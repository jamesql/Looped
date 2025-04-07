import { Role, Server } from "./serverTypes";
import { Job } from "./jobTypes";
import { R2File } from "./contentTypes";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    servers?: Server[];

    friends?: User[];
    friendsOf?: User[];
    friendRequestsReceived?: User[];
    friendRequestsSent?: User[];

    directChannels?: DirectChannel[];
    directMessages?: DirectMessage[]; // Direct messages sent to this user

    avatarId?: string;
    avatar?: R2File;
    createdAt: Date;
    updatedAt: Date;
    status?: string;
    location?: string;
    birthday?: Date;
    roles?: Role[];
    applications?: Job[];
    portfolioCdnImages?: R2File[]; // Array of portfolio image IDs
    skills: string[];
}

export interface DirectChannel {
    id: string;
    createdAt: Date; // Date when the direct channel was created
    updatedAt: Date; // Date when the direct channel was last updated
    userIds: String[];
    users?: User[]; // Users that are part of this direct channel
    messages?: DirectMessage[]; // Messages in this direct channel
}

export interface DirectMessage {
    id: string;
    directChannelId: string;
    authorId: string;
    author?: User;

    content: string;
    createdAt: Date; // Date when the message was created
    updatedAt: Date; // Date when the message was last updated

    DirectChannel?: DirectChannel; // The direct channel this message belongs to

}