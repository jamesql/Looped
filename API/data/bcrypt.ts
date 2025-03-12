import * as bcrypt from 'bcrypt';

export class Bcrypt {
    private saltRounds: number;

    constructor(saltRounds: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)) {
        this.saltRounds = saltRounds;
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}