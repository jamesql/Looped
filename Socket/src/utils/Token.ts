import jwt from 'jsonwebtoken';

// Secret keys for signing tokens (store them securely)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';

export async function validateRefreshToken(token: String) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

export async function validateAccessToken(token: String) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}