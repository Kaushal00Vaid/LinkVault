import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  vaultApi,
  type Vault,
  type CreateVaultInput,
} from "../../api/vault.api"
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
import { Switch } from "@/components/ui/switch"
import { Globe, Lock, Loader2 } from "lucide-react"

interface EditVaultDialogProps {
  vault: Vault | null
  isOpen: boolean
  onClose: () => void
  // We need this to update the parent sheet if the slug changes!
  onSuccessUpdate: (updatedVault: Vault) => void
}

export default function EditVaultDialog({
  vault,
  isOpen,
  onClose,
  onSuccessUpdate,
}: EditVaultDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateVaultInput>>({
    name: "",
    description: "",
    color: "#5b704e", // fallback to primary hex
    isPublic: false,
  })
  const [error, setError] = useState("")

  const queryClient = useQueryClient()

  // Pre-fill form when dialog opens
  useEffect(() => {
    if (vault && isOpen) {
      setFormData({
        name: vault.name,
        description: vault.description || "",
        color: vault.color || "#5b704e",
        isPublic: vault.isPublic,
      })
      setError("")
    }
  }, [vault, isOpen])

  const mutation = useMutation({
    mutationFn: (data: Partial<CreateVaultInput>) =>
      vaultApi.updateVault(vault!.slug, data),
    onSuccess: (response) => {
      // 1. Refresh the canvas nodes
      queryClient.invalidateQueries({ queryKey: ["vaults"] })
      // 2. Pass the updated vault back to the sheet (critical for slug changes)
      // Assuming your ApiResponse structure returns the updated vault in the `data` property
      if (response.data) onSuccessUpdate(response.data)
      // 3. Close dialog
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to update vault")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    mutation.mutate(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Vault</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Make changes to your vault. If you change the name, the link URL
            will also update.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-foreground">
              Vault Name
            </Label>
            <Input
              id="edit-name"
              required
              minLength={2}
              maxLength={30}
              className="bg-card text-card-foreground"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-foreground">
              Description
            </Label>
            <Textarea
              id="edit-description"
              maxLength={200}
              className="bg-card text-card-foreground"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-base text-foreground">
                {formData.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-primary" /> Public Vault
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" /> Private
                    Vault
                  </>
                )}
              </Label>
              <div className="text-[0.8rem] text-muted-foreground">
                {formData.isPublic
                  ? "Anyone with the link can view this vault."
                  : "Only you can access this vault."}
              </div>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPublic: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-color" className="text-foreground">
              Theme Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="edit-color"
                type="color"
                className="h-10 w-14 cursor-pointer bg-card p-1"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
              <Input
                type="text"
                pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                className="flex-1 bg-card font-mono uppercase"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
