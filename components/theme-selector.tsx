'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Haze } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<string>('')

  // Sincronizar el tema y evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
    if (theme) {
      setSelectedTheme(theme)
    }
  }, [theme])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: 'light', label: 'Modo Claro', icon: Sun },
    { value: 'dark', label: 'Modo Oscuro', icon: Moon },
    { value: 'system', label: 'Automático', icon: Haze },
  ]

  const currentTheme = themes.find((t) => t.value === selectedTheme)
  const CurrentIcon = currentTheme?.icon || Sun

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    setTheme(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full hover:bg-accent transition-colors duration-300"
          aria-label="Seleccionar tema"
        >
          <CurrentIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((t) => {
          const Icon = t.icon
          return (
            <DropdownMenuCheckboxItem
              key={t.value}
              checked={selectedTheme === t.value}
              onCheckedChange={() => handleThemeChange(t.value)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </DropdownMenuCheckboxItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}