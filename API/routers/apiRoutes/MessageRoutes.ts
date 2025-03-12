import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import TokenUtil from "../../../Util/Token";
import ServerService from "../../data/servers";
import UserService from "../../data/users";
import ChannelService from "../../data/channels";
import RoleService from "../../data/roles";
import MessageService from "../../data/messages";
import { Permissions } from "../../../Types/permissionsTypes";

const tokenUtil = new TokenUtil();

const router: Router = express.Router();

// create message route
router.post(
    "/create",
    [
        header("Authorization").isString().isLength({ min: 1 }),
        body("content").isString().isLength({ min: 1, max: 200 }),
        body("userId").isString().isLength({ min: 1 }),
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
        const user = await UserService.getUserById(userId["userId"]);

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

        if (!role && channel.permissionRequired !== "MEMBER") {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        // create message
        const newMessage = await MessageService.createMessage(req.body.content, user.id, channel.id);

        // return message
        res.status(200).json(newMessage);
        return;
    });

module.exports = router;