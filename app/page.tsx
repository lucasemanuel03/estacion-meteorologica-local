import IrAlHistorialCard from "@/components/cards/ir-historial-card"
import AmplitudTermicaToday from "@/components/todays-stats/amplitud-termica-today"
import CurveToday from "@/components/todays-stats/curve-today"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"


export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <WeatherDashboard />
        <CurveToday/>
        <div>
          <IrAlHistorialCard />
        </div>

      </div>
    </main>
  )
}
