import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { vaultApi, type CreateVaultInput } from "../../api/vault.api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Globe, Lock } from "lucide-react"

export default function CreateVaultDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateVaultInput>({
    name: "",
    description: "",
    color: "#09443D",
    isPublic: false, // Added isPublic field
  })
  const [error, setError] = useState("")

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: vaultApi.createVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] })
      setOpen(false)
      setFormData({
        name: "",
        description: "",
        color: "#09443D",
        isPublic: false,
      })
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to create vault")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    mutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#09443D] text-[#f0eddf] hover:bg-[#09443D]/90">
          <Plus className="mr-2 h-4 w-4" /> New Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#c9c1b0] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#09443D]">Create New Vault</DialogTitle>
          <DialogDescription className="text-[#4f3b38]/70">
            A vault is a collection of resources for a specific stack or
            project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#4f3b38]">
              Vault Name
            </Label>
            <Input
              id="name"
              required
              minLength={2}
              maxLength={30}
              placeholder="e.g., React Core Architecture"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#4f3b38]">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              maxLength={200}
              placeholder="Resources and docs for my React setup..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#c9c1b0] p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-base text-[#4f3b38]">
                {formData.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-[#09443D]" />
                    Public Vault
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Private Vault
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
              className="data-[state=checked]:bg-[#09443D]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-[#4f3b38]">
              Theme Color
            </Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                className="h-10 w-14 cursor-pointer p-1"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
              <Input
                type="text"
                pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="flex-1 font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#c9c1b0] text-[#4f3b38] hover:bg-[#f0eddf]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#09443D] text-[#f0eddf] hover:bg-[#09443D]/90"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating..." : "Create Vault"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
