"use client"

import { AlertTriangle, WifiOff } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Card } from "./card"

type AdvertenciaNivel = "warning" | "error"

interface AdvertenciaCardProps {
  nivel: AdvertenciaNivel
  titulo: string
  descripcion: string
}

export function AdvertenciaCard({ nivel, titulo, descripcion }: AdvertenciaCardProps) {
  const isError = nivel === "error"

  return (
    <Card
      className={cn(
        "border-2 w-full p-5",
        isError
          ? "border-red-500 bg-red-50 text-red-950 dark:bg-red-950/20 dark:text-red-500"
          : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-500"
      )}
    >
        <div className="flex flex-row gap-3 items-center">
            <div>
                {isError ? (
                    <WifiOff className="h-8 w-8" />
                ) : (
                    <AlertTriangle className="h-8 w-8" />
                )}
            </div>
            <div className="w-full text-xs sm:text-sm">
                <h1 className="font-semibold text-sm sm:text-base">{titulo}</h1>
                <span className={isError ? "text-red-900" : ""}>
                    {descripcion}
                </span>
            </div>
      </div>
    </Card>
  )
}
