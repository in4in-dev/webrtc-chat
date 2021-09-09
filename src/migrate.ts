import {connectDatabase} from "./db";

connectDatabase().sync({force : true});