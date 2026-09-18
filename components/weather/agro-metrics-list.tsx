"use client"

import { useState } from "react"
import { HelpCircle, Sprout, Thermometer, Droplet, Sun, Snowflake } from "lucide-react"
import type { DerivedMetrics } from "@/lib/utils/functions/derived-metrics"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface AgroMetricsListProps {
  derivedMetrics?: DerivedMetrics | null
}

type ModalType = "ith" | "et0" | "deltaT" | "frostRisk" | null

export function AgroMetricsList({ derivedMetrics }: AgroMetricsListProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  if (!derivedMetrics) return null

  const { ith, et0, dewPoint, deltaT, frostRisk } = derivedMetrics

  // Si todas las métricas son nulas, no renderizar el bloque
  if (!ith && !et0 && !deltaT && !frostRisk) return null

  const getBadgeVariant = (category?: string | null) => {
    if (!category) return "secondary"
    const catUpper = category.toUpperCase()
    if (catUpper.includes("CONFORT") || catUpper.includes("ÓPTIMO") || catUpper.includes("NINGUNO")) {
      return "outline" // o verde
    }
    if (catUpper.includes("LEVE") || catUpper.includes("MODERADO") || catUpper.includes("BAJO")) {
      return "secondary"
    }
    return "destructive"
  }

  const getBadgeStyle = (category?: string | null) => {
    if (!category) return "bg-muted text-muted-foreground"
    const catUpper = category.toUpperCase()
    if (catUpper.includes("CONFORT") || catUpper.includes("ÓPTIMO") || catUpper.includes("NINGUNO")) {
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    }
    if (catUpper.includes("LEVE") || catUpper.includes("MODERADO") || catUpper.includes("BAJO")) {
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
    }
    return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
  }

  return (
    <div className="mt-6 rounded-2xl border bg-card/60 p-4 sm:p-5 backdrop-blur-xs shadow-xs animate-in fade-in duration-500">
      {/* Título de la sección */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sprout className="h-5 w-5" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold tracking-tight">
          Indicadores Agropecuarios
        </h3>
      </div>

      {/* Lista de indicadores */}
      <div className="flex flex-col divide-y divide-border/50 text-sm">

        {/* 2. ET0 */}
        {et0 && (
          <div className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1">
            <div className="flex items-center justify-between flex-col sm:flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Sun className="h-4 w-4 text-orange-500 shrink-0" />
                <span>Evapotranspiración (ET0):</span>
                <span className="font-semibold ml-2">
                  {et0.value} {et0.unit}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModal("et0")}
                  className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-full focus:outline-hidden"
                  title="Ver información detallada de ET0"
                  aria-label="Ver detalles de ET0"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 3. Delta T */}
        {deltaT && (
          <div className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1">
            <div className="flex items-center justify-between flex-col sm:flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Droplet className="h-4 w-4 text-sky-500 shrink-0" />
                <span>Delta T (Pulverización):</span>
                <span className="font-semibold ml-2">
                  {deltaT.value} {deltaT.unit}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModal("deltaT")}
                  className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-full focus:outline-hidden"
                  title="Ver información detallada de Delta T"
                  aria-label="Ver detalles de Delta T"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium w-40 truncate text-center border ${getBadgeStyle(
                  deltaT.category
                )}`}
              >
                {deltaT.category}
              </span>
            </div>
          </div>
        )}

        {/* 1. ITH */}
        {ith && (
          <div className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1">
            <div className="flex items-center justify-between flex-col sm:flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Thermometer className="h-4 w-4 text-amber-500 shrink-0" />
                <span>ITH (Estrés Ganadero):</span>
                <span className="font-semibold ml-2">{ith.value}</span>
                <button
                  type="button"
                  onClick={() => setActiveModal("ith")}
                  className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-full focus:outline-hidden"
                  title="Ver información detallada del ITH"
                  aria-label="Ver detalles de ITH"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium w-40 truncate text-center border ${getBadgeStyle(
                  ith.category
                )}`}
              >
                {ith.category}
              </span>
            </div>
          </div>
        )}

        {/* 4. Riesgo de Helada */}
        {frostRisk && (
          <div className="py-3 first:pt-0 last:pb-0 flex flex-col gap-1">
            <div className="flex items-center justify-between flex-col sm:flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Snowflake className="h-4 w-4 text-cyan-500 shrink-0" />
                <span>Riesgo de Helada</span>
                <button
                  type="button"
                  onClick={() => setActiveModal("frostRisk")}
                  className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-0.5 rounded-full focus:outline-hidden"
                  title="Ver información detallada del riesgo de heladas"
                  aria-label="Ver detalles de riesgo de helada"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium w-40 truncate text-center border ${getBadgeStyle(
                  frostRisk.category
                )}`}
              >
                {frostRisk.category}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL / DIALOG INFORMATIVO DE CADA PARÁMETRO */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md bg-card">
          {/* Modal ITH */}
          {activeModal === "ith" && ith && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-amber-500" />
                  <DialogTitle>Índice de Temperatura y Humedad (ITH)</DialogTitle>
                </div>
                <DialogDescription>
                  Indicador de bienestar y estrés térmico en ganadería (bovinos de leche y carne).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-muted/60 p-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Valor Actual:</span>
                    <span className="text-lg font-bold">{ith.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Estado:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getBadgeStyle(ith.category)}`}>
                      {ith.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-muted-foreground">Fórmula:</span>
                    <span className="font-mono text-muted-foreground">Thom / NRC (1959)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    Impacto en Producción
                  </h4>
                  <p className="text-xs leading-relaxed">{ith.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t text-xs">
                  <h4 className="font-medium text-muted-foreground">Escala de Referencia ITH:</h4>
                  <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                    <li><strong className="text-foreground">&lt; 68:</strong> Confort (Sin impacto hídrico ni térmico).</li>
                    <li><strong className="text-foreground">68 - 71:</strong> Estrés Leve (Monitoreo en alta producción).</li>
                    <li><strong className="text-foreground">72 - 78:</strong> Estrés Moderado (Caída en ingesta y leche).</li>
                    <li><strong className="text-foreground">79 - 83:</strong> Estrés Severo (Agitación respiratoria grave).</li>
                    <li><strong className="text-foreground">≥ 84:</strong> Emergencia (Peligro vital para el rodeo).</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Modal ET0 */}
          {activeModal === "et0" && et0 && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-orange-500" />
                  <DialogTitle>Evapotranspiración de Referencia (ET0)</DialogTitle>
                </div>
                <DialogDescription>
                  Estimación de la pérdida de agua del suelo y cultivo por evaporación y transpiración.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-muted/60 p-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Estimación diaria para hoy:</span>
                    <span className="text-lg font-bold">{et0.value} {et0.unit}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="font-medium">{et0.method} (1985)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Radiación Extraterrestre (Ra):</span>
                    <span className="font-mono">{et0.solarRadiationRa} MJ/m²/día</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    Interpretación Agronómica
                  </h4>
                  <p className="text-xs leading-relaxed">{et0.description}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    Indica cuántos milímetros de agua necesitaría reponer el suelo mediante riego o lluvia para mantener la humedad de referencia en el cultivo.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Modal Delta T */}
          {activeModal === "deltaT" && deltaT && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-sky-500" />
                  <DialogTitle>Delta T (Diferencia Psicrométrica)</DialogTitle>
                </div>
                <DialogDescription>
                  Parámetro determinante para decidir la aplicación de productos fitosanitarios/agroquímicos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-muted/60 p-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Valor Actual:</span>
                    <span className="text-lg font-bold">{deltaT.value} {deltaT.unit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Aptitud de Pulverización:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getBadgeStyle(deltaT.category)}`}>
                      {deltaT.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-muted-foreground">Fórmula:</span>
                    <span className="font-mono text-muted-foreground">T. Seco - T. Bulbo Húmedo (Stull)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    Recomendación de Aplicación
                  </h4>
                  <p className="text-xs leading-relaxed">{deltaT.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t text-xs">
                  <h4 className="font-medium text-muted-foreground">Rangos de Aplicación:</h4>
                  <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                    <li><strong className="text-foreground">&lt; 2.0 °C (Bajo):</strong> Gotas flotantes. Riesgo de deriva por inversión térmica.</li>
                    <li><strong className="text-emerald-600 dark:text-emerald-400">2.0 - 8.0 °C (Óptimo):</strong> Condición ideal para pulverizar.</li>
                    <li><strong className="text-amber-600 dark:text-amber-400">8.1 - 10.0 °C (Alto):</strong> Evaporación rápida. Usar pastillas/antideriva.</li>
                    <li><strong className="text-red-600 dark:text-red-400">&gt; 10.0 °C (Crítico):</strong> Evaporación extrema. No pulverizar.</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Modal Riesgo de Helada */}
          {activeModal === "frostRisk" && frostRisk && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-cyan-500" />
                  <DialogTitle>Evaluación de Riesgo de Helada</DialogTitle>
                </div>
                <DialogDescription>
                  Diagnóstico preventivo de heladas agrícolas y tipo de congelamiento esperado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="rounded-xl bg-muted/60 p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Diagnóstico Actual:</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getBadgeStyle(frostRisk.category)}`}>
                      {frostRisk.category}
                    </span>
                  </div>
                  {dewPoint && (
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-muted-foreground">Punto de Rocío Actual:</span>
                      <span className="font-mono font-medium">{dewPoint.value} °C</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    Detalle del Diagnóstico
                  </h4>
                  <p className="text-xs leading-relaxed">{frostRisk.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t text-xs">
                  <h4 className="font-medium text-muted-foreground">Conceptos Clave para el Productor:</h4>
                  <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                    <li>
                      <strong className="text-foreground">Helada Blanca:</strong> Se produce cuando el punto de rocío está por encima de 0°C y la temperatura cae bajo cero con suficiente humedad, generando escarcha helada visible sobre las plantas.
                    </li>
                    <li>
                      <strong className="text-red-600 dark:text-red-400">Helada Negra:</strong> Ocurre con aire sumamente seco (punto de rocío negativo y baja humedad). No genera hielo en la superficie pero congela los jugos internos vegetales, destruyendo brotes y follaje (quema).
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
