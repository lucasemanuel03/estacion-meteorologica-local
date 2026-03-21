"use client"

import { useEffect, useState } from "react"

type EstadoConexion = "normal" | "warning" | "error"

export function useConnectionStatus(recordedAt: string | null) {
  const [estadoConexion, setEstadoConexion] = useState<EstadoConexion>("normal")
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [lastUpdate, setLastUpdate] = useState("")

  useEffect(() => {
    if (!recordedAt) {
      setEstadoConexion("error")
      return
    }

    const verify = () => {
      const now = new Date()
      const last = new Date(recordedAt)
      const diffMinutes = (now.getTime() - last.getTime()) / (1000 * 60)

      let nextState: EstadoConexion = "normal"
      if (diffMinutes > 60) {
        nextState = "error"
      } else if (diffMinutes > 20) {
        nextState = "warning"
      }

      if (nextState === "error" && estadoConexion !== "error") {
        setShowErrorModal(true)
      }
      setEstadoConexion(nextState)

      setLastUpdate(
        last.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }

    verify()
    const interval = setInterval(verify, 60000)

    return () => clearInterval(interval)
  }, [recordedAt, estadoConexion])

  return {
    estadoConexion,
    lastUpdate,
    showErrorModal,
    setShowErrorModal,
  }
}
