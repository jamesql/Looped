import React from 'react';
import WebSocketComponent from '@/components/WebSocket';
import { OpCodeHandler } from '@/util/ws';
import { OPCodes } from '../../../Types/socketTypes';

const Application: React.FC = () => {

    // create the map of listeners
    const listeners = new Map<number, OpCodeHandler[]>();

    // Example handler
    const exampleHandler: OpCodeHandler = (data) => {
        console.log('Received data:', data);
    };
    listeners.set(OPCodes.HELLO, [exampleHandler]);

    return (
        <div>
            <WebSocketComponent url={"ws://127.0.0.1:444"} listeners={listeners} />
        </div>
    );
};

export default Application;