import { CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function EmptyStateCard() {
  return (
    <Card className="relative overflow-hidden border backdrop-blur-xl bg-linear-to-br from-slate-500/5 via-transparent to-slate-500/10 border-slate-400/30">
      <CardContent className="py-12 px-6 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground text-lg">No hay datos disponibles para mostrar.</p>
      </CardContent>
    </Card>
  )
}
