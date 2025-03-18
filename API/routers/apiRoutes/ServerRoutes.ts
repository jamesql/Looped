import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import TokenUtil from "../../../Util/Token";
import ServerService from "../../data/servers";
import UserService from "../../data/users";
import { validateToken } from "../../data/token";
import { redisInstance } from "../../data/redis";
import { OPCodes } from "../../../Types/socketTypes";


const tokenUtil = new TokenUtil();

const router: Router = express.Router();


router.post("/create", [
    header("Authorization").isString().isLength({min: 1}),
    body("name").isString().isLength({min: 3, max: 20}),
    body("description").isString().isLength({min: 3, max: 100}),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    // validate access token
    const token = req.header("Authorization");
    const userId = await tokenUtil.validateAccessToken(token);

    // make sure token is valid
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // check if token is expired
    const isExpired = Date.now() / 1000 > userId["exp"];
    if (isExpired) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // get user
    const user = await UserService.getUserById(userId["userId"]);

    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // create server object
    const server = {
        id: undefined,
        name: req.body.name,
        ownerId: user.id,
        description: req.body.description,
        banner: "",
        icon: "",
        invites: [],
        createdAt: undefined,
        updatedAt: undefined,
    };

    // create server
    const newServer = await ServerService.createServer(server);

    // join user to server
    await ServerService.addMember(newServer.id, user.id);

    // publish to redis {"op":OPCodes, "d":{"type":"serverJoin", "server":newServer}}
    redisInstance.publish(`user:${user.id}:events`, JSON.stringify({
        op: OPCodes.SERVER_CREATE,
        d: {
            server: newServer
        }
    }));

    // return server
    res.status(200).json(newServer);
    return;

});

router.post("/edit", [
    header("Authorization").isString().isLength({min: 1}),
    body("name").isString().isLength({min: 3, max: 20}),
    body("description").isString().isLength({min: 3, max: 100}),
    body("icon").isString().isLength({min: 1}),
    body("banner").isString().isLength({min: 1}),
], async(req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    // validate access token
    const token = req.header("Authorization");

    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // get user
    const user = await UserService.getUserById(result.userId);

    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // get server
    const server = await ServerService.getServerById(req.body.serverId);

    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // make sure user is owner
    if (server.ownerId !== user.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // create edited server object
    let editedServer = {
        name: req.body.name,
        description: req.body.description,
        banner: req.body.banner,
        icon: req.body.icon,
        createdAt: undefined,
        updatedAt: undefined
    };

    // edit server
    const newServer = await ServerService.editServer(server.id, editedServer);

    // return server
    res.status(200).json(newServer);
    return;

});

// delete server route
router.post("/delete", [
    header("Authorization").isString().isLength({min: 1}),
    body("serverId").isString().isLength({min: 1}),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    // validate access token
    const token = req.header("Authorization");
    
    const result = await validateToken(token);
    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // get user
    const user = await UserService.getUserById(result.userId);

    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // get server
    const server = await ServerService.getServerById(req.body.serverId);

    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // make sure user is owner
    if (server.ownerId !== user.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // delete server
    await ServerService.deleteServer(server.id);

    // return success
    res.status(200).json({ success: true });
    return;

});

// join server route
router.post("/join", [
    header("Authorization").isString().isLength({min: 1}),
    body("code").isString().isLength({min: 1}),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    // validate access token
    const token = req.header("Authorization");
    const result = await validateToken(token);
    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    // get user
    const user = await UserService.getUserById(result.userId);
    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // get server by invite code
    const server = await ServerService.getServerByInviteCode(req.body.code);
    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }
    // add user to server
    await ServerService.addMember(server.id, user.id);

    // publish to redis {"op":OPCodes, "d":{"type":"serverJoin", "server":newServer}}
        redisInstance.publish(`user:${user.id}:events`, JSON.stringify({
            op: OPCodes.SERVER_CREATE,
            d: {
                server: server
            }
        }));
    
    // return server
    res.status(200).json(server);
    return;
});



module.exports = router;