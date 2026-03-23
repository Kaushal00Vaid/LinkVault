import { api } from "./axios"
import type { ApiResponse } from "@/types/index"

export interface Vault {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  isPublic: boolean
  userId: string
  linkCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateVaultInput {
  name: string
  description?: string
  icon?: string
  color?: string
  isPublic?: boolean
}

export const vaultApi = {
  getVaults: async (): Promise<ApiResponse<Vault[]>> => {
    const res = await api.get("/vaults")
    return res.data
  },

  createVault: async (data: CreateVaultInput): Promise<ApiResponse<Vault>> => {
    const res = await api.post("/vaults", data)
    return res.data
  },

  getVault: async (slug: string): Promise<ApiResponse<Vault>> => {
    const res = await api.get(`/vaults/${slug}`)
    return res.data
  },

  updateVault: async (
    slug: string,
    data: Partial<CreateVaultInput>
  ): Promise<ApiResponse<Vault>> => {
    const res = await api.patch(`/vaults/${slug}`, data)
    return res.data
  },

  deleteVault: async (slug: string): Promise<ApiResponse<void>> => {
    const res = await api.delete(`/vaults/${slug}`)
    return res.data
  },
}
