
'use client';

import React from 'react';

export default function Home() {
  const plans = [
    {
      label: 'Get Started Free',
      priceId: 'price_1',
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
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1
        style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '10px',
        }}
      >
        Improve Your Resume and Increase Your Interview Chances
      </h1>

      <p
        style={{
          textAlign: 'center',
          fontSize: '16px',
          maxWidth: '700px',
          margin: '0 auto 30px',
          lineHeight: 1.6,
        }}
      >
        Receive an accurate ATS score, an in-depth resume analysis, or a complete optimization—delivered directly to your inbox within minutes. Choose the service that fits your goals and improve your chances of landing interviews.
      </p>

      {/* CTA Button */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button
          onClick={() => handleCheckout('price_1')}
          style={{
            backgroundColor: '#800080',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '6px',
            border: 'none',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C5A100')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#800080')}
        >
          Start Free
        </button>
      </div>

      {/* Trust Section */}
      <p
        style={{
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '14px',
          marginBottom: '5px',
        }}
      >
        Fast. Secure. Delivered by Email.
      </p>
      <p
        style={{
          textAlign: 'center',
          fontSize: '13px',
          marginBottom: '10px',
        }}
      >
        We do not store or share your resume. Results are sent directly to your inbox.
      </p>
      <p
        style={{
          textAlign: 'center',
          fontSize: '13px',
          marginBottom: '40px',
          fontWeight: 'bold',
        }}
      >
        Once your order is complete, you’ll receive a secure email with instructions to upload your resume.
        All files are handled confidentially and never stored or shared.
      </p>

      {/* Secure Delivery Image */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <img
          src="/secure-delivery.png"
          alt="Delivered Securely"
          style={{
            maxWidth: '320px',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
      </div>

      {/* Plan Table */}
      <h2 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '20px' }}>
        Choose the Plan That Matches Your Needs
      </h2>

      <table
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto 40px',
          borderCollapse: 'collapse',
          fontSize: '15px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#e5e5e5' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>PLAN</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>WHAT'S INCLUDED</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '12px' }}>📊 Free</td>
            <td style={{ padding: '12px' }}>
              ATS Resume Score + Personalized Suggestions
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <td style={{ padding: '12px' }}>🛠 Basic</td>
            <td style={{ padding: '12px' }}>
              Full ATS Resume Analysis + Formatting Fixes
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px' }}>👜 Premium</td>
            <td style={{ padding: '12px' }}>
              Basic + Complete Resume Optimization + Keyword Enhancement & Cover Letter
            </td>
          </tr>
        </tbody>
      </table>

      {/* Plan Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '60px',
        }}
      >
        {plans.map((plan) => (
          <button
            key={plan.label}
            onClick={() => handleCheckout(plan.priceId)}
            style={{
              padding: '12px 20px',
              border: '2px solid #800080',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#800080',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C5A100';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = '#C5A100';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#800080';
              e.currentTarget.style.borderColor = '#800080';
            }}
          >
            {plan.label}
          </button>
        ))}
      </div>
    </main>
  );
}
