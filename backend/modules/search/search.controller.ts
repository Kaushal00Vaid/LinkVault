import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { SearchQuery, searchSchema } from "../../validators/search.validators";
import ApiResponse from "../../utils/ApiResponse";
import { searchLinks } from "./search.service";

export const searchHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = searchSchema.parse({
      query: req.query,
    });

    const query = parsed.query;
    const userId = req.user!._id;

    const { results, total, page, totalPages } = await searchLinks(
      userId,
      query,
    );

    res.status(200).json(
      new ApiResponse(200, "Search results fetched successfully", {
        results,
        pagination: {
          total,
          page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }),
    );
  },
);
