import { Prisma, PrismaClient, User } from "@prisma/client";
import { User as LoopedUser } from "../../Types/userTypes";
import { Message, Server } from "../../Types/serverTypes";
import { Channel } from "../../Types/serverTypes";
import { Role } from "../../Types/serverTypes";

import LoopedSession from "../../Types/sessionTypes";
import { MapRMapToPMap, RelationMap } from "./data";

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
      },
    });
  }

  async _getUserById(
    id: string,
    relation: RelationMap<LoopedUser>
  ): Promise<LoopedUser> {
    const inc: Prisma.UserInclude = await MapRMapToPMap(relation);
    console.log(inc);

    return await prisma.user.findUnique({
      where: { id },
      include: {
        ...inc,
      },
    });
  }

  async _updateUserById(
    id: string,
    data: Partial<LoopedUser>
  ): Promise<LoopedUser> {
    const updateData: Partial<User> = {};
    for (const key in data) {
      if (data[key] && key in updateData) {
        updateData[key] = data[key];
      }
    }

    return await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
      },
    });
  }

  async _deleteUserById(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
    return;
  }

  async _getUserByEmail(email: string, relation: RelationMap<LoopedUser>): Promise<LoopedUser> {
    const inc = await this.MapRMapToPrismaUser(relation);

    return await prisma.user.findUnique({
      where: { email },
      include: {
        ...inc,
      },
    });
  }

  async MapRMapToPrismaUser(
    relation: RelationMap<Omit<LoopedUser, "id" | "createdAt" | "updatedAt">>
  ): Promise<Prisma.UserInclude> {
    const include: Prisma.UserInclude = {};

    // map relation to the include, include all rescursive relations in RelationMap
    for (const key in relation) {
      if (relation[key] === true) {
        include[key] = true;
      }
      // if the value is an object, recursively map it
      else if (typeof relation[key] === "object") {
        include[key] = {
          include: await this.MapRMapToPrismaUser(relation[key] as RelationMap<LoopedUser>)
        };
      }
      // if the value is an array, map it as well
      else if (Array.isArray(relation[key])) {
        include[key] = {
          include: await this.MapRMapToPrismaUser(relation[key][0] as RelationMap<LoopedUser>)
        };
      }
    }
    return include;
  }
}

export default new UserService();
