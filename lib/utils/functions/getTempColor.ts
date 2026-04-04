export interface TemperatureCardStyle {
  gradient: string
  border: string
  iconBg: string
  iconColor: string
  glow: string
  textColor: string
}

export default function getTempColor(temperature: number): TemperatureCardStyle {
  if (temperature <= 0) {
    return {
      gradient: "from-blue-700/15 to-blue-500/35",
      border: "border-blue-500/35",
      iconBg: "bg-linear-to-br from-blue-600/30 to-cyan-500/20",
      iconColor: "text-blue-900 dark:text-blue-200",
      glow: "shadow-blue-800/25",
      textColor: "text-blue-900 dark:text-blue-500",
    }
  }

    if (temperature <= 10) {
    return {
      gradient: "from-sky-700/15 to-blue-500/35",
      border: "border-sky-300/35",
      iconBg: "bg-linear-to-br from-sky-600/30 to-cyan-500/20",
      iconColor: "text-sky-900 dark:text-sky-200",
      glow: "shadow-sky-700/25",
      textColor: "text-sky-900 dark:text-sky-300",
    }
  }

  if (temperature <= 25) {
    return {
      gradient: "from-slate-700/10 to-cyan-500/30",
      border: "border-slate-200/30",
      iconBg: "bg-linear-to-br from-cyan-600/25 to-sky-500/15",
      iconColor: "text-slate-800 dark:text-slate-200",
      glow: "shadow-slate-600/20",
      textColor: "text-slate-900 dark:text-slate-200",
    }
  }

  if (temperature <= 30) {
    return {
      gradient: "from-yellow-600/15 to-amber-500/30",
      border: "border-yellow-400/30",
      iconBg: "bg-linear-to-br from-yellow-500/25 to-amber-500/20",
      iconColor: "text-yellow-900 dark:text-yellow-300",
      glow: "shadow-yellow-600/20",
      textColor: "text-yellow-700 dark:text-yellow-400",
    }
  }


  if (temperature <= 35) {
    return {
      gradient: "from-orange-700/20 to-red-500/35",
      border: "border-orange-400/30",
      iconBg: "bg-linear-to-br from-orange-600/30 to-red-500/25",
      iconColor: "text-orange-900 dark:text-orange-300",
      glow: "shadow-orange-700/30",
      textColor: "text-orange-700 dark:text-orange-400",
    }
  }

  return {
    gradient: "from-red-700/20 to-red-500/40",
    border: "border-red-500/30",
    iconBg: "bg-linear-to-br from-red-600/35 to-orange-500/25",
    iconColor: "text-red-900 dark:text-red-300",
    glow: "shadow-red-700/35",
    textColor: "text-red-500",
  }
}
