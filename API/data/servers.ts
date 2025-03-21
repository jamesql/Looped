import { Prisma, PrismaClient, Server } from "@prisma/client";
import { Server as _Server } from "../../Types/serverTypes";
import { MapRMapToPMap, RelationMap } from "./data";

const prisma = new PrismaClient();

class ServerService {
  /** New functions  */
  async createServer(
    data: Omit<_Server, "id" | "createdAt" | "updatedAt">
  ): Promise<_Server> {
    return await prisma.server.create({
      data: data as Server,
    });
  }

  async getServerById(
    id: string,
    relation: RelationMap<_Server>
  ): Promise<_Server> {
    const inc: Prisma.ServerInclude = await MapRMapToPMap(relation);
    return await prisma.server.findUnique({
      where: { id },
      include: {
        ...inc,
      },
    });
  }

  async editServerById(id: string, data: Partial<_Server>): Promise<_Server> {
    return await prisma.server.update({
      where: { id },
      data: data as Partial<Server>,
    });
  }

  async deleteServerById(id: string): Promise<_Server> {
    return await prisma.server.delete({
      where: { id },
    });
  }

  async getServerByInviteCode(code: string, relation: RelationMap<_Server>): Promise<_Server> {
    const inc: Prisma.ServerInclude = await MapRMapToPMap(relation);
    return await prisma.server.findFirst({
      where: {
        invites: {
          has: code,
        },
      },
      include: {
        ...inc,
      },
    });
  }

  async addInviteCode(serverId: string, code: string): Promise<_Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        invites: {
          push: code,
        },
      },
    });
  }

  
  async addMember(serverId: string, userId: string): Promise<_Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    });
  }

  async getMember(serverId: string, userId: string): Promise<_Server> {
    return await prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: { id: userId },
        },
      },
    });
  }

  async removeMember(serverId: string, userId: string): Promise<_Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    });
  }

}

export default new ServerService();
