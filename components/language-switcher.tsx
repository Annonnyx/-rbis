"use client"

import { usePathname, useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useTransition, useState } from "react"
import { Globe } from "lucide-react"
import { i18n, type Locale } from "@/i18n.config"

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const currentLocale = (params?.lang as Locale) || i18n.defaultLocale

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
      router.push(newPathname)
      setIsOpen(false)
    })
  }

  const localeNames: Record<Locale, string> = {
    fr: "FR",
    en: "EN",
    de: "DE",
    es: "ES",
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{localeNames[currentLocale]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 py-2 w-24 glass rounded-xl z-50 border">
            {i18n.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full px-4 py-2 text-left hover:bg-accent transition-colors ${
                  locale === currentLocale ? "text-orbe font-medium" : ""
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
