import { RedisFactory } from '../../Util/Redis';

class Redis {
    private static instance: Redis;
    private redisClient: any;

    private constructor() {
        this.redisClient = RedisFactory.createClient();
    }

    public static getInstance(): Redis {
        if (!Redis.instance) {
            Redis.instance = new Redis();
        }
        return Redis.instance;
    }

    public getClient() {
        return this.redisClient;
    }
}

export default Redis;