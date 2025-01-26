import React, { useState, useEffect } from 'react';
import WebSocketService from '../ws/WebSocketService';
import { OPCodes } from '../ws/WSValues';
import { onHello, onReady } from '../ws/WSHandlers';

export const WebSocketComponent = () => {
    const [wsServer, setWsService] = useState(null);


    // todo: add payload types
    const msgHandler = (data: any, self: WebSocketService) => {
        console.log(data);

        let { op, d } = data;

        switch (data.op)  {
            case OPCodes.HELLO:
                onHello(self, d);
                break;
            case OPCodes.READY:
                onReady(self, d);
                break;
        }
    };

    useEffect(() => {
        const ws = new WebSocketService("ws://127.0.0.1:444", msgHandler);
        setWsService(ws);

        return () => {
            ws.closeConnection();
        };
    }, []);

    return (
        <></>
    )
};