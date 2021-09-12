import {Server, Socket} from "socket.io";
import {ClientStore} from "./ClientStore";
import {Client} from "./Client";
import ClientActions from "../consts/ClientActions";
import {Attachment, File, Message, Room, User, Chat} from "../models";
import ServerActions from "../consts/ServerActions";
import {OnlineResponse} from "../responses/OnlineResponse";
import {literal, Op} from "sequelize";
import {MessageResponse} from "../responses/MessageResponse";
import {ChatResponse} from "../responses/ChatResponse";

export class Controller{

    public socket : Server;
    public $usersStore : ClientStore = new ClientStore;

    constructor(socket : Server) {

        socket.on('connection', (connection : Socket) => {

            console.log('User connected');

            //Авторизация
            connection.on(ClientActions.AUTH, async (data) => {

                let user = await User.findByPk(data.id);

                user
                    ? await this.onSuccessAuth(connection, user)
                    : await this.onFailureAuth(connection);

            });

        });

        this.socket = socket;

    }

    protected emitInChats(chats : Chat[], action : string, cb : (chat : Chat, client : Client) => any) {

        chats.forEach(chat => {
            this.emitByUser(chat.user_id, action, client => cb(chat, client));
        });

    }

    protected emitByUser(user_id : number, action : string, cb : (client : Client) => any) {

        this.$usersStore.filter(user_id).emit(action, client => cb(client));

    }


    protected async onSuccessAuth(connection : Socket, user : User){

        let client = new Client(connection, user);

        await this.onConnect(client);
        await this.onWelcome(client);

        connection.on('disconnect', () => {
            this.onDisconnect(client);
        });

        //Новый диалог
        connection.on(ClientActions.CREATE_CHAT, async (data) => {

            let response = await client.createChat(data.user_id, data.text, data.file_id);

            response && this.emitInChats(response.chats, ServerActions.NEW_MESSAGE, (chat) => {
                return new MessageResponse(response!.message, chat, response!.room);
            });

        });

        //Отправка сообщения
        connection.on(ClientActions.SEND_MESSAGE, async (data) => {

            let response = await client.sendMessage(data.room_id, data.text, data.file_id);

            response && this.emitInChats(response.chats, ServerActions.NEW_MESSAGE, (chat) => {
                return new MessageResponse(response!.message, chat, response!.room);
            });

        });

        //Удаление сообщения
        connection.on(ClientActions.DELETE_MESSAGE, async (data) => {

            let response = await client.deleteMessage(data.message_id);

            response && this.emitInChats(response.chats, ServerActions.DELETE_MESSAGE, (chat) => {
                return new MessageResponse(response!.message, chat, response!.room);
            });

        });

        //Очистка истории сообщений
        connection.on(ClientActions.CLEAR_CHAT, async (data) => {

            let response = await client.clearChat(data.room_id);

            response && this.emitByUser(user.id, ServerActions.CLEAR_CHAT, () => {
                return new ChatResponse(response!.chat, response!.room);
            });

        });

        //Удаление чата
        connection.on(ClientActions.DELETE_CHAT, async (data) => {

            let response = await client.deleteChat(data.room_id);

            response && this.emitByUser(user.id, ServerActions.DELETE_CHAT, () => {
                return new ChatResponse(response!.chat, response!.room);
            });

        });

        //Получение истории
        connection.on(ClientActions.GET_HISTORY, async (data) => {

            let messages = await client.getHistory(data.room_id, data.last_id, data.limit || 30);

            connection.emit(ServerActions.HISTORY_LOADED, {
                messages
            });

        });

        //Пометка прочитанными
        connection.on(ClientActions.READ_CHAT, async (data) => {

            let response = await client.readChat(data.room_id);

            response && this.emitByUser(user.id, ServerActions.DELETE_CHAT, () => {
                return new ChatResponse(response!.chat, response!.room);
            });

        });

    }

    protected async onFailureAuth(connection : Socket){

        console.log('User failed auth');

        connection.emit(ServerActions.AUTHORIZED, {
            success : false
        });

    }

    protected async onWelcome(client : Client){

        let chats = await client.user.getChats();

        client.connection.emit(ServerActions.AUTHORIZED, {
            success : true,
            user : client.user,
            chats : chats.map(
                ({ room, ...chat }) => ({ chat, room })
            )
        });

    }

    protected onConnect(client : Client){

        this.$usersStore.add(client);

        //Онлайн ++
        this.socket.emit(
            ServerActions.USER_ONLINE,
            new OnlineResponse(client.user.id, true)
        );

    }

    protected onDisconnect(client : Client){

        this.$usersStore.remove(client);

        if(!this.$usersStore.has(client.user.id)){

            this.socket.emit(
                ServerActions.USER_ONLINE,
                new OnlineResponse(client.user.id, false)
            );

        }

    }

}