import { User } from "./userTypes";
import { Job } from "./jobTypes";

export interface Server {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    ownerId: string;
    owner?: User;
    website: string;
    members?: User[];
    channels?: Channel[];
    invites: string[];
    icon: string;
    banner: string;
    description: string;
    onlineMembers?: User[];
    roles?: Role[];
    jobListings?: Job[];
}

export interface Channel {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    serverId: string;
    server?: Server;
    messages?: Message[];
    permissionRequired: string;
}

export interface Message {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    author?: User;
    channelId: string;
    channel?: Channel;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
    serverId: string;
    createdAt: Date;
    updatedAt: Date;
    server?: Server;
}