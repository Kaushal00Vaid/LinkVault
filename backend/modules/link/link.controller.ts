import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  CreateLinkInput,
  GetVaultLinksQuery,
  UpdateLinkInput,
} from "../../validators/link.validators";
import {
  createLink,
  deleteLink,
  getLinkById,
  getVaultLinks,
  toggleFavorite,
  updateLink,
} from "./link.service";
import ApiResponse from "../../utils/ApiResponse";

// create link
export const createLinkHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const userId = req.user!._id;
    const body = req.body as CreateLinkInput;

    const link = await createLink(slug as string, userId, body);

    res
      .status(201)
      .json(new ApiResponse(201, "Link created successfully", link));
  },
);

// get vault links
export const getVaultLinkshandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const userId = req.user!._id;
    const query = req.query as unknown as GetVaultLinksQuery;

    const links = await getVaultLinks(slug as string, userId, query);

    res
      .status(200)
      .json(new ApiResponse(200, "Links fetched successfully", links));
  },
);

// get single link
export const getLinkByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, linkId } = req.params;
    const userId = req.user!._id;

    const link = await getLinkById(slug as string, userId, linkId as string);

    res
      .status(200)
      .json(new ApiResponse(200, "Link fetched successfully", link));
  },
);

// update link
export const updateLinkHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, linkId } = req.params;
    const userId = req.user!._id;
    const body = req.body as UpdateLinkInput;

    const link = await updateLink(
      slug as string,
      userId,
      linkId as string,
      body,
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Link updated successfully", link));
  },
);

// delete link
export const deleteLinkHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, linkId } = req.params;
    const userId = req.user!._id;

    await deleteLink(slug as string, userId, linkId as string);

    res.status(200).json(new ApiResponse(200, "Link deleted successfully"));
  },
);

// toggle fav
export const toggleFavouriteHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, linkId } = req.params;
    const userId = req.user!._id;

    const link = await toggleFavorite(slug as string, userId, linkId as string);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          `Link ${link.isFavorite ? "added to" : "removed from"} favorites`,
          link,
        ),
      );
  },
);
