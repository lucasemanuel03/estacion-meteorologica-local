export interface ITHResult {
  /** Valor numérico del ITH redondeado a 1 decimal */
  value: number
  /** Categoría del nivel de estrés térmico ganadero */
  category: "CONFORT" | "ESTRÉS LEVE" | "ESTRÉS MODERADO" | "ESTRÉS SEVERO" | "ESTRÉS MUY SEVERO"
  /** Descripción agronómica e impacto en la producción ganadera */
  description: string
}

/**
 * Calcula el Índice de Temperatura y Humedad (ITH) según la fórmula estándar Thom / NRC (1959).
 * ITH = (1.8 * T + 32) - (0.55 - 0.55 * RH/100) * (1.8 * T - 26)
 *
 * @param temperature - Temperatura en °C
 * @param humidity - Humedad relativa en % (0 - 100)
 * @returns ITHResult o null si las entradas no son válidas
 */
export function calculateITH(
  temperature: number | null | undefined,
  humidity: number | null | undefined
): ITHResult | null {
  if (temperature === null || temperature === undefined || humidity === null || humidity === undefined) {
    return null
  }

  // Asegurar rangos mínimos válidos
  if (humidity < 0 || humidity > 100) {
    return null
  }

  const rhDecimal = humidity / 100
  const tFahrenheit = 1.8 * temperature + 32
  const rawITH = tFahrenheit - (0.55 - 0.55 * rhDecimal) * (1.8 * temperature - 26)
  const value = Number(rawITH.toFixed(1))

  if (value < 68) {
    return {
      value,
      category: "CONFORT",
      description: "Zona de confort térmico para el ganado. Sin impacto en producción de leche ni ganancia de peso.",
    }
  }

  if (value <= 71) {
    return {
      value,
      category: "ESTRÉS LEVE",
      description: "Alerta temprana. Leve incremento de la frecuencia respiratoria y posible menor ingesta en vacas de alta producción.",
    }
  }

  if (value <= 78) {
    return {
      value,
      category: "ESTRÉS MODERADO",
      description: "Estrés térmico moderado. Se evidencia menor consumo de alimento, disminución de producción de leche y ganancia de peso.",
    }
  }

  if (value <= 83) {
    return {
      value,
      category: "ESTRÉS SEVERO",
      description: "Estrés térmico severo. Jadeo excesivo, alteración metabólica grave y fuerte caída en índices productivos y reproductivos.",
    }
  }

  return {
    value,
    category: "ESTRÉS MUY SEVERO",
    description: "Peligro vital extremo para los animales. Riesgo inminente de mortalidad. Requiere refrescado activo y sombra inmediata.",
  }
}
