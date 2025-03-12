import TokenUtil from "../../Util/Token";

const tokenUtil = new TokenUtil();

// type for the return value of the validateToken function
type ValidateTokenReturnType = {
    valid: boolean;
    userId: string;
    exp: number;
}

export const validateToken = async (token: string): Promise<ValidateTokenReturnType> => {
    const decode = await tokenUtil.validateAccessToken(token);

    if (decode === null) {
        return {
            valid: false,
            userId: "",
            exp: 0,
        };
    }

    const isExpired = Date.now() / 1000 > decode["exp"];

    if (isExpired) {
        return {
            valid: false,
            userId: "",
            exp: 0,
        };
    }

    return {
        valid: true,
        userId: decode["userId"],
        exp: decode["exp"],
    };
}
