
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
      <h2 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '20px' }}>
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

      {/* ✅ Plan Comparison Table */}
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
              <td style={{ padding: '10px' }}>
                Basic + Complete Resume Optimization + Keyword Enhancement & Cover Letter
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ✅ Plan Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {plans.map((plan) => (
          <button
            key={plan.label}
            onClick={() => handleCheckout(plan.priceId)}
            style={{
              padding: '10px 16px',
              border: '2px solid #800080',
              borderRadius: '5px',
              backgroundColor: 'white',
              color: '#800080',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#C5A100';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#800080';
            }}
          >
            {plan.label}
          </button>
        ))}
      </div>
    </main>
  );
}
