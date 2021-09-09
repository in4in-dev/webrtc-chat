import {Socket} from "socket.io";
import {User} from "../models";

export class Client {

    public id : number | null = null;
    public data : User | null = null;

    public isAuth : boolean = false;

    public socket : Socket;

    constructor(socket : Socket) {
        this.socket = socket;
    }

    public auth(user : User) : void
    {
        this.isAuth = true;
        this.id = user.id;
        this.data = user;
    }

}