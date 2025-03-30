import { Channel, Message, Role, Server } from "../../Types/serverTypes";
import { User } from "../../Types/userTypes";

export type SelectMap<T> = {
    [K in keyof T]?: boolean;
}

export type RelationMap<T> = {
    [K in keyof T]?: boolean | (T[K] extends Array<infer U> ? RelationMap<U> : RelationMap<T[K]>);
} & {
    select?: SelectMap<T>;
};

export async function MapRMapToPMap<R, P>(
    relation: RelationMap<R>
  ): Promise<P> {
    const include = {} as P;

    // map relation to the include, include all rescursive relations in RelationMap
    for (const key in relation) {
      if (relation[key] === true) {
        (include as any)[key] = true;
      } 
      // if the value is a select object, include it
      else if (relation[key] && typeof relation[key] === "object" && relation[key].select) {
        (include as any)[key] = {
          select: relation[key].select
        };
      }
      // if the value is an object, recursively map it
      else if (typeof relation[key] === "object") {
        (include as any)[key] = {
          include: await MapRMapToPMap(relation[key] as RelationMap<R>)
        };
      }
      // if the value is an array, map it as well
      else if (Array.isArray(relation[key])) {
        (include as any)[key] = {
          include: await MapRMapToPMap(relation[key][0] as RelationMap<R>)
        };
      }
    }
    return include;
  }

export class UserDatapacks {
    public static readonly ALL_USER_DATA: RelationMap<User> = {
        avatar:true,
        friendRequestsSent: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true, // Include avatar
                status: true, // Include status
                location: true, // Include location
                birthday: true, // Include birthday
                email: true, // Include email
                password: false, // Exclude password for security
                skills: true,
            }
        },
        friendRequestsReceived: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true, // Include avatar
                status: true, // Include status
                location: true, // Include location
                birthday: true, // Include birthday
                email: true, // Include email
                password: false, // Exclude password for security
                skills: true,
            }
        },
        friends: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true, // Include avatar
                status: true, // Include status
                location: true, // Include location
                birthday: true, // Include birthday
                email: true, // Include email
                password: false, // Exclude password for security
                skills: true,
            }
        },
        servers: {
            icon:true,
            banner:true,    
            channels: {
                messages: {
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            status: true,
                            location: true,
                            birthday: true,
                            email: true,
                            password: false,
                            skills: true,
                        }
                    },
                    file: {
                        select: {
                            id: true,
                            fileName: true,
                            contentType: true,
                            fileSize: true,
                            createdAt: true,
                        }
                    }
                }
            },
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    status: true,
                    location: true,
                    birthday: true,
                    email: true,
                    roles: true,
                    password: false,
                    skills: true,
                }
            },
            owner: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    status: true,
                    location: true,
                    birthday: true,
                    email: true,
                    password: false,
                    skills: true,
                }
            },
        },
        roles: true,
    
    }
    public static readonly USER_PUBLIC_DATA: RelationMap<User> = {}
}

export class ServerDatapacks {
    public static readonly ALL_SERVER_DATA: RelationMap<Server> = {
        channels: {
            messages: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        status: true,
                        location: true,
                        birthday: true,
                        email: true,
                        password: false
                    }
                },
                file: {
                    select: {
                        id: true,
                        fileName: true,
                        contentType: true,
                        createdAt: true,
                        fileSize: true,
                    }
                }
            }

        },
        members: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                status: true,
                location: true,
                birthday: true,
                email: true,
                password: false
            }
        },
        roles: true,
        owner: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                status: true,
                location: true,
                birthday: true,
                email: true,
                password: false
            }
        },
        icon: true,
        banner: true
    }
    public static readonly SERVER_PUBLIC_DATA: RelationMap<Server> = {};
}

export class ChannelDatapacks {
    public static readonly CHANNEL_PUBLIC_DATA: RelationMap<Channel> = {};
}

export class MessageDatapacks {
    public static readonly MESSAGE_PUBLIC_DATA: RelationMap<Message> = {};
}

export class RoleDatapacks {
    public static readonly ROLE_PUBLIC_DATA: RelationMap<Role> = {};
}

export class PortfolioDatapacks {
    public static readonly PORTFOLIO_PUBLIC_DATA: RelationMap<PortfolioDatapacks> = {};
}

export class JobDatapacks {
    public static readonly JOB_PUBLIC_DATA: RelationMap<JobDatapacks> = {};
}