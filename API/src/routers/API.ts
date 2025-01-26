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
  let { userId, exp } = await validateAccessToken(token);

  if (userId === undefined) {
    res.status(401).send("Invalid credentials.");
    return { valid: false, userId: null };
  }

  let isExpired = Date.now() / 1000 > exp;

  if (isExpired) {
    res.status(401).send("Unauthorized.");
    return { valid: false, userId: null };
  }

  return { valid: true, userId: userId };
};

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

    let user = await _prisma.user.findUnique({
      where: {
        id: validation.userId,
      },
    });

    if (user === null) {
      res.status(401).send("User not found.");
      return;
    }

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

    let user = await _prisma.user.findUnique({
      where: {
        id: validation.userId,
      },
    });

    if (user === null) {
      res.status(401).send("User not found.");
      return;
    }

    let server = await _prisma.server.findUnique({
      where: {
        id: serverId,
      },
    });

    if (server === null) {
      res.status(401).send("Server not found.");
      return;
    }

    // make sure user is not banned/already in server
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

// 1
router.post("/create-channel", (req: Request, res: Response) => {});

router.post("/modify-channel", (req: Request, res: Response) => {});

router.post("/delete-channel", (req: Request, res: Response) => {});

// 2
router.post("/message", (req: Request, res: Response) => {});

router.post("/modify-message", (req: Request, res: Response) => {});

router.post("/delete-message", (req: Request, res: Response) => {});

module.exports = router;
