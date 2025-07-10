
'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe.js once
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Home() {
  async function handleCheckout(priceId: string) {
    const stripe = await stripePromise;
    if (!stripe) {
      alert('Could not load Stripe.js');
      return;
    }

    // Create session
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const text = await res.text();
    console.log('Client got status:', res.status);
    console.log('Client got body:', text);

    if (!res.ok) {
      alert(`Server error: ${text}`);
      return;
    }

    const { sessionId } = JSON.parse(text);
    stripe.redirectToCheckout({ sessionId });
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Choose a Plan</h1>
      <div style={{ display: 'inline-flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={() =>
            handleCheckout(process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!)
          }
          style={{
            backgroundColor: 'purple',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Get Basic Plan
        </button>

        <button
          onClick={() =>
            handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!)
          }
          style={{
            backgroundColor: 'purple',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Get Premium Plan
        </button>
      </div>
    </div>
  );
}
