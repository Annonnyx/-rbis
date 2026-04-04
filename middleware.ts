// ============================================
// middleware.ts
// Protection des routes et redirections auth - SIMPLIFIÉ
// ============================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  
  // Routes protégées (requièrent auth)
  const protectedRoutes = ['/dashboard', '/map', '/bank', '/company', '/profile', '/suggestions', '/market', '/jobs', '/alliances']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Page de login
  const isLoginPage = pathname === '/auth/login'
  const isRegisterPage = pathname.startsWith('/auth/register')
  
  // 1. Non connecté sur route protégée → login
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // 2. Connecté sur page de login → rediriger vers register (pour continuer onboarding ou compléter)
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/auth/register', request.url))
  }
  
  // 3. Sur /auth/register, on laisse passer car la logique est gérée côté client
  // (évite les boucles de redirection)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
