import { HeatIndex } from "@/lib/types/weather"

interface HeatIndexStyle {
  gradient: string
  border: string
  iconBg: string
  iconColor: string
  glow: string
  badgeBg: string
  badgeText: string
}

/**
 * Obtiene los estilos visuales basados en la categoría del índice de calor
 * Siguiendo el esquema de colores de la tabla de advertencias
 */
export function getHeatIndexStyle(category: HeatIndex["category"]): HeatIndexStyle {
  switch (category) {
    case "SEGURO":
      return {
        gradient: "from-green-500/5 via-transparent to-green-500/20",
        border: "border-green-400/40",
        iconBg: "bg-linear-to-br from-green-500/20 to-emerald-500/20",
        iconColor: "text-green-600",
        glow: "shadow-green-500/20",
        badgeBg: "bg-green-500/15",
        badgeText: "text-green-700 dark:text-green-400",
      }
    
    case "PRECAUCIÓN":
      return {
        gradient: "from-yellow-500/5 via-transparent to-yellow-500/20",
        border: "border-yellow-400/40",
        iconBg: "bg-linear-to-br from-yellow-500/20 to-amber-500/20",
        iconColor: "text-yellow-600",
        glow: "shadow-yellow-500/20",
        badgeBg: "bg-yellow-500/15",
        badgeText: "text-yellow-700 dark:text-yellow-400",
      }
    
    case "PRECAUCIÓN EXTREMA":
      return {
        gradient: "from-orange-500/5 via-transparent to-orange-500/25",
        border: "border-orange-400/40",
        iconBg: "bg-linear-to-br from-orange-500/20 to-amber-600/20",
        iconColor: "text-orange-600",
        glow: "shadow-orange-500/25",
        badgeBg: "bg-orange-500/15",
        badgeText: "text-orange-700 dark:text-orange-400",
      }
    
    case "PELIGRO":
      return {
        gradient: "from-red-500/5 via-transparent to-red-500/25",
        border: "border-red-400/40",
        iconBg: "bg-linear-to-br from-red-500/20 to-rose-600/20",
        iconColor: "text-red-600",
        glow: "shadow-red-500/25",
        badgeBg: "bg-red-500/15",
        badgeText: "text-red-700 dark:text-red-400",
      }
    
    case "PELIGRO EXTREMO":
      return {
        gradient: "from-purple-500/5 via-transparent to-fuchsia-500/30",
        border: "border-purple-400/40",
        iconBg: "bg-linear-to-br from-purple-500/25 to-fuchsia-600/25",
        iconColor: "text-purple-600",
        glow: "shadow-purple-500/30",
        badgeBg: "bg-purple-500/15",
        badgeText: "text-purple-700 dark:text-purple-400",
      }
    
    case "MÁS ALLÁ DEL UMBRAL HUMANO":
      return {
        gradient: "from-slate-900/10 via-transparent to-slate-800/40",
        border: "border-slate-400/50",
        iconBg: "bg-linear-to-br from-slate-700/30 to-black/30",
        iconColor: "text-slate-800 dark:text-slate-300",
        glow: "shadow-slate-800/40",
        badgeBg: "bg-slate-800/20 dark:bg-slate-700/20",
        badgeText: "text-slate-900 dark:text-slate-200",
      }
  }
}
