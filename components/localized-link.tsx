"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { type Locale, i18n } from "@/i18n.config"
import { ReactNode } from "react"

interface LocalizedLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function LocalizedLink({ href, children, className, onClick }: LocalizedLinkProps) {
  const params = useParams()
  const lang = (params?.lang as Locale) || i18n.defaultLocale
  
  const localizedHref = href.startsWith("/") ? `/${lang}${href}` : `/${lang}/${href}`
  
  return (
    <Link href={localizedHref} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
