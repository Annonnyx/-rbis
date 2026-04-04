// ============================================
// middleware.ts
// Protection des routes et redirections auth
// ============================================

import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
  
  // Routes protégées (requièrent auth)
  const protectedRoutes = ['/dashboard', '/map', '/bank', '/company', '/profile', '/suggestions']
  const isProtected = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // Routes auth (rediriger vers dashboard si déjà connecté ET onboarding complet)
  const authRoutes = ['/auth/login', '/auth/register']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )
  
  // Redirections
  if (isProtected && !user) {
    // Non connecté sur route protégée → login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Ne rediriger vers dashboard que si l'utilisateur a complété l'onboarding
  // (a un profil dans la base de données)
  if (isAuthRoute && user) {
    // Vérifier si l'utilisateur a un profil complet
    const { data: profile } = await supabase
      .from('User')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      // Onboarding complet → dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // Sinon, laisser l'utilisateur sur la page d'inscription pour compléter l'onboarding
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
