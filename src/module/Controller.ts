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
import {Field, Validator} from "./Validator";
import {HistoryResponse} from "../responses/HistoryResponse";
import {AuthResponse} from "../responses/AuthResponse";

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
        connection.on(ClientActions.CREATE_CHAT, async (request) => {

            let data = new Validator({
                'user_id' : new Field('number'),
                'text'    : new Field('string', false, ''),
                'file_id' : new Field('number', false, null)
            }).validate(request);

            if(data){

                let response = await client.createChat(data.user_id, data.text, data.file_id);

                response && this.emitInChats(response.chats, ServerActions.NEW_MESSAGE, (chat) => {
                    return new MessageResponse(response!.message, chat, response!.room);
                });

            }

        });

        //Отправка сообщения
        connection.on(ClientActions.SEND_MESSAGE, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number'),
                'text'    : new Field('string', false, ''),
                'file_id' : new Field('number', false, null)
            }).validate(request);

            if(data){

                let response = await client.sendMessage(data.room_id, data.text, data.file_id);

                response && this.emitInChats(response.chats, ServerActions.NEW_MESSAGE, (chat) => {
                    return new MessageResponse(response!.message, chat, response!.room);
                });

            }

        });

        //Удаление сообщения
        connection.on(ClientActions.DELETE_MESSAGE, async (request) => {

            let data = new Validator({
                'message_id' : new Field('number')
            }).validate(request);

            if(data) {

                let response = await client.deleteMessage(data.message_id);

                response && this.emitInChats(response.chats, ServerActions.DELETE_MESSAGE, (chat) => {
                    return new MessageResponse(response!.message, chat, response!.room);
                });

            }

        });

        //Очистка истории сообщений
        connection.on(ClientActions.CLEAR_CHAT, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number')
            }).validate(request);

            if(data){

                let response = await client.clearChat(data.room_id);

                response && this.emitByUser(user.id, ServerActions.CLEAR_CHAT, () => {
                    return new ChatResponse(response!.chat, response!.room);
                });

            }

        });

        //Удаление чата
        connection.on(ClientActions.DELETE_CHAT, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number')
            }).validate(request);

            if(data){

                let response = await client.deleteChat(data.room_id);

                response && this.emitByUser(user.id, ServerActions.DELETE_CHAT, () => {
                    return new ChatResponse(response!.chat, response!.room);
                });

            }

        });

        //Получение истории
        connection.on(ClientActions.GET_HISTORY, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number'),
                'last_id' : new Field('number', false, null),
                'limit'   : new Field('number', false, 30)
            }).validate(request);

            if(data){

                let messages = await client.getHistory(data.room_id, data.last_id, Math.max(1, data.limit));

                connection.emit(ServerActions.HISTORY_LOADED, new HistoryResponse(messages || []));

            }

        });

        //Пометка прочитанными
        connection.on(ClientActions.READ_CHAT, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number')
            }).validate(request);

            if(data){

                let response = await client.readChat(data.room_id);

                response && this.emitByUser(user.id, ServerActions.DELETE_CHAT, () => {
                    return new ChatResponse(response!.chat, response!.room);
                });

            }

        });

    }

    protected async onFailureAuth(connection : Socket){

        console.log('User failed auth');

        connection.emit(ServerActions.AUTHORIZED, new AuthResponse(false));

    }

    protected async onWelcome(client : Client){

        let chats = await client.getChats();

        client.connection.emit(ServerActions.AUTHORIZED, new AuthResponse(client.user, chats));

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