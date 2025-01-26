import ws from "ws";

export default class WebSocketService {
    private msgHandler: Function;
    private socket: WebSocket;
    static instance: WebSocketService;
    private static sequence: number = 1;

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

    onOpen = () => {
        console.log("WebSocket connection started.");
    };

    onClose = () => {
        console.log("WebSocket connection closed.");
    };

    onError = (error) => {
        console.error("WebSocket connection error.", error);
    };

    sendAsync = async(d: any) => {
        if (this.socket.readyState !== WebSocket.OPEN) return;
        console.log(`[$socketClient] [Client>>Server] Sent OP Code >${d.op}< to Server.`);

        return new Promise<void>((a,b) => {
            this.socket.send(
                JSON.stringify({
                    ...d,
                    s:d.s??++WebSocketService.sequence,
                })
            );
        });
    }

    closeConnection = () => {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.close();
        }
      };


}