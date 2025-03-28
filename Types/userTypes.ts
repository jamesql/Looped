import { Role, Server } from "./serverTypes";
import { Job } from "./jobTypes";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    servers?: Server[];
    friends?: User[];
    friendsOf?: User[];
    friendRequests?: User[];
    friendRequestsSent?: User[];
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
    status?: string;
    location?: string;
    birthday?: Date;
    roles?: Role[];
    applications?: Job[];
}