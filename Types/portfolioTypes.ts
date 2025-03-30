import { R2File } from "./contentTypes";
import { User } from "./userTypes";

export interface Portfolio {
    id: string;
    user?: User;
    files?: R2File[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}