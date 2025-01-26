export default class WebSocketService {
    private msgHandler: Function;
    private instance: any;

    constructor(url: string, onMessageHandler: Function) {
        this.msgHandler = onMessageHandler;
    }


}