import { api } from "@/api/axios";
import { unwrapApiData } from "@/api/envelope";
import type { ApiEnvelope, Vault } from "@/types";

export type CreateVaultBody = {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isPublic?: boolean;
};

export type UpdateVaultBody = Partial<CreateVaultBody>;

export async function listVaults() {
  const res =
    await api.get<ApiEnvelope<(Vault & { linkCount?: number })[]>>("/vaults");
  return unwrapApiData(res.data);
}

export async function getVaultBySlug(slug: string) {
  const res = await api.get<ApiEnvelope<Vault>>(
    `/vaults/${encodeURIComponent(slug)}`,
  );
  return unwrapApiData(res.data);
}

export async function createVault(body: CreateVaultBody) {
  const res = await api.post<ApiEnvelope<Vault>>("/vaults", body);
  return unwrapApiData(res.data);
}

export async function updateVault(slug: string, body: UpdateVaultBody) {
  const res = await api.patch<ApiEnvelope<Vault>>(
    `/vaults/${encodeURIComponent(slug)}`,
    body,
  );
  return unwrapApiData(res.data);
}

export async function deleteVault(slug: string) {
  const res = await api.delete<ApiEnvelope<null>>(
    `/vaults/${encodeURIComponent(slug)}`,
  );
  if (!res.data.success) {
    throw new Error(
      res.data.errors?.[0] || res.data.message || "Delete failed",
    );
  }
  return null;
}
