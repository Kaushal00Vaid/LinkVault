import mongoose from "mongoose";
import Vault from "../../models/vault.models";
import {
  CreateVaultInput,
  UpdateVaultInput,
} from "../../validators/vault.validators";
import ApiError from "../../utils/ApiError";
import Link from "../../models/link.models";

// slug helper
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
};

const resolveUniqueSlug = async (
  baseSlug: string,
  userId: mongoose.Types.ObjectId,
  excludeVaultId?: mongoose.Types.ObjectId,
) => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: any = { slug, userId };

    if (excludeVaultId) {
      query._id = { $ne: excludeVaultId };
    }

    const existing = await Vault.findOne(query);
    if (!existing) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// create vault
export const createVault = async (
  data: CreateVaultInput,
  userId: mongoose.Types.ObjectId,
) => {
  const baseSlug = generateSlug(data.name);
  const slug = await resolveUniqueSlug(baseSlug, userId);

  // strip undefined fields
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined),
  );

  const vault = await Vault.create({
    ...cleanedData,
    slug,
    userId,
  });

  return vault;
};

// get all vaults
export const getUserVaults = async (userId: mongoose.Types.ObjectId) => {
  const vaults = await Vault.aggregate([
    { $match: { userId } },
    // join
    {
      $lookup: {
        from: "links",
        localField: "_id",
        foreignField: "vaultId",
        as: "links",
      },
    },
    // get the count
    {
      $addFields: {
        linkCount: { $size: "$links" },
      },
    },
    // remove the links array
    {
      $project: {
        links: 0, // drop the links array, just keep the count
      },
    },
    // sort by createdAt desc
    { $sort: { createdAt: -1 } },
  ]);

  return vaults;
};

// get single vault by slug
export const getVaultBySlug = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
) => {
  const vault = await Vault.findOne({ slug, userId });

  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  return vault;
};

// update vault by slug
export const updateVault = async (
  slug: string,
  data: UpdateVaultInput,
  userId: mongoose.Types.ObjectId,
) => {
  const vault = await Vault.findOne({ slug, userId });

  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  // if name updated --> regenrate slug
  if (data.name) {
    const baseSlug = generateSlug(data.name);
    vault.slug = await resolveUniqueSlug(
      baseSlug,
      userId,
      vault._id as mongoose.Types.ObjectId,
    );
    vault.name = data.name;
  }

  if (data.description !== undefined) vault.description = data.description;
  if (data.icon !== undefined) vault.icon = data.icon;
  if (data.color !== undefined) vault.color = data.color;
  if (data.isPublic !== undefined) vault.isPublic = data.isPublic;

  await vault.save();

  return vault;
};

// delete vault by slug
export const deleteVault = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
) => {
  const vault = await Vault.findOne({ slug, userId });

  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  // cascade delete all links in the vault
  await Link.deleteMany({ vaultId: vault._id });
  await vault.deleteOne();
};
