import Cookie from 'js-cookie';
import WebSocketService from './WebSocketService';
import { OPCodes } from './WSValues';

// change todo: add payload structures
export const onHello = async(client: WebSocketService, payload: any) => {

    let token = Cookie.get("accessToken");

    let d = {
        op: OPCodes.AUTH,
        d: {
            access_token: token
        }
    }
    await client.sendAsync(d);
};

export const onReady = async(client: WebSocketService, payload: any) => {
    await client.setSession(payload._session);
    console.log(client.getSession())
};