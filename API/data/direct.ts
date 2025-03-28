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
            status: true, // Select the status
            location: true, // Select the location
            birthday: true, // Select the birthday
            email: true, // Select the email
            createdAt: true, // Select the createdAt
            updatedAt: true, // Select the updatedAt
            password: false,
          },
        }, // Include users in the result
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
}

export default new DirectService();
