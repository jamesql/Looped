import express, { Router, Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import { AuthenticatedUser } from "../../Types/apiTypes";
import { User } from "../../Types/userTypes";
import LoopedSession from "../../Types/sessionTypes";
import users from "../data/users";
import { User as u } from "@prisma/client";
import TokenUtil from "../../Util/Token";
import { Bcrypt } from "../data/bcrypt";
import { redisInstance } from "../data/redis";
import { UserDatapacks } from "../data/data";

const tokenUtil = new TokenUtil(); // TokenUtil class
const bCrypt = new Bcrypt(); // Bcrypt class

const router: Router = express.Router();

// signn up post route
router.post(
  "/signup",
  [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6, max: 20 }),
    body("firstName").isString().isLength({ min: 3, max: 20 }),
    body("lastName").isString().isLength({ min: 3, max: 20 }),
    body("birthday").isString().isLength({ min: 10, max: 10 }),
    body("location").isString().isLength({ min: 3, max: 20 }),
  ],
  async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // encrypt the password with bcrypt
      const hashedPassword = await bCrypt.hashPassword(req.body.password);

      // create user
      const user: u = {
        id: undefined,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        birthday: new Date(req.body.birthday),
        location: req.body.location,
        avatarId: "",
        createdAt: undefined,
        updatedAt: undefined,
        status: undefined,
        skills: undefined
      };
      const newUser = await users.createUser(user);

      // generate tokens
      const access_token = tokenUtil.generateAccessToken(newUser.id);
      const refresh_token = tokenUtil.generateRefreshToken(newUser.id);

      // return authenticated user
      const { password, ...userWithoutPassword } = newUser;
      const authenticatedUser: AuthenticatedUser = {
        user: userWithoutPassword as User,
        accessToken: access_token,
        refreshToken: refresh_token,
      };

      const session: LoopedSession = await users.getUserById(newUser.id, UserDatapacks.ALL_USER_DATA);
      // remove password
      delete session.password;

      redisInstance.set(`user:${newUser.id}:session`, JSON.stringify(session));

      res.status(200).json(authenticatedUser);
      return;
  }
);

// login post route
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6, max: 20 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // find user by email
    const user = await users.getUserByEmail(req.body.email, UserDatapacks.ALL_USER_DATA);

    // check if user exists
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    // compare password
    const isPasswordValid = await bCrypt.comparePassword(req.body.password, user.password);

    // check if password is valid
    if (!isPasswordValid) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    
    // generate tokens
    const access_token = tokenUtil.generateAccessToken(user.id);
    const refresh_token = tokenUtil.generateRefreshToken(user.id);

    // set user session
    redisInstance.set(`user:${user.id}:session`, JSON.stringify(user));

    // remove password from user object
    delete user.password;

    // return authenticated user
    const authenticatedUser: AuthenticatedUser = {
      user: user as User,
      accessToken: access_token,
      refreshToken: refresh_token,
    };

    res.status(200).json(authenticatedUser);
    return;
    

});

// refresh token post route
// TODO: When global bans are implemented, check global ban before allowing refresh.
router.post(
  "/refresh",
  [
    header("Authorization").isString().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // get refresh token
    const refreshToken = req.header("Authorization");

    // validate refresh token
    const decode = tokenUtil.validateRefreshToken(refreshToken);

    // check if token is valid
    if (!decode) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    // check if token is expired
    const isExpired = Date.now() / 1000 > decode["exp"];
    if (isExpired) {
      res.status(400).json({ error: "Token expired" });
      return;
    }

    // generate new access token
    const accessToken = tokenUtil.generateAccessToken(decode["userId"]);

    res.status(200).json({ accessToken: accessToken });
    return;
  }
);

// refreshes the refresh token if it's near expiry.
router.post(
  "/refresh-trade",
  [
    header("Authorization").isString().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // get refresh token
    const refreshToken = req.header("Authorization");

    // validate refresh token
    const decode = tokenUtil.validateRefreshToken(refreshToken);

    // check if token is valid
    if (!decode) {
      res.status(400).json({ error: "Invalid token" });
      return;
    }

    // check if token is expired
    const isExpired = Date.now() / 1000 > decode["exp"];
    if (isExpired) {
      res.status(400).json({ error: "Token expired" });
      return;
    }

    // generate new access token
    const newToken = tokenUtil.generateRefreshToken(decode["userId"]);

    res.status(200).json({ refreshToken: newToken });
    return;
  }
);


module.exports = router;
