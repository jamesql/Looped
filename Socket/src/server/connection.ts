/// <reference path="../utils/@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";
import { HEARTBEAT_INTERVAL, OPCodes } from "./WSValues";
import Redis from "ioredis";
import { getUserSession, refreshSubscriptions } from "./redis";

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

  // Create redis subscription stuff
  client.activeSubscriptions = new Set<string>;
  client.subscriber = new Redis({
    host: "localhost",
    port: 6379,
  });

  // redis test events
  client.subscriber.on("connect", () => {
    console.log(
      `[$wss] Redis Subscriber Connected Succesfully (${client.subscriber.status})`
    );
  });

  client.subscriber.on("error", (err) => {
    console.error(`[$wss] Redis Subscriber Error: ${err}`);
  });

  client.subscriber.on("message", async (channel, m) => {
    if (client.readyState !== WebSocket.OPEN) return;

    let data = JSON.parse(m);

    let opcode = data["op"];
    let d = data["d"];

    let payload = {
      op: opcode,
      d: d,
    };

    if (opcode === OPCodes.NILOP) {
      client.session = await getUserSession(client.session.userId);
      await refreshSubscriptions(client);
      return;
    }

    await client.sendAsync(payload);
  });
  

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
