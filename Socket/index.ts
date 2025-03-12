/// <reference path="./@types/global.d.ts" />

import * as http from "http";
import * as ws from "ws";

const server = http.createServer();
const wss = new ws.Server({ server });

const port = process.env.PORT || 444;
const host = process.env.HOST || 'localhost';

server.listen(port, () => {
    console.log(`Server is listening on ${host}:${port}`);
});

wss.on('connection', (socket) => {

    socket.on("connection", require("./modules/connection").default.bind(null, server));

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});