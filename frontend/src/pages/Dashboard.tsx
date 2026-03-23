import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import * as authApi from "@/api/auth.api";
import { getErrorMessage } from "@/api/envelope";
import { InlineError } from "@/components/common/InlineError";
import { useAuth } from "@/context/AuthContext";
import {
  useCreateVaultMutation,
  useDeleteVaultMutation,
  useUpdateVaultMutation,
  useVaultsQuery,
} from "@/hooks/useVaults";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const vaultsQuery = useVaultsQuery();
  const createVault = useCreateVaultMutation();
  const updateVault = useUpdateVaultMutation();
  const deleteVault = useDeleteVaultMutation();

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);

  const [renamingSlug, setRenamingSlug] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(
    null,
  );

  const vaults = vaultsQuery.data ?? [];

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    setError(null);
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch (err) {
      // Even if backend logout fails, clear local state.
      setError(getErrorMessage(err));
    } finally {
      logout();
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  }

  async function onCreateVault(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await createVault.mutateAsync({
        name: newName,
        description: newDescription || undefined,
        isPublic: newIsPublic,
      });
      setNewName("");
      setNewDescription("");
      setNewIsPublic(false);
      navigate(`/vaults/${created.slug}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function startRename(slug: string, currentName: string) {
    setError(null);
    setRenamingSlug(slug);
    setRenameName(currentName);
    setDeleteConfirmSlug(null);
  }

  function cancelRename() {
    setRenamingSlug(null);
    setRenameName("");
  }

  async function submitRename(slug: string) {
    const nextName = renameName.trim();
    if (!nextName) return;

    setError(null);
    try {
      const updated = await updateVault.mutateAsync({
        slug,
        body: { name: nextName },
      });
      cancelRename();
      if (updated.slug && updated.slug !== slug) {
        navigate(`/vaults/${updated.slug}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function askDelete(slug: string) {
    setError(null);
    setDeleteConfirmSlug(slug);
    cancelRename();
  }

  function cancelDelete() {
    setDeleteConfirmSlug(null);
  }

  async function confirmDelete(slug: string) {
    setError(null);
    try {
      await deleteVault.mutateAsync(slug);
      cancelDelete();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <main className="container py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in{user?.email ? ` as ${user.email}` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
            to="/search"
          >
            Search
          </Link>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <InlineError message={error} />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6">
        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-lg font-semibold">Create vault</h2>
          <form className="mt-4 grid gap-3" onSubmit={onCreateVault}>
            <label className="grid gap-2">
              <span className="text-sm font-medium">Name</span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="nextjs-fullstack-assets"
                required
                disabled={createVault.isPending}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">
                Description (optional)
              </span>
              <input
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Docs and tools for my stack"
                disabled={createVault.isPending}
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newIsPublic}
                onChange={(e) => setNewIsPublic(e.target.checked)}
                disabled={createVault.isPending}
              />
              Public
            </label>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
              disabled={createVault.isPending}
            >
              {createVault.isPending ? "Creating…" : "Create"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Your vaults</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.email ? `Owner: ${user.email}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
              onClick={() => vaultsQuery.refetch()}
              disabled={vaultsQuery.isFetching}
            >
              {vaultsQuery.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {vaultsQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : vaultsQuery.isError ? (
            <div className="mt-4">
              <InlineError message={getErrorMessage(vaultsQuery.error)} />
            </div>
          ) : vaults.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No vaults yet.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {vaults.map((v) => (
                <div
                  key={v._id}
                  className="flex flex-col gap-2 rounded-md border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {renamingSlug === v.slug ? (
                        <form
                          className="flex flex-wrap items-center gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void submitRename(v.slug);
                          }}
                        >
                          <input
                            className="h-9 w-64 max-w-full rounded-md border border-border bg-background px-3 text-sm"
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            disabled={updateVault.isPending}
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                            disabled={
                              updateVault.isPending || !renameName.trim()
                            }
                          >
                            {updateVault.isPending ? "Saving…" : "Save"}
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                            onClick={cancelRename}
                            disabled={updateVault.isPending}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="font-medium">{v.name}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {v.slug}
                      </div>
                      {typeof v.linkCount === "number" ? (
                        <div className="mt-1 text-xs text-muted-foreground">
                          links: {v.linkCount}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted"
                        to={`/vaults/${v.slug}`}
                      >
                        Open
                      </Link>
                      {deleteConfirmSlug === v.slug ? (
                        <>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                            onClick={() => void confirmDelete(v.slug)}
                            disabled={deleteVault.isPending}
                          >
                            {deleteVault.isPending ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                            onClick={cancelDelete}
                            disabled={deleteVault.isPending}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                            onClick={() => startRename(v.slug, v.name)}
                            disabled={
                              updateVault.isPending || deleteVault.isPending
                            }
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
                            onClick={() => askDelete(v.slug)}
                            disabled={
                              deleteVault.isPending || updateVault.isPending
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {v.description ? (
                    <div className="text-sm text-muted-foreground">
                      {v.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
