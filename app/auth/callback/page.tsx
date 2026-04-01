import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string; error_description?: string }
}) {
  const code = searchParams.code
  const error = searchParams.error

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(searchParams.error_description || 'OAuth error')}`)
  }

  if (!code) {
    redirect('/auth/login?error=missing_code')
  }

  const supabase = await createClient()
  
  // Exchange the code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    redirect(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
  }

  // Check if user needs onboarding (new Google user)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Check if user has completed onboarding in our database
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!dbUser) {
      // New Google user - needs to be created in our database
      // Redirect to a special onboarding flow for OAuth users
      // For now, redirect to register step 2 (profile completion)
      redirect('/auth/oauth-complete')
    }

    if (!dbUser.first_name || !dbUser.last_name) {
      // Needs profile completion
      redirect('/auth/oauth-complete')
    }

    // Fully onboarded
    redirect('/dashboard')
  }

  redirect('/dashboard')
}
