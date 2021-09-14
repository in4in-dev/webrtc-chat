import {connectDatabase} from "./db";

connectDatabase().sync({alter : true});