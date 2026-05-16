import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SensorHealthStatus } from "@/lib/types/station-status"

export function SensorStatusBadge({ status }: { status: SensorHealthStatus }) {
  const ok = status === "OK"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold",
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
      )}
    >
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {status}
    </span>
  )
}
