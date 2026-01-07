"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { WeatherCard } from "./weather-card"
import { ExtremesDisplay } from "./extremes-display"
import type { WeatherDashboardData } from "@/lib/types/weather"
import { Thermometer, Droplets } from "lucide-react"
import getTempColor from "@/lib/utils/functions/getTempColor"
import EstadisticasHoy from "../todays-stats/estadisticas-hoy"
import { AdvertenciaCard } from "@/components/ui/advertencia-card"
import { ModalError } from "@/components/ui/modal-error"

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

export function WeatherDashboard() {
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
      const ahora = new Date()
      const ultimaMedicion = new Date(data.latestReading.recorded_at)
      const diferenciaMinutos = (ahora.getTime() - ultimaMedicion.getTime()) / (1000 * 60)

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Valores Actuales</h2>
          {lastUpdate && <p className="text-base text-muted-foreground">Última Medición: {lastUpdate}</p>}
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Actualizando...</span>
          </div>
        )}
      </div>

      {/* Advertencias de conexión */}
      {estadoConexion === "warning" && (
        <AdvertenciaCard
          nivel="warning"
          titulo="Advertencia: Valores desactualizados"
          descripcion="No se ha recibido la última medición del sensor. Los valores mostrados pueden estar desactualizados."
        />
      )}

      {estadoConexion === "error" && (
        <AdvertenciaCard
          nivel="error"
          titulo="Error: Conexión perdida con el sensor"
          descripcion="Se perdió la conexión con el sensor ESP01. Los valores mostrados están desactualizados. Verifique la conexión del dispositivo."
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <WeatherCard
          title="Temperatura"
          value={data?.latestReading?.temperature ?? null}
          unit="°C"
          icon={<Thermometer className="h-6 w-6" />}
          variant="temperature"
          tempColor={getTempColor(data?.latestReading?.temperature ?? 16)}
          subtitle={tempTrend ? tempTrend.message : undefined}
          diferencial={tempTrend ? tempTrend.differential : undefined}
        />
        <WeatherCard
          title="Humedad"
          value={data?.latestReading?.humidity ?? null}
          unit="%"
          icon={<Droplets className="h-6 w-6" />}
          variant="humidity"
          subtitle={humTrend ? humTrend.message : undefined}
          diferencial={humTrend ? humTrend.differential : undefined}
        />
      </div>

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
        title="Se perdió conexión con el sensor"
        description="Se perdió la conexión con el sensor ESP01. No se están recibiendo datos actualizados. Por favor, verifique que el dispositivo esté encendido y correctamente conectado a la red."
      />
    </div>
  )
}
