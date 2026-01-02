export default function getTempColor(temperature: number): string {
  switch (true) {
    case temperature <= 0:
      return "text-blue-500"; // Muy frío
    case temperature > 0 && temperature <= 15:
      return "text-cyan-700"; // Frío
    case temperature > 15 && temperature <= 25:
      return "text-primary"; // Templado
    case temperature > 25 && temperature <= 28:
      return "text-yellow-500"; // Cálido
    case temperature > 28 && temperature <= 30:
      return "text-orange-500"; // Cálido
    case temperature > 30 && temperature <= 34:
      return "text-orange-700"; // Cálido
    case temperature > 34:
      return "text-red-700"; // Cálido
    default:
      return "text-primary"; // Caliente
  }
}