import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as linkApi from "@/api/link.api";

const keys = {
  list: (slug: string, params?: linkApi.ListLinksParams) =>
    ["links", slug, params ?? {}] as const,
};

export function useLinksQuery(slug: string, params?: linkApi.ListLinksParams) {
  return useQuery({
    queryKey: keys.list(slug, params),
    queryFn: () => linkApi.listLinks(slug, params),
    enabled: Boolean(slug),
  });
}

export function useCreateLinkMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: linkApi.CreateLinkBody) =>
      linkApi.createLink(slug, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["links", slug] });
      qc.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
}

export function useUpdateLinkMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      linkId,
      body,
    }: {
      linkId: string;
      body: linkApi.UpdateLinkBody;
    }) => linkApi.updateLink(slug, linkId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links", slug] }),
  });
}

export function useDeleteLinkMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => linkApi.deleteLink(slug, linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["links", slug] });
      qc.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
}

export function useToggleFavoriteMutation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => linkApi.toggleFavorite(slug, linkId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links", slug] }),
  });
}
