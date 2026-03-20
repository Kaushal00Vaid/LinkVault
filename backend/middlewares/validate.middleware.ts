import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import ApiError from "../utils/ApiError";

const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => e.message);
        next(new ApiError(422, "Validation failed", errors));
        return;
      }

      next(error);
    }
  };

export default validate;
