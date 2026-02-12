import { Activity, ChevronsLeftRightEllipsis } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TrendIcon from "../weather/trend-icon";
import { cn } from "@/lib/utils";

export default function EstadisticasHoy({temp_max, temp_min, tempDiferencial=-999, humDiferencial=-999 }: {temp_max: number | null, temp_min: number | null, tempDiferencial?: number, humDiferencial?: number}) {
    const amplitudTermica = temp_max !== null && temp_min !== null ? (temp_max - temp_min).toFixed(1) : "--"
    
    return(
        <Card className={cn(
            "overflow-hidden backdrop-blur-xl",
            "bg-linear-to-br from-violet-500/5 via-background/95 to-indigo-500/5",
            "border-violet-400/20 shadow-xl shadow-violet-500/10",
            "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
        )}
        style={{ animationDelay: "400ms" }}
        >
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.1),rgba(255,255,255,0))] pointer-events-none" />
            
            <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                    <div className="p-2.5 rounded-xl bg-linear-to-br from-violet-500/20 to-indigo-500/20 backdrop-blur-sm">
                        <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="font-bold tracking-wide">Estadísticas Actuales</span>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
                <div className="flex flex-col gap-4">
                    {/* Amplitud Térmica */}
                    <div className={cn(
                        "group flex items-center gap-3 p-4 rounded-xl",
                        "bg-linear-to-r from-orange-500/10 to-amber-500/5",
                        "border border-orange-400/20",
                        "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    )}>
                        <div className="p-2 rounded-lg bg-orange-500/15 group-hover:scale-110 transition-transform">
                            <ChevronsLeftRightEllipsis className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">
                            La amplitud térmica del día es de{" "}
                            <span className="font-black text-lg">
                                {amplitudTermica} °C
                            </span>
                        </p>
                    </div>

                    {/* Tendencia de Temperatura */}
                    {tempDiferencial !== -999 && (
                        <div className={cn(
                            "group flex items-center gap-3 p-4 rounded-xl",
                            "bg-linear-to-r from-red-500/10 to-pink-500/5",
                            "border border-red-400/20",
                            "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        )}>
                            <div className="p-2 rounded-lg bg-red-500/15 group-hover:scale-110 transition-transform">
                                <TrendIcon diferencial={tempDiferencial!} />
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed">
                                La temperatura{" "}
                                <span className="font-bold">
                                    {tempDiferencial > 0 ? "aumentó" : tempDiferencial < 0 ? "disminuyó" : "se mantuvo"}
                                </span>
                                {tempDiferencial !== 0 && (
                                    <span className="font-black ">
                                        {" "}{Math.abs(tempDiferencial).toFixed(1)} °C
                                    </span>
                                )}
                                {" "}en los últimos 30 minutos
                            </p>
                        </div>
                    )}

                    {/* Tendencia de Humedad */}
                    {humDiferencial !== -999 && (
                        <div className={cn(
                            "group flex items-center gap-3 p-4 rounded-xl",
                            "bg-linear-to-r from-blue-500/10 to-cyan-500/5",
                            "border border-blue-400/20",
                            "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        )}>
                            <div className="p-2 rounded-lg bg-blue-500/15 group-hover:scale-110 transition-transform">
                                <TrendIcon diferencial={humDiferencial!} />
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed">
                                La humedad{" "}
                                <span className="font-bold">
                                    {humDiferencial > 0 ? "aumentó" : humDiferencial < 0 ? "disminuyó" : "se mantuvo"}
                                </span>
                                {humDiferencial !== 0 && (
                                    <span className="font-black">
                                        {" "}{Math.abs(humDiferencial).toFixed(1)}%
                                    </span>
                                )}
                                {" "}en los últimos 30 minutos
                            </p>
                        </div>
                    )}
                </div>
            </CardContent> 
        </Card>
    )
}