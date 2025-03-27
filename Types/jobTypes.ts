import { Server } from "./serverTypes";
import { User } from "./userTypes";

export interface Job {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    location: string;
    salary: string;
    status: string;
    serverId: string;
    server?: Server;
    applicants?: User[];
}