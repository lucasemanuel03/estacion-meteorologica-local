import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IrAlHistorialCard() {
  return (
    <Card className={cn(
      "relative overflow-hidden backdrop-blur-xl",
      "bg-linear-to-br from-emerald-400/20 to-emerald-600/10",
      "border-border/50 shadow-2xl shadow-border/50",
      "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
      "group  transition-all w-full"
    )}
    style={{ animationDelay: "600ms" }}
    >
      
      <CardHeader className="relative z-10">
        <div className="flex items-start gap-4 group-hover:scale-101 transition-transform duration-300">
          <div className="p-3 rounded-2xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm ">
            <HistoryIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black tracking-tight ">
              Historial del Clima
            </CardTitle>
            <CardDescription className="text-sm">
              Consulta los valores de los últimos días.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <Link href="/weather-calendar">
          <Button 
            variant="secondary" 
            size="lg"
            className={cn(
              "w-full sm:w-auto group/btn",
            )}
          >
            <HistoryIcon className="mr-2" />
            Ver Calendario Climático
            <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}