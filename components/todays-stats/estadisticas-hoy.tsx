import { Activity, ArrowDownFromLine, ChevronsLeftRightEllipsis } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TrendIcon from "../weather/trend-icon";
import { cn } from "@/lib/utils";

export default function EstadisticasHoy({temp_max, temp_min, tempDiferencial=-999, humDiferencial=-999, deltaPressure }: {temp_max: number | null, temp_min: number | null, tempDiferencial?: number, humDiferencial?: number, deltaPressure: number | null}) {
    const amplitudTermica = temp_max !== null && temp_min !== null ? (temp_max - temp_min).toFixed(1) : "--"
    
    return(
        <Card className={cn(
            "overflow-hidden backdrop-blur-xl",
            "bg-card",
            "border-border/50 shadow-xl shadow-border/50",
            "animate-in fade-in-50 slide-in-from-bottom-10 duration-700"
        )}
        style={{ animationDelay: "400ms" }}
        >   
            <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                    <span className="font-bold tracking-wide">Estadísticas del día</span>
                </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
                <div className="flex flex-col gap-4">
                    {/* Amplitud Térmica */}
                    <div className={cn(
                        "group flex items-center gap-3 p-4 rounded-xl",
                        "bg-linear-to-r from-slate-500/10 to-slate-500/5",
                        "border border-orange-400/20",
                        "transition-all duration-400 hover:shadow-2xl shadow-orange-500/10"
                    )}>
                        <div className="p-2 rounded-lg bg-orange-500/15">
                            <ChevronsLeftRightEllipsis className="w-5 h-5 text-foreground" />
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">
                            La amplitud térmica del día es de{" "}
                            <span className="font-black text-lg">
                                {amplitudTermica} °C
                            </span>
                        </p>
                    </div>
                    
                    {/* Presión Atmosférica */}
                    <div className={cn(
                        "group flex items-center gap-3 p-4 rounded-xl",
                        "bg-linear-to-r from-gray-500/10 to-sky-500/5",
                        "border border-blue-400/20",
                        "transition-all duration-300 hover:shadow-2xl shadow-blue-500/10"
                    )}>
                        <div className="p-2 rounded-lg bg-blue-500/15 ">
                            <TrendIcon diferencial={deltaPressure ?? 0} threshold={0.5} />
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">
                            La variación de presión atmosférica en las últimas 3 horas es de {" "}
                            <span className="font-black text-lg">
                                {deltaPressure ? deltaPressure.toFixed(1) : "--"} hPa
                            </span>
                        </p>
                    </div>

                    {/* Tendencia de Temperatura */}
                    {tempDiferencial !== -999 && (
                        <div className={cn(
                            "group flex items-center gap-3 p-4 rounded-xl",
                            "bg-linear-to-r from-slate-500/10 to-slate-500/5",
                            "border border-red-400/20",
                            "transition-all duration-300 hover:shadow-2xl shadow-red-500/10"
                        )}>
                            <div className="p-2 rounded-lg bg-red-500/15">
                                <TrendIcon diferencial={tempDiferencial!} />
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed">
                                La temperatura{" "}
                                <span className="font-bold">
                                    {tempDiferencial > 0 ? "aumentó" : tempDiferencial < 0 ? "disminuyó" : "se mantuvo estable"}
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
                            "bg-linear-to-r from-slate-500/10 to-slate-500/5",
                            "border border-blue-400/20",
                            "transition-all duration-300 hover:shadow-2xl shadow-blue-500/10"
                        )}>
                            <div className="p-2 rounded-lg bg-blue-500/15">
                                <TrendIcon diferencial={humDiferencial!} />
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed">
                                La humedad{" "}
                                <span className="font-bold">
                                    {humDiferencial > 0 ? "aumentó" : humDiferencial < 0 ? "disminuyó" : "se mantuvo estable"}
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