import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeatIndex } from "@/lib/types/weather"
import { cn } from "@/lib/utils"
import { Flame, HelpCircle } from "lucide-react"
import { getHeatIndexStyle } from "@/lib/utils/functions/getHeatIndexStyle"
import leyendas from "@/lib/utils/leyendas"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

interface HeatIndexCardProps {
  heatIndex: HeatIndex | null
}

export default function HeatIndexCard({ heatIndex }: HeatIndexCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Estilo por defecto cuando no hay datos
  const defaultStyle = {
    gradient: "from-slate-500/5 via-transparent to-slate-500/10",
    border: "border-slate-400/30",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-500",
    glow: "shadow-slate-500/10",
    badgeBg: "bg-slate-500/10",
    badgeText: "text-slate-600 dark:text-slate-400",
  }

  const style = heatIndex ? getHeatIndexStyle(heatIndex.category) : defaultStyle

  return (
    <Card
      className={cn(
        "relative overflow-hidden border backdrop-blur-xl bg-linear-to-br",
        "transition-all duration-300 hover:shadow-2xl",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
        style.gradient,
        style.border,
        style.glow
      )}
    >
      {/* Efecto de fondo atmosférico */}
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
        <CardTitle 
            className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide text-foreground/90">
                <p className="flex gap-2 items-center">
                    Índice de Calor
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <HelpCircle className="text-primary/50 cursor-pointer hover:text-primary transition-colors w-5 h-5" />
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <Flame className="w-6 h-6 text-orange-500" />
                            ¿Qué es el Índice de Calor?
                          </DialogTitle>
                          <DialogDescription className="text-base leading-relaxed pt-4">
                            {leyendas.heatIndexLeyenda}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-3 pt-4">
                          <h3 className="font-semibold text-lg">Categorías de Advertencia</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0" />
                              <div>
                                <p className="font-semibold text-green-700 dark:text-green-400">SEGURO (&lt; 26°C)</p>
                                <p className="text-sm text-muted-foreground">No se esperan efectos adversos debidos al calor.</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1 shrink-0" />
                              <div>
                                <p className="font-semibold text-yellow-700 dark:text-yellow-400">PRECAUCIÓN (27-32°C)</p>
                                <p className="text-sm text-muted-foreground">Fatiga posible con exposición prolongada y/o actividad física.</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                              <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 shrink-0" />
                              <div>
                                <p className="font-semibold text-orange-700 dark:text-orange-400">PRECAUCIÓN EXTREMA (33-40°C)</p>
                                <p className="text-sm text-muted-foreground">Posible golpe de calor, calambres o agotamiento con exposición prolongada.</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                              <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0" />
                              <div>
                                <p className="font-semibold text-red-700 dark:text-red-400">PELIGRO (41-51°C)</p>
                                <p className="text-sm text-muted-foreground">Calambres o agotamiento probables y golpe de calor posible.</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <div className="w-3 h-3 rounded-full bg-purple-500 mt-1 shrink-0" />
                              <div>
                                <p className="font-semibold text-purple-700 dark:text-purple-400">PELIGRO EXTREMO (52-92°C)</p>
                                <p className="text-sm text-muted-foreground">Golpe de calor altamente probable.</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-500/10 border border-slate-500/20">
                              <div className="w-3 h-3 rounded-full bg-slate-700 dark:bg-slate-400 mt-1 shrink-0" />
                              <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-300">MÁS ALLÁ DEL UMBRAL HUMANO (≥93°C)</p>
                                <p className="text-sm text-muted-foreground">Valores más allá de la resistencia humana al calor.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      <DialogFooter>
                        <p className="font-extralight text-primary/70">Fuente: <a href="https://www.weather.gov/ama/heatindex" target="_blank">National Weather Service (USA)</a></p>
                      </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </p>
        </CardTitle>
        <div
          className={cn(
            "p-3 rounded-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-110",
            style.iconBg
          )}
        >
          <Flame className={cn("w-7 h-7", style.iconColor)} />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pb-6">
        {heatIndex ? (
          <>
            {/* Valor principal - más compacto */}
            <div className="flex items-baseline justify-center gap-2 py-2">
              <span
                className={cn(
                  "text-4xl sm:text-5xl font-bold tracking-wide",
                  "bg-linear-to-br from-foreground to-foreground/80 bg-clip-text text-transparent",
                  "drop-shadow-sm"
                )}
              >
                {heatIndex.value.toFixed(1)}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-muted-foreground/80">
                °C
              </span>
            </div>

            {/* Badge de categoría */}
            <div className="flex justify-center mt-3">
              <span
                className={cn(
                  "inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider",
                  "backdrop-blur-sm border border-current/20",
                  "animate-in zoom-in-90 duration-500 delay-150",
                  style.badgeBg,
                  style.badgeText
                )}
              >
                {heatIndex.category}
              </span>
            </div>

            {/* Descripción compacta */}
            <div className="mt-3 px-3 py-2 rounded-lg bg-background/40 backdrop-blur-sm">
              <p className="text-xs sm:text-sm text-center font-medium text-muted-foreground leading-relaxed">
                {heatIndex.description}
              </p>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground/70">
              No hay datos disponibles para calcular el índice de calor
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
 