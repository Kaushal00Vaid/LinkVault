import User, { IUser } from "../../models/user.models";
import ApiError from "../../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token.utils";
import { RegisterInput, LoginInput } from "../../validators/auth.validators";
import mongoose from "mongoose";
import { Response } from "express";

// cookie helper functions
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

// token pair generator
export const generateTokenPair = (user: IUser) => {
  const accessToken = generateAccessToken({
    _id: user._id,
    email: user.email,
    name: user.name,
  });

  const refreshToken = generateRefreshToken({
    _id: user._id as mongoose.Types.ObjectId,
  });

  return { accessToken, refreshToken };
};

// register
export const registerUser = async (data: RegisterInput) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  return user;
};

// login
export const loginUser = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordvalid = await user.comparePassword(data.password);

  if (!isPasswordvalid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  return { user, accessToken, refreshToken };
};

// refresh token
export const refreshAccessToken = async (token: string) => {
  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded: { _id: mongoose.Types.ObjectId };

  try {
    decoded = verifyRefreshToken(token) as { _id: mongoose.Types.ObjectId };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired, please login again");
    }
    throw new ApiError(401, "Invalid refresh token");
  }

  // fresh DB lookup
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  return { accessToken, refreshToken };
};

// OAuth
export interface OAuthUserData {
  name: string;
  email: string;
  avatar?: string;
}

export const oauthUpsertUser = async (data: OAuthUserData) => {
  let user = await User.findOne({ email: data.email });

  if (!user) {
    // oauth user --> no password --> set random password
    const randomPassword =
      Math.random().toString(36).slice(-16) +
      Math.random().toString(36).slice(-16);

    user = await User.create({
      name: data.name,
      email: data.email,
      password: randomPassword,
      ...(data.avatar && { avatar: data.avatar }),
    });
  } else if (data.avatar && !user.avatar) {
    user.avatar = data.avatar;
    await user.save();
  }

  return user;
};
