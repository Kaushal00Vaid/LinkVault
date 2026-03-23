import { api } from "./axios"
import type { ApiResponse } from "@/types/index"

export interface Link {
  _id: string
  title: string
  url: string
  alias?: string
  description?: string
  tags: string[]
  vaultId: string
  userId: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLinkInput {
  title: string
  url: string
  alias?: string
  description?: string
  tags?: string[]
  isFavorite?: boolean
}

export interface GetVaultLinksQuery {
  tag?: string
  favorite?: boolean
  sort?: "newest" | "oldest" | "relevant"
}

export const linkApi = {
  getVaultLinks: async (
    slug: string,
    params?: GetVaultLinksQuery
  ): Promise<ApiResponse<Link[]>> => {
    const res = await api.get(`/vaults/${slug}/links`, { params })
    return res.data
  },

  createLink: async (
    slug: string,
    data: CreateLinkInput
  ): Promise<ApiResponse<Link>> => {
    const res = await api.post(`/vaults/${slug}/links`, data)
    return res.data
  },

  updateLink: async (
    slug: string,
    linkId: string,
    data: Partial<CreateLinkInput>
  ): Promise<ApiResponse<Link>> => {
    const res = await api.patch(`/vaults/${slug}/links/${linkId}`, data)
    return res.data
  },

  deleteLink: async (
    slug: string,
    linkId: string
  ): Promise<ApiResponse<void>> => {
    const res = await api.delete(`/vaults/${slug}/links/${linkId}`)
    return res.data
  },

  toggleFavorite: async (
    slug: string,
    linkId: string
  ): Promise<ApiResponse<Link>> => {
    const res = await api.patch(`/vaults/${slug}/links/${linkId}/favorite`)
    return res.data
  },
}
