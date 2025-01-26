import express, { Router, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import Prisma from "../db/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
} from "../Util/Token";
import { v4 } from "uuid";
import { getUserSession, setUserSession } from "../Util/redis";

const router: Router = express.Router();
const _prisma = Prisma.getInstance();

// register user
router.post(
  "/signup",
  [
    // body validation
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
    body("username")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters."),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
  ],
  async (req: Request, res: Response) => {
    // validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firstName, lastName, username, email, password } = req.body;

    // include bcrypt for password later
    const user = await _prisma.user.create({
      data: {
        id: v4(),
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        password: password,
      },
    });

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({ accessToken, refreshToken });
  }
);

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username required."),
    body("password").notEmpty().withMessage("Password required."),
  ],
  async (req: Request, res: Response) => {
    // validate body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, password } = req.body;

    // get user from prisma
    let user = await _prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        serverMemberships: {
          include: {
            server: {
              include: {
                Channel: true,
              },
            },
            Role: {
              include: {
                RolePermissions: true,
              },
            },
          },
        },
      },
    });

    // or password is incorrect (bcrypt)
    if (user === null) {
      res.status(401).send("Invalid credentials.");
      return;
    }

    // get user servers, channels, roles
    let servers = user.serverMemberships.map((x) => x.server);
    let serverIds = servers.map((x) => x.id);
    let channels = servers.map((s) => s.Channel);
    let channelIds = channels.map((c, i) => {
      return { serverId: serverIds[i], channelIds: c.map((c) => c.id) };
    });
    let roles = user.serverMemberships.map((s, i) => {
      return { serverId: serverIds[i], roleIds: s.Role.map((r) => r.id) };
    });

    // send to ws
    // subscribe to all events on ws
    // redis.on()

    let _session: LoopedSession.Session = {
      userId: user.id,
      serverIds: serverIds,
      roleIds: roles,
      channelIds: channelIds,
    };

    await setUserSession(_session);

    let x = await getUserSession(user.id);
    // only give new refresh token if expired. Always give accessToken

    let tokenRes = await _prisma.refreshToken.findFirst({
      where: {
        userid: user.id,
      },
      orderBy: {
        expiresAt: "asc",
      },
    });

    const accessToken = await generateAccessToken(user.id);
    const refreshToken =
      tokenRes === null ||
      Date.parse(tokenRes.expiresAt.toString()) < Date.now()
        ? await generateRefreshToken(user.id)
        : tokenRes.token;

    res.json({ accessToken, refreshToken });
  }
);

router.post(
  "/refresh-token",
  [header("Authorization").notEmpty().withMessage("No Token Provided.")],
  async (req: Request, res: Response) => {
    // validate header
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    let token = req.header("Authorization") || "INVALID TOKEN";

    // validate token:
    let { userId } = await validateRefreshToken(token);

    if (userId === undefined) {
      res.status(401).send("Invalid credentials.");
      return;
    }

    // make sure token is valid in db
    let tokenRes = await _prisma.refreshToken.findFirst({
      where: {
        userid: userId,
      },
      orderBy: {
        expiresAt: "asc",
      },
    });

    if (tokenRes === null) {
      // should not occur, issue with db atp?
      res.status(399).send("Something went wrong.");
      return;
    }
    // if token expired
    if (Date.parse(tokenRes.expiresAt.toString()) < Date.now()) {
      // change this, not sure what the error code is ottomh
      res.status(402).send("Token expired.");
      return;
    }

    const newToken = await generateAccessToken(userId);

    res.send({ newToken });
  }
);

module.exports = router;
