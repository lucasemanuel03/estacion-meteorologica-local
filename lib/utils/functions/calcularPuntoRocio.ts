export default function calcularPuntoRocio(temperatura: number | null, humedad: number | null): number | null {
  if (temperatura === null || humedad === null) return null

  const a = 17.27
  const b = 237.7
  const alpha = ((a * temperatura) / (b + temperatura)) + Math.log(humedad / 100)
  const puntoRocio = (b * alpha) / (a - alpha)

  return puntoRocio
}