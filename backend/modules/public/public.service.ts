import { Types } from "mongoose";
import Vault, { IVault } from "../../models/vault.models";
import Link, { ILink } from "../../models/link.models";
import ApiError from "../../utils/ApiError";
import {
  BrowsePublicVaultsQuery,
  SearchPublicVaultsQuery,
} from "../../validators/public.validators";

// shared slug logic

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const resolveUniqueSlug = async (
  baseSlug: string,
  userId: Types.ObjectId,
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Vault.findOne({ slug });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Browse public vaults

export const getPublicVaults = async (
  query: BrowsePublicVaultsQuery,
): Promise<{
  results: (IVault & { linkCount: number; owner: { name: string } })[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { page, limit, sort } = query;
  const skip = (page - 1) * limit;

  const sortStage: Record<string, unknown> =
    sort === "oldest"
      ? { createdAt: 1 }
      : sort === "popular"
        ? { linkCount: -1 }
        : { createdAt: -1 };

  const pipeline: any[] = [
    { $match: { isPublic: true } },

    // join links to get count
    {
      $lookup: {
        from: "links",
        localField: "_id",
        foreignField: "vaultId",
        as: "links",
      },
    },
    {
      $addFields: {
        linkCount: { $size: "$links" },
        links: "$$REMOVE",
      },
    },

    // join owner name
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },

    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        icon: 1,
        color: 1,
        isPublic: 1,
        createdAt: 1,
        linkCount: 1,
        userId: 1,
        "owner.name": 1,
        "owner._id": 1,
      },
    },

    { $sort: sortStage },
  ];

  const [countResult, results] = await Promise.all([
    Vault.aggregate([...pipeline, { $count: "total" }]),
    Vault.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
  ]);

  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return { results, total, page, totalPages };
};

// Search public vaults

export const searchPublicVaults = async (
  query: SearchPublicVaultsQuery,
): Promise<{
  results: (IVault & { linkCount: number; owner: { name: string } })[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { q, page, limit } = query;
  const skip = (page - 1) * limit;

  // case-insensitive search across name and description
  const matchStage = {
    isPublic: true,
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  };

  const pipeline: any[] = [
    { $match: matchStage },

    {
      $lookup: {
        from: "links",
        localField: "_id",
        foreignField: "vaultId",
        as: "links",
      },
    },
    { $addFields: { linkCount: { $size: "$links" }, links: "$$REMOVE" } },

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },

    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        icon: 1,
        color: 1,
        isPublic: 1,
        createdAt: 1,
        linkCount: 1,
        "owner.name": 1,
        "owner._id": 1,
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  const [countResult, results] = await Promise.all([
    Vault.aggregate([...pipeline, { $count: "total" }]),
    Vault.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
  ]);

  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return { results, total, page, totalPages };
};

// Get single public vault with its links

export const getPublicVaultBySlug = async (
  slug: string,
): Promise<{ vault: IVault; links: ILink[] }> => {
  const vault = await Vault.findOne({ slug, isPublic: true }).populate(
    "userId",
    "name",
  );

  if (!vault) {
    throw new ApiError(404, "Vault not found or is not public");
  }

  const links = await Link.find({ vaultId: vault._id }).sort({ createdAt: -1 });

  return { vault, links };
};

// Clone a public vault into the requesting user's account

export const clonePublicVault = async (
  slug: string,
  userId: Types.ObjectId,
) => {
  // 1. fetch the original public vault
  const originalVault = await Vault.findOne({ slug, isPublic: true });

  if (!originalVault) {
    throw new ApiError(404, "Vault not found or is not public");
  }

  // 2. prevent cloning your own vault
  if (originalVault.userId.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot clone your own vault");
  }

  // 3. resolve a unique slug for the cloning user's account
  const baseSlug = generateSlug(originalVault.name);
  const newSlug = await resolveUniqueSlug(baseSlug, userId);

  // 4. create the new vault — isPublic always false for clone
  const clonedVault = await Vault.create({
    name: originalVault.name,
    slug: newSlug,
    ...(originalVault.description && {
      description: originalVault.description,
    }),
    ...(originalVault.icon && { icon: originalVault.icon }),
    ...(originalVault.color && { color: originalVault.color }),
    isPublic: false,
    userId,
  });

  // 5. fetch all links from original vault
  const originalLinks = await Link.find({ vaultId: originalVault._id });

  // 6. deep clone all links into new vault
  const clonedLinks = await Link.insertMany(
    originalLinks.map((link) => ({
      title: link.title,
      url: link.url,
      alias: link.alias,
      description: link.description,
      tags: link.tags,
      isFavorite: false, // reset favorites on clone
      vaultId: clonedVault._id,
      userId,
    })),
  );

  return { vault: clonedVault, links: clonedLinks };
};
