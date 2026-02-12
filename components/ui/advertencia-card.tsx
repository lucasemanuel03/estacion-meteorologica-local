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
        "transition-all duration-500 hover:scale-[1.01]",
        "animate-in fade-in-50 slide-in-from-top-5 duration-500",
        isError
          ? "border-red-500/50 bg-linear-to-br from-red-500/15 to-red-600/5 shadow-lg shadow-red-500/20"
          : "border-yellow-500/50 bg-linear-to-br from-yellow-500/15 to-amber-500/5 shadow-lg shadow-yellow-500/20"
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
            <WifiOff className="h-7 w-7 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        
        <div className="flex-1 space-y-1">
          <h3 className={cn(
            "font-bold text-base sm:text-lg tracking-wide",
            isError 
              ? "text-red-700 dark:text-red-300" 
              : "text-yellow-700 dark:text-yellow-300"
          )}>
            {titulo}
          </h3>
          <p className={cn(
            "text-sm sm:text-base leading-relaxed",
            isError 
              ? "text-red-600 dark:text-red-400" 
              : "text-yellow-600 dark:text-yellow-400"
          )}>
            {descripcion}
          </p>
        </div>
      </div>
    </Card>
  )
}
