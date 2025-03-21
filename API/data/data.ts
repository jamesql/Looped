import { User } from "../../Types/userTypes";

export type RelationMap<T> = {
    [K in keyof T]?: boolean | (T[K] extends Array<infer U> ? RelationMap<U> : RelationMap<T[K]>);
};

export class UserDatapacks {
    public static readonly ALL_USER_DATA: RelationMap<User> = {
        servers: {
            channels: {
                messages: {
                    author: true
                }
            }
        },
        roles: true
     

    }
    public static readonly USER_PUBLIC_DATA: RelationMap<User> = {}
}