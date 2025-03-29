import express, { Router, Express, Request, Response } from "express";
const { body, validationResult, header } = require("express-validator");
import UserService from "../../data/users";
import DirectService from "../../data/direct";
import { validateToken } from "../../data/token";
import { UserDatapacks } from "../../data/data";
import { redisInstance } from "../../data/redis";
import { OPCodes } from "../../../Types/socketTypes";

const router: Router = express.Router();

router.post(
  "/add-friend",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }
    // Check if the friend is already in the user's friend list
    const existingFriendRequest = await DirectService.isFriendOrRequested(
      user.id,
      friendId
    );
    if (existingFriendRequest) {
      res.status(400).json({ error: "Friend request already exists" });
      return;
    }

    // Create a friend request
    const friendRequest = await UserService.sendFriendRequest(
      user.id,
      friendId
    );

    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_CREATE,
        d: {
          user: user,
        },
      })
    );

    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REQUEST_SENT,
        d: {
          friend: friend, // The friend who was added
        },
      })
    );

    // send response
    res.status(200).json({ message: "Friend request sent" });
    return;
  }
);

router.post(
  "/accept-friend",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // is currently requested
    const isRequested = await DirectService.isFriendOrRequested(
      friendId,
      user.id
    );
    if (!isRequested) {
      // If there is no request to accept
      res.status(400).json({ error: "No friend request to accept" });
      return;
    }

    // Accept the friend request
    const accepted = await UserService.acceptFriendRequest(user.id, friendId);

    // Notify the friend that the request was accepted
    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REQUEST_ACCEPT,
        d: {
          user: user, // The user who accepted the request
        },
      })
    );

    // Notify the user that the friend request was accepted
    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REQUEST_ACCEPT,
        d: {
          friend: friend, // The friend who accepted the request
        },
      })
    );

    // send response
    res.status(200).json({ message: "Friend request accepted" });
    return;
  }
);

router.post(
  "/decline-friend",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // is currently requested
    const isRequested = await DirectService.isFriendOrRequested(
      friendId,
      user.id
    );
    if (!isRequested) {
      // If there is no request to accept
      res.status(400).json({ error: "No friend request to accept" });
      return;
    }

    // Decline the friend request
    const declined = await UserService.declineFriendRequest(user.id, friendId);

    // Notify the friend that the request was declined
    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REQUEST_REJECT,
        d: {
          user: user, // The user who declined the request
        },
      })
    );

    // Notify the user that the friend request was declined
    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REQUEST_REJECT,
        d: {
          friend: friend, // The friend who declined the request
        },
      })
    );

    // send response
    res.status(200).json({ message: "Friend request declined" });
    return;
  }
);

router.post(
  "/remove-friend",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // Check if the user is friends with the friend
    const isFriend = await UserService.isFriends(user.id, friendId);
    if (!isFriend) {
      // If not friends, return an error
      res.status(400).json({ error: "Not friends with the specified user" });
      return;
    }
    // Remove the friend
    const removed = await UserService.removeFriend(user.id, friendId);

    // Notify the friend that they were removed
    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REMOVED,
        d: {
          user: user, // The user who removed them
        },
      })
    );
    // Notify the user that the friend was removed
    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_REMOVED,
        d: {
          friend: friend, // The friend who was removed
        },
      })
    );
    // send response
    res.status(200).json({ message: "Friend removed successfully" });
    return;
  }
);

router.post(
  "/msg/send",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
    body("content").isString().isLength({ min: 1 }), // The content of the message to send
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // Check if the user is friends with the friend
    const isFriend = await UserService.isFriends(user.id, friendId);
    if (!isFriend) {
      // If not friends, return an error
      res.status(400).json({ error: "Not friends with the specified user" });
      return;
    }

    // get direct channel
    const channel = await DirectService.getDirectChannelByUserIds([
      user.id, // The ID of the user sending the message
      friendId, // The ID of the friend receiving the message
    ]);

    // Send the message
    const messageContent = req.body.content; // Assuming content is passed in the request body
    const newMessage = await DirectService.createDirectMessage(
      channel.id,
      user.id,
      messageContent
    );
    if (!newMessage) {
      res.status(500).json({ error: "Failed to send message" });
      return;
    }
    // Notify the friend that a new message was sent
    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_CREATE,
        d: {
          user: user, // The user who sent the message
          channel: channel, // The direct channel where the message was sent
          message: newMessage, // The message object
        },
      })
    );
    // Notify the sender that their message was sent
    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_CREATE,
        d: {
          friend: friend, // The friend who received the message
          channel: channel,
          message: newMessage, // The message object
        },
      })
    );
    // send response
    res.status(200).json(newMessage);
  }
);

router.post(
  "/msg/edit",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
    body("messageId").isString().isLength({ min: 1 }), // The ID of the message to edit
    body("content").isString().isLength({ min: 1 }), // The new content of the message
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // Check if the user is friends with the friend
    const isFriend = await UserService.isFriends(user.id, friendId);
    if (!isFriend) {
      // If not friends, return an error
      res.status(400).json({ error: "Not friends with the specified user" });
      return;
    }

    // get direct channel
    const channel = await DirectService.getDirectChannelByUserIds([
      user.id, // The ID of the user sending the message
      friendId, // The ID of the friend receiving the message
    ]);

    if (!channel) {
      // If no direct channel exists, return an error
      res.status(404).json({ error: "Direct channel not found" });
      return;
    }

    // Edit the message
    const messageId = req.body.messageId; // The ID of the message to edit
    const newContent = req.body.content; // The new content for the message
    const updatedMessage = await DirectService.editDirectMessage(
      messageId,
      newContent
    );

    if (!updatedMessage) {
      // If the message could not be edited, return an error
      res.status(500).json({ error: "Failed to edit message" });
      return;
    }
    // Notify the friend that the message was edited
    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_UPDATE,
        d: {
          user: user, // The user who edited the message
          channel: channel, // The direct channel where the message was sent
          message: updatedMessage, // The updated message object
        },
      })
    );
    // Notify the sender that their message was edited
    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_UPDATE,
        d: {
          friend: friend, // The friend who received the message
          channel: channel, // The direct channel where the message was sent
          message: updatedMessage, // The updated message object
        },
      })
    );
    // send response
    res.status(200).json(updatedMessage);
    return;
  }
);

router.post(
  "/msg/delete",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
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

    // get user from token
    const user = await UserService.getUserById(
      result.userId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // get the friend to add
    const friendId = req.body.friendId;
    const friend = await UserService.getUserById(
      friendId,
      UserDatapacks.USER_PUBLIC_DATA
    );
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // Check if the user is friends with the friend
    const isFriend = await UserService.isFriends(user.id, friendId);
    if (!isFriend) {
      // If not friends, return an error
      res.status(400).json({ error: "Not friends with the specified user" });
      return;
    }

    // get direct channel
    const channel = await DirectService.getDirectChannelByUserIds([
      user.id, // The ID of the user sending the message
      friendId, // The ID of the friend receiving the message
    ]);

    if (!channel) {
      // If no direct channel exists, return an error
      res.status(404).json({ error: "Direct channel not found" });
      return;
    }

    // Delete the message
    const messageId = req.body.messageId; // The ID of the message to delete
    const deletedMessage = await DirectService.deleteDirectMessage(
      messageId // The ID of the message to delete
    );
    if (!deletedMessage) {
      // If the message could not be deleted, return an error
      res.status(500).json({ error: "Failed to delete message" });
      return;
    }
    // Notify the friend that the message was deleted
    redisInstance.publish(
      `user:${friendId}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_DELETE,
        d: {
          user: user, // The user who deleted the message
          channel: channel, // The direct channel where the message was sent
          messageId: deletedMessage.id, // The ID of the deleted message
        },
      })
    );
    // Notify the sender that their message was deleted
    redisInstance.publish(
      `user:${user.id}:events`,
      JSON.stringify({
        op: OPCodes.FRIEND_MESSAGE_DELETE,
        d: {
          friend: friend, // The friend who received the message
          channel: channel, // The direct channel where the message was sent
          messageId: deletedMessage.id, // The ID of the deleted message
        },
      })
    );

    // send response
    res.status(200).json(deletedMessage);
    return;
  }
);

router.get(
  "/channel",
  [
    header("Authorization").isString().isLength({ min: 1 }),
    body("friendId").isString().isLength({ min: 1 }), // The ID of the friend to add
  ],
  async (req: Request, res: Response) => {
    
  }
);

module.exports = router;
