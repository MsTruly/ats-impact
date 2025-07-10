'use client';

import { useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage('Check your email for confirmation link!');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage('Login successful!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sign Up / Log In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ marginBottom: '10px', display: 'block' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ marginBottom: '10px', display: 'block' }}
      />
      <button onClick={handleSignup} style={{ marginRight: '10px' }}>
        Sign Up
      </button>
      <button onClick={handleLogin}>Log In</button>
      <p>{message}</p>
    </div>
  );
}
