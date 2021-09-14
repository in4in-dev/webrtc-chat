import {connectDatabase} from "./db";
import * as dotenv from "dotenv";

dotenv.config();
connectDatabase().sync({alter : true});