import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { Role } from '../../Types/serverTypes';

const prisma = new PrismaClient();

class RoleService {
    async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
        return prisma.role.create({
            data: data as PrismaRole,
        });
    }

    async getRoleById(id: string): Promise<Role | null> {
        return prisma.role.findUnique({
            where: { id },
        });
    }

    async getUserRolesByServerId(userId: string, serverId: string): Promise<Role[]> {
        return prisma.role.findMany({
            where: { 
                serverId: serverId,
                users: {
                    some: {
                        id: userId
                    }
                }
             },
        });
    }

    async updateRole(id: string, data: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role> {
        return prisma.role.update({
            where: { id },
            data: data as Partial<PrismaRole>,
        });
    }

    async deleteRole(id: string): Promise<Role> {
        return prisma.role.delete({
            where: { id },
        });
    }

    async getAllRoles(): Promise<Role[]> {
        return prisma.role.findMany();
    }

    async addRoleToUser(userId: string, roleId: string): Promise<Role> {
        // This method adds a role to a user
        return prisma.role.update({
            where: { id: roleId },
            data: {
                users: {
                    connect: { id: userId } // Connects the user to the role
                }
            },
        });
    }

    async removeRoleFromUser(userId: string, roleId: string): Promise<Role> {
        // This method removes a role from a user
        return prisma.role.update({
            where: { id: roleId },
            data: {
                users: {
                    disconnect: { id: userId } // Disconnects the user from the role
                }
            },
        });
    }
}

export default new RoleService();