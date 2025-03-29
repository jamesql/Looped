import { Prisma, PrismaClient, User as PrismaUser } from "@prisma/client";
import { User } from "../../Types/userTypes";
import { MapRMapToPMap, RelationMap } from "./data";
import DirectService from "./direct";

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
        avatar: true
      },
      omit: removePassword ? { password: true } : undefined,
    });
  }
  

  async updateUserById(id: string, data: Partial<User>): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};
  
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.location) updateData.location = data.location;
    if (data.status) updateData.status = data.status;
  
    if (data.avatarId !== undefined) {
      updateData.avatar = { connect: { id: data.avatarId } }
    }

    return await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        avatar: true
      },
    });
  }

  async deleteUserById(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
    return;
  }

  async getUserByEmail(
    email: string,
    relation: RelationMap<User>
  ): Promise<User> {
    const inc: Prisma.UserInclude = await MapRMapToPMap(relation);

    return await prisma.user.findUnique({
      where: { email },
      include: {
        ...inc,
      },
    });
  }

  async getUsersByRoleId(roleId: string): Promise<User[]> {
    // This method retrieves users by role ID
    return await prisma.user.findMany({
      where: {
        roles: {
          some: {
            id: roleId,
          },
        },
      },
    });
  }

  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    // This method sends a friend request from one user to another
    await prisma.user.update({
      where: { id: fromUserId },
      data: {
        friendRequestsSent: {
          connect: { id: toUserId },
        },
      },
    });

    await prisma.user.update({
      where: { id: toUserId },
      data: {
        friendRequestsReceived: {
          connect: { id: fromUserId },
        },
      },
    });
    return;
  }

  async acceptFriendRequest(
    fromUserId: string,
    toUserId: string
  ): Promise<void> {
    // This method accepts a friend request
    await prisma.user.update({
      where: { id: fromUserId },
      data: {
        friendRequestsSent: {
          disconnect: { id: toUserId },
        },
        friendRequestsReceived: {
          disconnect: { id: toUserId }
        },
        friends: {
          connect: { id: toUserId },
        },
      },
    });

    await prisma.user.update({
      where: { id: toUserId },
      data: {
        friendRequestsReceived: {
          disconnect: { id: fromUserId },
        },
        friendRequestsSent: {
          disconnect: { id: fromUserId }
        },
        friends: {
          connect: { id: fromUserId },
        },
      },
    });

    // create a direct channel for the two users if it doesn't already exist
    await DirectService.createDirectChannel([fromUserId, toUserId]);

    return;
  }

  async declineFriendRequest(
    fromUserId: string,
    toUserId: string
  ): Promise<void> {
    // This method declines a friend request
    await prisma.user.update({
      where: { id: fromUserId },
      data: {
        friendRequestsSent: {
          disconnect: { id: toUserId },
        },
      },
    });

    await prisma.user.update({
      where: { id: toUserId },
      data: {
        friendRequestsReceived: {
          disconnect: { id: fromUserId },
        },
      },
    });
    return;
  }

  async isFriends(
    userId: string,
    otherUserId: string
  ): Promise<boolean> {
    // This method checks if two users are friends
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: true, // Include the friends relation
      },
    });

    if (!user) {
      return false; // User not found
    }

    // Check if the otherUserId is in the user's friends list
    const isFriend = user.friends.some((friend) => friend.id === otherUserId);
    return isFriend; // Return true if they are friends, false otherwise
  }

  async removeFriend(
    userId: string,
    otherUserId: string
  ): Promise<void> {
    // This method removes a friend from the user's friend list
    await prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          disconnect: { id: otherUserId }, // Disconnect the friend
        },
      },
    });

    await prisma.user.update({
      where: { id: otherUserId },
      data: {
        friends: {
          disconnect: { id: userId }, // Disconnect the user from the other user's friend list
        },
      },
    });
    return;
  }

}

export default new UserService();
