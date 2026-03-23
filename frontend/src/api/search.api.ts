import { api } from "./axios"
import type { ApiResponse } from "@/types/index"

export interface SearchQuery {
  q?: string
  tag?: string
  vaultSlug?: string
  favorite?: boolean
  sort?: "newest" | "oldest" | "relevant"
  page?: number
  limit?: number
}

export interface SearchResult {
  _id: string
  title: string
  url: string
  alias?: string
  description?: string
  tags: string[]
  isFavorite: boolean
  createdAt: string
  vault: {
    _id: string
    name: string
    slug: string
  }
}

export interface SearchResponseData {
  results: SearchResult[]
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const searchApi = {
  searchLinks: async (
    params: SearchQuery
  ): Promise<ApiResponse<SearchResponseData>> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
    )

    const res = await api.get("/search", { params: cleanParams })
    return res.data
  },
}
