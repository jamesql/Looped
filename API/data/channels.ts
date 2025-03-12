import { PrismaClient, Channel } from '@prisma/client';

const prisma = new PrismaClient();

class ChannelService {
    async createChannel(data: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Channel> {
        return await prisma.channel.create({
            data,
        });
    }

    async getChannelById(id: string): Promise<Channel | null> {
        return await prisma.channel.findUnique({
            where: { id },
        });
    }

    async updateChannel(id: string, data: Partial<Channel>): Promise<Channel> {
        return await prisma.channel.update({
            where: { id },
            data,
        });
    }

    async deleteChannel(id: string): Promise<Channel> {
        return await prisma.channel.delete({
            where: { id },
        });
    }

    async getAllChannels(): Promise<Channel[]> {
        return await prisma.channel.findMany();
    }
}

export default new ChannelService();