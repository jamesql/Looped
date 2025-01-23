import { startServer } from "./server";
import * as http from "http";

const s = http.createServer();

async function start(): Promise<void> {
    let instance = await startServer(s);

    s.listen(8080, "127.0.0.1", () => {
        console.log("[%s] Socket server started.... (%s)", Util.ProgramName, s.address);
    });
}

start();