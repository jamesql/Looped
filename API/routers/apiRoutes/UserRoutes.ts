import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import { validateToken } from "../../data/token";
import UserService from "../../data/users";
import { redisInstance } from "../../data/redis";
import LoopedSession from "../../../Types/sessionTypes";
import { OPCodes } from "../../../Types/socketTypes";
import { User } from "../../../Types/userTypes";
import ServerService from "../../data/servers";
import { ServerDatapacks } from "../../data/data";
import { UserDatapacks } from "../../data/data";

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

    const u: User = await UserService.getUserById(result.userId, UserDatapacks.ALL_USER_DATA);

    if (!u) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // store session
    redisInstance.set(`user:${u.id}:session`, JSON.stringify(u));

    res.status(200).json(u);
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

    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // set status in redis
    redisInstance.set(`user:${user.id}:status`, req.body.status);
});

// edit user route
router.post("/edit", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("firstName").isString().isLength({ min: 1 }),
    body("lastName").isString().isLength({ min: 1 }),
    body("location").isString().isLength({ min: 1 }),
    body("status").isString().isLength({ min: 1 }),
    body("skills").isArray(),
    body("skills.*").isString().isLength({ min: 1 }),
    body("images").isArray().isLength({ min:0 }),
    body("images.*").isString().isLength({ min: 1 }),
    body("avatarId").isString().isLength({ min: 0 }).optional(),
], async (req: Request, res: Response) => {
    console.log(req.body.images);
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

    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const updatedUser = await UserService.updateUserById(result.userId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        location: req.body.location,
        status: req.body.status,
        avatarId: req.body.avatarId? req.body.avatarId : undefined,
        skills: req.body.skills
    }, req.body.images);

    const newUser = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    redisInstance.publish(`user:${user.id}:events`, JSON.stringify({
        op: OPCodes.USER_UPDATE,
        d: {
            user: newUser,
        }
    }));

    // get user servers
    const servers = await ServerService.getServerIdsByUserId(user.id);
    for (const s of servers) {
        const id = s.id;
        redisInstance.publish(`server:${id}:events`, JSON.stringify({
            op: OPCodes.SERVER_MEMBER_UPDATE,
            d: {
                serverId: id,
                user: newUser,
            }
        }));
    }
    
    res.status(200).json(newUser);
    return;
});


module.exports = router;