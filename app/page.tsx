import IrAlHistorialCard from "@/components/cards/ir-historial-card"
import CurveToday from "@/components/todays-stats/curve-today"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"

import { redirect } from "next/navigation"

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Atmospheric background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-500/5 via-background to-background pointer-events-none" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-sky-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
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
