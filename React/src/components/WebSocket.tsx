import React, { useEffect, useRef } from 'react';
import {WebSocketClient, OpCodeHandler} from "../util/ws";

interface WebSocketProps {
    url: string;
    listeners: Map<number, OpCodeHandler[]>;
}

const WebSocketComponent: React.FC<WebSocketProps> = ({ url, listeners }) => {
    const wsRef = useRef<WebSocketClient | null>(null);

    useEffect(() => {
        if (wsRef.current) return;
        
        wsRef.current = new WebSocketClient(url);

        for (const [opCode, handlers] of listeners.entries()) {
            handlers.forEach(handler => {
                wsRef.current?.addListener(opCode, handler);
            });
        }

        return () => {

        };
    }, [url, listeners]);

    return<></>;
};

export default WebSocketComponent;