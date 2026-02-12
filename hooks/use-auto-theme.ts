'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

interface UseAutoThemeOptions {
  /** Hora de inicio del modo claro (0-23). Por defecto: 6 (6:00 AM) */
  lightModeStart?: number
  /** Hora de inicio del modo oscuro (0-23). Por defecto: 18 (6:00 PM) */
  darkModeStart?: number
  /** Si true, establece el tema automáticamente. Si false, respeta la preferencia del usuario */
  enabled?: boolean
}

/**
 * Hook que determina automáticamente si el tema debe ser claro u oscuro
 * basándose en la hora del día del equipo del usuario.
 * 
 * @param options - Configuración del tema automático
 * @returns La función que calcula el tema basado en la hora
 * 
 * @example
 * ```tsx
 * // Modo claro de 7 AM a 7 PM, modo oscuro el resto
 * useAutoTheme({ lightModeStart: 7, darkModeStart: 19 })
 * 
 * // Usar valores por defecto (6 AM - 6 PM)
 * useAutoTheme({ enabled: true })
 * ```
 */
export function useAutoTheme({
  lightModeStart = 6,
  darkModeStart = 22,
  enabled = true,
}: UseAutoThemeOptions = {}) {
  const { setTheme, theme } = useTheme()

  /**
   * Determina si el tema debe ser oscuro basándose en la hora actual
   * @param hour - Hora actual (0-23)
   * @param lightStart - Hora de inicio del modo claro
   * @param darkStart - Hora de inicio del modo oscuro
   * @returns true si debe usar modo oscuro, false si debe usar modo claro
   */
  const shouldUseDarkMode = (
    hour: number,
    lightStart: number,
    darkStart: number
  ): boolean => {
    // Si la hora de inicio del modo oscuro es mayor que la del claro
    // (caso normal: día de 6-18, noche de 18-6)
    if (darkStart > lightStart) {
      return hour < lightStart || hour >= darkStart
    }
    // Si la hora de inicio del modo oscuro es menor que la del claro
    // (caso invertido: día de 18-6, noche de 6-18)
    return hour >= darkStart && hour < lightStart
  }

  /**
   * Calcula y devuelve el tema apropiado basándose en la hora actual
   */
  const getThemeBasedOnTime = (): 'light' | 'dark' => {
    const currentHour = new Date().getHours()
    return shouldUseDarkMode(currentHour, lightModeStart, darkModeStart)
      ? 'dark'
      : 'light'
  }

  useEffect(() => {
    // Solo aplicar cambios automáticos si:
    // 1. El componente está habilitado
    // 2. El tema seleccionado es "system" (modo automático)
    if (!enabled || theme !== 'system') return

    // Establecer el tema inicial basado en la hora
    const initialTheme = getThemeBasedOnTime()
    setTheme(initialTheme)

    // Verificar cada minuto si cambió la hora y actualizar el tema si es necesario
    const interval = setInterval(() => {
      const newTheme = getThemeBasedOnTime()
      setTheme(newTheme)
    }, 60000) // Verificar cada 60 segundos

    return () => clearInterval(interval)
  }, [lightModeStart, darkModeStart, enabled, setTheme, theme])

  return getThemeBasedOnTime
}
