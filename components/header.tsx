import Link from "next/link";
import { cn } from "@/lib/utils";

import ThemeSelector from "./theme-selector";

export default function Header() {
  return (
    <header className={cn(
      "w-full bg-background/85 backdrop-blur-xl p-3 shadow-lg border-b border-border/50 sticky top-0 z-50",
      "transition-all duration-300"
    )}>
      {/* Gradient effect */}
      <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 pointer-events-none" />
      
      <div className="container flex justify-between items-center mx-auto relative z-10">
        <div className="flex flex-col items-center justify-center">
          <Link href="/inicio" className="group">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div
                  className="h-10 w-10 sm:h-11 sm:w-11 text-foreground relative z-10 drop-shadow-lg"
                  style={{
                    backgroundColor: "currentColor",
                    WebkitMask: "url('/EML-isotipo.svg') center / contain no-repeat",
                    mask: "url('/EML-isotipo.svg') center / contain no-repeat",
                  }}
                />
              </div>
              <h1 className={cn(
                "text-lg sm:text-2xl font-black tracking-tight",
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