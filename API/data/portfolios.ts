import { PrismaClient, Portfolio } from '@prisma/client';

const prisma = new PrismaClient();

class PortfolioService {
    async createPortfolio(data: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Portfolio> {
        return await prisma.portfolio.create({
            data,
        });
    }

    async getPortfolioById(id: string): Promise<Portfolio | null> {
        return await prisma.portfolio.findUnique({
            where: { id },
        });
    }

    async getAllPortfolios(): Promise<Portfolio[]> {
        return await prisma.portfolio.findMany();
    }

    async updatePortfolio(id: string, data: Partial<Portfolio>): Promise<Portfolio> {
        return await prisma.portfolio.update({
            where: { id },
            data,
        });
    }

    async deletePortfolio(id: string): Promise<Portfolio> {
        return await prisma.portfolio.delete({
            where: { id },
        });
    }
}

export default new PortfolioService();