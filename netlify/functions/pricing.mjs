// GET /api/pricing — the Pro price as configured in Stripe, so the page never hard-codes it.
import { handler, json, stripe } from '../lib/server.mjs';

export default handler(async () => {
  const id = process.env.STRIPE_PRICE_PRO;
  if (!id) return json(200, { configured: false });
  const p = await stripe().prices.retrieve(id, { expand: ['product'] });
  return json(200, {
    configured: true,
    amount: p.unit_amount,
    currency: p.currency,
    interval: p.recurring?.interval || null,
    livemode: p.livemode,
    name: typeof p.product === 'object' ? p.product.name : 'Lunorb Pro',
  }, { 'cache-control': 'public, max-age=300' });
}, { methods: ['GET'] });

export const config = { path: '/api/pricing' };
