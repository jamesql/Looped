import jwt from 'jsonwebtoken';

class TokenUtil {
    private accessTokenSecret: string;
    private refreshTokenSecret: string;
    private accessTokenExpiry: string;
    private refreshTokenExpiry: string;

    constructor(
        accessTokenExpiry: string = '15m',
        refreshTokenExpiry: string = '7d'
    ) {
        this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || '';
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || '';
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;

        if (!this.accessTokenSecret || !this.refreshTokenSecret) {
            throw new Error('Token secrets must be set in environment variables');
        }
    }

    generateAccessToken(payload: object): string {
        return jwt.sign(payload, this.accessTokenSecret, { expiresIn: this.accessTokenExpiry });
    }

    generateRefreshToken(payload: object): string {
        return jwt.sign(payload, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpiry });
    }

    validateAccessToken(token: string): object | null {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        } catch (error) {
            return null;
        }
    }

    validateRefreshToken(token: string): object | null {
        try {
            return jwt.verify(token, this.refreshTokenSecret);
        } catch (error) {
            return null;
        }
    }
}

export default TokenUtil;