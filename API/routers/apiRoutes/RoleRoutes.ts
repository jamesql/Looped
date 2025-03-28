import express, { Router, Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import { Role, Server } from "../../../Types/serverTypes";
import { User } from "../../../Types/userTypes";
import { validateToken } from "../../data/token";
import { redisInstance } from "../../data/redis";
import { Permissions } from "../../../Types/permissionsTypes";
import RoleService from "../../data/roles";
import UserService from "../../data/users";
import ServerService from "../../data/servers";
import { UserDatapacks, ServerDatapacks } from "../../data/data";
import { OPCodes } from "../../../Types/socketTypes";

const router: Router = express.Router();

router.post(
  "/create",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("serverId").isString().isLength({ min: 1 }),
    body("name")
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage("Role name must be between 1 and 50 characters long."),
    body("permissions").isInt({ min: 0, max: Permissions.OWNER }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // validate access token
    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // get user
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get server
    const server = await ServerService.getServerById(
      req.body.serverId,
      ServerDatapacks.SERVER_PUBLIC_DATA
    );
    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    // check if user is owner or admin
    if (server.ownerId !== user.id) {
      // check if the user has admin permissions in the server
      const roles = await RoleService.getUserRolesByServerId(
        user.id,
        server.id
      );
      if (
        roles.length === 0 ||
        !roles.some(
          (role) => (role.permissions & Permissions.ADMIN) === Permissions.ADMIN
        )
      ) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }
    // create the role
    const newRole: Role = {
      id: undefined,
      name: req.body.name,
      permissions: req.body.permissions,
      serverId: req.body.serverId,
      createdAt: undefined,
      updatedAt: undefined,
    };

    // Call the RoleService to create the role in the database
    const role = await RoleService.createRole(newRole);

    redisInstance.publish(
      `server:${server.id}:events`,
      JSON.stringify({
        op: OPCodes.ROLE_CREATE,
        d: {
          server: server,
          role: role,
        },
      })
    );

    res.status(200).json(role);
    return;
  }
);

router.post(
  "/edit",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("roleId")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Role ID is required."),
    body("name")
      .isString()
      .isLength({ min: 1, max: 50 })
      .withMessage("Role name must be between 1 and 50 characters long."),
    body("permissions")
      .isInt({ min: 0, max: Permissions.OWNER })
      .withMessage(
        "Permissions must be a valid integer between 0 and the maximum permissions value."
      ),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // validate access token
    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // get user
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get role
    const role = await RoleService.getRoleById(req.body.roleId);
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    // get server
    const server = await ServerService.getServerById(
      req.body.serverId,
      ServerDatapacks.SERVER_PUBLIC_DATA
    );
    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    // check if user is owner or admin
    if (server.ownerId !== user.id) {
      // check if the user has admin permissions in the server
      const roles = await RoleService.getUserRolesByServerId(
        user.id,
        server.id
      );
      if (
        roles.length === 0 ||
        !roles.some(
          (role) => (role.permissions & Permissions.ADMIN) === Permissions.ADMIN
        )
      ) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    // edit the role
    const updatedRole: Role = {
      ...role, // Spread the existing role properties
      name: req.body.name, // Update the name
      permissions: req.body.permissions, // Update the permissions
    };

    // Call the RoleService to update the role in the database
    const newRole = await RoleService.updateRole(
      req.body.roleId, // The ID of the role to update
      updatedRole // The updated role object
    );

    // Return the updated role
    if (!newRole) {
      res.status(500).json({ error: "Failed to update role" });
      return;
    }
    // Successfully updated the role

    redisInstance.publish(
      `server:${server.id}:events`,
      JSON.stringify({
        op: OPCodes.ROLE_MODIFY,
        d: {
          server: server,
          role: newRole,
        },
      })
    );

    res.status(200).json(newRole);
    return;
  }
);

router.post(
  "/delete",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("roleId")
      .isString()
      .isLength({ min: 1 })
      .withMessage("Role ID is required."),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // validate access token
    const token = req.header("Authorization");
    const result = await validateToken(token);

    if (!result || !result.valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // get user
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get role
    const role = await RoleService.getRoleById(req.body.roleId);
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    // get server
    const server = await ServerService.getServerById(
      role.serverId,
      ServerDatapacks.SERVER_PUBLIC_DATA
    );
    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    // check if user is owner or admin
    if (server.ownerId !== user.id) {
      // check if the user has admin permissions in the server
      const roles = await RoleService.getUserRolesByServerId(
        user.id,
        server.id
      );
      if (
        roles.length === 0 ||
        !roles.some(
          (role) => (role.permissions & Permissions.ADMIN) === Permissions.ADMIN
        )
      ) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    // make sure the role has no users who have it
    const usersWithRole = await UserService.getUsersByRoleId(req.body.roleId);
    // If there are users with this role, prevent deletion
    if (usersWithRole && usersWithRole.length > 0) {
      // If there are users with this role, return an error
      res
        .status(400)
        .json({ error: "Cannot delete role, it is assigned to users." });
      return;
    }

    // Delete the role
    const deletedRole = await RoleService.deleteRole(req.body.roleId);
    if (!deletedRole) {
      // If the deletion failed, return an error
      res.status(500).json({ error: "Failed to delete role" });
      return;
    }

    redisInstance.publish(
      `server:${server.id}:events`,
      JSON.stringify({
        op: OPCodes.ROLE_DELETE,
        d: {
          server: server,
          role: deletedRole,
        },
      })
    );

    // Successfully deleted the role
    res.status(200).json(deletedRole);
    return;
  }
);

router.post(
  "/add-user",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("roleId").isString().isLength({ min: 1 }),
    body("userId").isString().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // validate access token
    const token = req.header("Authorization");
    const result = await validateToken(token);
    if (!result || !result.valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // get user
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get role
    const role = await RoleService.getRoleById(req.body.roleId);
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    // get server
    const server = await ServerService.getServerById(
      role.serverId,
      ServerDatapacks.SERVER_PUBLIC_DATA
    );

    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    // check if user is owner or admin
    if (server.ownerId !== user.id) {
      // check if the user has admin permissions in the server
      const roles = await RoleService.getUserRolesByServerId(
        user.id,
        server.id
      );
      if (
        roles.length === 0 ||
        !roles.some(
          (role) => (role.permissions & Permissions.ADMIN) === Permissions.ADMIN
        )
      ) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    // Check if the user to be added exists
    const userToAdd = await UserService.getUserById(
      req.body.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!userToAdd) {
      // If the user to be added does not exist, return an error
      res.status(404).json({ error: "User to add not found" });
      return;
    }

    // Add the user to the role
    const updatedUser = await RoleService.addRoleToUser(
      req.body.userId, // The ID of the user to add
      req.body.roleId // The ID of the role to assign
    );
    if (!updatedUser) {
      // If adding the role to the user failed, return an error
      res.status(500).json({ error: "Failed to add user to role" });
      return;
    }

    // Successfully added the user to the role
    // Publish the event to the server's event channel
    redisInstance.publish(
      `server:${server.id}:events`,
      JSON.stringify({
        op: OPCodes.ROLE_ADD,
        d: {
          server: server,
          role: role,
          user: updatedUser, // The updated user object
        },
      })
    );

    // Return the updated user
    res.status(200).json(updatedUser);
    return; 
  }
);

router.post(
  "/remove-user",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("roleId").isString().isLength({ min: 1 }),
    body("userId").isString().isLength({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // validate access token
    const token = req.header("Authorization");
    const result = await validateToken(token);
    if (!result || !result.valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // get user
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get role
    const role = await RoleService.getRoleById(req.body.roleId);
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    // get server
    const server = await ServerService.getServerById(
      role.serverId,
      ServerDatapacks.SERVER_PUBLIC_DATA
    );

    if (!server) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    // check if user is owner or admin
    if (server.ownerId !== user.id) {
      // check if the user has admin permissions in the server
      const roles = await RoleService.getUserRolesByServerId(
        user.id,
        server.id
      );
      if (
        roles.length === 0 ||
        !roles.some(
          (role) => (role.permissions & Permissions.ADMIN) === Permissions.ADMIN
        )
      ) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    // Check if the user to be added exists
    const userToAdd = await UserService.getUserById(
      req.body.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!userToAdd) {
      // If the user to be added does not exist, return an error
      res.status(404).json({ error: "User to add not found" });
      return;
    }

    // Remove the user from the role
    const updatedUser = await RoleService.removeRoleFromUser(
      req.body.userId, // The ID of the user to remove
      req.body.roleId // The ID of the role to remove
    );

    if (!updatedUser) {
      // If removing the role from the user failed, return an error
      res.status(500).json({ error: "Failed to remove user from role" });
      return;
    }
    // Successfully removed the user from the role
    // Publish the event to the server's event channel

    redisInstance.publish(
      `server:${server.id}:events`,
      JSON.stringify({
        op: OPCodes.ROLE_REMOVE,
        d: {
          server: server,
          role: role,
          user: updatedUser, // The updated user object
        },
      })
    );
    // Return the updated user

    res.status(200).json(updatedUser);
    return;
  }
);

module.exports = router;
