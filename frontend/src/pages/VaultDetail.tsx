import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import { getErrorMessage } from "@/api/envelope";
import { InlineError } from "@/components/common/InlineError";
import {
  useCreateLinkMutation,
  useDeleteLinkMutation,
  useLinksQuery,
  useToggleFavoriteMutation,
  useUpdateLinkMutation,
} from "@/hooks/useLinks";
import { useVaultQuery } from "@/hooks/useVaults";
import { LINK_TAGS, parseTags } from "@/lib/linkTags";
import type { LinkTag } from "@/types";

export function VaultDetailPage() {
  const { slug = "" } = useParams();

  const [filterTag, setFilterTag] = useState<LinkTag | "">("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const params = useMemo(
    () => ({
      tag: filterTag ? (filterTag as LinkTag) : undefined,
      favorite: favoritesOnly ? true : undefined,
      sort,
    }),
    [favoritesOnly, filterTag, sort],
  );

  const vaultQuery = useVaultQuery(slug);
  const linksQuery = useLinksQuery(slug, params);

  const links = linksQuery.data ?? [];

  const createLink = useCreateLinkMutation(slug);
  const updateLink = useUpdateLinkMutation(slug);
  const deleteLink = useDeleteLinkMutation(slug);
  const toggleFavorite = useToggleFavoriteMutation(slug);

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formAlias, setFormAlias] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formFavorite, setFormFavorite] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteConfirmLinkId, setDeleteConfirmLinkId] = useState<string | null>(
    null,
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createLink.mutateAsync({
        title: formTitle,
        url: formUrl,
        alias: formAlias || undefined,
        description: formDescription || undefined,
        tags: parseTags(formTags),
        isFavorite: formFavorite,
      });

      setFormTitle("");
      setFormUrl("");
      setFormAlias("");
      setFormDescription("");
      setFormTags("");
      setFormFavorite(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function startEdit(linkId: string, currentTitle: string) {
    setError(null);
    setEditingLinkId(linkId);
    setEditTitle(currentTitle);
    setDeleteConfirmLinkId(null);
  }

  function cancelEdit() {
    setEditingLinkId(null);
    setEditTitle("");
  }

  async function submitEdit(linkId: string) {
    const nextTitle = editTitle.trim();
    if (!nextTitle) return;
    setError(null);
    try {
      await updateLink.mutateAsync({ linkId, body: { title: nextTitle } });
      cancelEdit();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function askDelete(linkId: string) {
    setError(null);
    setDeleteConfirmLinkId(linkId);
    cancelEdit();
  }

  function cancelDelete() {
    setDeleteConfirmLinkId(null);
  }

  async function confirmDelete(linkId: string) {
    setError(null);
    try {
      await deleteLink.mutateAsync(linkId);
      cancelDelete();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onToggleFavorite(linkId: string) {
    setError(null);
    try {
      await toggleFavorite.mutateAsync(linkId);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="container py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Vault</h1>
          <p className="mt-2 text-sm text-muted-foreground">slug: {slug}</p>
        </div>
        <RouterLink
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
          to="/dashboard"
        >
          Back
        </RouterLink>
      </div>

      {error ? (
        <div className="mt-4">
          <InlineError message={error} />
        </div>
      ) : null}

      <section className="mt-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
        <h2 className="text-lg font-semibold">Vault info</h2>
        {vaultQuery.isLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : vaultQuery.isError ? (
          <div className="mt-3">
            <InlineError message={getErrorMessage(vaultQuery.error)} />
          </div>
        ) : vaultQuery.data ? (
          <div className="mt-3 text-sm">
            <div>
              <span className="font-medium">Name:</span> {vaultQuery.data.name}
            </div>
            {vaultQuery.data.description ? (
              <div className="mt-1 text-muted-foreground">
                {vaultQuery.data.description}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 text-card-foreground">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Links</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage links in this vault.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm">
              Tag{" "}
              <select
                className="ml-2 h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value as LinkTag | "")}
              >
                <option value="">All</option>
                {LINK_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={favoritesOnly}
                onChange={(e) => setFavoritesOnly(e.target.checked)}
              />
              Favorites only
            </label>

            <label className="text-sm">
              Sort{" "}
              <select
                className="ml-2 h-9 rounded-md border border-border bg-background px-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              onClick={() => linksQuery.refetch()}
              disabled={linksQuery.isFetching}
            >
              {linksQuery.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <form className="grid gap-3" onSubmit={onCreate}>
            <h3 className="text-base font-semibold">Add link</h3>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Title</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                disabled={createLink.isPending}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">URL</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://..."
                required
                disabled={createLink.isPending}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Alias (optional)</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={formAlias}
                onChange={(e) => setFormAlias(e.target.value)}
                disabled={createLink.isPending}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Description (optional)
              </span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                disabled={createLink.isPending}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Tags (comma-separated)
              </span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="Docs, Tool"
                disabled={createLink.isPending}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formFavorite}
                onChange={(e) => setFormFavorite(e.target.checked)}
                disabled={createLink.isPending}
              />
              Favorite
            </label>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
              disabled={createLink.isPending}
            >
              {createLink.isPending ? "Adding…" : "Add link"}
            </button>
          </form>

          <div>
            <h3 className="text-base font-semibold">Link list</h3>
            {linksQuery.isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
            ) : linksQuery.isError ? (
              <div className="mt-3">
                <InlineError message={getErrorMessage(linksQuery.error)} />
              </div>
            ) : links.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No links found.
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {links.map((l) => (
                  <div
                    key={l._id}
                    className="rounded-md border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {editingLinkId === l._id ? (
                          <form
                            className="flex flex-wrap items-center gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              void submitEdit(l._id);
                            }}
                          >
                            <input
                              className="h-9 w-80 max-w-full rounded-md border border-border bg-background px-3 text-sm"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              disabled={updateLink.isPending}
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                              disabled={
                                updateLink.isPending || !editTitle.trim()
                              }
                            >
                              {updateLink.isPending ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                              onClick={cancelEdit}
                              disabled={updateLink.isPending}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <div className="font-medium">
                            {l.title} {l.isFavorite ? "★" : ""}
                          </div>
                        )}
                        <div className="mt-1 break-all text-xs text-muted-foreground">
                          {l.url}
                        </div>
                        {l.alias ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            alias: {l.alias}
                          </div>
                        ) : null}
                        {l.tags?.length ? (
                          <div className="mt-2 text-xs text-muted-foreground">
                            tags: {l.tags.join(", ")}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                          onClick={() =>
                            window.open(l.url, "_blank", "noopener,noreferrer")
                          }
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                          onClick={() => onToggleFavorite(l._id)}
                          disabled={toggleFavorite.isPending}
                        >
                          {l.isFavorite ? "Unfavorite" : "Favorite"}
                        </button>
                        {deleteConfirmLinkId === l._id ? (
                          <>
                            <button
                              type="button"
                              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                              onClick={() => void confirmDelete(l._id)}
                              disabled={deleteLink.isPending}
                            >
                              {deleteLink.isPending ? "Deleting…" : "Confirm"}
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                              onClick={cancelDelete}
                              disabled={deleteLink.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                              onClick={() => startEdit(l._id, l.title)}
                              disabled={
                                updateLink.isPending ||
                                deleteLink.isPending ||
                                toggleFavorite.isPending
                              }
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                              onClick={() => askDelete(l._id)}
                              disabled={
                                deleteLink.isPending ||
                                updateLink.isPending ||
                                toggleFavorite.isPending
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {l.description ? (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {l.description}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
