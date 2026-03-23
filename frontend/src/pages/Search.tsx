import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import type { SearchSort } from "@/api/search.api";
import { getErrorMessage } from "@/api/envelope";
import { InlineError } from "@/components/common/InlineError";
import { useVaultsQuery } from "@/hooks/useVaults";
import { useSearchQuery } from "@/hooks/useSearch";
import { LINK_TAGS } from "@/lib/linkTags";
import { safeOpenUrl } from "@/lib/url";
import type { LinkTag } from "@/types";

export function SearchPage() {
  const vaultsQuery = useVaultsQuery();

  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<LinkTag | "">("");
  const [vaultSlug, setVaultSlug] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [sort, setSort] = useState<SearchSort>("relevant");
  const [limit, setLimit] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const next = qInput;
    if (!next.trim()) {
      setQ("");
      return;
    }

    const t = setTimeout(() => setQ(next), 500);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    setPage((p) => (p === 1 ? p : 1));
  }, [qInput, tag, vaultSlug, favorite, sort, limit]);

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      tag: tag || undefined,
      vaultSlug: vaultSlug || undefined,
      favorite: favorite ? true : undefined,
      sort,
      page,
      limit,
    }),
    [favorite, limit, page, q, sort, tag, vaultSlug],
  );

  const searchQuery = useSearchQuery(params);

  const results = searchQuery.data?.results ?? [];
  const pagination = searchQuery.data?.pagination;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQ(qInput);
    setPage(1);
  }

  const vaultOptions = vaultsQuery.data ?? [];

  return (
    <main className="container py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Search</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search across all your links.
          </p>
        </div>
        <RouterLink
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
          to="/dashboard"
        >
          Back
        </RouterLink>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Query</span>
            <input
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search title, alias, or URL"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Tag</span>
              <select
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={tag}
                onChange={(e) => setTag(e.target.value as LinkTag | "")}
              >
                <option value="">Any</option>
                {LINK_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Vault</span>
              <select
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={vaultSlug}
                onChange={(e) => setVaultSlug(e.target.value)}
              >
                <option value="">Any</option>
                {vaultOptions.map((v) => (
                  <option key={v._id} value={v.slug}>
                    {v.name} ({v.slug})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              Favorites only
            </label>

            <label className="text-sm">
              Sort{" "}
              <select
                className="ml-2 h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as SearchSort)}
              >
                <option value="relevant">Relevant</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>

            <label className="text-sm">
              Limit{" "}
              <select
                className="ml-2 h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={String(limit)}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>

            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
              disabled={searchQuery.isFetching}
            >
              {searchQuery.isFetching ? "Searching…" : "Search"}
            </button>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted"
              onClick={() => {
                setQInput("");
                setQ("");
                setTag("");
                setVaultSlug("");
                setFavorite(false);
                setSort("relevant");
                setLimit(20);
                setPage(1);
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Results</h2>
          {pagination ? (
            <div className="text-sm text-muted-foreground">
              total: {pagination.total}
            </div>
          ) : null}
        </div>

        {searchQuery.isError ? (
          <div className="mt-4">
            <InlineError message={getErrorMessage(searchQuery.error)} />
          </div>
        ) : null}

        {!searchQuery.isError &&
        !searchQuery.isFetching &&
        !searchQuery.data ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Enter a query or filter to search.
          </p>
        ) : null}

        {searchQuery.data ? (
          results.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No results.</p>
          ) : (
            <div className="mt-4 grid gap-2">
              {results.map((r) => (
                <div
                  key={r._id}
                  className="rounded-md border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {r.title} {r.isFavorite ? "★" : ""}
                      </div>
                      <div className="mt-1 break-all text-xs text-muted-foreground">
                        {r.url}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        vault:{" "}
                        <RouterLink
                          className="underline underline-offset-4"
                          to={`/vaults/${r.vault.slug}`}
                        >
                          {r.vault.name}
                        </RouterLink>
                      </div>
                      {r.tags?.length ? (
                        <div className="mt-2 text-xs text-muted-foreground">
                          tags: {r.tags.join(", ")}
                        </div>
                      ) : null}
                      {r.alias ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          alias: {r.alias}
                        </div>
                      ) : null}
                      {r.description ? (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {r.description}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted"
                        onClick={() => safeOpenUrl(r.url)}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}

        {pagination ? (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage || searchQuery.isFetching}
            >
              Prev
            </button>
            <div className="text-sm text-muted-foreground">
              page {pagination.page} / {pagination.totalPages}
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || searchQuery.isFetching}
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
