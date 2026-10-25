import { env } from "../config/env";
import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "../types/user.types";

export const signAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtSecret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token.");
  }
};
