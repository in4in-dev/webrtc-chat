import {DefaultResponse} from "./DefaultResponse";

export class ErrorResponse extends DefaultResponse{

    constructor(error : string) {
        super(false, {
            error
        });
    }

}