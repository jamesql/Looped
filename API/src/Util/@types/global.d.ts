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
            serverIds: Set<String>,
            roleIds: Set<String>,
            channelIds: Set<String>,
        }
    }
}