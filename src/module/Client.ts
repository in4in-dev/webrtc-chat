import {Socket} from "socket.io";
import {Attachment, Chat, File, Message, Room, User} from "../models";
import {literal, Op} from "sequelize";
import ServerActions from "../consts/ServerActions";

interface ChatRoomDump{
    room : Room,
    chat : Chat
}

interface MessageDump{
    message : Message
    chats : Chat[],
    room : Room
}

export class Client {

    public id : number;
    public user : User;

    public connection : Socket;

    constructor(connection : Socket, user : User) {
        this.connection = connection;

        this.user = user;
        this.id = user.id;
    }

    public async getChatByRoom(room_id : number, { where = {}, ...options } : any = {}) : Promise<Chat | null>
    {

        return Chat.findOne({
            where : {
                room_id,
                user_id : this.user.id,
                ...where
            },
            ...options
        });

    }

    public async getChats() : Promise<Chat[]>
    {

        return this.user.getChats({
            include : Room,
            order : [
                [literal('unread_count > 0'), 'DESC'],
                ['updated_at', 'DESC']
            ]
        });

    }

    public async readChat(room_id : number) : Promise<ChatRoomDump|null>
    {

        let chat = await this.getChatByRoom(room_id, {
            include : Room
        });

        if(!chat){
            return null;
        }

        chat.unread_count = 0;
        await chat.save();

        return {
            chat,
            room : chat.room!
        }

    }

    public async getHistory(room_id : number, last_id : number | null, limit : number = 30) : Promise<Message[] | null>
    {

        let chat = await this.getChatByRoom(room_id);

        if(!chat){
            return null;
        }

        let filter : any = {};

        if(last_id){

            filter.id = {
                [Op.lt] : last_id
            };

        }

        if(chat.clear_time){
            filter.created_at = {
                [Op.gt] : chat.clear_time
            }
        }

        return Message.findAll({
            where : {
                ...filter,
                room_id : chat.room_id,
            },
            order : [
                ['id', 'DESC']
            ],
            include : Attachment,
            limit
        });

    }

    public async deleteChat(room_id : number) : Promise<ChatRoomDump|null>
    {

        let chat = await this.getChatByRoom(room_id, {
            include : Room
        });

        if(!chat){
            return null;
        }

        chat.is_deleted = true;
        chat.clear_time = new Date;
        await chat.save();

        return {
            chat,
            room : chat.room!
        }

    }

    public async clearChat(room_id : number) : Promise<ChatRoomDump|null>
    {

        let chat = await this.getChatByRoom(room_id, {
            include : Room
        });

        if(!chat){
            return null;
        }

        chat.clear_time = new Date;
        await chat.save();

        return {
            chat,
            room : chat.room!
        }

    }

    public async deleteMessage(message_id : number) : Promise<MessageDump|null>
    {

        let message = await Message.findByPk(message_id, {
            include : Room
        });

        if(message && message.user_id === this.user.id){

            await message.destroy();

            let room = message.room!;
            let chats = await room.getChats();

            return {
                chats,
                room,
                message
            }

        }

        return null;

    }

    public async sendMessage(room_id : number, text : string, file_id : number) : Promise<MessageDump|null>
    {

        let chat = await this.getChatByRoom(room_id);

        if(!chat){
            return null;
        }

        return this.sendMessageToChat(chat, text, file_id);

    }

    public async createChat(user_id : number, text : string, file_id : number) : Promise<MessageDump|null>
    {

        let receiver = await User.findByPk(user_id);

        if(receiver){

            let rooms = await this.user.getChats({
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
                    user_id : this.user.id,
                    room_id : room.id
                });

            }

            return this.sendMessageToChat(chat, text, file_id);

        }

        return null;

    }

    protected async createAttachment(file_id : number, chat_id : number) : Promise<Attachment|null>{

        let file = await File.findByPk(file_id);

        if(file && file.user_id === this.user.id){

            return await Attachment.create({
                file_id : file.id,
                chat_id : chat_id
            })

        }

        return null;

    }

    protected async sendMessageToChat(chat : Chat, text : string, file_id : number | null) : Promise<MessageDump>{

        let attachment = file_id ? await this.createAttachment(file_id, chat.id) : null;

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

        let room = await chat.getRoom();

        let message = await Message.create({
            attachment_id : attachment?.id,
            room_id : chat.room_id,
            user_id : this.user.id,
            text
        });

        let chats = await room.getChats();

        return {
            chats,
            room,
            message
        }

    }

}