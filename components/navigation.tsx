"use client"

import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Building2,
  User,
  Lightbulb,
  Landmark,
  Map,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Menu,
  Orbit,
  TrendingUp,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/business", label: "Mon Entreprise", icon: Building2 },
  { href: "/market", label: "Bourse", icon: TrendingUp },
  { href: "/bank", label: "Ma Banque", icon: Landmark },
  { href: "/map", label: "Carte", icon: Map },
  { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
  { href: "/profile", label: "Profil", icon: User },
]

export function Navigation() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check admin status
    fetch("/api/admin")
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false))
  }, [])

  if (!session) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Orbit className="w-8 h-8 text-orbe" />
            <span className="font-bold text-xl">Ørbis</span>
          </Link>
          <div className="flex items-center gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <Link
              href="/login"
              className="px-4 py-2 bg-orbe text-white rounded-lg hover:bg-orbe-dark transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Orbit className="w-8 h-8 text-orbe" />
          <span className="font-bold text-xl">Ørbis</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                "hover:bg-accent text-sm font-medium"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                "hover:bg-red-500/10 hover:text-red-500 text-sm font-medium"
              )}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
          
          <button
            onClick={() => signOut()}
            className="hidden md:flex p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden glass border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
