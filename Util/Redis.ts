import Redis, { Redis as RedisClientType } from 'ioredis';

class RedisWrapper {
    private client: RedisClientType;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL);
        this.client.on('error', (err) => console.error('Redis Client Error', err));
    }

    async set(key: string, value: string): Promise<void> {
        await this.client.set(key, value);
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        this.client.subscribe(channel, (err, count) => {
            if (err) {
                console.error('Failed to subscribe: %s', err.message);
            } else {
                console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        this.client.on('message', (subscribedChannel, message) => {
            if (subscribedChannel === channel) {
                callback(message);
            }
        });
    }

    async unsubscribe(channel: string): Promise<void> {
        await this.client.unsubscribe(channel);
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

class RedisFactory {
    static createClient(): RedisWrapper {
        return new RedisWrapper();
    }
}

class RedisPubSub {
    private client: RedisClientType;
    private subscribedChannels: Set<string>;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL);
        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.subscribedChannels = new Set<string>();
    }

    async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
    }

    async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        if (this.subscribedChannels.has(channel)) {
            console.error(`Already subscribed to channel: ${channel}`);
            return;
        }

        this.client.subscribe(channel, (err, count) => {
            if (err) {
                console.error('Failed to subscribe: %s', err.message);
            } else {
                this.subscribedChannels.add(channel);
                console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        this.client.on('message', (subscribedChannel, message) => {
            if (subscribedChannel === channel) {
                callback(message);
            }
        });
    }

    async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    async unsubscribe(channel: string): Promise<void> {
        if (this.subscribedChannels.has(channel)) {
            await this.client.unsubscribe(channel);
            this.subscribedChannels.delete(channel);
        } else {
            console.error(`Not subscribed to channel: ${channel}`);
        }
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}

export { RedisFactory, RedisPubSub, RedisWrapper };