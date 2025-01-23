// Singleton redis client class
import {Redis} from "ioredis";

// redisclient global
let redisClient: Redis | null = null;

export const getRedisInstance = (): Redis => {
    if (!redisClient) {
        // establish new connection
        redisClient = new Redis({
            host: 'localhost',
            port: 6379            
        });

        // redis test events
        redisClient.on('connect', () => {
            console.log(`[${Util.ProgramName} - Redis] Connected Succesfully (${redisClient.status})`);
        });

        redisClient.on('error', (err) => {
            console.error(`[${Util.ProgramName} - Redis] Error: ${err}`)
        });

    }

    // return redisclient
    return redisClient;
}