import { User } from "./userTypes";

export interface Server {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner: User;
    members: User[];
    channels: Channel[];
    invites: string[];
    icon?: string;
    banner?: string;
    description?: string;
    public: boolean;
    onlineMembers: User[];
    roles: Role[];
}

export interface Channel {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    serverId: string;
    server: Server;
    members: User[];
    messages: Message[];
}

export interface Message {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    author: User;
    channelId: string;
    channel: Channel;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
    serverId: string;
    server: Server;
}