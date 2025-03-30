import {
  Prisma,
  PrismaClient,
  DirectChannel as PChannel,
  DirectMessage as PMessage,
} from "@prisma/client";
import { User, DirectChannel, DirectMessage } from "../../Types/userTypes";
import { MapRMapToPMap, RelationMap } from "./data";

const prisma = new PrismaClient();

class DirectService {
  async createDirectChannel(userIds: string[]): Promise<DirectChannel> {
    return await prisma.directChannel.create({
      data: {
        // Create a new direct channel with the provided user IDs
        users: {
          connect: userIds.map((userId) => ({ id: userId })),
        },
      },
    });
  }

  async getDirectChannelById(channelId: string): Promise<DirectChannel | null> {
    // Retrieve a direct channel by its ID
    return await prisma.directChannel.findUnique({
      where: { id: channelId }, // Replace with actual ID
      include: {
        users: {
          select: {
            id: true, // Select the user ID
            firstName: true, // Select the first name
            lastName: true, // Select the last name
            avatar: true, // Select the avatar
            avatarId: true,
            status: true, // Select the status
            location: true, // Select the location
            birthday: true, // Select the birthday
            email: true, // Select the email
            createdAt: true, // Select the createdAt
            updatedAt: true, // Select the updatedAt
            password: false,
            skills: true, // Select the skills
          },
        }, // Include users in the result
        messages: true, // Include messages in the result
      },
    });
  }

  async getDirectChannelByUserIds(
    userIds: string[]
  ): Promise<DirectChannel | null> {
    // Retrieve a direct channel by the user IDs
    return await prisma.directChannel.findFirst({
      where: {
        users: {
          every: {
            id: {
              in: userIds, // Ensure all user IDs are present in the channel
            },
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            status: true,
            location: true,
            birthday: true,
            email: true,
            skills: true,
            password: false,
            createdAt: true, // Include createdAt for users
            updatedAt: true, // Include updatedAt for users
          },
        },
        messages: true, // Include messages in the result
      },
    });
  }

  async createDirectMessage(
    channelId: string,
    authorId: string,
    content: string
  ): Promise<DirectMessage> {
    return await prisma.directMessage.create({
      data: {
        content: content,
        authorId: authorId, // The ID of the author of the message
        directChannelId: channelId, // The ID of the direct channel this message belongs to
      },
    });
  }

  async editDirectMessage(
    messageId: string,
    newContent: string
  ): Promise<DirectMessage> {
    // Edit an existing direct message by its ID
    return await prisma.directMessage.update({
      where: { id: messageId }, // Replace with actual message ID
      data: {
        content: newContent, // New content for the message
      },
    });
  }

  async deleteDirectMessage(messageId: string): Promise<DirectMessage> {
    // Delete a direct message by its ID
    return await prisma.directMessage.delete({
      where: { id: messageId }, // Replace with actual message ID
    });
  }

  async isFriendOrRequested(userId: string, otherUserId: string): Promise<boolean> {
    // find if the user has otherUserId in their friends or incomingFriendRequests or FriendRequestsSent
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: true,
        friendRequestsReceived: true,
        friendRequestsSent: true,
      },
    });

    if (!user) {
      return false; // User not found
    }
    // Check if the otherUserId is in the user's friends
    const isFriend = user.friends.some((friend) => friend.id === otherUserId);
    if (isFriend) {
      return true; // The other user is a friend
    }
    // Check if the otherUserId is in the user's incoming friend requests
    const isRequested = user.friendRequestsReceived.some(
      (request) => request.id === otherUserId
    );
    if (isRequested) {
      return true; // The other user has sent a friend request to the user
    }
    // Check if the otherUserId is in the user's sent friend requests
    const isSentRequest = user.friendRequestsSent.some(
      (request) => request.id === otherUserId
    );
    if (isSentRequest) {
      return true; // The user has sent a friend request to the other user
    }
    // If none of the above, return false
    return false;

  }

  async isCurrentlyRequested(userId: string, otherUserId: string): Promise<boolean> {
    // This method checks if a user has a pending friend request from another user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friendRequestsReceived: true,
      },
    });

    if (!user) {
      return false; // User not found
    }

    // Check if the otherUserId is in the user's incoming friend requests
    const isRequested = user.friendRequestsReceived.some(
      (request) => request.id === otherUserId
    );

    return isRequested; // Return true if there is a pending request, false otherwise
  }



}

export default new DirectService();
