/// <reference path="../utils/@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";
import { HEARTBEAT_INTERVAL, OPCodes } from "./WSValues";

// Incoming connection handler
export default async (
  ws: Socket.SocketServer,
  client: Socket.SocketClient,
  rq: IncomingMessage
) => {
  // set client address
  client.address = rq.socket.address()["address"];

  // Log incoming connection
  console.log(
    `[$wss] [Client>>Server] Incoming Connection from ${client.address}`
  );

  // props
  client.props = {
    sequence: 0,
    lastHeartbeat: Date.now(),
  };

  // bind message handler
  client.on("message", require("./message").default.bind(null, ws, client, rq));

  // send hello with heartbeat interval
  client.sendAsync({
    op: OPCodes.HELLO,
    d: {
      heartbeatInterval: HEARTBEAT_INTERVAL,
    },
  });
};
