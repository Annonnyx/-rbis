import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { i18n, type Locale } from '@/i18n.config'

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !i18n.locales.includes(locale as Locale)) notFound()

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  }
})
