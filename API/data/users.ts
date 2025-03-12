import { PrismaClient, User } from '@prisma/client';

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