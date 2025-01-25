import { Channel } from "diagnostics_channel";
import { Server } from "http";

export {};

// Global tyoes
declare global {

        namespace LoopedSession {

            // We need channel ids users are subscribed to in memory 
            // in our session so when redis contacts the websocket we can relay that info 
            // efficiently
            // just for example
            // made need to move to seperate file in future

            interface Session {
                userId: String,
                serverIds: Set<String>,
                roleIds: Set<String>,
                channelIds: Set<String>,
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

                props: {
                    sequence: number;
                    lastHeartbeat: number;
                    username: String
                };

                sendAsync(data: any): Promise<void>;

            }
        }
        
}