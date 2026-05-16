import { StationStatusDashboard } from "@/components/station-status/station-status-dashboard"

export default function StationStatusPage() {
  return (
    <main className="app-stage relative min-h-screen overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-8">
        <StationStatusDashboard />
      </div>
    </main>
  )
}
