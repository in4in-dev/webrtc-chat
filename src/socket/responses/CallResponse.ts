import {DefaultResponse} from "./DefaultResponse";
import {Call, User} from "../../models";

export class CallResponse extends DefaultResponse{

    constructor(user : User, call : Call, session_description : any) {
        super(true, {
            call, user, session_description
        });
    }

}