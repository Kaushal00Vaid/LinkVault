import mongoose from "mongoose";
import { SearchQuery } from "../../validators/search.validators";
import ApiError from "../../utils/ApiError";
import Vault from "../../models/vault.models";
import Link from "../../models/link.models";

export interface SearchResult {
  _id: mongoose.Types.ObjectId;
  title: string;
  url: string;
  alias?: string;
  description?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  vault: {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  };
}

export const searchLinks = async (
  userId: mongoose.Types.ObjectId,
  query: SearchQuery,
) => {
  const { q, tag, vaultSlug, favorite, sort, page, limit } = query;

  if (!q && !tag && !vaultSlug && favorite === undefined) {
    throw new ApiError(
      400,
      "Provide at lease one search parameter: q, tag, vaultSlug, or favorite",
    );
  }

  // match stage
  const matchStage: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (tag) {
    matchStage.tags = tag;
  }

  if (favorite === true) {
    matchStage.isFavorite = true;
  }

  if (vaultSlug) {
    const vault = await Vault.findOne({ slug: vaultSlug, userId });

    if (!vault) {
      throw new ApiError(404, "Vault not found");
    }
    matchStage.vaultId = vault._id;
  }

  if (q) {
    matchStage.$text = { $search: q };
  }

  // sort stage
  let sortStage: Record<string, unknown>;

  if (sort === "relevant" && q) {
    sortStage = { score: { $meta: "textScore" }, createdAt: -1 };
  } else if (sort === "oldest") {
    sortStage = { createdAt: 1 };
  } else {
    sortStage = { createdAt: -1 };
  }

  // pagination
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    // add text score field if doing text search
    ...(q
      ? [{ $match: { ...matchStage, $text: { $search: q } } }]
      : [{ $match: matchStage }]),

    {
      $lookup: {
        from: "vaults",
        localField: "vaultId",
        foreignField: "_id",
        as: "vault",
      },
    },
    { $unwind: "$vault" },

    {
      $project: {
        title: 1,
        url: 1,
        alias: 1,
        description: 1,
        tags: 1,
        isFavorite: 1,
        createdAt: 1,
        vault: {
          _id: "$vault._id",
          name: "$vault.name",
          slug: "$vault.slug",
        },

        // include text score in projection if text search
        ...(q && sort === "relevant" ? { score: { $meta: "textScore" } } : {}),
      },
    },

    { $sort: sortStage },
  ];

  // run count and pagination results in parallel
  const [countResult, results] = await Promise.all([
    Link.aggregate([...pipeline, { $count: "total" }]),
    Link.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
  ]);

  const total = countResult[0]?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return { results, total, page, totalPages };
};
