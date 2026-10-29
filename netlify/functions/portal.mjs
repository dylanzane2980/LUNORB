// POST /api/portal — opens the Stripe customer portal (change card, invoices, cancel).
import { handler, json, requireUser, stripe, admin, siteUrl, HttpError } from '../lib/server.mjs';

export default handler(async (req) => {
  const user = await requireUser(req);
  const { data: sub, error } = await admin().from('subscriptions')
    .select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (!sub?.stripe_customer_id) throw new HttpError(404, 'There is no billing account yet. Upgrade first.');

  const session = await stripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl(req)}/#home`,
    ...(process.env.STRIPE_PORTAL_CONFIGURATION ? { configuration: process.env.STRIPE_PORTAL_CONFIGURATION } : {}),
  });
  return json(200, { url: session.url });
});

export const config = { path: '/api/portal' };
