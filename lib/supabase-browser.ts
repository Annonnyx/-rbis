// ============================================
// lib/supabase-browser.ts
// Client Supabase BROWSER uniquement
// ============================================

import { createBrowserClient } from '@supabase/ssr'

// Browser client pour Client Components
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
