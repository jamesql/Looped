import { PrismaClient, User } from '@prisma/client';
import { User as LoopedUser } from '../../Types/userTypes';
import { Message, Server } from '../../Types/serverTypes';
import { Channel } from '../../Types/serverTypes';
import { Role } from '../../Types/serverTypes';

import LoopedSession from '../../Types/sessionTypes';

const prisma = new PrismaClient();

class UserService {
    async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        return await prisma.user.create({
            data,
        });
    }

    async getUserById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async getAllUserData(id: string): Promise<LoopedSession | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                Role: true,
                servers: {
                    include: {
                        Role: true,
                        channels: {
                            include: {
                                Message: {
                                    include: {
                                        user: true,
                                },
                            },
                        },                        
                    },
                    members: true,
                },
            },
        }
        });

        if (!user) {
            return null;
        }

        // map all servers to include the channels and messages
        const servers = user.servers.map((server) => {
            const channels = server.channels.map((channel) => {
                const messages = channel.Message.map((message) => {
                    return {
                        ...message,
                        author: {
                            ...message.user,
                            password: undefined,
                        },
                        authorId: message.userId
                    };
                });

                return {
                    ...channel,
                    messages,
                };
            });

            return {
                ...server,
                channels,
                owner: server.members.find((member) => member.id === server.ownerId),
                roles: server.Role,
            };
        });

        // create a list of all channels user is in from servers
        const channels: Channel[] = [];
        servers.forEach((server) => {
            server.channels.forEach((channel) => {
                channels.push(channel);
            });
        });

        // create a list of all roles user has from servers
        const roles: Role[] = [];
        servers.forEach((server) => {
            server.roles.forEach((role) => {
                user.Role.find((userRole) => userRole.id === role.id) && roles.push(role);
            });
        });

        const session: LoopedSession = {
            user: {
                ...user,
                password: undefined,
                servers: undefined,
            },
            servers: servers,
            channels: channels,
            roles: roles
        };

        return session;


}

    async getAllUsers(): Promise<User[]> {
        return await prisma.user.findMany();
    }

    async updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: string): Promise<User> {
        return await prisma.user.delete({
            where: { id },
        });
    }
}

export default new UserService();