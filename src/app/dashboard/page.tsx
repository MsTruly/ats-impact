'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [tier, setTier] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSessionAndFetchTier = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('tier')
        .eq('email', session.user.email)
        .single()

      if (error) {
        console.error('Error fetching tier:', error)
      } else {
        setTier(profile?.tier || 'unknown')
      }

      setUser(session.user)
      setLoading(false)
    }

    checkSessionAndFetchTier()
  }, [router])

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p>Loading...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome to Your Dashboard</h2>
      <p>You’re logged in as: {user?.email}</p>
      <p>Your current subscription tier is: <strong>{tier}</strong></p>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  )
}
