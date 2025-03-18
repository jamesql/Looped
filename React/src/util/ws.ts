export type OpCodeHandler = (data: any, client: WebSocketClient) => void;

export class WebSocketClient {
    private ws: WebSocket;
    private handlers: Map<number, OpCodeHandler[]>;

    constructor(url: string) {
        this.ws = new WebSocket(url);
        this.handlers = new Map();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const opCode = message.op;
            const data = message.d;

            if (this.handlers.has(opCode)) {
                this.handlers.get(opCode)!.forEach(handler => handler(data, this));
            }
        };

        this.ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    public addListener(opCode: number, handler: OpCodeHandler): void {
        if (!this.handlers.has(opCode)) {
            this.handlers.set(opCode, []);
        }
        this.handlers.get(opCode)!.push(handler);
    }

    public send(data: any): void {
        this.ws.send(JSON.stringify(data));
    }

    public close(): void {
        this.ws.close();
    }
    public isOpen(): boolean {
        return this.ws.readyState === WebSocket.OPEN;
    }
    public readyState(): number {
        return this.ws.readyState;
    }
    public getUrl(): string {
        return this.ws.url;
    }
}