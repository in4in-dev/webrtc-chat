import {Server, Socket} from "socket.io";
import {ClientStore} from "./ClientStore";
import {Client} from "./Client";
import ClientActions from "../consts/ClientActions";
import {Attachment, File, Message, Room, User, Chat, Call} from "../models";
import ServerActions from "../consts/ServerActions";
import {OnlineResponse} from "./responses/OnlineResponse";
import {literal, Op} from "sequelize";
import {MessageResponse} from "./responses/MessageResponse";
import {ChatResponse} from "./responses/ChatResponse";
import {Field, Validator} from "../module/Validator";
import {HistoryResponse} from "./responses/HistoryResponse";
import {AuthResponse} from "./responses/AuthResponse";
import {CallResponse} from "./responses/CallResponse";
import {DefaultResponse} from "./responses/DefaultResponse";
import {ErrorResponse} from "./responses/ErrorResponse";
import {CallIceResponse} from "./responses/CallIceResponse";

export class Controller{

    public socket : Server;
    public $usersStore : ClientStore = new ClientStore;

    constructor(socket : Server) {

        socket.on('connection', (connection : Socket) => {

            console.log('User connected');

            //Авторизация
            connection.on(ClientActions.AUTH, async (request) => {

                let data = <any>new Validator({
                    id : new Field('number'),
                    token : new Field('string')
                }).validate(request);

                if(data){

                    let user = await User.findByPk(data.id);

                    if(user && user.token && user.token === data.token){
                        return this.onSuccessAuth(connection, user);
                    }

                }

                return this.onFailureAuth(connection);

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

        //ICE_CANDIDATE для звонков
        connection.on(ClientActions.CALL_ICE, async (request) => {

            let data = <any>new Validator({
                'call_id' : new Field('number'),
                'ice_candidate' : new Field('*')
            }).validate(request);

            if(data){

                let call = await Call.findByPk(data.call_id);

                if(call){

                    if(call.receiver_id === user.id){

                        this.emitByUser(call.caller_id, ServerActions.CALL_ICE, client => {
                            return new CallIceResponse(call!, data.ice_candidate);
                        });

                    }else if(call.caller_id === user.id){

                        this.emitByUser(call.receiver_id, ServerActions.CALL_ICE, client => {
                            return new CallIceResponse(call!, data.ice_candidate);
                        });

                    }

                }

            }

        });

        //Звонок
        connection.on(ClientActions.CALL_INIT, async (request) => {

            let data = <any>new Validator({
                'user_id' : new Field('number'),
                'session_description' : new Field('*')
            }).validate(request);

            if(data){

                let target = await User.findByPk(data.user_id);

                if(target){

                    let call = await Call.create({
                        caller_id : user.id,
                        receiver_id : target.id
                    });

                    this.emitByUser(target.id, ServerActions.CALL_INIT, client => {
                        return new CallResponse(user, call, data.session_description);
                    })

                }else{

                    connection.emit(ServerActions.ERROR, new ErrorResponse('User not found'));

                }

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'))

            }

        });

        //Ответ на звонок
        connection.on(ClientActions.CALL_ANSWER, async (request) => {

            let data = <any>new Validator({
                'call_id' : new Field('number'),
                'session_description' : new Field('*')
            }).validate(request);

            if(data){

                let call = await Call.findByPk(data.call_id);

                if(call && call.receiver_id === user.id && call.status === 'new'){

                    call.status = 'confirmed';
                    await call.save();

                    this.emitByUser(call.caller_id, ServerActions.CALL_ANSWER, client => {
                        return new CallResponse(user, call!, data.session_description);
                    })

                }else{

                    connection.emit(ServerActions.ERROR, new ErrorResponse('User not found'));

                }

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

            }

        });

        //Новый диалог
        connection.on(ClientActions.CREATE_CHAT, async (request) => {

            let data = new Validator({
                'user_id' : new Field('number'),
                'text'    : new Field('string', false, ''),
                'attachment_id' : new Field('number', false, null)
            }).validate(request);

            if(data && (data.text.length || data.attachment_id)){

                let response = await client.createChat(data.user_id, data.text, data.attachment_id);

                response && this.emitInChats(response.chats, ServerActions.NEW_MESSAGE, (chat) => {
                    return new MessageResponse(response!.message, chat, response!.room);
                });

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

            }

        });

        //Уведомление о действии
        connection.on(ClientActions.I_DO_SOMETHING, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number'),
                'action' : new Field('string', true),
            }).validate(request);

            if(data){

                let {room_id, action} = data;

                if(await client.getChatByRoom(room_id)){

                    let chats = await client.getChatPartners(room_id);

                    this.emitInChats(chats, ServerActions.DO_SOMETHING, (chat) => {
                        return new DefaultResponse(true, { chat, action, user });
                    });

                }else{

                    connection.emit(ServerActions.ERROR, new ErrorResponse('Bad room_id'));

                }

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

            }

        });

        //Отправка сообщения
        connection.on(ClientActions.SEND_MESSAGE, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number'),
                'text'    : new Field('string', false, ''),
                'attachment_id' : new Field('number', false, null),
                'answer_message_id' : new Field('number', false, null)
            }).validate(request);

            if(data && (data.text.length || data.attachment_id)){

                let response = await client.sendMessage(data.room_id, data.text, data.attachment_id, data.answer_message_id);

                response && this.emitInChats(response.chats, ServerActions.NEW_MESSAGE, (chat) => {
                    return new MessageResponse(response!.message, chat, response!.room);
                });

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

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

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

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

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

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

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

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

                let response = await client.getHistory(data.room_id, data.last_id, Math.max(1, data.limit));

                if(response){
                    connection.emit(ServerActions.HISTORY_LOADED,
                        new HistoryResponse(response.room, response.chat, response.messages)
                    );
                }

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

            }

        });

        //Пометка прочитанными
        connection.on(ClientActions.READ_CHAT, async (request) => {

            let data = new Validator({
                'room_id' : new Field('number')
            }).validate(request);

            if(data){

                let response = await client.readChat(data.room_id);

                response && this.emitByUser(user.id, ServerActions.READ_CHAT, () => {
                    return new ChatResponse(response!.chat, response!.room);
                });

            }else{

                connection.emit(ServerActions.ERROR, new ErrorResponse('Bad data'));

            }

        });

    }

    protected async onFailureAuth(connection : Socket){

        console.log('User failed auth');

        connection.emit(ServerActions.AUTHORIZED, new AuthResponse(null));

    }

    protected async onWelcome(client : Client){

        let chats = [];

        let dialogs = await client.getChats();

        for(let dialog of dialogs){

            let messages = await dialog.room.getMessages({
                limit : 1,
                order : [
                    ['id', 'DESC']
                ],
                include : Attachment
            });

            chats.push({
                room : dialog.room,
                chat : dialog.chat,
                message : messages.length ? messages[0] : null
            })

        }

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