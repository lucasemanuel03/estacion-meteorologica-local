import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowRight, HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IrAlHistorialCard() {
  return (
    <Link href="/weather-calendar" className="w-full">
      <Card className={cn(
        "relative overflow-hidden backdrop-blur-xl",
        "bg-linear-to-br from-indigo-500/20 to-indigo-500/10",
        "border-border/50 shadow-2xl shadow-border/50",
        "animate-in fade-in-50 slide-in-from-bottom-10 duration-700",
        "group  transition-all w-full"
      )}
        style={{ animationDelay: "600ms" }}
      >

        <CardHeader className="relative z-10">
          <div className="flex items-start gap-4 group-hover:scale-101 transition-transform duration-300">
            <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 backdrop-blur-sm ">
              <HistoryIcon className="w-6 h-6 text-indigo-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight ">
                Ver Historial Climático
              </CardTitle>
              <CardDescription className="text-sm">
                Consulta el clima meses anteriores
              </CardDescription>
            </div>
          </div>
        </CardHeader>

      </Card>
    </Link>
  )
}