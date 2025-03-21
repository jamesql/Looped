import { PrismaClient, Server } from "@prisma/client";

const prisma = new PrismaClient();

class ServerService {
  async createServer(
    data: Omit<Server, "id" | "createdAt" | "updatedAt">
  ): Promise<Server> {
    return await prisma.server.create({
      data,
    });
  }

  async getServerById(id: string): Promise<Server | null> {
    return await prisma.server.findUnique({
      where: { id },
    });
  }

  async updateServer(id: string, data: Partial<Server>): Promise<Server> {
    return await prisma.server.update({
      where: { id },
      data,
    });
  }

  async editServer(id: string, data: Partial<Server>): Promise<Server> {
    return await prisma.server.update({
      where: { id },
      data,
    });
  }

  async deleteServer(id: string): Promise<Server> {
    return await prisma.server.delete({
      where: { id },
    });
  }

  async getAllServers(): Promise<Server[]> {
    return await prisma.server.findMany();
  }

  async addMember(serverId: string, userId: string): Promise<Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    });
  }

  async getMember(serverId: string, userId: string): Promise<Server | null> {
    return await prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: { id: userId },
        },
      },
    });
  }

  async removeMember(serverId: string, userId: string): Promise<Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });
  }

  async banUser(serverId: string, userId: string): Promise<Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        bannedUsers: {
          connect: { id: userId },
        },
      },
    });
  }

  async unbanUser(serverId: string, userId: string): Promise<Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        bannedUsers: {
          disconnect: { id: userId },
        },
      },
    });
  }

  async getServerByInviteCode(code: string): Promise<Server | null> {
    return await prisma.server.findFirst({
      where: {
        invites: {
          has: code,
        },
      },
    });
  }

  async addInviteCode(serverId: string, code: string): Promise<Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        invites: {
          push: code,
        },
      },
    });
  }

  async getAllServerData(serverId: string): Promise<Server> {
    return await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        members: true,
        roles: true,
        bannedUsers: true,
        channels: {
          include: {
            messages: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    });
  }
}

export default new ServerService();
