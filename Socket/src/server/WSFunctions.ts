/// <reference path="../utils/@types/global.d.ts" />

import { WebSocket } from "ws";

// define the function sendAsync which is added onto the WebSocket object
Object.defineProperty(WebSocket.prototype, "sendAsync", {
    async value(this: Socket.SocketClient, d: any) {
		// dont send if socket is closed
		if (this.readyState !== WebSocket.OPEN) return;
        console.log(`[$wss] [Server>>Client] Sent OP Code >${d.op}< to ${this.props.username}`);
		return new Promise<void>((a, b) =>
			// pack the data into a string and update the sequence
			this.send(typeof d !== "string" ? JSON.stringify({
				...d,
				s: d.s ?? ++this.props.sequence
				// resolve or reject the promise based on the result
			}) : d, (e) => !e ? a() : b(e))
		);
	}
});

export default null;