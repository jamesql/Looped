import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");


const router: Router = express.Router();

router.post("/add-friend", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.post("/accept-friend", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.post("/decline-friend", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.post("/remove-friend", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.post("/msg/send", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.post("/msg/edit", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.post("/msg/delete", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

router.get("/channel", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
], async (req: Request, res: Response) => {
});

module.exports = router;