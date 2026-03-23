import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchApi } from "../../api/search.api"
import { useDebounce } from "../../hooks/useDebounce"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  ExternalLink,
  Folder,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface GlobalSearchProps {
  onOpenVault: (slug: string) => void
}

export default function GlobalSearch({ onOpenVault }: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)

  // 500ms Debounce
  const debouncedSearch = useDebounce(searchTerm, 500)

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch, page],
    queryFn: () =>
      searchApi.searchLinks({
        q: debouncedSearch,
        page,
        limit: 5,
      }),

    enabled: debouncedSearch.length > 0 && open,
  })

  const results = searchResponse?.data?.results || []
  const pagination = searchResponse?.data?.pagination

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-64 justify-start border-border bg-card text-muted-foreground shadow-sm"
        >
          <Search className="mr-2 h-4 w-4" />
          Search links...
          <kbd className="pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>

      <DialogContent className="gap-0 overflow-hidden border-border bg-background p-0 sm:max-w-2xl">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search titles, URLs, or aliases..."
            className="flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!debouncedSearch ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Type to start searching across all your vaults...
            </div>
          ) : results.length === 0 && !isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results found for "{debouncedSearch}"
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((link) => (
                <div
                  key={link._id}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 truncate text-base font-semibold text-foreground hover:text-primary"
                      >
                        {link.title}
                        <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                      </a>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {link.description || link.url}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                    <div className="flex cursor-pointer items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-muted text-xs font-normal text-muted-foreground"
                        onClick={() => {
                          onOpenVault(link.vault.slug)
                          setOpen(false)
                        }}
                      >
                        <Folder className="h-3 w-3" />
                        {link.vault.name}
                      </Badge>
                      {link.tags?.flat().map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] font-normal text-muted-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total)
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
