
'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    const stripe = await stripePromise;
    if (!stripe) {
      alert('Could not load Stripe.js');
      return;
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const text = await res.text();
    if (!res.ok) {
      alert(`Server error: ${text}`);
      return;
    }

    const { sessionId } = JSON.parse(text);
    stripe.redirectToCheckout({ sessionId });
  }

  const plans = [
    { label: 'Get Started Free', priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID! },
    { label: 'Get Basic Plan', priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID! },
    { label: 'Get Premium Plan', priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID! },
  ];

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>Choose a Plan</h1>
      <div style={{ display: 'inline-flex', gap: '1rem', marginTop: '2rem' }}>
        {plans.map((plan) => (
          <button
            key={plan.label}
            onClick={() => handleCheckout(plan.priceId)}
            onMouseEnter={() => setHovered(plan.label)}
            onMouseLeave={() => setHovered(null)}
            style={{
              backgroundColor: hovered === plan.label ? '#FFD700' : '#800080',
              color: hovered === plan.label ? 'black' : 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {plan.label}
          </button>
        ))}
      </div>
    </div>
  );
}

