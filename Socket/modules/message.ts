/// <reference path="../@types/global.d.ts" />

import { IncomingMessage } from "http";
import * as ws from "ws";
import { OPCodes } from "../../Types/socketTypes";
import TokenUtil from "../../Util/Token";
import { RedisPubSub } from "../../Util/Redis";
import LoopedSession from "../../Types/sessionTypes";

// Import the TokenUtil class
const tokenUtil = new TokenUtil();

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
  
        // fill session object and send it to user

        // create client subscriber instance
        let _subscriber = new RedisPubSub();
        client.subscriber = _subscriber;
        
  
        // get session and store in client.session
        let _session = JSON.parse( await client.subscriber.get(`user:${decode["userId"]}:session`) );
        client.session = _session as LoopedSession;

        // add some error handling
        if (!client.session) {
          client.close(1008, "Unauthorized.");
          console.log(`[$wss] User ${decode["userId"]} session not found!`);
          break;
        }  

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