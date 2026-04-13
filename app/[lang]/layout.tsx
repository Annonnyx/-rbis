import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Providers } from "../providers"
import { Navigation } from "@/components/navigation"
import { i18n } from "@/i18n.config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ørbis - La simulation économique collaborative",
  description: "Un monde virtuel qui grandit avec vos suggestions. Créez votre entreprise, gérez vos finances, et façonnez l'économie.",
}

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8 pt-24">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
