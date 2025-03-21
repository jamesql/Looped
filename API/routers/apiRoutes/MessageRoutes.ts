import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import TokenUtil from "../../../Util/Token";
import ServerService from "../../data/servers";
import UserService from "../../data/users";
import ChannelService from "../../data/channels";
import RoleService from "../../data/roles";
import MessageService from "../../data/messages";
import { Member, Permissions } from "../../../Types/permissionsTypes";
import { validateToken } from "../../data/token";
import { redisInstance } from "../../data/redis";
import { OPCodes } from "../../../Types/socketTypes";
import { Message } from "../../../Types/serverTypes";
import { UserDatapacks } from "../../data/data";

const tokenUtil = new TokenUtil();

const router: Router = express.Router();

// create message route
router.post(
    "/create",
    [
        header("Authorization").isString().isLength({ min: 1 }),
        body("content").isString().isLength({ min: 1, max: 200 }),
        body("channelId").isString().isLength({ min: 1 }),
    ],
    async (req: Request, res: Response) => {
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
        const user = await UserService.getUserById(userId["userId"], UserDatapacks.USER_PUBLIC_DATA);

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

        // make sure user is in server
        const server = await ServerService.getServerById(channel.serverId);

        // make sure server exists
        if (!server) {
            res.status(404).json({ error: "Server not found" });
            return;
        }

        const member = await ServerService.getMember(server.id, user.id);

        if (!member) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // make sure user has permission to see channel
        const roles = await RoleService.getRolesByServerId(user.id, channel.serverId);
        const role = roles.find((role) => role.permissions.includes(channel.permissionRequired));

        if (!role && channel.permissionRequired !== Member) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // create message
        const newMessage = await MessageService.createMessage(req.body.content, user.id, channel.id);
        
        // add author to message using typecast to type Message

        // remove password from user
        user.password = undefined;

        newMessage["author"] = user;
        newMessage["authorId"] = user.id;

        // send to clients message was created

        redisInstance.publish(`server:${server.id}:channel:${channel.id}:events`, JSON.stringify({
            op: OPCodes.MESSAGE_CREATE,
            d: {
                server: server,
                channel: channel,
                message: newMessage
            }
        }));

        // return message
        res.status(200).json(newMessage);
        return;
    });

// edit message route
router.post(
    "/edit",
    [
        header("Authorization").isString().isLength({ min: 1 }),
        body("content").isString().isLength({ min: 1, max: 200 }),
        body("messageId").isString().isLength({ min: 1 }),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }   

        // validate access token
        const token = req.header("Authorization");
        const result = await validateToken(token);

        // make sure token is valid
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

        // get message
        const message = await MessageService.getMessageById(req.body.messageId);

        // make sure message exists
        if (!message) {
            res.status(404).json({ error: "Message not found" });
            return;
        }

        // make sure user is owner
        if (message.authorId !== user.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // edit message
        const newMessage = await MessageService.updateMessage(req.body.messageId, req.body.content);

        // get channel
        const channel = await ChannelService.getChannelById(message.channelId);
        // get server
        const server = await ServerService.getServerById(channel.serverId);
        // make sure channel and server exist
        if (!channel || !server) {
            res.status(404).json({ error: "Channel or Server not found" });
            return;
        }

        // send to clients message was edited
        redisInstance.publish(`server:${server.id}:channel:${channel.id}:events`, JSON.stringify({
            op: OPCodes.MESSAGE_UPDATE,
            d: {
                server: server,
                channel: channel,
                message: newMessage
            }
        }));

        // return message
        res.status(200).json(newMessage);
        return;
    });

// delete message route
router.post(
    "/delete",
    [
        header("Authorization").isString().isLength({ min: 1 }),
        body("messageId").isString().isLength({ min: 1 }),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }   

        // validate access token
        const token = req.header("Authorization");
        const result = await validateToken(token);

        // make sure token is valid
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

        // get message
        const message = await MessageService.getMessageById(req.body.messageId);

        // make sure message exists
        if (!message) {
            res.status(404).json({ error: "Message not found" });
            return;
        }

        // todo: check if user is server owner or has admin permissions
        // make sure user is owner
        if (message.authorId !== user.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // get channel and server
        const channel = await ChannelService.getChannelById(message.channelId);
        const server = await ServerService.getServerById(channel.serverId);

        // make sure channel and server exist
        if (!channel || !server) {
            res.status(404).json({ error: "Channel or Server not found" });
            return;
        }        

        // delete message
        const newMessage = await MessageService.deleteMessage(req.body.messageId);

        // send to clients message was deleted
        redisInstance.publish(`server:${server.id}:channel:${channel.id}:events`, JSON.stringify({
            op: OPCodes.MESSAGE_DELETE,
            d: {
                server: server,
                channel: channel,
                messageId: req.body.messageId
            }
        }));

        // return message
        res.status(200).json(newMessage);
        return;
    });


module.exports = router;