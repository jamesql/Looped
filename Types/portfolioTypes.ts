import { User } from "./userTypes";

export interface Portfolio {
    id: string;
    user?: User;
    images: string[];
    userId: string;
    createdAt: string;
    updatedAt: string;
}