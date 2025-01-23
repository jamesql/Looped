import { startServer } from "./server";
import * as http from "http";

const s = http.createServer();

async function start(): Promise<void> {
    let instance = await startServer(s);

    // port should be changed later, from env file
    s.listen(444, "127.0.0.1", () => {
        console.log("[$wss] Socket server started....",);
    });
}

start();