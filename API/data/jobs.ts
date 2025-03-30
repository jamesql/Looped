import { Prisma, PrismaClient, Job as PrismaJob } from "@prisma/client";
import { Job } from "../../Types/jobTypes";
import { MapRMapToPMap, RelationMap } from "./data";

const prisma = new PrismaClient();

class JobService {

    async createJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
        return await prisma.job.create({
            data: job as PrismaJob,
        });
    };

    async getJobById(id: string, withApplicants: false): Promise<Job | null> {
        return await prisma.job.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                location: true,
                salary: true,
                serverId: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                server: true,
                tags: true,
                applicants: withApplicants? {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        status: true,
                        location: true,
                        birthday: true,
                        email: true,
                        password: false,
                        createdAt: true,
                        updatedAt: true,
                        skills: true,
                    }
                }: false,
            }
        });
    };

    async editJob(id: string, data: Partial<Omit<Job, "id" | "createdAt" | "updatedAt">>): Promise<Job> {
        return await prisma.job.update({
            where: { id },
            data: data as PrismaJob,
        });
    };

    async deleteJob(id: string): Promise<Job> {
        return await prisma.job.delete({
            where: { id },
        });
    };

    async applyUserToJob(userId: string, jobId: string): Promise<Job> {
        return await prisma.job.update({
            where: { id: jobId },
            data: {
                applicants: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

}

export default new JobService();