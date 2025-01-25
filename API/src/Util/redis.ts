/// <reference path="./@types/global.d.ts" />
// Singleton redis client class
import { Redis } from "ioredis";

// redisclient global
let redisClient: Redis | null = null;

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
