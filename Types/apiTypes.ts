import { User } from "./userTypes";

export interface AuthenticatedUser {
    user: User;
    accessToken: string;
    refreshToken: string;
}