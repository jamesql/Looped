export {};

declare global {
    namespace Auth {

        interface Tokens {
            access_token?: String,
            refresh_token: String
        }

        type ValidationError = String;

    }
}