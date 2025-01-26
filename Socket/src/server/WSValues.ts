// seperate data file so we can compile these values seperate than our
// global.d.ts

// Client and server OPCodes
export const OPCodes = {
    HELLO: 0,
    HEARTBEAT: 1,
    HEARTBEAT_ACK: 2,
    AUTH: 3,
    READY: 4,
    REQUEST_SERVER_MEMBERS: 5,
    MESSAGE_CREATE: 6,
    MESSAGE_UPDATE: 7,
    MESSAGE_DELETE: 8,
    TYPING_START: 9,
    SERVER_CREATE: 10,
    SERVER_DELETE: 11,
    SERVER_UPDATED: 12,
    SERVER_MEMBER_ADD: 13,
    SERVER_MEMBER_DEL: 14,
    SERVER_MEMBER_UPDATE: 15,
    RECONNECT: 99,
    UPDATE_VOICE_STATE: 100,
  
    NILOP: -1,
    ERROR: 9999,
  } as const;

export const HEARTBEAT_INTERVAL = 6e4 as const;

export interface User {}
