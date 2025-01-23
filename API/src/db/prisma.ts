import { PrismaClient } from '@prisma/client';

// Prisma Singleton Class
class Prisma {
  private static instance: PrismaClient;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Get the Prisma Client instance
  public static getInstance(): PrismaClient {
    if (!Prisma.instance) {
        Prisma.instance = new PrismaClient();
      console.log('Prisma Client has been initialized');
    }
    return Prisma.instance;
  }

  public static async disconnect() {
    if (Prisma.instance) {
      await Prisma.instance.$disconnect();
      console.log('Prisma Client has been disconnected');
    }
  }

}

export default Prisma;
