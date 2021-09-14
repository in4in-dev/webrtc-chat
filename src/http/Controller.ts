import {Express, Request, Response} from "express";
import fileUpload from 'express-fileupload';
import {Attachment, Chat, File, User} from "../models";
import {PrepareAttachment} from "./PrepareAttachment";
import bodyParser from "body-parser";
import path from 'path';

export default class Controller{

    protected app : Express;

    constructor(app : Express) {

        this.app = app;

        app.use(fileUpload({
            limit: {
                fileSize : 50 * 1024 * 1024
            }
        }));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended : true }));

        app.use((req : Request, res : Response, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            next();
        });

        app.get('/download/:user_id/:token/:attachment_id/', async (req : Request, res : Response) => {

            let user_id       = +req.params.user_id,
                attachment_id = +req.params.attachment_id,
                token         = String(req.params.token) || '';

            if(user_id && attachment_id && token &&
                await this.checkAuth(user_id, token)
            ){

                let attachment = await Attachment.findByPk(attachment_id);

                if(attachment && await this.checkAccess(user_id, attachment.room_id)){

                    let file = await File.findByPk(attachment.file_id);

                    return res.status(200)
                        .sendFile(path.resolve(file!.path));

                }

            }

            return res.status(403);

        });

        app.post('/upload/', async (req : Request, res : Response) => {

            let file = req.files?.file;

            let room_id = +req.query.room_id!,
                user_id = +req.query.user_id!,
                token = String(req.query.token) || '',
                type  = String(req.query.type) || '';

            console.log(room_id, user_id, token, type);

            if(file && room_id && user_id && token && type &&
                await this.checkAuth(user_id, token) &&
                await this.checkAccess(user_id, room_id)
            ){

                if(file instanceof Array){
                    file = file[0];
                }

                let prepare = new PrepareAttachment(file, type);
                await prepare.upload('uploads/');

                if(prepare.uploaded){

                    let attachment = await this.onUploadAttachment(user_id, room_id, prepare);

                    return res.status(200).json({
                        success : true,
                        attachment
                    });

                }

            }


            return res.status(500).json({
                success : false
            });

        });

    }

    protected async checkAuth(user_id : number, token : string) : Promise<boolean>
    {
        let user = await User.findByPk(user_id);

        return !!(user && user.token === token);
    }

    protected async checkAccess(user_id : number, room_id : number) : Promise<boolean>
    {

        let chat = await Chat.findOne({
            where : {
                room_id,
                user_id
            }
        });

        return !!chat;

    }

    protected async onUploadAttachment(user_id : number, room_id : number, prepare : PrepareAttachment) : Promise<Attachment>
    {

        let file = await File.create({
            path : prepare.path,
            user_id
        });

        let attachment = await Attachment.create({
            file_id : file.id,
            type : prepare.type,
            room_id : room_id
        });

        return attachment;

    }

}