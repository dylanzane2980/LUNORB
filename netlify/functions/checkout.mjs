// POST /api/checkout — starts a Stripe Checkout session for Lunorb Pro and returns its URL.
import { handler, json, requireUser, stripe, admin, siteUrl, HttpError } from '../lib/server.mjs';

const ACTIVE = new Set(['active', 'trialing', 'past_due']);

export default handler(async (req) => {
  const user = await requireUser(req);
  const price = process.env.STRIPE_PRICE_PRO;
  if (!price) throw new HttpError(500, 'Server is missing the STRIPE_PRICE_PRO setting');

  const db = admin();
  const { data: sub, error } = await db.from('subscriptions')
    .select('plan,status,stripe_customer_id').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (sub?.plan === 'pro' && ACTIVE.has(sub.status)) throw new HttpError(409, 'You are already on Pro. Use “Manage billing” instead.');

  let customer = sub?.stripe_customer_id;
  if (!customer) {
    const c = await stripe().customers.create(
      { email: user.email, metadata: { user_id: user.id } },
      { idempotencyKey: `lunorb-customer-${user.id}` },
    );
    customer = c.id;
    const { error: upErr } = await db.from('subscriptions')
      .upsert({ user_id: user.id, stripe_customer_id: customer, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (upErr) throw upErr;
  }

  const base = siteUrl(req);
  const session = await stripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    success_url: `${base}/?checkout=success#home`,
    cancel_url: `${base}/?checkout=cancel#home`,
  });
  return json(200, { url: session.url });
});

export const config = { path: '/api/checkout' };
