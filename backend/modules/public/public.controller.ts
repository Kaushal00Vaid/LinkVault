import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import {
  getPublicVaults,
  searchPublicVaults,
  getPublicVaultBySlug,
  clonePublicVault,
} from "./public.service";
import {
  BrowsePublicVaultsQuery,
  SearchPublicVaultsQuery,
} from "../../validators/public.validators";

// Browse public vaults
export const browsePublicVaultsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const raw = req.query;

    const query: BrowsePublicVaultsQuery = {
      page: Number(raw.page) || 1,
      limit: Number(raw.limit) || 20,
      sort: (raw.sort as BrowsePublicVaultsQuery["sort"]) ?? "newest",
    };

    const { results, total, page, totalPages } = await getPublicVaults(query);

    res.status(200).json(
      new ApiResponse(200, "Public vaults fetched successfully", {
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

// Search public vaults

export const searchPublicVaultsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const raw = req.query;

    const query: SearchPublicVaultsQuery = {
      q: raw.q as string,
      page: Number(raw.page) || 1,
      limit: Number(raw.limit) || 20,
    };

    const { results, total, page, totalPages } =
      await searchPublicVaults(query);

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

// Get single public vault

export const getPublicVaultBySlugHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };

    const { vault, links } = await getPublicVaultBySlug(slug);

    res.status(200).json(
      new ApiResponse(200, "Public vault fetched successfully", {
        vault,
        links,
      }),
    );
  },
);

// Clone public vault

export const clonePublicVaultHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const userId = req.user!._id;

    const { vault, links } = await clonePublicVault(slug, userId);

    res.status(201).json(
      new ApiResponse(201, "Vault cloned successfully", {
        vault,
        links,
      }),
    );
  },
);
