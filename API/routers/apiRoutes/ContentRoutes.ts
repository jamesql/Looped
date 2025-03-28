import express, {Router,  Express, Request, Response } from "express";
import { validateToken } from "../../data/token";
const { body, validationResult, header } = require("express-validator");
import UserService from "../../data/users";
import ContentService from "../../data/content";
import { UserDatapacks } from "../../data/data";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { param } from "express-validator";

const router: Router = express.Router();


const r2client = new S3Client({
    region: "auto",
    endpoint: process.env.CLOUDFLARE_R2_URL,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    },
  });
  

async function generatePresignedUploadUrl(fileName: string, contentType: string, contentLength: number) {
    const command = new PutObjectCommand({
        Bucket: "looped-ugc",
        Key: fileName,
        ContentType: contentType,
        ContentLength: contentLength
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
    body("contentLength").isInt({min:1, max: 5 * 1024 * 1024}),
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
        userId: user.id,
        fileSize: req.body.contentLength,
    });
    const url = await generatePresignedUploadUrl(file.id, req.body.contentType, req.body.contentLength);

    
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

module.exports = router;