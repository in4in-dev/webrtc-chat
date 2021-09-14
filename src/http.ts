import express from "express";
import * as dotenv from 'dotenv';

import {connectDatabase} from "./db";
import Controller from "./http/Controller";
import {Env} from "./module/Env";

dotenv.config();

console.log(process.env);

let server = express();
let db = connectDatabase();

let controller = new Controller(server);

console.log('Http started');

server.listen(
    Env.get('HTTP_PORT')
);