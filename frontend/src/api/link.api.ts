import { api } from "@/api/axios";
import { unwrapApiData } from "@/api/envelope";
import type { ApiEnvelope, Link, LinkTag } from "@/types";

export type ListLinksParams = {
  tag?: LinkTag;
  favorite?: boolean;
  sort?: "newest" | "oldest";
};

export type CreateLinkBody = {
  title: string;
  url: string;
  alias?: string;
  description?: string;
  tags?: LinkTag[];
  isFavorite?: boolean;
};

export type UpdateLinkBody = Partial<CreateLinkBody>;

export async function listLinks(vaultSlug: string, params?: ListLinksParams) {
  const res = await api.get<ApiEnvelope<Link[]>>(
    `/vaults/${encodeURIComponent(vaultSlug)}/links`,
    { params },
  );
  return unwrapApiData(res.data);
}

export async function createLink(vaultSlug: string, body: CreateLinkBody) {
  const res = await api.post<ApiEnvelope<Link>>(
    `/vaults/${encodeURIComponent(vaultSlug)}/links`,
    body,
  );
  return unwrapApiData(res.data);
}

export async function updateLink(
  vaultSlug: string,
  linkId: string,
  body: UpdateLinkBody,
) {
  const res = await api.patch<ApiEnvelope<Link>>(
    `/vaults/${encodeURIComponent(vaultSlug)}/links/${encodeURIComponent(linkId)}`,
    body,
  );
  return unwrapApiData(res.data);
}

export async function deleteLink(vaultSlug: string, linkId: string) {
  const res = await api.delete<ApiEnvelope<null>>(
    `/vaults/${encodeURIComponent(vaultSlug)}/links/${encodeURIComponent(linkId)}`,
  );
  if (!res.data.success) {
    throw new Error(
      res.data.errors?.[0] || res.data.message || "Delete failed",
    );
  }
  return null;
}

export async function toggleFavorite(vaultSlug: string, linkId: string) {
  const res = await api.patch<ApiEnvelope<Link>>(
    `/vaults/${encodeURIComponent(vaultSlug)}/links/${encodeURIComponent(linkId)}/favorite`,
  );
  return unwrapApiData(res.data);
}
