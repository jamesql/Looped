export {};

declare global {
    namespace Auth {

        interface Tokens {
            access_token?: String,
            refresh_token: String
        }

        type ValidationError = String;

    }

    namespace LoopedSession {
        interface Session {
            userId: String,
            serverIds: string[],
            roleIds: { serverId: string, roleIds: string[]}[],
            channelIds: { serverId: string, channelIds: string[]}[],
        }
    }
}