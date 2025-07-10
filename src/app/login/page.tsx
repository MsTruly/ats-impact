'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tier, setTier] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTier('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // ✅ Fetch the user's tier after login
      const userTier = await fetchUserTier(email)
      setTier(userTier || 'unknown')

      console.log('Logged in as:', email)
      console.log('Tier:', userTier)

      // ✅ Redirect based on tier (optional)
      router.push('/')
    }
  }

  // ✅ Helper function to fetch tier from Supabase
  const fetchUserTier = async (email: string): Promise<string | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('tier')
      .eq('email', email.toLowerCase())
      .single()

    if (error) {
      console.error('Error fetching tier:', error.message)
      return null
    }

    return data?.tier ?? null
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Log In</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tier && <p style={{ color: 'green' }}>Access tier: {tier}</p>}
    </div>
  )
}
