import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherDashboard } from "@/components/weather/weather-dashboard"
import { HistoryIcon } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <WeatherDashboard />
        <div>
          <Card className="mt-8 bg-primary/5 shadow-black/50 border-secondary/50">
            <CardHeader>
              <CardTitle>Historial del Clima</CardTitle>
              <CardDescription>
                Consulta los extremos diarios registrados en los últimos días.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/weather-history" >
                <Button variant={"default"} className="mt-6">
                  <HistoryIcon />
                  Ver Historial del Clima
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
