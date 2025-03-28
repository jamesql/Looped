import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import TokenUtil from "../../../Util/Token";
import ServerService from "../../data/servers";
import UserService from "../../data/users";
import ChannelService from "../../data/channels";
import RoleService from "../../data/roles";
import { Permissions } from "../../../Types/permissionsTypes";
import { validateToken } from "../../data/token";
import { redisInstance } from "../../data/redis";
import { OPCodes } from "../../../Types/socketTypes";
import { ServerDatapacks, UserDatapacks } from "../../data/data";

const tokenUtil = new TokenUtil();

const router: Router = express.Router();

// create channel route
router.post("/create", [
    header("Authorization").isString().isLength({min: 1}),
    body("name").isString().isLength({min: 3, max: 20}),
    body("serverId").isString().isLength({min: 1}),
    body("description").isString().isLength({min: 3, max: 100}),
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
    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // check if user is either owner or admin, check their roles and then roles with the same server id has a list of permissions that can either be OWNER ADMIN MANAGER OR MEMBER
    const server = await ServerService.getServerById(req.body.serverId, ServerDatapacks.SERVER_PUBLIC_DATA);

    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // make sure user is either owner or admin
    if (server.ownerId !== user.id) {
        const roles = await RoleService.getRolesByServerId(user.id, server.id);
        const role = roles.find((role) => role.permissions.includes(Permissions.ADMIN.toString()));

        // make sure user has the admin role
        if (!role) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
    }

    // create channel object
    const channel = {
        id: undefined,
        name: req.body.name,
        serverId: req.body.serverId,
        description: req.body.description,
        createdAt: undefined,
        updatedAt: undefined,
        type: "TEXT",
        permissionRequired: Permissions.MEMBER.toString() // default permission required for the channel, can be changed later by an admin or owner
    }

    // create channel
    const newChannel = await ChannelService.createChannel(channel);

    // send to server events channel was created
    redisInstance.publish(`server:${server.id}:events`, JSON.stringify({
        op: OPCodes.CHANNEL_CREATE,
        d: {
            server: server,
            channel: newChannel
        }
    }));

    // send response
    res.status(200).json(newChannel);
    return;

});

// edit channel route
router.post("/edit", [
    header("Authorization").isString().isLength({min: 1}),
    body("name").isString().isLength({min: 3, max: 20}),
    body("channelId").isString().isLength({min: 1}),
    body("description").isString().isLength({min: 3, max: 100}),
    body("permissionRequired").isString().isLength({min: 1}),
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
    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // get channel
    const channel = await ChannelService.getChannelById(req.body.channelId);

    // make sure channel exists
    if (!channel) {
        res.status(404).json({ error: "Channel not found" });
        return;
    }

    // get server
    const server = await ServerService.getServerById(channel.serverId, ServerDatapacks.SERVER_PUBLIC_DATA);

    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // make sure user is either owner or admin
    if (server.ownerId !== user.id) {
        const roles = await RoleService.getRolesByServerId(user.id, server.id);
        const role = roles.find((role) => role.permissions.includes(Permissions.ADMIN.toString()));

        // make sure user has the admin role
        if (!role) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
    }

    // edit channel object
    const editedChannel = {
        name: req.body.name,
        description: req.body.description,
        permissionRequired: req.body.permissionRequired
    }

    // edit channel
    const newChannel = await ChannelService.updateChannel(channel.id, editedChannel);

    // send to server events channel was edited
    redisInstance.publish(`server:${server.id}:events`, JSON.stringify({
        op: OPCodes.CHANNEL_MODIFY,
        d: {
            server: server,
            channel: newChannel
        }
    }));

    // send response
    res.status(200).json(newChannel);
    return;

});

// delete channel route
router.post("/delete", [
    header("Authorization").isString().isLength({min: 1}),
    body("channelId").isString().isLength({min: 1}),
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
    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    // make sure user exists
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // get channel
    const channel = await ChannelService.getChannelById(req.body.channelId);

    // make sure channel exists
    if (!channel) {
        res.status(404).json({ error: "Channel not found" });
        return;
    }

    // get server
    const server = await ServerService.getServerById(channel.serverId, ServerDatapacks.SERVER_PUBLIC_DATA);

    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // make sure user is either owner or admin
    if (server.ownerId !== user.id) {
        const roles = await RoleService.getRolesByServerId(user.id, server.id);
        const role = roles.find((role) => role.permissions.includes(Permissions.ADMIN.toString()));

        // make sure user has the admin role
        if (!role) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
    }

    // delete channel
    const deletedChannel = await ChannelService.deleteChannel(channel.id);

    // send to server events channel was deleted
    redisInstance.publish(`server:${server.id}:events`, JSON.stringify({
        op: OPCodes.CHANNEL_DELETE,
        d: {
            server: server,
            channel: deletedChannel
        }
    }));

    // send response
    res.status(200).json(deletedChannel);
    return;

});

module.exports = router;