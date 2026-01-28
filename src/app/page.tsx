import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ScrollytellingLanding from '@/components/landing/ScrollytellingLanding'

export default async function Home() {
  let user = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.warn('[Home] Auth check failed, showing landing:', error.message)
    } else {
      user = data.user
    }
  } catch (err) {
    console.error('[Home] Unexpected error during auth check:', err)
  }

  // Redirects must be outside try/catch - Next.js redirect() throws NEXT_REDIRECT internally
  if (user) {
    const username = user.user_metadata?.username || user.app_metadata?.username
    if (!username) {
      redirect('/onboarding')
    }
    redirect('/library')
  }

  return <ScrollytellingLanding />
}
