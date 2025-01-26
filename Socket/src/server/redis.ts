/// <reference path="../utils/@types/global.d.ts" />

// Singleton redis client class
import { Redis } from "ioredis";
import { OPCodes } from "./WSValues";

// redisclient global
let redisClient: Redis | null = null;

// make new client for subscribing to channels
let redisSubscriber: Redis | null = null;

export const getRedisInstance = (): Redis => {
  if (!redisClient) {
    // establish new connection
    redisClient = new Redis({
      host: "localhost",
      port: 6379,
    });

    // redis test events
    redisClient.on("connect", () => {
      console.log(`[$wss] Redis Connected Succesfully (${redisClient.status})`);
    });

    redisClient.on("error", (err) => {
      console.error(`[$wss] Redis Error: ${err}`);
    });
  }

  // return redisclient
  return redisClient;
};

export const getSubscriberInstance = (): Redis => {
  if (!redisSubscriber) {
    // establish new connection
    redisSubscriber = new Redis({
      host: "localhost",
      port: 6379,
    });

    // redis test events
    redisSubscriber.on("connect", () => {
      console.log(
        `[$wss] Redis Subscriber Connected Succesfully (${redisSubscriber.status})`
      );
    });

    redisSubscriber.on("error", (err) => {
      console.error(`[$wss] Redis Subscriber Error: ${err}`);
    });
  }

  // return redisclient
  return redisSubscriber;
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

export const refreshSubscriptions = async (client: Socket.SocketClient) => {
  await subscribeToUserEvents(client);
  await subscribeToChannelEvents(client);
  await subscribeToServerEvents(client);
};

export const subscribeToChannel = async (
  client: Socket.SocketClient,
  channelName: string
) => {
  let sub = client.subscriber;
  sub.subscribe(channelName, (err, count) => {
    if (err) console.error(err);
    else {
      client.activeSubscriptions.add(channelName);
      console.log(
        `[$wss] Redis subscribed: ${channelName} (${client.session.userId})`
      );
    }
  });
};

export const subscribeToUserEvents = async (client: Socket.SocketClient) => {
  let sub = client.subscriber;
  let channelName = `user-events:${client.session.userId}`;

  if (client.activeSubscriptions.has(channelName)) return;

  // User Events
  await subscribeToChannel(client, channelName);

};

export const subscribeToServerEvents = async (client: Socket.SocketClient) => {
  let sub = client.subscriber;
  let servers = client.session.serverIds;

  servers.forEach(async (serverId) => {
    let channelName = `server-events:${serverId}`;
    if (client.activeSubscriptions.has(channelName)) return;
    await subscribeToChannel(client, channelName);
  });
};

export const subscribeToChannelEvents = async (client: Socket.SocketClient) => {
  let sub = client.subscriber;
  let serverChannels = client.session.channelIds;

  serverChannels.forEach((i) => {
    let channels = i.channelIds;

    channels.forEach(async (c) => {
      let channelName = `channel-event:${i.serverId}:${c}`;

      if (client.activeSubscriptions.has(channelName)) return;

      await subscribeToChannel(client, channelName);
    });
  });
};
