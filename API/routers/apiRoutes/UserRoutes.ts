import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import { validateToken } from "../../data/token";
import UserService from "../../data/users";
import { redisInstance } from "../../data/redis";
import LoopedSession from "../../../Types/sessionTypes";
import { OPCodes } from "../../../Types/socketTypes";

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

    // store session
    redisInstance.set(`user:${user.user.id}:session`, JSON.stringify(user));

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

// edit user route
router.post("/edit", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("firstName").isString().isLength({ min: 1 }),
    body("lastName").isString().isLength({ min: 1 }),
    body("birthday").isString().isLength({ min: 1 }),
    body("location").isString().isLength({ min: 1 }),
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
    const updatedUser = await UserService.updateUser(result.userId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthday: req.body.birthday,
        location: req.body.location,
        status: req.body.status,
    });

    const newUser = await UserService.getAllUserData(result.userId);
    // remove password
    const { password, ...userWithoutPassword } = newUser.user;

    
    res.status(200).json(newUser);
    return;
});


module.exports = router;