import IrAEstadisticasCard from "@/components/cards/ir-estadisticas"
import IrAlHistorialCard from "@/components/cards/ir-historial-card"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"

export default function Home() {
  return (
    <main className="app-stage min-h-screen relative overflow-hidden">
      <div className="container mx-auto py-8 px-4 relative z-10">
        <WeatherDashboard 
          ubicacion="Las Margaritas, Córdoba"
        />
        <div className="mt-8 flex flex-col w-full sm:flex-row gap-4 sm:gap-6">
          <IrAEstadisticasCard />
          <IrAlHistorialCard />
        </div>
      </div>
    </main>
  )
}
