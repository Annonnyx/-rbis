// ============================================
// app/auth/callback/route.ts
// Route de callback OAuth Google - Échange le code contre une session
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Gérer les erreurs OAuth (ex: utilisateur a annulé)
  if (error) {
    console.error('[OAuth Callback] Error:', error, errorDescription)
    return NextResponse.redirect(`${origin}/?error=oauth&message=${encodeURIComponent(errorDescription || error)}`)
  }

  if (!code) {
    console.error('[OAuth Callback] No code provided')
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  // Créer un client Supabase pour la route
  const cookieStore = request.cookies

  try {
    // Créer un objet pour stocker les cookies à définir
    const cookiesToSet: { name: string; value: string; options: any }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            // Stocker les cookies pour les définir plus tard dans la réponse finale
            cookiesToSet.push(...cookies)
          },
        },
      }
    )

    // Échanger le code contre une session
    console.log('[OAuth Callback] Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.user) {
      console.error('[OAuth Callback] Exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/?error=auth`)
    }

    const { user, session } = data
    console.log('[OAuth Callback] Session created:', { 
      userId: user.id, 
      email: user.email,
      accessToken: session?.access_token ? 'present' : 'missing',
      refreshToken: session?.refresh_token ? 'present' : 'missing'
    })
    console.log('[OAuth Callback] Cookies to set:', cookiesToSet.length)

    // Synchroniser avec Prisma - créer ou mettre à jour l'utilisateur
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!existingUser) {
      // Générer un username unique basé sur l'email ou le nom
      const baseUsername = user.email?.split('@')[0] || 'user'
      let username = baseUsername
      let counter = 1

      // Vérifier l'unicité du username
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Créer l'utilisateur dans Prisma
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          username,
          firstName: user.user_metadata?.given_name || null,
          lastName: user.user_metadata?.family_name || null,
          displayName: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        },
      })
      console.log('[OAuth Callback] User created in Prisma:', username)

      // Créer le compte bancaire avec solde initial
      const accountNumber = generateAccountNumber()
      await prisma.bankAccount.create({
        data: {
          ownerId: user.id,
          ownerType: 'PERSONAL',
          balance: BigInt(100000), // ◎ 1 000,00
          accountNumber,
        },
      })
      console.log('[OAuth Callback] Bank account created:', accountNumber)
    } else {
      // Mettre à jour les infos si nécessaire
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email!, // Email peut avoir changé
          avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || existingUser.avatarUrl,
        },
      })
      console.log('[OAuth Callback] User updated in Prisma')
    }

    // Vérifier si l'utilisateur a un GameProfile (onboarding complet)
    const gameProfile = await prisma.gameProfile.findUnique({
      where: { userId: user.id },
    })

    // Créer la réponse de redirection ET y inclure les cookies de session
    let redirectUrl: string
    if (!gameProfile) {
      redirectUrl = `${origin}/auth/register?step=2&userId=${user.id}`
      console.log('[OAuth Callback] New user, redirecting to:', redirectUrl)
    } else {
      redirectUrl = `${origin}/dashboard`
      console.log('[OAuth Callback] Onboarding complete, redirecting to:', redirectUrl)
    }
    
    // Créer la réponse de redirection
    const redirectResponse = NextResponse.redirect(redirectUrl)
    
    // AJOUTER LES COOKIES DE SESSION à la réponse de redirection
    console.log('[OAuth Callback] Setting cookies in redirect response:', cookiesToSet.map(c => c.name))
    for (const cookie of cookiesToSet) {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie.options)
    }
    
    return redirectResponse

  } catch (error) {
    console.error('[OAuth Callback] Unexpected error:', error)
    return NextResponse.redirect(`${origin}/?error=auth`)
  }
}

// Génère un numéro de compte bancaire unique
function generateAccountNumber(): string {
  const prefix = 'ORB'
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase()
  return `${prefix}-${random}-${timestamp}`
}
