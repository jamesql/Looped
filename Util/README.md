# Utility Functions

This directory contains utility functions that are used throughout the project. Below are the main utilities included:

## JWT Class

The `JWT` class provides methods for creating and verifying JSON Web Tokens (JWT). This is useful for handling authentication and authorization in your application.

### Methods

- `createToken(payload: object, secret: string, options?: object): string`
    - Creates a JWT token with the given payload and secret.
- `verifyToken(token: string, secret: string): object | null`
    - Verifies the given token using the secret and returns the decoded payload if valid.

## Redis Instance Creator

The Redis instance creator provides a function to create and configure a Redis client instance. This is useful for caching and other Redis-based operations.

### Function

- `createRedisInstance(config: object): RedisClient`
    - Creates and returns a Redis client instance with the given configuration.

### Example Usage

```javascript
const redis = createRedisInstance({
    host: 'localhost',
    port: 6379,
    password: 'your_password'
});
```

Make sure to install the necessary dependencies and configure your environment variables accordingly.