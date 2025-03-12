import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import TokenUtil from "../../../Util/Token";
import ServerService from "../../data/servers";
import UserService from "../../data/users";
import ChannelService from "../../data/channels";
import RoleService from "../../data/roles";
import { Admin, Permissions } from "../../../Types/permissionsTypes";

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

    // check if user is either owner or admin, check their roles and then roles with the same server id has a list of permissions that can either be OWNER ADMIN MANAGER OR MEMBER
    const server = await ServerService.getServerById(req.body.serverId);

    // make sure server exists
    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // make sure user is either owner or admin
    if (server.ownerId !== user.id) {
        const roles = await RoleService.getRolesByServerId(user.id, server.id);
        const role = roles.find((role) => role.permissions.includes(Admin));

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
        permissionRequired: "MEMBER"
    }

    // create channel
    const newChannel = await ChannelService.createChannel(channel);

    // send response
    res.status(200).json(newChannel);
    return;

});
    


module.exports = router;