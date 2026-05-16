export function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatRecordedAtLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const time = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  if (isToday) return `Hoy a las ${time}`

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function getWifiSignalLabel(rssi: number): { label: string; tone: "good" | "fair" | "poor" } {
  if (rssi >= -60) return { label: "Excelente", tone: "good" }
  if (rssi >= -75) return { label: "Buena", tone: "good" }
  if (rssi >= -85) return { label: "Regular", tone: "fair" }
  return { label: "Débil", tone: "poor" }
}
