"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

type ThemeColor = "CYAN" | "BLUE" | "GREEN" | "ORANGE" | "RED" | "PINK" | "PURPLE"

interface ThemeContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themeColors: Record<ThemeColor, { hue: number; name: string; hex: string }> = {
  CYAN: { hue: 180, name: "Cyan", hex: "#00ffff" },
  BLUE: { hue: 210, name: "Bleu", hex: "#3b82f6" },
  GREEN: { hue: 140, name: "Vert", hex: "#22c55e" },
  ORANGE: { hue: 25, name: "Orange", hex: "#f97316" },
  RED: { hue: 0, name: "Rouge", hex: "#ef4444" },
  PINK: { hue: 330, name: "Rose", hex: "#ec4899" },
  PURPLE: { hue: 270, name: "Violet", hex: "#a855f7" },
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [themeColor, setThemeColorState] = useState<ThemeColor>("CYAN")
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from session
  useEffect(() => {
    if (status === "authenticated" && session?.user?.themeColor) {
      setThemeColorState(session.user.themeColor as ThemeColor)
    }
    setIsLoading(false)
  }, [session, status])

  // Apply CSS variables when theme changes
  useEffect(() => {
    const theme = themeColors[themeColor]
    const root = document.documentElement

    // Primary color
    root.style.setProperty("--primary", `${theme.hue} 100% 50%`)
    root.style.setProperty("--ring", `${theme.hue} 100% 55%`)
    root.style.setProperty("--orbe", `${theme.hue} 100% 50%`)

    // Neon accent color
    root.style.setProperty("--neon-primary", theme.hex)
    root.style.setProperty("--grid-color", `${theme.hex}08`)

    // Border colors
    root.style.setProperty("--border", `${theme.hue} 50% 20%`)

    // Set data attribute for CSS selectors
    root.setAttribute("data-theme", themeColor.toLowerCase())
  }, [themeColor])

  const setThemeColor = async (color: ThemeColor) => {
    setThemeColorState(color)
    
    // Save to backend
    try {
      await fetch("/api/user/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeColor: color }),
      })
    } catch (error) {
      console.error("Failed to save theme:", error)
    }
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export { themeColors }
export type { ThemeColor }
