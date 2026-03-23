import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { linkApi, type CreateLinkInput } from "../../api/link.api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

const AVAILABLE_TAGS = [
  "Docs",
  "UI/UX",
  "Tutorial",
  "Deployment",
  "Tool",
  "Reference",
  "Other",
]

interface CreateLinkDialogProps {
  vaultSlug: string
  isOpen: boolean
  onClose: () => void
}

export default function CreateLinkDialog({
  vaultSlug,
  isOpen,
  onClose,
}: CreateLinkDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<CreateLinkInput>({
    title: "",
    url: "",
    alias: "",
    description: "",
    tags: [],
  })

  const mutation = useMutation({
    mutationFn: (data: CreateLinkInput) => linkApi.createLink(vaultSlug, data),
    onSuccess: () => {
      // Refresh links in the sheet
      queryClient.invalidateQueries({ queryKey: ["links", vaultSlug] })
      // Refresh vaults to update the linkCount on the canvas node!
      queryClient.invalidateQueries({ queryKey: ["vaults"] })

      setFormData({ title: "", url: "", alias: "", description: "", tags: [] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to add link")
    },
  })

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags || []
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) }
      }
      if (currentTags.length >= 5) return prev // Max 5 tags validation
      return { ...prev, tags: [...currentTags, tag] }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Clean up empty optional fields
    const payload = { ...formData }
    if (!payload.alias?.trim()) delete payload.alias
    if (!payload.description?.trim()) delete payload.description

    mutation.mutate(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Link</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Save a new resource to this vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              required
              placeholder="e.g., React Flow Documentation"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alias" className="text-foreground">
              Alias <span className="text-destructive">*</span>
            </Label>
            <Input
              id="alias"
              required
              placeholder="Reactflow"
              value={formData.alias}
              onChange={(e) =>
                setFormData({ ...formData, alias: e.target.value })
              }
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-foreground">
              URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              required
              placeholder="https://..."
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Tags (Max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = formData.tags?.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-card text-muted-foreground hover:bg-accent"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief note about this link..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="resize-none bg-card"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
