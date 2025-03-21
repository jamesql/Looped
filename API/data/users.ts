import { Prisma, PrismaClient, User } from "@prisma/client";
import { User as LoopedUser } from "../../Types/userTypes";
import { Message, Server } from "../../Types/serverTypes";
import { Channel } from "../../Types/serverTypes";
import { Role } from "../../Types/serverTypes";

import LoopedSession from "../../Types/sessionTypes";

const prisma = new PrismaClient();

class UserService {
  async createUser(
    data: Omit<User, "id" | "createdAt" | "updatedAt" | "status">
  ): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async getAllUserData(id: string): Promise<LoopedSession | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Role: true,
        servers: {
          include: {
            Role: true,
            channels: {
              include: {
                Message: {
                  include: {
                    user: true,
                  },
                },
              },
            },
            members: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // map all servers to include the channels and messages
    const servers = user.servers.map((server) => {
      const channels = server.channels.map((channel) => {
        const messages = channel.Message.map((message) => {
          return {
            ...message,
            author: {
              ...message.user,
              password: undefined,
            },
            authorId: message.userId,
          };
        });

        return {
          ...channel,
          messages,
        };
      });

      return {
        ...server,
        channels,
        owner: server.members.find((member) => member.id === server.ownerId),
        roles: server.Role,
      };
    });

    // create a list of all channels user is in from servers
    const channels: Channel[] = [];
    servers.forEach((server) => {
      server.channels.forEach((channel) => {
        channels.push(channel);
      });
    });

    // create a list of all roles user has from servers
    const roles: Role[] = [];
    servers.forEach((server) => {
      server.roles.forEach((role) => {
        user.Role.find((userRole) => userRole.id === role.id) &&
          roles.push(role);
      });
    });

    const session: LoopedSession = {
      user: {
        ...user,
        password: undefined,
        servers: undefined,
      },
      servers: servers,
      channels: channels,
      roles: roles,
    };

    return session;
  }

  async getAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  async updateUser(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User> {
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




/** New user crud methods to map to global types */


async _createUser(user: LoopedUser): Promise<LoopedUser> {
  return await prisma.user.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      avatar: user.avatar || "",
      status: user.status || "New to Looped!",
      location: user.location || "",
      birthday: user.birthday || undefined,
    }
  })
};

async _getUserById(id: string, relation: RelationMap<LoopedUser>): Promise<LoopedUser> {
  const inc = await this.MapRMapToPrismaUser(relation);

  return await prisma.user.findUnique({
    where: { id },
    include: {
      ...inc
    }
  })
}

async _updateUserById(id: string, data: Partial<LoopedUser>): Promise<LoopedUser> {
  const keys = Object.keys(data);
  const updateData = keys.reduce((acc, key) => {
    acc[key] = data[key];
    return acc;
  }, {});

  return await prisma.user.update({
    where: { id },
    data: {
      ...updateData
    }
  });
}

async _deleteUserById(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
  return;
}

async MapRMapToPrismaUser(relation: RelationMap<LoopedUser>): Promise<Prisma.UserInclude> {
  const include: Prisma.UserInclude = {};

  // Map the relation to Prisma include
  for (const key in relation) {
    if (relation[key] && key in include) {
      include[key] = true;
    }
  }
  return include;
}

}

type RelationMap<T> = {
  [K in keyof T]?: boolean | (T[K] extends Array<infer U> ? RelationMap<U>[] : RelationMap<T[K]>);
};

export default new UserService();
