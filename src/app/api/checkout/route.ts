import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

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

    return NextResponse.json({ url: session.url }); // ✅ Return the URL, not sessionId
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
