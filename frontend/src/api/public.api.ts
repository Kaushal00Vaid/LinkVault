import { api } from "./axios"
import type { ApiResponse } from "@/types/index"
import type { Vault } from "./vault.api"
import type { Link } from "./link.api"

// The backend returns owner too
export interface PublicVault extends Vault {
  owner: {
    _id: string
    name: string
  }
}

export interface PublicVaultsResponse {
  results: PublicVault[]
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface PublicVaultDetailsResponse {
  vault: PublicVault
  links: Link[]
}

export const publicApi = {
  getVaults: async (params?: {
    page?: number
    limit?: number
    sort?: string
  }): Promise<ApiResponse<PublicVaultsResponse>> => {
    const res = await api.get("/public/vaults", { params })
    return res.data
  },

  searchVaults: async (params: {
    q: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<PublicVaultsResponse>> => {
    const res = await api.get("/public/vaults/search", { params })
    return res.data
  },

  getVaultBySlug: async (
    slug: string
  ): Promise<ApiResponse<PublicVaultDetailsResponse>> => {
    const res = await api.get(`/public/vaults/${slug}`)
    return res.data
  },

  cloneVault: async (
    slug: string
  ): Promise<ApiResponse<{ vault: Vault; links: Link[] }>> => {
    const res = await api.post(`/public/vaults/${slug}/clone`)
    return res.data
  },
}
