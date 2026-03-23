import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as vaultApi from "@/api/vault.api";

const keys = {
  all: ["vaults"] as const,
  detail: (slug: string) => ["vault", slug] as const,
};

export function useVaultsQuery() {
  return useQuery({
    queryKey: keys.all,
    queryFn: vaultApi.listVaults,
  });
}

export function useVaultQuery(slug: string) {
  return useQuery({
    queryKey: keys.detail(slug),
    queryFn: () => vaultApi.getVaultBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateVaultMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vaultApi.createVault,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateVaultMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      slug,
      body,
    }: {
      slug: string;
      body: vaultApi.UpdateVaultBody;
    }) => vaultApi.updateVault(slug, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.detail(vars.slug) });
    },
  });
}

export function useDeleteVaultMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vaultApi.deleteVault,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
