import { Server, Socket } from "socket.io";
import { createServer } from "http";

import ClientActions from "./consts/ClientActions";
import {Attachment, ChatRelation, File, User} from "./models";
import ServerActions from "./consts/ServerActions";
import {ClientStore} from "./module/ClientStore";
import {Client} from "./module/Client";
import {Message} from "./models";
import {Chat} from "./models";
import {connectDatabase} from "./db";
import {literal, Op} from "sequelize";

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

        user ? onSuccessAuth(user) : onFailureAuth();
    });

    connection.on(ClientActions.REGISTER, async (data) => {
        onSuccessAuth(
            await User.create({})
        );
    });

    function onSuccessAuth(user : User){

        client.auth(user);

        welcome();

        socket.emit(ServerActions.USER_ONLINE, {
            id : user.id,
            online : true
        });

        ///////////////////////////////////
        /////// Handlers
        ///////////////////////////////////


        //Отключение
        connection.on('disconnect', (data) => {

            $usersStore.remove(client);
            
            if(!$usersStore.has(user.id)){

                socket.emit(ServerActions.USER_ONLINE, {
                    id : user.id,
                    online : false
                });

            }
            
        });

        connection.on(ClientActions.CREATE_CHAT, async (data) => {

            let receiver = await User.findByPk(data.id);

            if(receiver){

                let chats = await ChatRelation.findAll({
                    where : {
                        user_id : user.id
                    },
                    attributes : ['id']
                });

                let relation = await ChatRelation.findOne({
                    where : {
                        user_id : receiver.id,
                        chat_id : {
                            [Op.in] : chats.map(r => r.chat_id)
                        }
                    }
                });


                //Get or Create chat
                let chat;

                if(!relation){

                    chat = await Chat.create({
                        name : receiver.name,
                        picture : receiver.avatar_file_id
                    });

                    await ChatRelation.create({
                       user_id : receiver.id,
                       chat_id : chat.id
                    });

                    await ChatRelation.create({
                        user_id : user.id,
                        chat_id : chat.id
                    });

                }else{

                    chat = await relation.getChat();

                }

                await sendMessage(chat!, data.text, data.file_id);

            }

        });

        connection.on(ClientActions.SEND_MESSAGE, async (data) => {

            let relation = await ChatRelation.findOne({
                where : {
                    user_id : user.id,
                    chat_id : data.id
                },
                include : Chat
            });

            if(relation){

                await ChatRelation.update({
                    is_deleted : false,
                    unread_count : literal('unread_count + 1')
                }, {
                    where : {
                        chat_id : data.id
                    }
                });

                relation.unread_count = 0;
                await relation.save();

                await sendMessage(relation.chat!, data.text, data.file_id);

            }

        });

        //Удаление сообщения
        connection.on(ClientActions.DELETE_MESSAGE, async (data) => {

            let message = await Message.findByPk(data.id, {
                include : Chat
            });

            if(message && message.user_id === user.id){

                await message.destroy();

                let chat = message.chat!;
                let users = await chat.getUsers();

                $usersStore.filter(
                    users.map(u => u.id)
                ).each((cl : Client) => {

                    cl.socket.emit(ServerActions.DELETE_MESSAGE, {
                        message,
                        chat
                    });

                });

            }

        });

        //Очистка истории сообщений
        connection.on(ClientActions.CLEAR_CHAT, async (data) => {

            let relation = await ChatRelation.findOne({
                where : {
                    chat_id : data.id,
                    user_id : user.id
                }
            });

            if(relation){

                relation.clear_time = new Date;
                await relation.save();

                $usersStore.filter(user.id).each((cl : Client) => {

                    cl.socket.emit(ServerActions.CLEAR_CHAT, {
                        id : relation!.chat_id
                    })

                });

            }


        });

        //Удаление чата
        connection.on(ClientActions.DELETE_CHAT, async (data) => {

            let relation = await ChatRelation.findOne({
                where : {
                    chat_id : data.id,
                    user_id : user.id
                }
            });

            if(relation){

                relation.is_deleted = true;
                await relation.save();

                $usersStore.filter(user.id).each((cl : Client) => {

                    cl.socket.emit(ServerActions.DELETE_CHAT, {
                        id : relation!.chat_id
                    })

                });

            }

        });

        //Получение истории
        connection.on(ClientActions.GET_HISTORY, async (data) => {

            let relation = await ChatRelation.findOne({
                where : {
                    chat_id : data.id,
                    user_id : user.id
                }
            });

            if(relation){

                let filter : any = {};

                if(data.lastId){

                    filter.id = {
                        [Op.lt] : data.last
                    };

                }

                let messages = await Message.findAll({
                    where : {
                        ...filter,
                        chat_id : relation.chat_id,
                        createdAt : {
                            [Op.gt] : relation.clear_time
                        }
                    },
                    order : [
                        ['id', 'DESC']
                    ],
                    include : File,
                    limit : Math.min(30, data.limit || 0)
                });

                connection.emit(ServerActions.HISTORY_LOADED, { messages })

            }


        });

        //Пометка прочитанными
        connection.on(ClientActions.READ_CHAT, async (data) => {

            let relation = await ChatRelation.findOne({
                where : {
                    chat_id : data.id,
                    user_id : user.id
                },
                include : Chat
            });

            if(relation){

                relation.unread_count = 0;
                await relation.save();

                let chat = relation.chat!;
                let users = await chat.getUsers();

                $usersStore.filter(
                    users.map(u => u.id)
                ).each((cl : Client) => {

                    cl.socket.emit(ServerActions.READ_CHAT, {
                        chat,
                        unread : relation!.unread_count
                    });

                });

            }

        });


        async function sendMessage(chat : Chat, text : string, file_id : number | null){


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

            let message = await Message.create({
                attachment_id : attachment?.id,
                text,
                chat_id : chat.id
            });


            let users = await chat.getUsers();

            $usersStore.filter(
                users.map(u => u.id)
            ).each((c : Client) => {

                c.socket.emit(ServerActions.NEW_MESSAGE, {
                    chat,
                    message,
                    users
                })

            });

        }

        async function welcome(){

            let chats = await user.getChats({
                include : User
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