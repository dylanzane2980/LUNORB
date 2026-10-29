// POST /api/account/delete — cancels any subscription, then deletes the user (all their rows cascade).
import { handler, json, requireUser, stripe, admin } from '../lib/server.mjs';

const ENDED = new Set(['canceled', 'incomplete_expired']);

export default handler(async (req) => {
  const user = await requireUser(req);
  const db = admin();
  const { data: sub } = await db.from('subscriptions')
    .select('stripe_subscription_id,status').eq('user_id', user.id).maybeSingle();
  if (sub?.stripe_subscription_id && !ENDED.has(sub.status)) {
    await stripe().subscriptions.cancel(sub.stripe_subscription_id);
  }
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) throw error;
  return json(200, { deleted: true });
});

export const config = { path: '/api/account/delete' };
