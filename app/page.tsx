import Header from "@/components/header"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <WeatherDashboard />
      </div>
    </main>
  )
}
