import { useQuery, useMutation } from "@tanstack/react-query"
import { useParams, useNavigate } from "react-router-dom"
import { publicApi } from "../api/public.api"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  Link as LinkIcon,
  Copy,
  FolderPlus,
} from "lucide-react"
import { toast } from "sonner"

export default function PublicVaultPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: response, isLoading } = useQuery({
    queryKey: ["public-vault", slug],
    queryFn: () => publicApi.getVaultBySlug(slug!),
    enabled: !!slug,
  })

  const cloneMutation = useMutation({
    mutationFn: () => publicApi.cloneVault(slug!),
    onSuccess: () => {
      // Redirect straight to dashboard once cloned so they can see their new vault
      navigate("/dashboard")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to clone vault"

      toast.error(message)
    },
  })

  const handleCloneClick = () => {
    if (!user) {
      // Send them to login. You could also store the slug in sessionStorage
      // to auto-redirect them back here after login if you want!
      navigate("/login")
      return
    }
    cloneMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!response?.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <h2 className="mb-2 text-2xl font-bold">Vault Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          This vault may be private or deleted.
        </p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    )
  }

  const { vault, links } = response.data

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mini Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
        </Button>
        <div className="font-bold text-primary">LinkVault</div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Vault Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div
              className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
              style={{ backgroundColor: vault.color || "var(--primary)" }}
            />

            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                {vault.name}
              </h1>
              <p className="mb-4 text-muted-foreground">
                Curated by {(vault.userId as any)?.name}
              </p>
              <p className="text-base leading-relaxed">{vault.description}</p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
            <Button
              size="lg"
              onClick={handleCloneClick}
              disabled={
                cloneMutation.isPending ||
                !!(user && (vault.userId as any)?._id.toString() === user._id)
              }
              className="shadow-sm"
            >
              {cloneMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FolderPlus className="mr-2 h-4 w-4" />
              )}
              {user &&
              (vault.userId as any)?._id?.toString() === user._id?.toString()
                ? "This is your Vault"
                : "Clone to Workspace"}
            </Button>
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                Requires free account
              </p>
            )}
          </div>
        </div>

        {/* Links List */}
        <div className="mb-6 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Resources ({links.length})</h2>
        </div>

        <div className="flex flex-col gap-4">
          {links.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-muted-foreground">
              This vault is currently empty.
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link._id}
                className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-fit items-center gap-2 truncate text-lg font-semibold text-foreground transition-colors hover:text-primary"
                  >
                    {link.title}
                    <ExternalLink className="h-4 w-4 opacity-40 transition-opacity group-hover:opacity-100" />
                  </a>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground/60">
                    <LinkIcon className="h-3 w-3 shrink-0" />
                    <span className="max-w-[50ch] truncate">{link.url}</span>
                  </p>
                  {link.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {link.description}
                    </p>
                  )}
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

                {/* Copy URL button for convenience */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => navigator.clipboard.writeText(link.url)}
                  title="Copy Link"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
