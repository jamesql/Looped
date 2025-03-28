import express, {Router,  Express, Request, Response } from "express";
import { validateToken } from "../../data/token";
const { body, validationResult, header } = require("express-validator");
import UserService from "../../data/users";
import ContentService from "../../data/content";
import { UserDatapacks } from "../../data/data";
import Cloudflare from 'cloudflare';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { param } from "express-validator";



const router: Router = express.Router();

// get cdn url and api key
const apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
const userId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const email = process.env.CLOUDFLARE_EMAIL || "";
const apiKey = process.env.CLOUDFLARE_API_KEY || "";

const client = new Cloudflare({
    apiEmail: email,
    apiToken: apiToken,
    apiKey: apiKey,
});

const r2client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_URL,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    },
  });
  

async function generatePresignedUploadUrl(fileName: string, contentType: string) {
    const command = new PutObjectCommand({
        Bucket: "looped-ugc",
        Key: fileName,
        ContentType: contentType,
    });

    const url = await getSignedUrl(r2client, command, { expiresIn: 3600 });
    return url;
}

export async function getPresignedDownloadUrl(fileName: string) {
    const command = new GetObjectCommand({
      Bucket: "looped-ugc",
      Key: fileName,
    });
  
    const url = await getSignedUrl(r2client, command, { expiresIn: 3600 });
    return url;
  }
  

router.post("/create", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("fileName").isString().isLength({ min: 1 }),
    body("contentType").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // check if user exists
    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const file = await ContentService.createContent({
        fileName: req.body.fileName,
        contentType: req.body.contentType,
    });
    const url = await generatePresignedUploadUrl(file.id, req.body.contentType);

    
    res.status(200).json({url: url, r2file: file});
    return;
});

router.get("/files/:id", [
    header("Authorization").isString().isLength({ min: 1 }),
    param("id").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // check if user exists
    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const file = await ContentService.getContentById(req.params.id);
    const url = await getPresignedDownloadUrl(file.id);
    res.status(200).json({url: url, r2file: file});
    return;
});


/*
router.get("/get-video-link", [ // if we still want this
    header("Authorization").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // check if user exists
    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // get upload link
    const directUpload = await client.stream.directUpload.create({
        account_id: userId,
        maxDurationSeconds: 3600, 
    });

    res.status(200).json(directUpload.uploadURL);
    return;
});*/

module.exports = router;