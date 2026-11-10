import { WeatherCalendarView } from "@/components/weather-calendar/weather-calendar-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendario Climático | Estación Meteorológica Local",
  description: "Historial climático mensual con resúmenes y parámetros configurables por día.",
}

export default function WeatherCalendarPage() {
  return (
    <main className="app-stage min-h-screen relative">
      <WeatherCalendarView />
    </main>
  )
}
