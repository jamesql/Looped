import express, {Router,  Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");


const router: Router = express.Router();

router.use("/user", require("./apiRoutes/UserRoutes"));
router.use("/channel", require("./apiRoutes/ChannelRoutes"));
router.use("/message", require("./apiRoutes/MessageRoutes"));
router.use("/role", require("./apiRoutes/RoleRoutes"));
router.use("/server", require("./apiRoutes/ServerRoutes"));
router.use("/job", require("./apiRoutes/JobRoutes"));
router.use("/content", require("./apiRoutes/ContentRoutes"));
router.use("/direct", require("./apiRoutes/DirectRoutes"));

router.use("/test", require("./apiRoutes/TestRoutes"));

module.exports = router;