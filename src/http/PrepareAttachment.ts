import {UploadedFile} from "express-fileupload";

interface Types{
    [key:string] : { [key:string] : string }
}

export class AttachmentType{

    public type : string;
    public extension : string;

    constructor(type : string, extension : string) {
        this.type = type;
        this.extension = extension;
    }

}

export class PrepareAttachment{

    protected file : UploadedFile;

    public valid : boolean = false;
    public uploaded : boolean = false;

    public name : string;
    public path : string;

    public extension? : string;
    public type? : string;

    constructor(file : UploadedFile, type : string) {

        let attachmentType = PrepareAttachment.getType(file, type);

        if(attachmentType){
            this.valid = true;
            this.extension = attachmentType.extension;
            this.type = attachmentType?.type;
        }

        this.name = file.md5 + Date.now();
        this.path = file.tempFilePath;
        this.file = file;

    }

    public async upload(dir : string) : Promise<boolean>
    {

        if(!this.valid){
            return false;
        }

        this.uploaded = true;
        this.path = dir + this.name + '.' + this.extension;

        await this.file.mv(this.path);

        return true;

    }

    public static getType(file : UploadedFile, type : string) : AttachmentType | null
    {

        let types = <Types>{

            photo : {
                'image/gif' : 'gif',
                'image/jpeg' : 'jpeg',
                'image/png' : 'png',
            },

            video : {
                'video/mp4' : 'mp4'
            },

            voice : {
                'audio/mpeg' : 'mp3'
            }

        }

        if( (type in types) && (file.mimetype in types[type]) ){
            return new AttachmentType(type, types[type][file.mimetype]);
        }

        let extension = file.name.split('.').pop();

        if(extension){
            return new AttachmentType('file', extension);
        }

        return null;

    }

}