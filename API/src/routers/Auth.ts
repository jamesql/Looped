import express, { Router, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import Prisma from "../db/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
} from "../Util/Token";
import { v4 } from "uuid";
import { getUserSession, setUserSession, updateUserState } from "../Util/redis";

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
    // also validate username, email is not taken
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

    await updateUserState(user.id);

    res.json({ accessToken, refreshToken, userId: user.id });
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
    });

    // or password is incorrect (bcrypt)
    if (user === null) {
      res.status(401).send("Invalid credentials.");
      return;
    }

    await updateUserState(user.id);

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

    res.json({ accessToken, refreshToken, userId: user.id });
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
