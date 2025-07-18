
'use client';

import React from 'react';

export default function Home() {
  const plans = [
    {
      label: 'Get Started Free',
      priceId: 'price_1RlDr5RnA80AIx3dY0rSGcE3',
    },
    {
      label: 'Get Basic Plan',
      priceId: 'price_1RijIiRnA80AIx3dIsNnYMQ9',
    },
    {
      label: 'Get Premium Plan',
      priceId: 'price_1RijJWRnA80AIx3ds8YL4I0d',
    },
  ];

  const handleCheckout = async (priceId: string) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!res.ok) throw new Error('Checkout failed');
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      alert('Something went wrong. Please try again.');
      console.error(error);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '20px' }}>
        Ready to See How Your Resume Stacks Up?
      </h2>

      <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '30px' }}>
        Select a plan below to get started. You’ll receive your results directly by email—fast, secure, and private.
      </p>

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

      <div style={{ maxWidth: '700px', margin: '0 auto 40px auto' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>
          Choose the Plan That Matches Your Needs
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#e0e0e0' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>PLAN</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>WHAT'S INCLUDED</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px' }}>📊 Free</td>
              <td style={{ padding: '10px' }}>ATS Resume Score + Personalized Suggestions</td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>🛠️ Basic</td>
              <td style={{ padding: '10px' }}>Full ATS Resume Analysis + Formatting Fixes</td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>👜 Premium</td>
              <td style={{ padding: '10px' }}>Basic + Complete Resume Optimization + Keyword Enhancement & Cover Letter</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {plans.map((plan) => (
          <button
            key={plan.label}
            onClick={() => {
              if (plan.label === 'Get Started Free') {
                window.location.href = '/submit'; // 👈 go directly to submit form
              } else {
                handleCheckout(plan.priceId); // 👈 paid plans go to Stripe
              }
            }}
            style={{
              padding: '10px 16px',
              border: '2px solid #800080',
              borderRadius: '5px',
              backgroundColor: '#800080',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#C5A100';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#800080';
              e.currentTarget.style.color = 'white';
            }}
          >
            {plan.label}
          </button>
        ))}
      </div>
    </main>
  );
}