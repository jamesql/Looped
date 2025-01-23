export {};

export {};

// Global tyoes
declare global {
        namespace Util {
            const ProgramName = "Looped - Socket";
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

                props: {
                    sequence: number;
                    lastHeartbeat: number;
                    username: String
                };

                sendAsync(data: any): Promise<void>;

            }
        }
        
}