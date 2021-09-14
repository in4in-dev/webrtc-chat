import {DefaultResponse} from "./DefaultResponse";

export class OnlineResponse extends DefaultResponse{

    constructor(id : number, online : boolean) {
        super(true, { id, online });
    }

}