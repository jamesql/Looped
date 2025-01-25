/// <reference path="../utils/@types/global.d.ts" />

// Singleton redis client class
import { Redis } from "ioredis";

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

export const subscribeToServerEvents = async (client: Socket.SocketClient) => {
  let sub = await getSubscriberInstance();
  let servers = client.session.serverIds;

  servers.forEach((serverId) => {
    let channelName = `server-events:${serverId}`;
    sub.subscribe(channelName, (err, count) => {
      if (err) console.error(err);
      else
        console.log(
          `[$wss] Redis subscribed: ${channelName} (${client.session.userId})`
        );
    });

    sub.on("message", async (channel, m) => {
      if (channel !== channelName) return;
      if (client.readyState !== WebSocket.OPEN) return;

      let data = JSON.parse(m);

      let opcode = data["op"];
      let d = data["d"];

      let payload = {
        op: opcode,
        d: d,
      };

      await client.sendAsync(payload);
    });
  });
};

export const subscribeToChannelEvents = async (client: Socket.SocketClient) => {
  let sub = await getSubscriberInstance();
  let serverChannels = client.session.channelIds;

  serverChannels.forEach((i) => {
    let channels = i.channelIds;

    channels.forEach((c) => {
      let channelName = `channel-event:${i.serverId}:${c}`;

      sub.subscribe(channelName, (err, count) => {
        if (err) console.error(err);
        else
          console.log(
            `[$wss] Redis subscribed: ${channelName} (${client.session.userId})`
          );
      });

      sub.on("message", async (channel, m) => {
        if (channel !== channelName) return;
        if (client.readyState !== WebSocket.OPEN) return;

        let data = JSON.parse(m);

        let opcode = data["op"];
        let d = data["d"];

        let payload = {
          op: opcode,
          d: d,
        };

        await client.sendAsync(payload);
      });
    });
  });
};
