/// <reference path="./@types/global.d.ts" />

// include .env
require('dotenv').config();

// include util
require("./util");

import * as http from "http";
import * as ws from "ws";
import TokenUtil from "../Util/Token";

const server = http.createServer();
const wss = new ws.Server({ server });

const port = process.env.PORT || 444;
const host = process.env.HOST || 'localhost';

server.listen(port, () => {
    console.log(`[$wss] Server is listening on ${host}:${port}`);
    // generate test access token
    console.log(new TokenUtil().generateAccessToken("1"));
});

wss.on("connection", require("./modules/connection").default.bind(null, wss));