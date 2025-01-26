import ws from "ws";
import { Session } from "./WSValues";

export default class WebSocketService {
    private msgHandler: Function;
    private socket: WebSocket;
    static instance: WebSocketService;
    private sequence: number = 1;
    private session: Session;

    constructor(url: string, onMessageHandler: Function) {
        this.msgHandler = onMessageHandler;

        if (!WebSocketService.instance) {
            this.socket = new WebSocket(url);
            this.socket.onopen = this.onOpen;
            this.socket.onclose = this.onClose;
            this.socket.onerror = this.onError;

            this.socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                this.msgHandler(data, this);
            };

            WebSocketService.instance = this;
        }

        return WebSocketService.instance;

    }

    onOpen = (): void => {
        console.log("WebSocket connection started.");
    };

    onClose = (): void => {
        console.log("WebSocket connection closed.");
    };

    onError = (error): void => {
        console.error("WebSocket connection error.", error);
    };

    sendAsync = async(d: any): Promise<void> => {
        if (this.socket.readyState !== WebSocket.OPEN) return;
        console.log(`[$socketClient] [Client>>Server] Sent OP Code >${d.op}< to Server.`);

        return new Promise<void>((a,b) => {
            this.socket.send(
                JSON.stringify({
                    ...d,
                    s:d.s??++this.sequence,
                })
            );
        });                        
    }

    closeConnection = (): void => {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
      };

    setSession = (_s: Session): void => {
        this.session = _s;
    };

    getSession = (): Session => {
        return this.session;
    };


}