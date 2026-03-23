import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { vaultApi, type Vault } from "../../api/vault.api"
import { linkApi } from "../../api/link.api"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Trash2,
  Edit2,
  Globe,
  Lock,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import EditLinkDialog from "../links/EditLinkDialog"
import CreateLinkDialog from "../links/CreateLinkDialog"

interface VaultDetailsSheetProps {
  vault: Vault | null
  isOpen: boolean
  onClose: () => void
  onEditClick: (vault: Vault) => void
}

export default function VaultDetailsSheet({
  vault,
  isOpen,
  onClose,
  onEditClick,
}: VaultDetailsSheetProps) {
  const queryClient = useQueryClient()

  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false)
  const [linkToEdit, setLinkToEdit] = useState<any | null>(null)

  // Fetch Links for this specific vault
  const { data: linksResponse, isLoading: isLoadingLinks } = useQuery({
    queryKey: ["links", vault?.slug],
    queryFn: () => linkApi.getVaultLinks(vault!.slug),
    enabled: !!vault?.slug && isOpen,
  })

  const links = linksResponse?.data || []

  // Vault Delete Mutation
  const deleteVaultMutation = useMutation({
    mutationFn: (slug: string) => vaultApi.deleteVault(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] })
      onClose()
    },
  })

  // Link Toggle Favorite Mutation
  const toggleLinkFavMutation = useMutation({
    mutationFn: (linkId: string) => linkApi.toggleFavorite(vault!.slug, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", vault?.slug] })
    },
  })

  // Delete Link Mutation
  const deleteLinkMutation = useMutation({
    mutationFn: (linkId: string) => linkApi.deleteLink(vault!.slug, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", vault?.slug] })
      queryClient.invalidateQueries({ queryKey: ["vaults"] }) // Updates count on canvas
    },
  })

  if (!vault) return null

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-100 overflow-y-auto border-l bg-background sm:w-135">
          <SheetHeader className="border-b border-border pt-2 pb-6">
            <div className="flex items-start justify-between pr-10">
              <div className="flex items-center gap-3">
                <div
                  className="h-7 w-7 shrink-0 rounded-lg shadow-sm"
                  style={{ backgroundColor: vault.color || "var(--primary)" }}
                />
                <SheetTitle className="text-2xl font-bold text-foreground">
                  {vault.name}
                </SheetTitle>
              </div>

              {/* Vault Actions (Edit & Delete) */}
              <div className="flex items-center gap-1 rounded-md bg-background/50 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditClick(vault)}
                  className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteVaultMutation.isPending}
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Vault</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{vault.name}</strong>? All links inside will be
                        permanently lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteVaultMutation.mutate(vault.slug)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteVaultMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-muted font-medium text-muted-foreground"
              >
                {vault.isPublic ? (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Private
                  </span>
                )}
              </Badge>
              <span className="text-sm font-medium text-muted-foreground/70">
                /{vault.slug}
              </span>
            </div>

            <SheetDescription className="mt-4 text-base leading-relaxed text-muted-foreground">
              {vault.description || "No description provided for this vault."}
            </SheetDescription>
          </SheetHeader>

          {/* Links Section */}
          <div className="py-8">
            <div className="mx-2 mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <LinkIcon className="h-5 w-5 text-primary" />
                Saved Links ({links.length})
              </h3>
              <Button
                size="sm"
                className="shadow-sm"
                onClick={() => setIsCreateLinkOpen(true)}
              >
                Add Link
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {isLoadingLinks ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                </div>
              ) : links.length === 0 ? (
                <div className="mx-2 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
                  <LinkIcon className="mb-3 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No links saved yet
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Click "Add Link" to populate this vault.
                  </p>
                </div>
              ) : (
                links.map((link) => (
                  <div
                    key={link._id}
                    className="group mx-2 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex w-fit items-center gap-2 truncate text-base font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {link.title}
                          <ExternalLink className="h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-100" />
                        </a>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/60">
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          <span className="max-w-[50ch] truncate">
                            {link.url}
                          </span>
                        </p>
                        {link.description && (
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {link.description}
                          </p>
                        )}

                        {/* Tags */}
                        {link.tags && link.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {link.tags.flat().map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="bg-muted/50 text-xs font-medium text-muted-foreground"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Link Actions */}
                      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-accent"
                          onClick={() => toggleLinkFavMutation.mutate(link._id)}
                          disabled={toggleLinkFavMutation.isPending}
                        >
                          <Star
                            className={`h-4 w-4 ${link.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLinkToEdit(link)}
                          className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this link?"
                              )
                            ) {
                              deleteLinkMutation.mutate(link._id)
                            }
                          }}
                          disabled={deleteLinkMutation.isPending}
                          className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CreateLinkDialog
        vaultSlug={vault.slug}
        isOpen={isCreateLinkOpen}
        onClose={() => setIsCreateLinkOpen(false)}
      />

      <EditLinkDialog
        vaultSlug={vault.slug}
        link={linkToEdit}
        isOpen={!!linkToEdit}
        onClose={() => setLinkToEdit(null)}
      />
    </>
  )
}
