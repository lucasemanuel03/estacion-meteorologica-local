"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeatherData } from "@/hooks/use-weather-data";
import ThemeSelector from "./theme-selector";

interface HeaderProps {
  ubicacion?: string;
}

export default function Header({
  ubicacion = "Las Margaritas, Córdoba",
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Obtenemos los datos climáticos actuales (SWR comparte caché con el dashboard)
  const { data } = useWeatherData();
  const currentTemp = data?.latestReading?.temperature;

  // Si está en el home y el scroll está arriba, no se muestra la temperatura (ya es visible en la card)
  const showTemp = (!isHome || isScrolled) && currentTemp !== undefined && currentTemp !== null;

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 10;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full bg-background/90 backdrop-blur-md sm:backdrop-blur-xl border-b border-border/50 sticky top-0 z-50",
        "h-16 sm:h-[68px] transition-shadow duration-300",
        isScrolled ? "shadow-md" : "shadow-lg"
      )}
    >
      <div className="container h-full flex justify-between items-center mx-auto px-4 relative z-10">
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Logo con tamaño constante para evitar saltos */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-orange-500/20 rounded-2xl blur-md sm:blur-xl transition-all transform-gpu" />
            <div
              className="h-10 w-10 sm:h-11 sm:w-11 text-foreground relative z-10 drop-shadow-lg"
              style={{
                backgroundColor: "currentColor",
                WebkitMask: "url('/EML-isotipo.svg') center / contain no-repeat",
                mask: "url('/EML-isotipo.svg') center / contain no-repeat",
              }}
            />
          </div>

          {/* Textos: Título, Ubicación y Temperatura con animación GPU pura sin reflows */}
          <div className="relative flex flex-col justify-center min-w-0 h-10 sm:h-11">
            {/* Título: Solo visible si el scroll se encuentra arriba del todo */}
            <div
              className={cn(
                "transition-all duration-300 ease-out transform-gpu will-change-[transform,opacity]",
                isScrolled
                  ? "opacity-0 -translate-y-2 pointer-events-none scale-95"
                  : "opacity-100 translate-y-0 scale-100"
              )}
            >
              <h1
                className={cn(
                  "text-base sm:text-xl font-black tracking-tight leading-tight",
                  "bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent",
                  "drop-shadow-sm truncate"
                )}
              >
                Estación Meteorológica Local
              </h1>
            </div>

            {/* Fila de Ubicación y Temperatura */}
            <div
              className={cn(
                "flex items-center gap-2 font-normal text-muted-foreground flex-wrap",
                "transition-all duration-300 ease-out transform-gpu will-change-[transform,color]",
                isScrolled
                  ? "-translate-y-2.5 sm:-translate-y-3 text-sm sm:text-base text-foreground/90"
                  : "translate-y-0 text-xs sm:text-sm"
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin
                  className={cn(
                    "shrink-0 transition-all duration-300 text-primary",
                    isScrolled ? "h-4 w-4" : "h-3.5 w-3.5"
                  )}
                />
                <span className="truncate">{ubicacion}</span>
              </div>

              {/* Píldora de temperatura semitransparente con borde primary/70 */}
              {showTemp && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                    "bg-primary/10 border border-primary/70 backdrop-blur-xs shrink-0",
                    "text-[11px] sm:text-xs transition-all duration-300 animate-in fade-in zoom-in-95"
                  )}
                >
                  <span className="font-light text-muted-foreground">Ahora:</span>
                  <span className="font-semibold text-foreground">
                    {typeof currentTemp === "number" ? currentTemp.toFixed(1) : currentTemp}°
                  </span>
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* El selector de tema se mantiene */}
        <div className="shrink-0">
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}