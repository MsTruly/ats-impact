import { supabase } from '../../../../supabaseClient'; // ✅ correct path
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // ✅ Only handle checkout session completions
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_email;
    const subscriptionId = session.subscription as string;
    let tier = 'free'; // default

    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // ✅ Match price ID to tier using your environment variables
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
          tier = 'basic';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
          tier = 'premium';
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID) {
          tier = 'free';
        }

        console.log(`✅ Matched priceId ${priceId} to tier: ${tier}`);
      } catch (error) {
        console.error('❌ Error retrieving subscription:', error);
      }
    }

    // ✅ Update or insert user in Supabase
    if (email) {
      const { error } = await supabase
        .from('users')
        .upsert([{ email: email.toLowerCase(), tier }]);

      if (error) {
        console.error('❌ Supabase error:', error);
      } else {
        console.log(`✅ Supabase user updated: ${email} → ${tier}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
