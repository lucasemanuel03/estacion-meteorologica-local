import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IrAlHistorialCard() {
  return (
    <Card className={cn(
      "relative overflow-hidden backdrop-blur-xl",
      "bg-gradient-to-br from-emerald-500/10 via-background/95 to-teal-500/10",
      "border-emerald-400/30 shadow-2xl shadow-emerald-500/20",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
      "group hover:scale-[1.01] transition-all"
    )}
    style={{ animationDelay: "600ms" }}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
            <HistoryIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              Historial del Clima
            </CardTitle>
            <CardDescription className="text-base">
              Consulta los extremos diarios registrados en los últimos días.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <Link href="/weather-history">
          <Button 
            variant="default" 
            size="lg"
            className={cn(
              "w-full sm:w-auto group/btn",
              "bg-gradient-to-r from-emerald-600 to-teal-600",
              "hover:from-emerald-700 hover:to-teal-700",
              "shadow-lg hover:shadow-xl shadow-emerald-500/30",
              "transition-all duration-300",
              "text-base font-bold"
            )}
          >
            <HistoryIcon className="mr-2" />
            Ver Historial del Clima
            <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}