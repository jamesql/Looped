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

    async getRolesByServerId(userId: string, serverId: string): Promise<Role[]> {
        return prisma.role.findMany({
            where: { 
                serverId,
                userId,
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
}

export default new RoleService();