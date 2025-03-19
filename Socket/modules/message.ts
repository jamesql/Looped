/// <reference path="../@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";
import { OPCodes } from "../../Types/socketTypes";
import TokenUtil from "../../Util/Token";
import { RedisPubSub } from "../../Util/Redis";
import LoopedSession from "../../Types/sessionTypes";
import { Channel, Role, Server } from "../../Types/serverTypes";
import { subscribe } from "diagnostics_channel";

// Import the TokenUtil class
const tokenUtil = new TokenUtil();

function handleRedisMessage(message: string) {
  console.log("Received message from Redis:", message);
  // Handle the message as needed
}

// Client message handler
export default async (
    ws: Socket.SocketServer,
    client: Socket.SocketClient,
    req: IncomingMessage,
    payload: ws.RawData
  ) => {
    let data;

    // make sure payload is valid
    try {
      data = JSON.parse(payload.toString());
    } catch (e) {
      data = null;
      console.log(e);
      console.log(payload);
    }
  
    // invalid packet, close connection
    if (data === null) return client.close();
  
    console.log(
      `[$wss] [Client>>Server] Recieved OP Code >${data.op}< from ${client.address}`
    );
  
    switch (data.op) {
  
      case OPCodes.AUTH:
        const { d } = data;
        const token = d.access_token;
  
        if (!token) {
          client.close(1008, "Unauthorized.");
          break;
        }
  
        let decode = await tokenUtil.validateAccessToken(token);
        if (decode === null) {
          client.close(1008, "Unauthorized.");
          break;
        }
  
        let isExpired = Date.now() / 1000 > decode["exp"];
  
        if (isExpired) {
          client.close(1008, "Unauthorized.");
          break;
        }
  
        console.log(`[$wss] User ${decode["userId"]} authenticated!`);

        // create client subscriber instance
        let _subscriber = new RedisPubSub();
        client.subscriber = _subscriber;
        
        // send to SessionUpdateQueue
        client.subscriber.publish(`SessionUpdateQueue`, decode["userId"]);
  
        // get session and store in client.session
        let _session = JSON.parse( await client.subscriber.get(`user:${decode["userId"]}:session`) );
        client.session = _session as LoopedSession;

        // add some error handling
        if (!client.session) {
          client.close(1008, "Unauthorized.");
          console.log(`[$wss] User ${decode["userId"]} session not found!`);
          break;
        }  

        // debug
        console.log(client.session);

        // send session to client with ready
        let payload = {
          op: OPCodes.READY,
          d: {
            _session: client.session,
          },
        };
  
        // send payload
        client.sendAsync(payload);
  
        // set client to authenticated
        client.authenticated = true;

        // add client to server clients
        ws.clients.add(client);

        // subscribe to user events
        client.subscriber.sub(`user:${decode["userId"]}:events`);
        // subscribe to server events
        client.session.servers.forEach((s: Server) => {
          client.subscriber.sub(`server:${s.id}:events`);
        });
        // subscribe to channels
        client.session.channels.forEach((c: Channel) => {
          client.subscriber.sub(`server:${c.serverId}}:channel:${c.id}:events`);
        });
        // subscribe to roles
        client.session.roles.forEach((r: Role) => {
          client.subscriber.sub(`server:${r.serverId}role:${r.id}:events`);
        });

        client.subscriber.onMessage((subscribedChannel: string, message: string) => {
          let data = JSON.parse(message);

          let opcode = data["op"];
          let d = data["d"];
      
          let payload = {
            op: opcode,
            d: d,
          };

          // handle opcodes that require subscribing or unsubscribing
          switch (opcode) {
            case OPCodes.SERVER_CREATE: 
              client.subscriber.sub(`server:${d.id}:events`);
            break;
            case OPCodes.SERVER_DELETE:
              client.subscriber.unsubscribe(`server:${d.id}:events`);
            break;
            case OPCodes.CHANNEL_CREATE:
              client.subscriber.sub(`server:${d.serverId}:channel:${d.id}:events`);
            break;
            case OPCodes.CHANNEL_DELETE:
              client.subscriber.unsubscribe(`server:${d.serverId}:channel:${d.id}:events`);
            break;
          }

          client.sendAsync(payload);
        });
        
        break;
  
      case OPCodes.CHANNEL_CREATE: 
        break;
  
      case OPCodes.SERVER_CREATE:
        //subscribeToServerEvents(client);
        break;
  
      case OPCodes.ERROR:
        break;
  
      default:
        client.close();
    }
  };