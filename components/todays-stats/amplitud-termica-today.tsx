import { ChevronsLeftRightEllipsis } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function AmplitudTermicaToday({temp_max, temp_min}: {temp_max: number | null, temp_min: number | null}) {
    return(
        <>
        <Card>
            <CardHeader>
                <CardTitle>
                    <ChevronsLeftRightEllipsis />
                    Amplitud térmica
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div>
                    La Amplitud térmica del día fue de{" "}
                    <span className="font-semibold">
                        {temp_max !== null && temp_min !== null
                            ? (temp_max - temp_min).toFixed(1)
                            : "--"}{" "}
                        °C
                    </span>
                </div>
            </CardContent> 
        </Card>
        </>
    )
}