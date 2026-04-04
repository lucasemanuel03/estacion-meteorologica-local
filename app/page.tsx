import IrAlHistorialCard from "@/components/cards/ir-historial-card"
import CurveToday from "@/components/todays-stats/curve-today"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"

import { redirect } from "next/navigation"

export default function Home() {
  return (
    <main className="app-stage min-h-screen relative overflow-hidden">
      <div className="container mx-auto py-8 px-4 relative z-10">
        <WeatherDashboard 
          ubicacion="Las Margaritas, Córdoba"
        />
        <div className="mt-8">
          <CurveToday/>
        </div>
        <div className="mt-8">
          <IrAlHistorialCard />
        </div>
      </div>
    </main>
  )
  redirect("/inicio")
}
