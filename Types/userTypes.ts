import { Role, Server } from "./serverTypes";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    servers?: Server[];
    friends?: User[];
    onlineFriends?: User[];
    avatar: string;
    friendsRequests?: User[];
    friendRequestsSent?: User[];
    createdAt: Date;
    updatedAt: Date;
    status?: string;
    location?: string;
    birthday?: Date;
    roles?: Role[];
}