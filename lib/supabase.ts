// ============================================
// lib/supabase.ts
// Re-exports depuis les fichiers serveur et browser séparés
// ============================================

export { createServerSupabaseClient, createServiceSupabaseClient } from './supabase-server'
export { createBrowserSupabaseClient } from './supabase-browser'
