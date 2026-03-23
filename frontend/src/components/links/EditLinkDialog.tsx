import { useState, useEffect } from "react"
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

interface EditLinkDialogProps {
  vaultSlug: string
  link: any | null // Pass your full Link type here
  isOpen: boolean
  onClose: () => void
}

export default function EditLinkDialog({
  vaultSlug,
  link,
  isOpen,
  onClose,
}: EditLinkDialogProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<Partial<CreateLinkInput>>({
    title: "",
    url: "",
    alias: "",
    description: "",
    tags: [],
  })

  useEffect(() => {
    if (link && isOpen) {
      setFormData({
        title: link.title,
        url: link.url,
        alias: link.alias || "",
        description: link.description || "",
        tags: link.tags?.flat() || [],
      })
      setError("")
    }
  }, [link, isOpen])

  const mutation = useMutation({
    mutationFn: (data: Partial<CreateLinkInput>) =>
      linkApi.updateLink(vaultSlug, link._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", vaultSlug] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update link")
    },
  })

  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags || []
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) }
      }
      if (currentTags.length >= 5) return prev
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
          <DialogTitle className="text-foreground">Edit Link</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your saved resource details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-foreground">
              Title
            </Label>
            <Input
              id="edit-title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-alias" className="text-foreground">
              Alias
            </Label>
            <Input
              id="edit-alias"
              required
              value={formData.alias}
              onChange={(e) =>
                setFormData({ ...formData, alias: e.target.value })
              }
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-url" className="text-foreground">
              URL
            </Label>
            <Input
              id="edit-url"
              type="url"
              required
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground"
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
            <Label htmlFor="edit-description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="edit-description"
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
              Update Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
