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
    avatar?: string;
    friendsRequests?: User[];
    friendRequestsSent?: User[];
    createdAt: string;
    updatedAt: string;
    token?: string;
    status?: string;
    bio?: string;
    location?: string;
    birthday?: string;
    roles: Role[];
}