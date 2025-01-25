import { Channel } from "diagnostics_channel";
import { Server } from "http";

export {};

// Global tyoes
declare global {
  namespace LoopedSession {
    interface Session {
      userId: String;
      serverIds: string[];
      roleIds: { serverId: string; roleIds: string[] }[];
      channelIds: { serverId: string; channelIds: string[] }[];
    }
  }

  namespace Socket {
    type Server = import("ws").Server;
    type WebSocket = import("ws");

    interface SocketServer extends Server {
      clients: Set<SocketClient>;
    }

    interface SocketClient extends WebSocket {
      type: "client";
      authenticated: boolean;
      session: LoopedSession.Session;
      address: String;

      props: {
        sequence: number;
        lastHeartbeat: number;
      };

      sendAsync(data: any): Promise<void>;
    }
  }
}
