import { Server, Socket } from "socket.io";
import { createServer } from "http";

import ClientActions from "./consts/ClientActions";
import {User} from "./models";
import ServerActions from "./consts/ServerActions";
import {ClientStore} from "./module/ClientStore";
import {Client} from "./module/Client";
import {Message} from "./models";
import {Chat} from "./models";
import {connectDatabase} from "./db";

let server = createServer();
let db = connectDatabase();
let socket = new Server(server, {
    path : '/',
    transports : ['websocket'],
    allowUpgrades : true,
    cors: {
        origin: "*"
    }
});

let $usersStore : ClientStore = new ClientStore;

socket.on('connection', (connection : Socket) => {

    let client = new Client(connection);

    //Авторизация
    connection.on(ClientActions.AUTH, async (data) => {

        let user : User | null = await User.findByPk(data.id);

        user ? onSuccessAuth(user) : onFailureAuth();

    });

    connection.on(ClientActions.REGISTER, async (data) => {

        let user : User = await User.create({});

        onSuccessAuth(user);

    });

    function onSuccessAuth(user : User){

        client.auth(user);

        connection.emit(ServerActions.AUTHORIZED, {
            success : true,
            user
        });

        socket.emit(ServerActions.USER_ONLINE, {
            id : user.id,
            online : true
        })

        //Handlers
        connection.on('disconnect', (data) => {

            $usersStore.remove(client);
            
            if(!$usersStore.has(user.id)){

                socket.emit(ServerActions.USER_ONLINE, {
                    id : user.id,
                    online : false
                });

            }
            
        });

        connection.on(ClientActions.SEND_MESSAGE, (data) => {

        });

        connection.on(ClientActions.DELETE_MESSAGE, async (data) => {

            let message : Message | null = await Message.findByPk(data.id, {
                include : Chat
            });

            if(message && message.user_id === user.id){

                await message.destroy();

                let chat : Chat = message.chat!;
                let users : User[] = await chat.getUsers();

                $usersStore.filter(
                    users.map(u => u.id)
                ).each((cl : Client) => {

                    cl.socket.emit(ServerActions.DELETE_MESSAGE, {
                        message,
                        chat
                    });

                });


            }

        });

        connection.on(ClientActions.CLEAR_CHAT, (data) => {

        });

        connection.on(ClientActions.DELETE_CHAT, (data) => {

        });

        connection.on(ClientActions.GET_HISTORY, (data) => {

        });

    }

    function onFailureAuth(){
        connection.emit(ServerActions.AUTHORIZED, {
            success : false
        });
    }

});



server.listen(3000);