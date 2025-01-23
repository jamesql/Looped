import express, {Router, Request, Response} from "express";
import Prisma from "../db/prisma";
import { generateAccessToken, generateRefreshToken, validateRefreshToken } from "../Util/Token";
import {v4} from "uuid";

const router: Router = express.Router();
const _prisma = Prisma.getInstance();

// register user
router.post("/signup", async (req: Request, res: Response) => {
    const {firstName, lastName, username, email, password} = req.body;


    // include bcrypt for password later
    const user = await _prisma.user.create({
        data: {
            id: v4(),
            firstName: firstName,
            lastName: lastName,
            username: username,
            email: email,
            password: password
        }
    });

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({accessToken, refreshToken});
});

router.post("/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!req.body || !username || !password) {
        res.status(400).send("Bad request.");
        return;
    }

    // get user from prisma
    let user = await _prisma.user.findUnique({
        where: {
            username: username
        }
    });

    console.log(user);

    // or password is incorrect (bcrypt)
    if (user === null) {
        res.status(401).send("Invalid credentials.");
        return;
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    console.log(accessToken);
    console.log(refreshToken);

    res.json({accessToken, refreshToken});
});

router.post("/refresh-token", async (req: Request, res: Response) => {
    // validate refresh-token, if expired give error so user reauths
    // if valid refresh token
    // return new access-token

    // No auth token provided
    if (!req.header("Authorization")) {
        res.status(400).send("Bad request.");
        return;
    }

    let token = req.header("Authorization") || "INVALID TOKEN";    

    // validate token:
    let { userId } = await validateRefreshToken(token);

    if (userId === undefined) {
        res.status(401).send("Invalid credentials.")
        return;
    }

    // make sure token is valid in db
    let tokenRes = await _prisma.refreshToken.findFirst({
        where: {
            userid: userId
        },
        orderBy: {
            expiresAt: 'asc'
        }
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

    res.send({newToken});

});

module.exports = router;