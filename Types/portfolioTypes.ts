import { User } from "./userTypes";

export interface Portfolio {
    id: string;
    user?: User;
    files: string[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}