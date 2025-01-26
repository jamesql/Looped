/// <reference path="../Util/@types/global.d.ts" />

import express, { Router, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import { v4 } from "uuid";
import { validateAccessToken } from "../Util/Token";
import Prisma from "../db/prisma";
import { publishToChannel, updateUserState } from "../Util/redis";
import { OPCodes } from "../Util/OPCodes";

const router: Router = express.Router();
const _prisma = Prisma.getInstance();

export const validateToken = async (
  token: string,
  res: Response
): Promise<Auth.TokenValidation> => {
  let decoded = await validateAccessToken(token);

  if (!decoded) {
    res.status(401).send("Invalid credentials.");
    return { valid: false, userId: null };
  }

  if (decoded["userId"] === undefined) {
    res.status(401).send("Invalid credentials.");
    return { valid: false, userId: null };
  }

  let isExpired = Date.now() / 1000 > decoded["exp"];

  if (isExpired) {
    res.status(401).send("Unauthorized.");
    return { valid: false, userId: null };
  }

  return { valid: true, userId: decoded["userId"] };
};

export const validateUser = async (userId: string, res: Response) => {
  const user = await _prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(401).send("User not found.");
    return null;
  }

  return user;
};

export const validateServer = async (serverId: string, res: Response) => {
  const server = await _prisma.server.findUnique({
    where: { id: serverId },
  });

  if (!server) {
    res.status(401).send("Server not found.");
    return null;
  }

  return server;
};

export const validateChannel = async (channelId: string, serverId: string, res: Response) => {
  const channel = await _prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.serverid !== serverId) {
    res.status(401).send("Channel not found.");
    return null;
  }

  return channel;
};

// make type for this
export const getServerData = async (userId) => {
  const serverData = await _prisma.server.findMany({
    where: {
      members: {
        some: {
          userId, // Ensure the user is a member of the server
        },
      },
    },
    include: {
      owner: true, // Include server owner
      members: {
        include: {
          user: true, // Get user details for each member
          Role: {
            include: {
              RolePermissions: true, // Include the role's permissions for each channel
            },
          },
        },
      },
      Channel: {
        include: {
          RolePermissions: {
            include: {
              role: true, // Include the role tied to the permission
            },
          },
        },
      },
      Role: {
        include: {
          RolePermissions: true, // Include role permissions for each channel
        },
      },
    },
  });

  // Restructure the data into a neat object
   const serverStructure = serverData.map((server) => {
    return {
      id: server.id,
      name: server.name,
      description: server.description,
      owner: server.owner, // Server owner details
      members: server.members.map((member) => ({
        user: member.user, // User info for the member
        roles: member.Role.map((role) => ({
          id: role.id,
          name: "ROLE NAME NEEDS TO BE IMPLEMENTED", // todo:
          permissions: role.RolePermissions.map((permission) => ({
            channelId: permission.channelid,
            canRead: permission.canRead,
            canSend: permission.canSend,
            canManage: permission.canManage,
            canConnect: permission.canConnect,
          })),
        })),
      })),
      channels: server.Channel.map((channel) => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        rolePermissions: channel.RolePermissions.map((rolePermission) => ({
          roleId: rolePermission.roleid,
          permissions: {
            canRead: rolePermission.canRead,
            canSend: rolePermission.canSend,
            canManage: rolePermission.canManage,
            canConnect: rolePermission.canConnect,
          },
        })),
      })),
    };
  });

  return serverStructure;
};


router.get("/get-server-data", [
  header("Authorization").notEmpty().withMessage("No Token Provided."),
  body("userId").notEmpty().withMessage("No userId provided.")
], async(req: Request, res: Response) => {
    // validate header
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let token = req.header("Authorization") || "INVALID TOKEN";
    let { userId } = req.body;

    let validation: Auth.TokenValidation = await validateToken(token, res);
    if (!validation.valid || validation.userId === null) return;

    let user = await validateUser(validation.userId, res);
    if (!user) return;

    let serverData = await getServerData(user.id);
    
    res.status(200).send(serverData);

});

router.post(
  "/create-server",
  [
    header("Authorization").notEmpty().withMessage("No Token Provided."),
    body("name").notEmpty().withMessage("No name provided."),
  ],
  async (req: Request, res: Response) => {
    // validate header
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let token = req.header("Authorization") || "INVALID TOKEN";
    let { name } = req.body;

    let validation: Auth.TokenValidation = await validateToken(token, res);
    if (!validation.valid || validation.userId === null) return;

    let user = await validateUser(validation.userId, res);
    if (!user) return;

    // create server in database
    let server = await _prisma.server.create({
      data: {
        id: v4(),
        name: name,
        ownerId: user.id,
      },
    });

    // add user to server
    let member = await _prisma.serverMember.create({
      data: {
        id: v4(),
        userId: user.id,
        serverId: server.id,
      },
    });

    let payload = {
      op: OPCodes.SERVER_CREATE,
      d: {
        id: server.id,
        name: server.name,
        ownerId: user.id,
      },
    };

    await publishToChannel(`user-events:${user.id}`, payload);
    await updateUserState(user.id);
    res.status(200).send(payload.d);
    return;
  }
);

router.post(
  "/join-server",
  [
    header("Authorization").notEmpty().withMessage("No Token Provided."),
    body("serverId").notEmpty().withMessage("No server id provided."),
  ],
  async (req: Request, res: Response) => {
    // validate header
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let token = req.header("Authorization") || "INVALID TOKEN";
    let { serverId } = req.body;

    let validation: Auth.TokenValidation = await validateToken(token, res);
    if (!validation.valid || validation.userId === null) return;

    let user = await validateUser(validation.userId, res);
    if (!user) return;

    let server = await validateServer(serverId, res);
    if (!server) return;

    // make sure user is not banned
    // todo:

    let mQuery = await _prisma.serverMember.findFirst({
      where: {
        userId: user.id,
        serverId: server.id,
      },
    });

    if (mQuery !== null) {
      res.status(401).send("Already a member of this server.");
      return;
    }

    // add user to server
    let member = await _prisma.serverMember.create({
      data: {
        id: v4(),
        userId: user.id,
        serverId: server.id,
      },
    });

    let scPayload = {
      op: OPCodes.SERVER_CREATE,
      d: {
        id: server.id,
        name: server.name,
        ownerId: user.id,
      },
    };

    let mjPayload = {
      op: OPCodes.SERVER_MEMBER_ADD,
      d: {
        id: server.id,
        user: user,
      },
    };

    await publishToChannel(`user-events:${user.id}`, scPayload);
    await publishToChannel(`server-events:${server.id}`, mjPayload);
    await updateUserState(user.id);
    res.status(200).send(scPayload.d);
  }
);

router.post("/leave-server", (req: Request, res: Response) => {});

router.post("/modify-server", (req: Request, res: Response) => {});

router.post("/delete-server", (req: Request, res: Response) => {});

router.post(
  "/create-channel",
  [
    header("Authorization").notEmpty().withMessage("No Token Provided."),
    body("serverId").notEmpty().withMessage("No server id provided."),
    body("channelName").notEmpty().withMessage("No channel name provided."),
    body("channelType")
      .isIn(["TEXT", "VOICE"])
      .withMessage("Channel types TEXT/VOICE."),
  ],
  async (req: Request, res: Response) => {
    // validate header
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let token = req.header("Authorization") || "INVALID TOKEN";
    let { serverId, channelName, channelType } = req.body;

    let validation: Auth.TokenValidation = await validateToken(token, res);
    if (!validation.valid || validation.userId === null) return;

    let user = await validateUser(validation.userId, res);
    if (!user) return;

    // make sure server exists
    let server = await validateServer(serverId, res);
    if (!server) return;

    // also add moderator permission later (todo)
    if (server.ownerId !== user.id) {
      res.status(401).send("No permission.");
      return;
    }

    let channel = await _prisma.channel.create({
      data: {
        id: v4(),
        name: channelName,
        type: channelType,
        serverid: serverId,
      },
    });

    let payload = {
      op: OPCodes.CHANNEL_CREATE,
      d: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        serverid: channel.serverid,
      },
    };

    await publishToChannel(`server-events:${channel.serverid}`, payload);
    await updateUserState(user.id);
    res.status(200).send(payload.d);
  }
);

router.post("/modify-channel", (req: Request, res: Response) => {});

router.post("/delete-channel", (req: Request, res: Response) => {});

router.post(
  "/message",
  [
    header("Authorization").notEmpty().withMessage("No Token Provided."),
    body("serverId").notEmpty().withMessage("No serverId provided."),
    body("channelId").notEmpty().withMessage("No channelId provided."),
    body("content").notEmpty().withMessage("No message content."),
  ],
  async (req: Request, res: Response) => {
    // validate header
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let token = req.header("Authorization") || "INVALID TOKEN";
    let { serverId, channelId, content } = req.body;

    let validation: Auth.TokenValidation = await validateToken(token, res);
    if (!validation.valid || validation.userId === null) return;

    let user = await validateUser(validation.userId, res);
    if (!user) return;

    // make sure server exists
    let server = await validateServer(serverId, res);
    if (!server) return;

    // make sure channel exists
    let channel = await validateChannel(channelId, serverId, res);
    if (!channel) return;

    // add role permissions later
    // todo:
    
    let msg = await _prisma.message.create({
      data: {
        id: v4(),
        content: content,
        senderid: user.id,
        channelid: channel.id
      }
    });

    let payload = {
      op: OPCodes.MESSAGE_CREATE,
      d: {
        id: msg.id,
        content: content,
        senderid: user.id,
        channelid: channel.id
      }
    }

    await publishToChannel(`channel-events:${server.id}:${channel.id}`, payload);
    res.status(200).send(payload.d);
  }
);

router.post("/modify-message", (req: Request, res: Response) => {});

router.post("/delete-message", (req: Request, res: Response) => {});

module.exports = router;
