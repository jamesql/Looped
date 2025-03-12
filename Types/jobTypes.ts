import { User } from "./userTypes";

export interface Job {
    id: string;
    serverId: string;
    title: string;
    payStart: number;
    payEnd: number;
    description: string;
    createdAt: string;
    updatedAt: string;
    applicants: Applicant[];
    questions?: string[];
}

export interface Applicant {
    userId: string;
    user: User;
    files: string[];
    answers: string[];
}