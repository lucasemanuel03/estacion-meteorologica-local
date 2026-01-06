import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { HistoryIcon } from "lucide-react";

export default function IrAlHistorialCard() {
  return (
    <>
        <Card className="mt-8 bg-primary/5 shadow-black/50 border-secondary/50">
        <CardHeader>
            <CardTitle>Historial del Clima</CardTitle>
            <CardDescription>
            Consulta los extremos diarios registrados en los últimos días.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/weather-history" >
            <Button variant={"default"} className="mt-6">
                <HistoryIcon />
                Ver Historial del Clima
            </Button>
            </Link>
        </CardContent>
        </Card>
    </>
  )

}