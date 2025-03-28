import express, {Router,  Express, Request, Response } from "express";
import { validateToken } from "../../data/token";
const { body, validationResult, header } = require("express-validator");
import UserService from "../../data/users";
import ServerService from "../../data/servers";
import JobService from "../../data/jobs";
import RoleService from "../../data/roles";
import { UserDatapacks, ServerDatapacks } from "../../data/data";
import { Permissions } from "../../../Types/permissionsTypes";


const router: Router = express.Router();

router.post("/create", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("title").isString().isLength({ min: 1 }),
    body("description").isString().isLength({ min: 1 }),
    body("location").isString().isLength({ min: 1 }),
    body("salary").isString().isLength({ min: 1 }),
    body("serverId").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const server = await ServerService.getServerById(req.body.serverId, ServerDatapacks.SERVER_PUBLIC_DATA);

    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // check if user is owner or admin or manager
    if (server.ownerId !== user.id) {
        const roles = (await RoleService.getRolesByServerId(user.id, server.id)).filter(role => role.permissions.includes(Permissions.ADMIN.toString()) || role.permissions.includes(Permissions.MANAGER.toString()));
        if (roles.length === 0) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
    }

    const job = await JobService.createJob({
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        salary: req.body.salary,
        status: "Accepting Applications",
        serverId: req.body.serverId,
    });

    res.status(200).json(job);
    return;
});

router.post("/modify", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("jobId").isString().isLength({ min: 1 }),
    body("title").isString().isLength({ min: 1 }),
    body("description").isString().isLength({ min: 1 }),
    body("location").isString().isLength({ min: 1 }),
    body("salary").isString().isLength({ min: 1 }),
    body("status").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const job = await JobService.getJobById(req.body.jobId, false);

    if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
    }

    const server = await ServerService.getServerById(job.serverId, ServerDatapacks.SERVER_PUBLIC_DATA);

    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // check if user is owner or admin or manager
    if (server.ownerId !== user.id) {
        const roles = (await RoleService.getRolesByServerId(user.id, server.id)).filter(role => role.permissions.includes(Permissions.ADMIN.toString()) || role.permissions.includes(Permissions.MANAGER.toString()));
        if (roles.length === 0) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
    }

    const updatedJob = await JobService.editJob(req.body.jobId, {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        salary: req.body.salary,
        status: req.body.status,
    });

    res.status(200).json(updatedJob);
    return;
});

router.post("/delete", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("jobId").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const job = await JobService.getJobById(req.body.jobId, false);

    if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
    }

    const server = await ServerService.getServerById(job.serverId, ServerDatapacks.SERVER_PUBLIC_DATA);

    if (!server) {
        res.status(404).json({ error: "Server not found" });
        return;
    }

    // check if user is owner or admin or manager
    if (server.ownerId !== user.id) {
        const roles = (await RoleService.getRolesByServerId(user.id, server.id)).filter(role => role.permissions.includes(Permissions.ADMIN.toString()) || role.permissions.includes(Permissions.MANAGER.toString()));
        if (roles.length === 0) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
    }

    const deletedJob = await JobService.deleteJob(req.body.jobId);

    res.status(200).json(deletedJob);
    return;
});

router.post("/apply", [
    header("Authorization").isString().isLength({ min: 1 }),
    body("jobId").isString().isLength({ min: 1 }),
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const user = await UserService.getUserById(result.userId, UserDatapacks.USER_PUBLIC_DATA);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const job = await JobService.getJobById(req.body.jobId, false);

    if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
    }

    // make sure they are not already applied
    if (job.applicants.find(applicant => applicant.id === user.id)) {
        res.status(400).json({ error: "User already applied to job" });
        return;
    }

    const application = await JobService.applyUserToJob(job.id, user.id);

    res.status(200).json(application);
    return;

});

module.exports = router;