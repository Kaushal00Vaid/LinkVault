import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { LoginInput, RegisterInput } from "../../validators/auth.validators";
import {
  clearRefreshTokenCookie,
  generateTokenPair,
  loginUser,
  oauthUpsertUser,
  refreshAccessToken,
  registerUser,
  setRefreshTokenCookie,
} from "./auth.service";
import ApiResponse from "../../utils/ApiResponse";
import env from "../../config/env";
import ApiError from "../../utils/ApiError";
import axios from "axios";

// register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterInput;

  const user = await registerUser(body);

  res.status(201).json(
    new ApiResponse(201, "Account created successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
    }),
  );
});

// login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginInput;

  const { user, accessToken, refreshToken } = await loginUser(body);

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(
    new ApiResponse(200, "Login Successfull", {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      accessToken,
    }),
  );
});

// logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearRefreshTokenCookie(res);
  res.status(200).json(new ApiResponse(200, "Logout Successfull"));
});

// refresh token
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  const { accessToken, refreshToken } = await refreshAccessToken(token);

  // rotate the refresh token cookie on every refresh
  setRefreshTokenCookie(res, refreshToken);

  res
    .status(200)
    .json(
      new ApiResponse(200, "Token refreshed successfully", { accessToken }),
    );
});

// google oauth
export const googleRedirect = asyncHandler(
  async (req: Request, res: Response) => {
    const params = new URLSearchParams({
      client_id: env.google.clientId,
      redirect_uri: env.google.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  },
);

export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.query as { code?: string };

    if (!code) {
      throw new ApiError(400, "Authorization code missing");
    }

    // exchange code for tokens
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: env.google.clientId,
        client_secret: env.google.clientSecret,
        redirect_uri: env.google.redirectUri,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const { access_token } = tokenRes.data;

    // fetch user info from Google
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    const { name, email, picture } = userInfoRes.data;

    const user = await oauthUpsertUser({ name, email, avatar: picture });
    const { accessToken, refreshToken } = await generateTokenPair(user);

    setRefreshTokenCookie(res, refreshToken);

    res.redirect(`${env.clientUrl}/auth/callback?accessToken=${accessToken}`);
  },
);

// github oauth
export const githubRedirect = asyncHandler(
  async (req: Request, res: Response) => {
    const params = new URLSearchParams({
      client_id: env.github.clientId,
      redirect_uri: env.github.redirectUri,
      scope: "user:email",
    });

    res.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  },
);

export const githubCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { code } = req.query as { code?: string };

    if (!code) {
      throw new ApiError(400, "Authorization code missing");
    }

    // exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: env.github.clientId,
        client_secret: env.github.clientSecret,
        code,
        redirect_uri: env.github.redirectUri,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const { access_token } = tokenRes.data;

    // fetch user profile
    const userInfoRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let { name, email, avatar_url } = userInfoRes.data;

    // fetch email from emails endpoint
    if (!email) {
      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const primaryEmail = emailRes.data.find(
        (e: { primary: boolean; verified: boolean; email: string }) =>
          e.primary && e.verified,
      );

      if (!primaryEmail) {
        throw new ApiError(400, "No verified email found on Github account");
      }

      email = primaryEmail.email;
    }

    const user = await oauthUpsertUser({
      name: name || email.split("@")[0],
      email,
      avatar: avatar_url,
    });

    const { accessToken, refreshToken } = generateTokenPair(user);

    setRefreshTokenCookie(res, refreshToken);

    res.redirect(`${env.clientUrl}/auth/callback?accessToken=${accessToken}`);
  },
);
