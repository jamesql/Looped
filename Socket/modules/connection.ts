/// <reference path="../@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";
import { HEARTBEAT_INTERVAL, OPCodes } from "../../Types/socketTypes";
import { RedisPubSub } from "../../Util/Redis"; // Updated import
import LoopedSession from "../../Types/sessionTypes";

// Incoming connection handler
export default async (
    ws: Socket.SocketServer,
    client: Socket.SocketClient,
    rq: IncomingMessage
) => {
    // Set client address
    client.address = rq.socket.address()["address"];

    // Log incoming connection
    console.log(
        `[$wss] [Client>>Server] Incoming Connection from ${client.address}`
    );

    // Initialize client properties
    client.props = {
        sequence: 0,
        lastHeartbeat: Date.now(),
    };


    // Bind message handler
    client.on("message", require("./message").default.bind(null, ws, client, rq));

    // Send hello with heartbeat interval
    client.sendAsync({
        op: OPCodes.HELLO,
        d: {
            heartbeatInterval: HEARTBEAT_INTERVAL,
        },
    });
};
