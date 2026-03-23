import { Handle, Position } from "@xyflow/react"
import { Folder } from "lucide-react"

interface VaultNodeProps {
  data: {
    id: string
    name: string
    slug: string
    description?: string
    linkCount: number
    color?: string
    isPublic: boolean
  }
}

export default function VaultNode({ data }: VaultNodeProps) {
  return (
    <div className="group max-w-65 min-w-55 cursor-pointer rounded-xl border-2 border-border bg-card px-4 py-4 shadow-sm transition-all hover:border-[#09443D] hover:shadow-md">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-start gap-3">
        <div
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
          style={{ backgroundColor: data.color || "#4f3b38" }}
        >
          <Folder size={18} />
        </div>
        <div className="flex-1">
          <h3 className="line-clamp-2 leading-tight font-bold text-foreground transition-colors group-hover:text-[#09443D]">
            {data.name}
          </h3>
          {data.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {data.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold tracking-wide text-secondary-foreground uppercase">
          {data.linkCount} {data.linkCount === 1 ? "Link" : "Links"}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
