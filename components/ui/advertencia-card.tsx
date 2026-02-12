"use client"

import { AlertTriangle, WifiOff } from "lucide-react"
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
        "relative overflow-hidden border backdrop-blur-xl w-full p-6",
        "animate-in fade-in-50 slide-in-from-top-5 duration-500",
        isError
          ? "border-red-800/50 bg-linear-to-br from-red-500/15 to-red-600/5 shadow-lg shadow-red-900/20"
          : "border-yellow-800/50 bg-linear-to-br from-yellow-500/15 to-amber-500/5 shadow-lg shadow-yellow-900/20"
      )}
    >
      {/* Atmospheric background effect */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        isError
          ? "bg-[radial-gradient(circle_at_10%_20%,rgba(239,68,68,0.15),rgba(255,255,255,0))]"
          : "bg-[radial-gradient(circle_at_10%_20%,rgba(234,179,8,0.15),rgba(255,255,255,0))]"
      )} />
      
      <div className="flex flex-row gap-4 items-start relative z-10">
        <div className={cn(
          "p-3 rounded-xl backdrop-blur-sm",
          isError 
            ? "bg-red-500/20" 
            : "bg-yellow-500/20"
        )}>
          {isError ? (
            <WifiOff className="h-7 w-7 text-red-800 dark:text-red-200" />
          ) : (
            <AlertTriangle className="h-7 w-7 text-yellow-800 dark:text-yellow-200" />
          )}
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className={cn(
            "font-bold text-base sm:text-lg tracking-wide",
            isError 
              ? "text-red-900 dark:text-red-100" 
              : "text-yellow-900 dark:text-yellow-100"
          )}>
            {titulo}
          </h3>
          <p className={cn(
            "text-sm sm:text-base leading-relaxed",
            isError 
              ? "text-red-800 dark:text-red-200" 
              : "text-yellow-800 dark:text-yellow-200"
          )}>
            {descripcion}
          </p>
        </div>
      </div>
    </Card>
  )
}
