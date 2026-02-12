"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalErrorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
}

export function ModalError({ open, onOpenChange, title, description }: ModalErrorProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(
        "overflow-hidden backdrop-blur-xl",
        "bg-linear-to-br from-red-500/10 via-background to-rose-500/5",
        "border-red-500/30"
      )}>
        {/* Background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <AlertDialogHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-red-500/20 backdrop-blur-sm">
              <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="relative z-10">
          <AlertDialogAction 
            onClick={() => onOpenChange(false)}
            className={cn(
              "bg-linear-to-r from-red-600 to-rose-600",
              "hover:from-red-700 hover:to-rose-700",
              "shadow-lg shadow-red-500/30",
              "font-bold"
            )}
          >
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
