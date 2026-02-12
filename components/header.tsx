import Link from "next/link";
import { cn } from "@/lib/utils";
import { CloudSun } from "lucide-react";
import ThemeSelector from "./theme-selector";

export default function Header() {
  return (
    <header className={cn(
      "w-full bg-background/80 backdrop-blur-xl p-4 shadow-lg border-b border-border/50 sticky top-0 z-50",
      "transition-all duration-300"
    )}>
      {/* Gradient effect */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 pointer-events-none" />
      
      <div className="container flex justify-between items-center mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <img 
                  src="/EML-isotipo.svg" 
                  alt="Estación Meteorológica Local" 
                  className="h-12 w-12 sm:h-14 sm:w-14 relative z-10 drop-shadow-lg" 
                />
              </div>
              <h1 className={cn(
                "text-xl sm:text-3xl md:text-4xl font-black tracking-tight",
                "bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent",
                "drop-shadow-sm"
              )}>
                Estación Meteorológica Local
              </h1>
            </div>
          </Link>
        </div>

          <ThemeSelector />

      </div>
    </header>
  )
}