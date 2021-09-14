import {DefaultResponse} from "./DefaultResponse";
import {User} from "../../models";

export class AuthResponse extends DefaultResponse{

    constructor(user : User | null, dialogs : any[] = []) {

        super(!!user, {
            user,
            token : user?.token,
            dialogs
        });

    }

}