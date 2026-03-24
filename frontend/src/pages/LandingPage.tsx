import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { publicApi } from "../api/public.api"
import { useDebounce } from "../hooks/useDebounce"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Folder,
  ArrowRight,
  Link as LinkIcon,
  Loader2,
} from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)

  // Fetch either search results or default public vaults
  const { data: response, isLoading } = useQuery({
    queryKey: ["public-vaults", debouncedSearch],
    queryFn: () =>
      debouncedSearch
        ? publicApi.searchVaults({ q: debouncedSearch })
        : publicApi.getVaults({ sort: "popular" }),
  })

  const vaults = response?.data?.results || []

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 sm:px-12">
        <div className="flex items-center gap-2 text-xl font-bold text-primary">
          <img
            src="/logos/logo.png"
            alt="LinkVault"
            className="h-8 w-8 object-contain"
          />
          LinkVault
        </div>
        <div>
          {user ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="shadow-sm"
            >
              Go to Dashboard
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="shadow-sm"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        {/* Hero Section */}
        <section className="flex w-full max-w-4xl flex-col items-center px-6 py-20 text-center">
          <Badge
            variant="secondary"
            className="mb-6 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          >
            ✦ Just Launched
          </Badge>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
            Organize the web.
            <br />
            <span className="text-primary">Share your stack.</span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            LinkVault is a visual workspace to save, categorize, and organize
            your most important links. Keep them private, or publish your vaults
            to share your curated resources with the world.
          </p>
          {!user && (
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="h-12 px-8 text-base shadow-md"
            >
              Create Your First Vault <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </section>

        {/* Explore Section */}
        <section className="w-full max-w-6xl border-t border-border px-6 py-12">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-3xl font-bold text-foreground">
              Explore Community Vaults
            </h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stacks, tools, topics..."
                className="border-border bg-card pl-9 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
            </div>
          ) : vaults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center">
              <p className="text-muted-foreground">No public vaults found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vaults.map((vault) => (
                <div
                  key={vault._id}
                  onClick={() => navigate(`/public/${vault.slug}`)}
                  className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{
                        backgroundColor: vault.color || "var(--primary)",
                      }}
                    >
                      <Folder size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold transition-colors group-hover:text-primary">
                        {vault.name}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        by {vault.owner?.name}
                      </p>
                    </div>
                  </div>

                  <p className="mb-6 line-clamp-3 flex-1 text-sm text-muted-foreground">
                    {vault.description || "No description provided."}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1.5 bg-muted font-medium text-muted-foreground"
                    >
                      <LinkIcon className="h-3 w-3" /> {vault.linkCount} Links
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
