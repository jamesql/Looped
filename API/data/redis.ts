import { RedisWrapper } from "../../Util/Redis";

class RedisSingleton {
    private static instance: RedisWrapper;

    private constructor() {}

    public static getInstance(): RedisWrapper {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new RedisWrapper();
        }
        return RedisSingleton.instance;
    }
}

export const redisInstance = RedisSingleton.getInstance();