
'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
    {
      label: 'Get Started Free',
      priceId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID!,
    },
    {
      label: 'Get Basic Plan',
      priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!,
    },
    {
      label: 'Get Premium Plan',
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#f8f8f8',
        fontFamily: 'Inter, sans-serif',
        minHeight: '100vh',
        paddingBottom: '3rem',
      }}
    >
      {/* Brand Title */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '32px', color: '#800080' }}>ATS Impact</h1>
      </div>

      {/* Headline and Description */}
      <h2
        style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          marginTop: '40px',
        }}
      >
        Ready to See How Your Resume Stacks Up?
      </h2>
      <p
        style={{
          textAlign: 'center',
          fontSize: '16px',
          marginBottom: '30px',
        }}
      >
        Select a plan below to get started. You'll receive your results directly
        by email—fast, secure, and private.
      </p>

      {/* ✅ Delivered Securely Image */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img
          src="/secure-delivery.png.png"
          alt="Resume Delivered Securely"
          style={{
            maxWidth: '320px',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {plans.map((plan) => (
          <button
            key={plan.label}
            onClick={() => handleCheckout(plan.priceId)}
            onMouseEnter={() => setHovered(plan.label)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: hovered === plan.label ? '#800080' : '#fff',
              color: hovered === plan.label ? '#fff' : '#800080',
              border: '2px solid #800080',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
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
