import { PrismaClient, Message as PrismaMessage } from '@prisma/client';
import { Message } from '../../Types/serverTypes';

const prisma = new PrismaClient();

class MessageService {
    async createMessage(content: string, userId: string, channelId: string, fileId?: string): Promise<Message> {
        return await prisma.message.create({
            data: {
                content,
                authorId: userId,
                channelId,
                ...(fileId && {
                    file: {
                      connect: { id: fileId },
                    },
                  }),
            },
            include: {
                file: true,
            },
    
        });
    }
    

    async getMessageById(id: string): Promise<Message> {
        return await prisma.message.findUnique({
            where: { id },
            include: {
                file: true,
            },
        });
    }

    async updateMessage(id: string, content: string): Promise<Message> {
        return await prisma.message.update({
            where: { id },
            data: { content },
            include: {
                file: true,
            },
        });
    }

    async deleteMessage(id: string): Promise<Message> {
        return await prisma.message.delete({
            where: { id },
            include: {
                file: true,
            },    
        });
    }

    async getMessagesByUserId(userId: string): Promise<Message[]> {
        return await prisma.message.findMany({
            where: { authorId: userId },
            include: {
                file: true,
            },    
        });
    }

    async getMessagesByChannelId(channelId: string): Promise<Message[]> {
        return await prisma.message.findMany({
            where: { channelId },
            include: {
                file: true,
            },    
        });
    }
}

export default new MessageService();