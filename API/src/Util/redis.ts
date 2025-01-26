/// <reference path="./@types/global.d.ts" />
// Singleton redis client class
import { Redis } from "ioredis";
import Prisma from "../db/prisma";
import { OPCodes } from "./OPCodes";

// redisclient global
let redisClient: Redis | null = null;
const _prisma = Prisma.getInstance();

export const getRedisInstance = (): Redis => {
  if (!redisClient) {
    // establish new connection
    redisClient = new Redis({
      host: "localhost",
      port: 6379,
    });

    // redis test events
    redisClient.on("connect", () => {
      console.log(
        `[$api - Redis] Connected Succesfully (${redisClient?.status})`
      );
    });

    redisClient.on("error", (err) => {
      console.error(`[$api - Redis] Error: ${err}`);
    });
  }

  // return redisclient
  return redisClient;
};

export const setUserSession = async (
  _session: LoopedSession.Session
): Promise<void> => {
  const rc: Redis = await getRedisInstance();
  const key = `user:${_session.userId}:session`;

  await rc?.hmset(key, {
    channels: JSON.stringify(_session.channelIds),
    roles: JSON.stringify(_session.roleIds),
    servers: JSON.stringify(_session.serverIds),
  });

  // TTL for session
  //await rc.expire(key, )
};

export const getUserSession = async (
  userId: String
): Promise<LoopedSession.Session | null> => {
  const key = `user:${userId}:session`;
  const rc: Redis = await getRedisInstance();

  let sessionData = await rc?.hgetall(key);

  // If session data exists, parse the fields and return the session object
  if (sessionData && Object.keys(sessionData).length > 0) {
    return {
      userId,
      channelIds: JSON.parse(sessionData.channels),
      roleIds: JSON.parse(sessionData.roles),
      serverIds: JSON.parse(sessionData.servers),
    };
  }

  return null; // Return null if no session data exists for the user
};

export const publishToChannel = async (channelName: string, message: any) => {
  try {
    const rc: Redis = await getRedisInstance();
    // Ensure the message is serialized as a string (if it's an object)
    const messageStr = JSON.stringify(message);

    // Publish the message to the Redis channel
    await rc.publish(channelName, messageStr);

    console.log(
      `[$api] Redis Message published to ${channelName}:`,
      messageStr
    );
  } catch (error) {
    console.error(`[$api] Error publishing to ${channelName}:`, error);
  }
};

// this needs a type for the user query
export const updateUserState = async (userId: string) => {
  // get user from prisma
  let user = await _prisma.user.findUnique({
    where: {
      id: userId,
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

  if (user === null) return;

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
  await publishToChannel(`user-events:${user.id}`, {
    op: OPCodes.NILOP,
  })
};
