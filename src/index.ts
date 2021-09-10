import { Server, Socket } from "socket.io";
import { createServer } from "http";

import ClientActions from "./consts/ClientActions";
import {Attachment, Room, Chat, File, User} from "./models";
import ServerActions from "./consts/ServerActions";
import {ClientStore} from "./module/ClientStore";
import {Client} from "./module/Client";
import {Message} from "./models";
import {connectDatabase} from "./db";
import {literal, Op} from "sequelize";
import {OnlineResponse} from "./responses/OnlineResponse";

let server = createServer();
let db = connectDatabase();
let socket = new Server(server, {
    path : '/',
    transports : ['websocket'],
    allowUpgrades : true,
    cors: {
        origin: "*"
    }
});

let $usersStore : ClientStore = new ClientStore;

socket.on('connection', (connection : Socket) => {

    let client = new Client(connection);

    //Авторизация
    connection.on(ClientActions.AUTH, async (data) => {

        let user = await User.findByPk(data.id);

        user ? await onSuccessAuth(user) : onFailureAuth();
    });

    //Регистрация
    connection.on(ClientActions.REGISTER, async (data) => {
        await onSuccessAuth(
            await User.create({})
        );
    });

    async function onSuccessAuth(user : User){

        client.auth(user);

        await welcome();

        //Онлайн ++
        socket.emit(
            ServerActions.USER_ONLINE,
            new OnlineResponse(user.id, true)
        );

        ///////////////////////////////////
        /////// Handlers
        ///////////////////////////////////


        //Отключение (Онлайн --)
        connection.on('disconnect', (data) => {

            $usersStore.remove(client);
            
            if(!$usersStore.has(user.id)){

                socket.emit(
                    ServerActions.USER_ONLINE,
                    new OnlineResponse(user.id, false)
                );

            }
            
        });

        connection.on(ClientActions.CREATE_CHAT, async (data) => {

            let receiver = await User.findByPk(data.user_id);

            if(receiver){

                let rooms = await user.getChats({
                    attributes : ['room_id']
                });

                let chat = await Chat.findOne({
                    where : {
                        user_id : receiver.id,
                        room_id : {
                            [Op.in] : rooms.map(r => r.room_id)
                        }
                    }
                });

                if(!chat){

                    let room = await Room.create({});

                    await Chat.create({
                        user_id : receiver.id,
                        room_id : room.id
                    });

                    chat = await Chat.create({
                        user_id : user.id,
                        room_id : room.id
                    });

                }

                await sendMessage(chat, data.text, data.file_id);

            }

        });

        connection.on(ClientActions.SEND_MESSAGE, async (data) => {

            let chat = await getChatByRoom(data.room_id);

            if(chat){

                await Chat.update({
                    is_deleted : false,
                    unread_count : literal('unread_count + 1')
                }, {
                    where : {
                        room_id : chat.room_id
                    }
                });

                chat.unread_count = 0;
                await chat.save();

                await sendMessage(chat, data.text, data.file_id);

            }

        });

        //Удаление сообщения
        connection.on(ClientActions.DELETE_MESSAGE, async (data) => {

            let message = await Message.findByPk(data.message_id, {
                include : Room
            });

            if(message && message.user_id === user.id){

                await message.destroy();

                let room = message.room!;
                let chats = await room.getChats();

                chats.forEach(chat => {
                    $usersStore.filter(chat.user_id).each(cl => {

                        cl.socket.emit(ServerActions.DELETE_MESSAGE, {
                            message,
                            chat,
                            room
                        });

                    });
                });

            }

        });

        //Очистка истории сообщений
        connection.on(ClientActions.CLEAR_CHAT, async (data) => {

            let chat = await getChatByRoom(data.room_id, {
                include : Room
            });

            if(chat){

                chat.clear_time = new Date;
                await chat.save();

                let room = chat.room!;

                $usersStore.filter(user.id).each(cl => {
                    cl.socket.emit(ServerActions.CLEAR_CHAT, { room, chat })
                });

            }


        });

        //Удаление чата
        connection.on(ClientActions.DELETE_CHAT, async (data) => {

            let chat = await getChatByRoom(data.room_id, {
                include : Room
            });

            if(chat){

                chat.is_deleted = true;
                await chat.save();

                let room = chat!.room;

                $usersStore.filter(user.id).each(cl => {
                    cl.socket.emit(ServerActions.DELETE_CHAT, { chat, room });
                });

            }

        });

        //Получение истории
        connection.on(ClientActions.GET_HISTORY, async (data) => {

            let chat = await getChatByRoom(data.room_id);

            if(chat){
                let filter : any = {};

                if(data.offset_id){

                    filter.id = {
                        [Op.lt] : data.offset_id
                    };

                }

                let messages = await Message.findAll({
                    where : {
                        ...filter,
                        room_id : chat.room_id,
                        createdAt : {
                            [Op.gt] : chat.clear_time
                        }
                    },
                    order : [
                        ['id', 'DESC']
                    ],
                    include : Attachment,
                    limit : Math.min(30, data.limit || 0)
                });

                connection.emit(ServerActions.HISTORY_LOADED, { messages })

            }


        });

        //Пометка прочитанными
        connection.on(ClientActions.READ_CHAT, async (data) => {

            let chat = await getChatByRoom(data.room_id, {
                include : Room
            });

            if(chat){

                chat.unread_count = 0;
                await chat.save();

                let room = chat.room!;

                $usersStore.filter(user.id).each(cl => {
                    cl.socket.emit(ServerActions.READ_CHAT, { chat, room });
                });

            }

        });

        async function getChatByRoom(
            room_id : number,
            { where = {}, ...options } : any = {}
        ) : Promise<Chat | null> {

            return Chat.findOne({
                where : {
                    room_id,
                    user_id : user.id,
                    ...where
                },
                ...options
            });

        }

        async function sendMessage(chat : Chat, text : string, file_id : number | null) : Promise<void> {

            let attachment = null;
            if(file_id){

                let file = await File.findByPk(file_id);

                if(file && file.user_id === user.id){

                    attachment = await Attachment.create({
                        file_id : file.id,
                        chat_id : chat.id
                    })

                }else{
                    file_id = null;
                }

            }

            let room = await chat.getRoom();
            let message = await Message.create({
                attachment_id : attachment?.id,
                room_id : chat.room_id,
                text
            });

            let chats = await room.getChats();

            chats.forEach(chat => {

                $usersStore.filter(chat.user_id).each(cl => {

                    cl.socket.emit(ServerActions.NEW_MESSAGE, {
                        room,
                        chat,
                        message
                    })

                });

            });

        }

        async function welcome() : Promise<void> {

            let chats = await user.getChats({
                include : Room,
            });

            connection.emit(ServerActions.AUTHORIZED, {
                success : true,
                user,
                chats
            });

        }

    }

    function onFailureAuth(){
        connection.emit(ServerActions.AUTHORIZED, {
            success : false
        });
    }


});



server.listen(3000);