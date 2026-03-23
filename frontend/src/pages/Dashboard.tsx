import { useMemo, useState, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type Node,
  useNodesState,
  type NodeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { vaultApi } from "../api/vault.api"
import { useAuth } from "../context/AuthContext"
import VaultNode from "../flow/nodes/VaultNode"
import CreateVaultDialog from "../components/vault/CreateVaultDialog"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import VaultDetailsSheet from "@/components/vault/VaultDetailsSheet"
import EditVaultDialog from "@/components/vault/EditVaultDialog"
import { type Vault } from "../api/vault.api"

const nodeTypes: NodeTypes = {
  vaultNode: VaultNode,
}

export default function Dashboard() {
  const { user, logoutUser } = useAuth()
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Fetch from /api/v1/vaults
  const { data: response, isLoading } = useQuery({
    queryKey: ["vaults"],
    queryFn: vaultApi.getVaults,
  })

  // node clicks
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    if (node.data) {
      setSelectedVault(node.data as unknown as Vault)
      setIsSheetOpen(true)
    }
  }, [])

  // Transform vaults into ReactFlow Nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!response?.data) return []

    return response.data.map((vault, index) => {
      // Create a clean grid layout for initial drop
      const columns = 4
      const xOffset = (index % columns) * 320
      const yOffset = Math.floor(index / columns) * 200

      return {
        id: vault._id,
        type: "vaultNode",
        position: { x: xOffset + 100, y: yOffset + 100 },
        data: {
          id: vault._id,
          name: vault.name,
          slug: vault.slug,
          description: vault.description,
          linkCount: vault.linkCount || 0,
          color: vault.color,
          isPublic: vault.isPublic,
        },
      }
    })
  }, [response?.data])

  // Manage node state so they can be dragged around
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  // Sync nodes when data fetches/updates
  useMemo(() => setNodes(initialNodes), [initialNodes, setNodes])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f0eddf]">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <img
            src="/logos/logo.png"
            alt="LinkVault"
            className="h-12 w-12 animate-bounce object-contain"
          />
          <p className="font-medium text-[#09443D]">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Navbar */}
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logos/logo.png"
              alt="LinkVault"
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-xl font-bold tracking-tight text-[#09443D]">
              LinkVault
            </h1>
          </div>
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground sm:inline-block">
            {user?.name}'s Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          <CreateVaultDialog />
          <Button
            variant="ghost"
            size="icon"
            onClick={logoutUser}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Infinite Canvas */}
      <main className="relative w-full flex-1">
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ maxZoom: 1, padding: 0.2 }} // Fixes the aggressive zoom
          minZoom={0.1}
          maxZoom={2}
          className="bg-[#f0eddf]"
        >
          <Background color="#c9c1b0" gap={24} size={2} />
          <Controls className="border-border bg-card fill-foreground shadow-md" />

          <MiniMap
            position="bottom-right"
            className="!m-6 overflow-hidden rounded-lg border-border bg-card shadow-md"
            nodeColor={(node) => (node.data?.color as string) || "#09443D"}
            maskColor="rgba(240, 237, 223, 0.6)"
            zoomable
            pannable
          />
        </ReactFlow>
        <VaultDetailsSheet
          vault={selectedVault}
          isOpen={isSheetOpen}
          onClose={() => {
            setIsSheetOpen(false)
            // Optional delay so it doesn't flash empty data while sliding away
            setTimeout(() => setSelectedVault(null), 300)
          }}
          onEditClick={() => {
            setIsEditOpen(true)
          }}
        />

        <EditVaultDialog
          vault={selectedVault}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccessUpdate={(updatedVault) => {
            setSelectedVault(updatedVault)
          }}
        />
      </main>
    </div>
  )
}
