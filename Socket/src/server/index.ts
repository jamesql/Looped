/// <reference path="../utils/@types/global.d.ts" />

import * as http from "http";
import * as ws from "ws";

// create websocket server
export async function startServer(s: http.Server): Promise<ws.WebSocketServer> {
    const x = new ws.Server({
        server:s
    });

    // handle connection
    x.on("connection", require("./connection").default.bind(null, s));

    return x;
}