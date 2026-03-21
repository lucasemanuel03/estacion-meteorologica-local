"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CloudSun, History } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  border: string
	color: string
	glow: string
  icon: React.ComponentType<{ className?: string }>
  isActive: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: "/inicio",
    label: "Actual",
    border: "border-emerald-800/50 dark:border-emerald-400/50",
		color: "text-emerald-800 dark:text-emerald-300",
		glow: "shadow-emerald-500/20",
    icon: CloudSun,
    isActive: (pathname) => pathname === "/inicio" || pathname === "/",
  },
  {
    href: "/estadisticas-hoy",
    label: "Estadísticas",
    border: "border-sky-700/50 dark:border-sky-400/50",
		color: "text-sky-700 dark:text-sky-300",
		glow: "shadow-sky-500/20",
    icon: BarChart3,
    isActive: (pathname) => pathname.startsWith("/estadisticas-hoy"),
  },
  {
    href: "/historial",
    label: "Últimos Días",
    border: "border-sky-800/50 dark:border-sky-400/50",
		color: "text-sky-800 dark:text-sky-300",
		glow: "shadow-sky-500/20",
    icon: History,
    isActive: (pathname) => pathname.startsWith("/historial") || pathname.startsWith("/weather-history"),
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/30 backdrop-blur-xl">
      <div className="container mx-auto px-2 py-2 flex items-center justify-center">
        <ul className="grid grid-cols-3 gap-2 max-w-2xl w-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.isActive(pathname)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold transition-all duration-300",
                    active
                      ? item.border + " bg-background " + item.color
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-background/50 hover:text-foreground hover:shadow-2xl " + item.glow,
                  )}
                >
                  <Icon/>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
