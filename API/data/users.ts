import { Prisma, PrismaClient, User as PrismaUser } from "@prisma/client";
import { User } from "../../Types/userTypes";
import { MapRMapToPMap, RelationMap } from "./data";

const prisma = new PrismaClient();

class UserService {
  /** New user crud methods to map to global types */

  async createUser(user: User): Promise<User> {
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

  async getUserById(
    id: string,
    relation: RelationMap<User>,
    removePassword = true
  ): Promise<User> {
    const inc: Prisma.UserInclude = await MapRMapToPMap(relation);

    return await prisma.user.findUnique({
      where: { id },
      include: {
        ...inc,
      },
      omit: removePassword ? { password: true } : undefined,
    });
  }

  async updateUserById(
    id: string,
    data: Partial<User>
  ): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data as Partial<PrismaUser>
      },
    });
  }

  async deleteUserById(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
    return;
  }

  async getUserByEmail(email: string, relation: RelationMap<User>): Promise<User> {
    const inc: Prisma.UserInclude = await MapRMapToPMap(relation);

    return await prisma.user.findUnique({
      where: { email },
      include: {
        ...inc,
      },
    });
  }
}

export default new UserService();
