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
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // ✅ Only for subscription-based checkouts
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_email;
    const subscriptionId = session.subscription as string;
    let tier = 'basic';

    // ✅ Fetch subscription to get pricing info
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const price = subscription.items.data[0].price;

        // Determine tier by price ID or amount (you can update this to match your premium price ID)
        if (price.unit_amount && price.unit_amount >= 1000) {
          tier = 'premium';
        }
      } catch (error) {
        console.error('Error retrieving subscription:', error);
      }
    }

    // ✅ Update Supabase user tier by email
    if (email) {
     await supabase
  .from('users')
  .upsert([{ email: email.toLowerCase(), tier }]);

    }
  }

  return NextResponse.json({ received: true });
}
