import express, {Router,  Express, Request, Response } from "express";
import { validateToken } from "../../data/token";
const { body, validationResult, header } = require("express-validator");
import UserService from "../../data/users";
import { UserDatapacks } from "../../data/data";
import Cloudflare from 'cloudflare';


const router: Router = express.Router();

// get cdn url and api key
const cdnUrl = process.env.CLOUDFLARE_CDN_URL || "";
const apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
const userId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const email = process.env.CLOUDFLARE_EMAIL || "";
const apiKey = process.env.CLOUDFLARE_API_KEY || "";

const client = new Cloudflare({
    apiEmail: email,
    apiToken: apiToken,
    apiKey: apiKey,
    
});


router.get("/get-upload-link", [
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
});

module.exports = router;