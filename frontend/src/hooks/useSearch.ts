import { keepPreviousData, useQuery } from "@tanstack/react-query";

import * as searchApi from "@/api/search.api";

const keys = {
  search: (params: searchApi.SearchParams) => ["search", params] as const,
};

export function isValidSearch(params: searchApi.SearchParams) {
  return Boolean(
    (params.q && params.q.trim()) ||
    params.tag ||
    params.vaultSlug ||
    params.favorite,
  );
}

export function useSearchQuery(params: searchApi.SearchParams) {
  return useQuery({
    queryKey: keys.search(params),
    queryFn: () => searchApi.searchLinks(params),
    enabled: isValidSearch(params),
    placeholderData: keepPreviousData,
  });
}
