/// <reference path="../utils/@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";

// Client message handler
export default (async (ws: Socket.SocketServer, client: Socket.SocketClient, req: IncomingMessage, payload: ws.RawData) => {
    let data;

    // make sure payload is valid
    try { data = JSON.parse(payload.toString()); }
    catch (e) { data = null; console.log(e); console.log(payload) }

    // invalid packet, close connection
    if (data === null) return client.close();

    switch (data.op) {

    };

});
