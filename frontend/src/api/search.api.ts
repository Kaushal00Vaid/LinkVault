import { api } from "@/api/axios";
import { unwrapApiData } from "@/api/envelope";
import type { ApiEnvelope, LinkTag, SearchResponse } from "@/types";

export type SearchSort = "newest" | "oldest" | "relevant";

export type SearchParams = {
  q?: string;
  tag?: LinkTag;
  vaultSlug?: string;
  favorite?: boolean;
  sort?: SearchSort;
  page?: number;
  limit?: number;
};

export async function searchLinks(params: SearchParams) {
  const res = await api.get<ApiEnvelope<SearchResponse>>("/search", { params });
  return unwrapApiData(res.data);
}
