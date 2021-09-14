import express from "express";

import {connectDatabase} from "./db";
import Controller from "./http/Controller";

let server = express();
let db = connectDatabase();

let controller = new Controller(server);

console.log('Http started');

server.listen(3001);