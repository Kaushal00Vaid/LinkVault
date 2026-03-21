import mongoose from "mongoose";
import Vault from "../../models/vault.models";
import ApiError from "../../utils/ApiError";
import {
  CreateLinkInput,
  GetVaultLinksQuery,
  UpdateLinkInput,
} from "../../validators/link.validators";
import Link from "../../models/link.models";

// vault ownership check
const resolveVault = async (slug: string, userId: mongoose.Types.ObjectId) => {
  const vault = await Vault.findOne({ slug, userId });
  if (!vault) {
    throw new ApiError(404, "Vault not found");
  }

  return vault;
};

// create link
export const createLink = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
  data: CreateLinkInput,
) => {
  const vault = await resolveVault(slug, userId);

  // strip undefined fields
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined),
  );

  const link = await Link.create({
    ...cleanedData,
    vaultId: vault._id,
    userId,
  });

  return link;
};

// get vault links
export const getVaultLinks = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
  query: GetVaultLinksQuery,
) => {
  const vault = await resolveVault(slug, userId);

  const filter: Record<string, unknown> = { vaultId: vault._id };

  if (query.tag) {
    filter.tags = query.tag;
  }

  if (query.favorite === true) {
    filter.isFavorite = true;
  }

  const sortOrder = query.sort === "oldest" ? 1 : -1;

  const links = await Link.find(filter).sort({ createdAt: sortOrder });

  return links;
};

// get single link
export const getLinkById = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
  linkId: string,
) => {
  const vault = await resolveVault(slug, userId);

  if (!mongoose.Types.ObjectId.isValid(linkId)) {
    throw new ApiError(400, "Invalid link ID");
  }

  const link = await Link.findOne({ _id: linkId, vaultId: vault._id });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  return link;
};

// update link
export const updateLink = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
  linkId: string,
  data: UpdateLinkInput,
) => {
  const vault = await resolveVault(slug, userId);

  if (!mongoose.Types.ObjectId.isValid(linkId)) {
    throw new ApiError(400, "Invalid link ID");
  }

  const link = await Link.findOne({ _id: linkId, vaultId: vault._id });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  if (data.title !== undefined) link.title = data.title;
  if (data.url !== undefined) link.url = data.url;
  if (data.alias !== undefined) link.alias = data.alias;
  if (data.description !== undefined) link.description = data.description;
  if (data.tags !== undefined) link.tags = data.tags;

  await link.save();
  return link;
};

// delete link
export const deleteLink = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
  linkId: string,
) => {
  const vault = await resolveVault(slug, userId);

  if (!mongoose.Types.ObjectId.isValid(linkId)) {
    throw new ApiError(400, "Invalid link ID");
  }

  const link = await Link.findOne({ _id: linkId, vaultId: vault._id });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  await link.deleteOne();
};

// toggle fav
export const toggleFavorite = async (
  slug: string,
  userId: mongoose.Types.ObjectId,
  linkId: string,
) => {
  const vault = await resolveVault(slug, userId);

  if (!mongoose.Types.ObjectId.isValid(linkId)) {
    throw new ApiError(400, "Invalid link ID");
  }

  const link = await Link.findOne({ _id: linkId, vaultId: vault._id });

  if (!link) {
    throw new ApiError(404, "Link not found");
  }

  link.isFavorite = !link.isFavorite;
  await link.save();

  return link;
};
