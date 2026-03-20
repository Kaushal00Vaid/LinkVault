import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { TokenPayload, verifyAccessToken } from "../utils/token.utils";

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // extract token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token missing");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Access token missing");
    }

    // verify
    try {
      const decoded = verifyAccessToken(token) as TokenPayload;
      req.user = decoded;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Access token expired");
      }
      throw new ApiError(401, "Invalid access token");
    }
  },
);

export default protect;
