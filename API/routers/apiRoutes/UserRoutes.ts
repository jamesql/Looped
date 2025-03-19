import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import { validateToken } from "../../data/token";
import UserService from "../../data/users";
import { redisInstance } from "../../data/redis";
import LoopedSession from "../../../Types/sessionTypes";

const router: Router = express.Router();

// Get user data
router.get("/get-user-data", [
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

    const user: LoopedSession = await UserService.getAllUserData(result.userId);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    res.status(200).json(user);
    return;
    
});

// set user status
router.post("/status", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("status").isString().isLength({ min: 1 }),
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

    const user = await UserService.getUserById(result.userId);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // set status in redis
    redisInstance.set(`user:${user.id}:status`, req.body.status);
});

module.exports = router;