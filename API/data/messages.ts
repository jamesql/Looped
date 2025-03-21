import { PrismaClient, Message as PrismaMessage } from '@prisma/client';
import { Message } from '../../Types/serverTypes';

const prisma = new PrismaClient();

class MessageService {
    async createMessage(content: string, userId: string, channelId: string): Promise<Message> {
        return await prisma.message.create({
            data: {
                content,
                authorId: userId,
                channelId,
            },
        });
    }

    async getMessageById(id: string): Promise<Message> {
        return await prisma.message.findUnique({
            where: { id },
        });
    }

    async updateMessage(id: string, content: string): Promise<Message> {
        return await prisma.message.update({
            where: { id },
            data: { content },
        });
    }

    async deleteMessage(id: string): Promise<Message> {
        return await prisma.message.delete({
            where: { id },
        });
    }

    async getMessagesByUserId(userId: string): Promise<Message[]> {
        return await prisma.message.findMany({
            where: { authorId: userId },
        });
    }

    async getMessagesByChannelId(channelId: string): Promise<Message[]> {
        return await prisma.message.findMany({
            where: { channelId },
        });
    }
}

export default new MessageService();