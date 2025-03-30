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
      include: {
        icon: true,
        banner: true
      },
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
        icon: true,
        banner: true
      },
    });
  }

  async editServerById(id: string, data: Partial<_Server>, iconId?: string | null, bannerId ?: string | null): Promise<_Server> {
    const updateData: Prisma.ServerUpdateInput = {};
  
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.website) updateData.website = data.website;
    if (data.tags) updateData.tags = data.tags;
  
    if (iconId !== undefined) {
      updateData.icon = iconId
        ? { connect: { id: iconId } }
        : { };
    }

    if (bannerId !== undefined) {
      updateData.banner = bannerId
        ? { connect: { id: bannerId } }
        : {  };
    }
  
    return await prisma.server.update({
      where: { id },
      data: updateData,
      include: {
        icon: true,
        banner: true
      },
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
        icon:true,
        banner:true
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

  async banMember(serverId: string, userId: string): Promise<_Server> {
    return await prisma.server.update({
      where: { id: serverId },
      data: {
        members: {
          disconnect: { id: userId },
        },
        bannedUsers: {
          connect: { id: userId },
        }
      },
    });
  }

  async getServerIdsByUserId(userId: string): Promise<{id: string}[]> {
    return await prisma.server.findMany({
      where: {
        members: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
      },
    });
  }

}

export default new ServerService();
