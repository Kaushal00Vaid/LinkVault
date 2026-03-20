import jwt, { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import env from "../config/env";

export interface TokenPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
}

const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.accessTokenSecret, {
    expiresIn: env.accessTokenExpiry,
  } as SignOptions);
};

const generateRefreshToken = (payload: Pick<TokenPayload, "_id">): string => {
  return jwt.sign(payload, env.refreshTokenSecret, {
    expiresIn: env.refreshTokenExpiry,
  } as SignOptions);
};

const verifyAccessToken = (token: string): Pick<TokenPayload, "_id"> => {
  return jwt.verify(token, env.accessTokenSecret) as TokenPayload;
};

const verifyRefreshToken = (token: string): Pick<TokenPayload, "_id"> => {
  return jwt.verify(token, env.refreshTokenSecret) as Pick<TokenPayload, "_id">;
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
