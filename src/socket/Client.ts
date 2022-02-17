import {Socket} from "socket.io";
import {Attachment, Chat, File, Message, Room, User} from "../models";
import {literal, Op} from "sequelize";

interface ChatRoomDump{
    room : Room,
    chat : Chat
}

interface MessageDump{
    message : Message
    chats : Chat[],
    room : Room
}

interface HistoryDump{
    messages : Message[],
    chat : Chat,
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

    public async getChats() : Promise<ChatRoomDump[]>
    {

        let chats = await this.user.getChats({
            where : {
                is_deleted : false
            },
            order : [
                [literal('unread_count > 0'), 'DESC'],
                ['updated_at', 'DESC']
            ]
        });

        let result = [];

        for(let i in chats){

            let chat = chats[i];

            let room = await chat.getRoom({
                include : User
            });

            result.push({ room, chat });

        }

        return result;

    }

    public async readChat(room_id : number) : Promise<ChatRoomDump|null>
    {

        let chat = await this.getChatByRoom(room_id);

        if(!chat){
            return null;
        }

        chat.unread_count = 0;
        await chat.save();

        let room = await chat.getRoom({
            include : User
        })

        return { chat, room }

    }

    public async getHistory(room_id : number, last_id : number | null, limit : number) : Promise<HistoryDump | null>
    {

        let chat = await this.getChatByRoom(room_id, {
            include : Room
        });

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

        let messages = await Message.findAll({
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

        let room = chat.room!;

        return {
            messages,
            chat,
            room
        }

    }

    public async deleteChat(room_id : number) : Promise<ChatRoomDump|null>
    {

        let chat = await this.getChatByRoom(room_id);

        if(!chat){
            return null;
        }

        chat.is_deleted = true;
        chat.clear_time = new Date;
        await chat.save();

        let room = await chat.getRoom({
            include : User
        });

        return { chat, room }

    }

    public async clearChat(room_id : number) : Promise<ChatRoomDump|null>
    {

        let chat = await this.getChatByRoom(room_id);

        if(!chat){
            return null;
        }

        chat.clear_time = new Date;
        await chat.save();

        let room = await chat.getRoom({
            include : User
        });

        return { chat, room }

    }

    public async deleteMessage(message_id : number) : Promise<MessageDump|null>
    {

        let message = await Message.findByPk(message_id, {
            include : Attachment
        });

        if(message && message.user_id === this.user.id){

            await message.destroy();

            let room = await message.getRoom({
                include : [User, Chat],
            });

            return {
                chats : room.chats!,
                room,
                message
            }

        }

        return null;

    }

    public async sendMessage(room_id : number, text : string, attachment_id : null | number = null, answer_message_id : number | null = null) : Promise<MessageDump|null>
    {

        let chat = await this.getChatByRoom(room_id);

        if(!chat){
            return null;
        }

        return this.sendMessageToChat(chat, text, attachment_id, answer_message_id);

    }

    public async createChat(user_id : number, text : string, attachment_id : null | number = null) : Promise<MessageDump|null>
    {

        let receiver = await User.findByPk(user_id);

        if(receiver && receiver.id !== this.user.id){

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

            return this.sendMessageToChat(chat, text, attachment_id);

        }

        return null;

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

    protected async getAttachment(chat : Chat, attachment_id : number) : Promise<Attachment | null>
    {

        let attachment = await Attachment.findByPk(attachment_id);

        if(attachment && attachment.room_id === chat.room_id){
            return attachment;
        }

        return null;

    }

    public async getChatPartners(room_id : number) : Promise<Chat[]>
    {
        return Chat.findAll({
            where : {
                user_id : {
                    [Op.not] : this.user.id
                },
                room_id
            }
        });
    }

    protected async sendMessageToChat(chat : Chat, text : string, attachment_id : number | null = null, answer_message_id : number | null = null) : Promise<MessageDump>{

        let attachment = null;
        if(attachment_id){
            attachment = await this.getAttachment(chat, attachment_id);
        }

        let answerMessage = null;
        if(answer_message_id){

            answerMessage = await Message.findByPk(answer_message_id);

            if(answerMessage && answerMessage.room_id !== chat.room_id){
                answerMessage = null;
            }

        }

        await Chat.update({
            is_deleted : false,
            unread_count : literal('unread_count + 1')
        }, {
            where : {
                user_id : {
                    [Op.not] : chat.user_id
                },
                room_id : chat.room_id
            }
        });

        chat.unread_count = 0;
        await chat.save();

        let room = await chat.getRoom({
            include : User
        });

        let message = await Message.create({
            attachment_id : attachment?.id,
            room_id : chat.room_id,
            user_id : this.user.id,
            answer_message_id : answerMessage ? answerMessage.id : null,
            text
        });

        await message.reload({
            include : [Attachment, {
                model : Message,
                as : 'answer_message'
            }]
        });

        let chats = await room.getChats();

        return {
            chats,
            room,
            message
        }

    }

}