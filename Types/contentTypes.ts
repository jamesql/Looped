import { Server } from "./serverTypes";

export interface R2File {
    id: string;
    fileName: string;         // Original file name uploaded by user
    contentType: string;      // MIME type (e.g., 'image/png')
    createdAt: Date;        // ISO date string or Date object
    userId?: string | null;   // Optional owner ID
    messageId?: string | null; // Optional Message ID
    fileSize: number;      // Size of the file in bytes
}
  

export interface ContentCreateResponse{
    url : string;
    r2file : R2File;
    contentType : string; //sometimes gets overriden so we use this one
}