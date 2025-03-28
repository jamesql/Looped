import { PrismaClient, R2File as PrismaR2File } from '@prisma/client';
import { R2File } from '../../Types/contentTypes';

const prisma = new PrismaClient();

class ContentService {
    async createContent(data: Omit<R2File, 'id' | 'createdAt' | 'updatedAt'>): Promise<R2File> {
        return await prisma.r2File.create({
            data: data as PrismaR2File,
        });
    }

    async getContentById(id: string): Promise<R2File | null> {
        return await prisma.r2File.findUnique({
            where: { id },
            select: {
                id: true,
                fileName: true,
                contentType: true,
                createdAt: true,
                userId: true,
                fileSize: true
            }
        });
    };
    
}

export default new ContentService();