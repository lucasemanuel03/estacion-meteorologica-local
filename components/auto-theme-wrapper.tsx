'use client'

import { useAutoTheme } from '@/hooks/use-auto-theme'

interface AutoThemeWrapperProps {
  children: React.ReactNode
  /** Hora de inicio del modo claro (0-23). Por defecto: 6 (6:00 AM) */
  lightModeStart?: number
  /** Hora de inicio del modo oscuro (0-23). Por defecto: 18 (6:00 PM) */
  darkModeStart?: number
  /** Si true, establece el tema automáticamente. Si false, respeta la preferencia del usuario */
  enabled?: boolean
}

/**
 * Componente wrapper que aplica automáticamente el tema según la hora del día.
 * Debe usarse dentro de un ThemeProvider.
 */
export function AutoThemeWrapper({
  children,
  lightModeStart = 6,
  darkModeStart = 22,
  enabled = true,
}: AutoThemeWrapperProps) {
  useAutoTheme({ lightModeStart, darkModeStart, enabled })

  return <>{children}</>
}
