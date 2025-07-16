
'use client';

import React from 'react';

export default function Home() {
  const plans = [
    {
      label: 'Get Started Free',
      priceId: 'price_1', // Replace with your actual Stripe Price ID
    },
    {
      label: 'Get Basic Plan',
      priceId: 'price_2',
    },
    {
      label: 'Get Premium Plan',
      priceId: 'price_3',
    },
  ];

  const handleCheckout = async (priceId: string) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });

    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h2
        style={{
          textAlign: 'center',
          fontSize: '18px',
          marginBottom: '20px',
        }}
      >
        Ready to See How Your Resume Stacks Up?
      </h2>

      <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '30px' }}>
        Select a plan below to get started. You’ll receive your results directly by email—fast, secure, and private.
      </p>

      {/* ✅ Secure Delivery Image */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img
          src="/secure-delivery.png"
          alt="Resume Delivered Securely"
          style={{
            maxWidth: '320px',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* ✅ Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {plans.map((plan) => (
          <button
            key={plan.label}
            onClick={() => handleCheckout(plan.priceId)}
            style={{
              padding: '10px 16px',
              border: '1px solid #b53fbc',
              borderRadius: '5px',
              backgroundColor: 'white',
              color: '#b53fbc',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {plan.label}
          </button>
        ))}
      </div>
    </main>
  );
}
