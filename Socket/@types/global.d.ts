import { Server } from "http";
import LoopedSession from "../../Types/sessionTypes";
import { RedisPubSub } from "../../Util/Redis";

export {};

// Global tyoes
declare global {

  namespace Socket {
    type Server = import("ws").Server;
    type WebSocket = import("ws");

    interface SocketServer extends Server {
      clients: Set<SocketClient>;
    }

    interface SocketClient extends WebSocket {
      type: "client";
      authenticated: boolean;
      session: LoopedSession;
      address: String;
      activeSubscriptions: Set<string>;
      subscriber: RedisPubSub;

      props: {
        sequence: number;
        lastHeartbeat: number;
      };

      sendAsync(data: any): Promise<void>;
    }
  }
}