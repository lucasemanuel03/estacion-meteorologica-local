"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CloudSun, History } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: (pathname: string) => boolean
}

const navItems: NavItem[] = [
  {
    href: "/inicio",
    label: "Inicio",
    icon: CloudSun,
    isActive: (pathname) => pathname === "/inicio" || pathname === "/",
  },
  {
    href: "/estadisticas-hoy",
    label: "Estadísticas",
    icon: BarChart3,
    isActive: (pathname) => pathname.startsWith("/estadisticas-hoy"),
  },
  {
    href: "/historial",
    label: "Historial",
    icon: History,
    isActive: (pathname) => pathname.startsWith("/historial") || pathname.startsWith("/weather-history"),
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto px-2 py-2">
        <ul className="grid grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.isActive(pathname)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold transition-colors",
                    active
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
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
