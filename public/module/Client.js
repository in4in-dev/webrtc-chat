"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    constructor(socket) {
        this.id = null;
        this.data = null;
        this.isAuth = false;
        this.socket = socket;
    }
    auth(user) {
        this.isAuth = true;
        this.id = user.id;
        this.data = user;
    }
}
exports.Client = Client;
