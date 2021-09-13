import {DefaultResponse} from "./DefaultResponse";
import {Chat, Message, Room, User} from "../models";

export class CallResponse extends DefaultResponse{

    constructor(user : User, ice_candidate : any, session_description : any) {
        super(true, {
            user, ice_candidate, session_description
        });
    }

}