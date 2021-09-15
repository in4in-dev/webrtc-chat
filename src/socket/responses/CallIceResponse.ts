import {DefaultResponse} from "./DefaultResponse";
import {Call, User} from "../../models";

export class CallIceResponse extends DefaultResponse{

    constructor(call : Call, ice_candidate : any) {
        super(true, {
            call, ice_candidate
        });
    }

}