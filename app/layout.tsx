import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Header from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { AutoThemeWrapper } from "@/components/auto-theme-wrapper"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Estación Meteorológica Local",
  description: "Monitoreo en tiempo real de temperatura y humedad con ESP-32",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/isotipo-32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/isotipo-32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/EML-favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AutoThemeWrapper
            lightModeStart={7}
            darkModeStart={22}
            enabled={true}
          >
            <Header />
            {children}
          </AutoThemeWrapper>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
