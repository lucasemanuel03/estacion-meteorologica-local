"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Thermometer, ThermometerSnowflake, Droplets, CloudRain, Sparkles, Check, Layout, LayoutDashboard, Cog } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "../ui/card"

export type WeatherParameter = "temperature" | "precip_total" | "temp_avg" | "humidity_avg"

export interface ParameterConfig {
  id: WeatherParameter
  label: string
  shortLabel: string
  unit: string
  icon: React.ComponentType<{ className?: string }>
  activeClass: string
  borderClass: string
  badgeBg: string
  badgeText: string
}

export const PARAMETER_CONFIGS: ParameterConfig[] = [
  {
    id: "temperature",
    label: "Temperaturas",
    shortLabel: "Máx/Mín",
    unit: "°C",
    icon: Thermometer,
    activeClass: "bg-orange-500/15 border-orange-500/50 text-orange-700 dark:text-orange-300",
    borderClass: "border-orange-500/30",
    badgeBg: "bg-orange-500/10 dark:bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300 border-orange-500/30",
  },
  {
    id: "precip_total",
    label: "Lluvia Acumulada",
    shortLabel: "Lluvia",
    unit: "mm",
    icon: CloudRain,
    activeClass: "bg-sky-500/15 border-sky-500/50 text-sky-700 dark:text-sky-300",
    borderClass: "border-sky-500/30",
    badgeBg: "bg-sky-500/10 dark:bg-sky-500/20",
    badgeText: "text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  {
    id: "temp_avg",
    label: "Promedio",
    shortLabel: "Prom",
    unit: "°C",
    icon: Thermometer,
    activeClass: "bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-500/30",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  {
    id: "humidity_avg",
    label: "H Promedio",
    shortLabel: "Hum",
    unit: "%",
    icon: Droplets,
    activeClass: "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-500/30",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
]

interface ParameterSelectorProps {
  selectedParameters: WeatherParameter[]
  onChange: (parameters: WeatherParameter[]) => void
}

export function ParameterSelector({ selectedParameters, onChange }: ParameterSelectorProps) {
  const toggleParameter = (id: WeatherParameter) => {
    if (selectedParameters.includes(id)) {
      if (selectedParameters.length === 1) {
        return // Mantener al menos un parámetro seleccionado
      }
      onChange(selectedParameters.filter((p) => p !== id))
    } else {
      onChange([...selectedParameters, id])
    }
  }

  const selectAll = () => {
    onChange(PARAMETER_CONFIGS.map((p) => p.id))
  }

  const selectDefault = () => {
    onChange(["temperature", "precip_total"])
  }

  const selectTemperatures = () => {
    onChange(["temperature"])
  }

  const selectRainAndHumidity = () => {
    onChange(["humidity_avg", "precip_total"])
  }

  return (
    <div className="flex flex-col p-3 sm:p-4 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cog className="w-4 h-4 text-primary" />
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            Configurar filtros:
          </span>
        </div>
      </div>

      {/* Botones de Parámetros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PARAMETER_CONFIGS.map((param) => {
          const Icon = param.icon
          const isSelected = selectedParameters.includes(param.id)

          return (
            <button
              key={param.id}
              type="button"
              onClick={() => toggleParameter(param.id)}
              className={cn(
                "flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer select-none",
                isSelected
                  ? param.activeClass + " shadow-2xs font-semibold"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:border-border hover:bg-background/80 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{param.label}</span>
              </div>
              <div
                className={cn(
                  "w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && <Check className="w-2.5 h-2.5" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
