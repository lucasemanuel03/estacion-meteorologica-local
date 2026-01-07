import { ChevronsLeftRightEllipsis, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TrendIcon from "../weather/trend-icon";

export default function EstadisticasHoy({temp_max, temp_min, tempDiferencial=-999, humDiferencial=-999 }: {temp_max: number | null, temp_min: number | null, tempDiferencial?: number, humDiferencial?: number}) {
    return(
        <>
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center gap-2">
                        <List />
                        Estadísticas actuales
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2 text-xs sm:text-base">               
                    <div className="flex items-center gap-2">
                        <ChevronsLeftRightEllipsis />
                        <span>
                            La amplitud térmica del día hasta ahora es de{" "}
                            <b>
                                {temp_max !== null && temp_min !== null
                                    ? (temp_max - temp_min).toFixed(1)
                                    : "--"}{" "}
                                °C
                            </b>
                        </span>
                    </div>
                    {tempDiferencial !== -999 &&(
                        <div className="flex items-center gap-2">
                            <TrendIcon diferencial={tempDiferencial!} />
                            <span>
                                <b>
                                La temperatura {" "}
                                {tempDiferencial > 0 ? "ha aumentado" : tempDiferencial < 0 ? "ha disminuido" : "se ha mantenido"}{" "} 
                                {tempDiferencial !== 0 ? `en ${Math.abs(tempDiferencial).toFixed(1)} °C ` : ""}
                                </b>
                                en los últimos 30 minutos.
                            </span>
                        </div>
                    )}

                    {humDiferencial !== -999 &&(
                        <div className="flex items-center gap-2">
                            <TrendIcon diferencial={humDiferencial!} />
                            <span>
                                <b>
                                La humedad {" "}
                                {humDiferencial > 0 ? "ha aumentado" : humDiferencial < 0 ? "ha disminuido" : "se ha mantenido"}{" "} 
                                {humDiferencial !== 0 ? `en ${Math.abs(humDiferencial).toFixed(1)} % ` : ""}
                                </b>
                                en los últimos 30 minutos.
                            </span>
                        </div>
                    )}
                </div>
            </CardContent> 
        </Card>
        </>
    )
}