import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values((err as any).errors).map((e: any) => e.message),
    });
    return;
  }

  // mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [],
    });
    return;
  }

  // unexpected unknown error
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    errors: [],
  });
};

export default errorMiddleware;
