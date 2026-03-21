import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
  CreateVaultInput,
  UpdateVaultInput,
} from "../../validators/vault.validators";
import {
  createVault,
  deleteVault,
  getUserVaults,
  getVaultBySlug,
  updateVault,
} from "./vault.service";
import ApiResponse from "../../utils/ApiResponse";

export const createVaultHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const body = req.body as CreateVaultInput;
    const userId = req.user!._id;

    const vault = await createVault(body, userId);

    res
      .status(201)
      .json(new ApiResponse(201, "Vault created succesfully", vault));
  },
);

// get all vaults
export const getUserVaultsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id;

    const vaults = await getUserVaults(userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Vaults fetched successfully", vaults));
  },
);

// get single vault
export const getVaultBySlugHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const { slug } = req.params;

    const vault = await getVaultBySlug(slug as string, userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Vault fetched successfully", vault));
  },
);

// update vault
export const updateVaultHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const { slug } = req.params;

    const body = req.body as UpdateVaultInput;

    const vault = await updateVault(slug as string, body, userId);

    res
      .status(200)
      .json(new ApiResponse(200, "Vault updated successfully", vault));
  },
);

// delete vault
export const deleteVaultHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const { slug } = req.params;

    await deleteVault(slug as string, userId);

    res.status(200).json(new ApiResponse(200, "Vault deleted successfully"));
  },
);
