import * as jwt from 'jsonwebtoken';

// Secret keys for signing tokens (store them securely)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';

export async function validateRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

export async function validateAccessToken(token: string): Promise<(jwt.JwtPayload | string) | null> {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (e) {
        return null;
    }
}