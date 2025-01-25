/// <reference path="../utils/@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";
import { OPCodes } from "./WSValues";
import { validateAccessToken } from "../utils/Token";
import { getRedisInstance, getUserSession } from "./redis";
import Redis from "ioredis";

const _redis: Redis = getRedisInstance();

// Client message handler
export default (async (ws: Socket.SocketServer, client: Socket.SocketClient, req: IncomingMessage, payload: ws.RawData) => {
    let data;

    // make sure payload is valid
    try { data = JSON.parse(payload.toString()); }
    catch (e) { data = null; console.log(e); console.log(payload) }

    // invalid packet, close connection
    if (data === null) return client.close();

    console.log(`[$wss] [Client>>Server] Recieved OP Code >${data.op}< from ${client.session.userId}`);

    switch (data.op) {

        case OPCodes.AUTH:
            const { d } = data;
            const token = d.access_token;


            if (!token) {
                client.close(1008, "Unauthorized.");
                break;
            }

            let decode = await validateAccessToken(token);
            if (decode === null) {
                client.close(1008, "Unauthorized.");
                break;
            }

            let isExpired = (Date.now()/1000) > decode["exp"];

            if (isExpired) {
                client.close(1008, "Unauthorized.");
                break;
            }

            console.log(`[$wss] User ${decode["userId"]} authenticated!`);

            // fill session object and send it to user

            let _session = await getUserSession(decode["userId"]);
            client.session = _session;
            // send ready opcode

            let payload = {
                op: OPCodes.READY,
                d: {
                    _session: client.session,
                }
            }; 

            client.sendAsync(payload);
            break;

        case OPCodes.ERROR:
            break;

        default:
            client.close();

    };

});
