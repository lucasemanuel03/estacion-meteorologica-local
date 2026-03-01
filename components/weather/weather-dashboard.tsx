"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { ExtremesDisplay } from "./extremes-display"
import type { WeatherDashboardData } from "@/lib/types/weather"
import EstadisticasHoy from "../todays-stats/estadisticas-hoy"
import ActualesDisplay from "./actuales-display"
import { AdvertenciaCard } from "@/components/ui/advertencia-card"
import { ModalError } from "@/components/ui/modal-error"
import { MapPin } from "lucide-react"

type TrendResponse = {
  success: boolean
  tempTrend?: { differential: number; message: string }
  humTrend?: { differential: number; message: string }
}

type TrendParametro = {
  differential: number
  message: string
}

type EstadoConexion = "normal" | "warning" | "error"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function WeatherDashboard({ubicacion = "Las Margaritas, Córdoba"}: {ubicacion?: string}) {
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [tempTrend, setTempTrend] = useState<TrendParametro | null>(null)
  const [humTrend, setHumTrend] = useState<TrendParametro | null>(null)
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>("normal")
  const [showErrorModal, setShowErrorModal] = useState(false)


  // SWR para refrescar datos automáticamente cada 60 segundos
  const { data, error, isLoading } = useSWR<WeatherDashboardData>("/api/weather-data", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  // Fetch tendencia
  useEffect(() => {
    let abort = false
    const loadTrend = async () => {
      try {
        const res = await fetch("/api/todays-stats/trend")
        if (!res.ok) return
        const json: TrendResponse = await res.json()
        if (abort || !json.success) return
        if (json.tempTrend) setTempTrend(json.tempTrend)
        if (json.humTrend) setHumTrend(json.humTrend)
      } catch {
        // silencioso
      }
    }
    loadTrend()
    return () => {
      abort = true
    }
  }, [])

  // Verificar estado de conexión basado en última medición
  useEffect(() => {
    if (!data?.latestReading?.recorded_at) return

    const verificarConexion = () => {
      if (!data?.latestReading?.recorded_at) return
      
      const ahora = new Date()
      const ultimaMedicion = new Date(data.latestReading.recorded_at)
      const diferenciaMinutos = (ahora.getTime() - ultimaMedicion.getTime()) / (1000 * 60)
      console.log("HeatIndex", data.heatIndex)

      let nuevoEstado: EstadoConexion = "normal"

      if (diferenciaMinutos > 60) {
        nuevoEstado = "error"
        // Mostrar modal solo la primera vez que cambia a error
        if (estadoConexion !== "error") {
          setShowErrorModal(true)
        }
      } else if (diferenciaMinutos > 20) {
        nuevoEstado = "warning"
      }

      setEstadoConexion(nuevoEstado)
    }

    verificarConexion()
    // Verificar cada minuto
    const intervalo = setInterval(verificarConexion, 60000)

    return () => clearInterval(intervalo)
  }, [data?.latestReading?.recorded_at, estadoConexion])

  useEffect(() => {
    if (data?.latestReading?.recorded_at) {
      const time = new Date(data.latestReading.recorded_at).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setLastUpdate(time)
    }
  }, [data])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar los datos meteorológicos</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header con efecto de gradiente */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 blur-3xl -z-10" />
        <div className="flex items-center justify-center pb-4">

          {isLoading? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-sm font-medium text-primary">Actualizando...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 ">
                <MapPin className="h-8 w-8"/>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  {ubicacion}
                </h2>
              </div>
              {lastUpdate && (
                <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2 ml-12">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Última Medición: {lastUpdate}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Advertencias de conexión */}
      <div className="animate-in fade-in-50 slide-in-from-top-5 duration-500">
        {estadoConexion === "warning" && (
          <AdvertenciaCard
            nivel="warning"
            titulo="Valores desactualizados"
            descripcion="No se ha recibido la última medición del sensor. Los valores mostrados pueden estar desactualizados."
          />
        )}

        {estadoConexion === "error" && (
          <AdvertenciaCard
            nivel="error"
            titulo="Conexión perdida con el sensor"
            descripcion="Se perdió la conexión con el sensor ESP01. Los valores mostrados están desactualizados. Verifique la conexión del dispositivo."
          />
        )}
      </div>

      <ActualesDisplay
        temperature={data?.latestReading?.temperature ?? null}
        humidity={data?.latestReading?.humidity ?? null}
        pressure={data?.latestReading?.pressure ?? null}
        altitude={data?.latestReading?.altitude ?? null} 
        heatIndex={data?.heatIndex ?? null}
        prediction={data?.predictions?.now ?? null}
        tempTrend={tempTrend ?? undefined}
        humTrend={humTrend ?? undefined}
      />

      <ExtremesDisplay extremes={data?.todayExtremes ?? null} />

      <EstadisticasHoy 
        temp_max={data?.todayExtremes?.temp_max ?? null} 
        temp_min={data?.todayExtremes?.temp_min ?? null}
        tempDiferencial={tempTrend ? tempTrend.differential : undefined}
        humDiferencial={humTrend ? humTrend.differential : undefined}
      />

      {/* Modal de error crítico */}
      <ModalError
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        title="Conexión perdida con el sensor"
        description="Se perdió la conexión con el sensor ESP01. No se están recibiendo datos actualizados. Por favor, verifique que el dispositivo esté encendido y correctamente conectado a la red."
      />
    </div>
  )
}
