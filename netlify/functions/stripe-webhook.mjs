// POST /api/stripe-webhook — Stripe tells us when a subscription starts, changes or ends.
// The subscription is re-fetched from Stripe on every event, so out-of-order delivery can't leave a stale plan.
import { stripe, admin, json } from '../lib/server.mjs';

const PRO_STATUSES = new Set(['active', 'trialing', 'past_due']);

async function userIdFor(sub) {
  if (sub.metadata?.user_id) return sub.metadata.user_id;
  const { data } = await admin().from('subscriptions').select('user_id').eq('stripe_customer_id', sub.customer).maybeSingle();
  return data?.user_id || null;
}

async function syncSubscription(subscriptionId) {
  const sub = await stripe().subscriptions.retrieve(subscriptionId);
  const userId = await userIdFor(sub);
  if (!userId) { console.warn('No Lunorb user for subscription', sub.id); return; }
  const periodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;
  const { error } = await admin().from('subscriptions').upsert({
    user_id: userId,
    plan: PRO_STATUSES.has(sub.status) ? 'pro' : 'free',
    status: sub.status,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json(500, { error: 'Server is missing the STRIPE_WEBHOOK_SECRET setting' });

  let event;
  try {
    event = await stripe().webhooks.constructEventAsync(await req.text(), req.headers.get('stripe-signature'), secret);
  } catch {
    return json(400, { error: 'Invalid signature' });
  }

  try {
    const obj = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
        if (obj.mode === 'subscription' && obj.subscription) await syncSubscription(obj.subscription);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await syncSubscription(obj.id);
        break;
    }
  } catch (e) {
    console.error('Webhook handling failed', event.type, e);
    return json(500, { error: 'Webhook handling failed' }); // non-2xx makes Stripe retry
  }
  return json(200, { received: true });
};

export const config = { path: '/api/stripe-webhook' };
