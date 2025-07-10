// src/app/api/checkout/route.ts

// --- DEBUG: file load + key ---


import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

// DEBUG: show all STRIPE_ vars
console.log('🔍 STRIPE_ env vars:',
  Object.entries(process.env)
    .filter(([key]) => key.startsWith('STRIPE'))
    .map(([k, v]) => `${k}=${v}`)
);

console.log('🛠️ Loaded /api/checkout/route.ts');
console.log('🛠️ STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY);

// Extra debug: list all STRIPE_* vars
console.log('🔍 All STRIPE_ vars:',
  Object.keys(process.env)
    .filter(k => k.startsWith('STRIPE'))
    .map(k => ({ [k]: process.env[k] }))
);

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  { apiVersion: '2022-11-15' }
);



export async function GET(request: NextRequest) {
  // Simple ping—verifies the file is working
  console.log('🛠️ GET /api/checkout');
  return NextResponse.json({ hello: 'world' });
}

export async function POST(request: NextRequest) {
  console.log('🛠️ POST /api/checkout');

  try {
    const { priceId } = await request.json();
    console.log('🛠️ priceId:', priceId);

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/cancelled`,
    });

    console.log('🛠️ session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('🛠️ Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
