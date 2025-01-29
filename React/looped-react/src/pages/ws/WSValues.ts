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
    CHANNEL_CREATE: 16,
    CHANNEL_MODIFY: 17,
    CHANNEL_DELETE: 18,
    
    RECONNECT: 99,
    UPDATE_VOICE_STATE: 100,
  
    NILOP: -1,
    ERROR: 9999,
  } as const;
  
  export const HEARTBEAT_INTERVAL = 6e4 as const;
  
  export interface User {}

  export interface Session {
    userId: String;
    serverIds: string[];
    roleIds: { serverId: string; roleIds: string[] }[];
    channelIds: { serverId: string; channelIds: string[] }[];
  }

  export type CHANNEL_TYPE = "TEXT" | "VOICE"

  export interface User {
    id: string,
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    avatarUrl?: string,
    roles: Role[]
  }

  export interface Client extends User {
    servers: Server[]
  }

  export interface Message {
    id: string,
    content: string,
    senderid: string,
    channelid: string
  }

  export interface Channel {
    id: string,
    name: string,
    serverid: string,
    channelType: CHANNEL_TYPE,
    messages?: Message[]
  }

  export interface RolePermissions {
    roleid: string,
    channelid: string,
    canRead: boolean,
    canSend: boolean,
    canManage: boolean,
    canConnect: boolean
  }

  export interface Role {
    id: string,
    serverid: string,
    RolePermissions: RolePermissions[]
  }

  export interface Server {
    id: string, 
    name: string, 
    description: string, 
    ownerId: string,
    members: User[],
    channels: Channel[]
  }

  export interface ServerMember {
    id: string,
    userId: string,
    serverId: string,
    user: {
      firstName: string,
      lastName: string,
      username: string
    }
  }
  