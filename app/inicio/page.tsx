"use client"

import { MapPin } from "lucide-react"
import ActualesDisplay from "@/components/weather/actuales-display"
import ProximasHorasDisplay from "@/components/weather/proximas-horas-display"
import { AdvertenciaCard } from "@/components/ui/advertencia-card"
import { ModalError } from "@/components/ui/modal-error"
import { useWeatherData } from "../../hooks/use-weather-data"
import { useTrends } from "../../hooks/use-trends"
import { useConnectionStatus } from "../../hooks/use-connection-status"

export default function InicioPage() {
  const { data, error, isLoading } = useWeatherData()
  const { tempTrend, humTrend } = useTrends()
  const {
    estadoConexion,
    lastUpdate,
    showErrorModal,
    setShowErrorModal,
  } = useConnectionStatus(data?.latestReading?.recorded_at ?? null)

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/5 via-background to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto py-8 px-4 relative z-10 space-y-8">
        <div className="flex items-center justify-center pb-2">
          {isLoading ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span className="text-sm font-medium text-primary">Actualizando...</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-7 w-7" />
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Las Margaritas, Córdoba
                </h2>
              </div>
              {lastUpdate && (
                <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2 ml-10">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Última medición: {lastUpdate}
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="text-center text-destructive">Error al cargar los datos meteorológicos</p>
        )}

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
            descripcion="Se perdió la conexión con el sensor ESP01. Los valores mostrados están desactualizados."
          />
        )}

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

        <ProximasHorasDisplay
          pressure={data?.latestReading?.pressure ?? null}
          prediction={data?.predictions?.now ?? null}
        />

        <ModalError
          open={showErrorModal}
          onOpenChange={setShowErrorModal}
          title="Conexión perdida con el sensor"
          description="Se perdió la conexión con el sensor ESP01. No se están recibiendo datos actualizados. Verifique el dispositivo."
        />
      </div>
    </main>
  )
}
