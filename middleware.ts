// ============================================
// middleware.ts
// Protection des routes et redirections auth
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Créer une réponse mutable
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mettre à jour les cookies dans la requête pour les prochains middlewares
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          
          // Mettre à jour les cookies dans la réponse pour le navigateur
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Cette ligne rafraîchit la session si nécessaire
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  
  // Routes protégées (requièrent auth)
  const protectedRoutes = ['/dashboard', '/map', '/bank', '/company', '/profile', '/suggestions', '/market', '/jobs', '/alliances']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Non connecté sur route protégée → login
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Connecté sur page de login/register → laisser passer (pas de redirection forcée)
  // La logique est gérée côté client pour éviter les boucles

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
