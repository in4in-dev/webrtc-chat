import { Socket } from "socket.io";
import { User } from "../models";
export declare class Client {
    id: number | null;
    data: User | null;
    isAuth: boolean;
    socket: Socket;
    constructor(socket: Socket);
    auth(user: User): void;
}
