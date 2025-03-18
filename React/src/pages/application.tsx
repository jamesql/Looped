import React, { useEffect } from 'react';
import WebSocketComponent from '@/components/WebSocket';
import { OpCodeHandler } from '@/util/ws';
import { OPCodes } from '../../../Types/socketTypes';
import Cookies from 'js-cookie';

const Application: React.FC = () => {

    // create the map of listeners
    const listeners = new Map<number, OpCodeHandler[]>();

    // check if access and refresh token are in cookie
    useEffect(() => {
        const accessToken = Cookies.get('access_token');
        const refreshToken = Cookies.get('refresh_token');

        if (!accessToken || !refreshToken) {
            // redirect to login page
            window.location.href = "/login";
        }
    }, []);

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