import { User } from "./userTypes";
import { Job } from "./jobTypes";
import { R2File } from "./contentTypes";

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
    icon?: R2File;
    iconId?: string;
    banner?: R2File;
    bannerId?: string;
    description: string;
    onlineMembers?: User[];
    roles?: Role[];
    jobListings?: Job[];
    tags: string[];
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
    permissionRequired: number;
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
    file?: R2File | null;
}

export interface Role {
    id: string;
    name: string;
    permissions: number;
    serverId: string;
    createdAt: Date;
    updatedAt: Date;
    server?: Server;
    users?: User[];
}