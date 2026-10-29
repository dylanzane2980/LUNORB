// Deploy-readiness smoke test: `npm run check`. Reads .env and calls the real functions in-process.
import { readFileSync } from 'node:fs';
import Stripe from 'stripe';

for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
let failed = 0;
const ok = (msg) => console.log('  ✓', msg);
const bad = (msg) => { failed++; console.log('  ✗', msg); };
const call = async (file, init = {}, path = '/') => {
  const mod = await import(`../netlify/functions/${file}`);
  const res = await mod.default(new Request(`http://localhost:8888${path}`, init), {});
  return [res.status, await res.json().catch(() => ({}))];
};

console.log('Environment');
for (const k of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_PRICE_PRO', 'STRIPE_WEBHOOK_SECRET', 'SITE_URL'])
  process.env[k] ? ok(`${k} is set`) : bad(`${k} is missing`);

console.log('Stripe');
{
  const [s, j] = await call('pricing.mjs', { method: 'GET' });
  s === 200 && j.configured ? ok(`pricing: ${j.name} ${(j.amount / 100).toFixed(2)} ${j.currency.toUpperCase()}/${j.interval} (${j.livemode ? 'live' : 'test'} mode)`) : bad(`pricing returned ${s} ${JSON.stringify(j)}`);
}
{
  const [s] = await call('checkout.mjs', { method: 'POST' });
  s === 401 || s === 500 ? ok(`checkout without a session is refused (${s})`) : bad(`checkout without a session returned ${s}`);
}
if (process.env.STRIPE_WEBHOOK_SECRET) {
  const [s1] = await call('stripe-webhook.mjs', { method: 'POST', body: '{}', headers: { 'stripe-signature': 't=1,v1=bad' } });
  s1 === 400 ? ok('webhook rejects a bad signature') : bad(`webhook with a bad signature returned ${s1}`);
  const payload = JSON.stringify({ id: 'evt_check', object: 'event', type: 'lunorb.check', data: { object: {} } });
  const header = new Stripe(process.env.STRIPE_SECRET_KEY).webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET });
  const [s2] = await call('stripe-webhook.mjs', { method: 'POST', body: payload, headers: { 'stripe-signature': header } });
  s2 === 200 ? ok('webhook accepts a correctly signed event') : bad(`signed webhook returned ${s2}`);
}

if (process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
  console.log('Supabase');
  const { createClient } = await import('@supabase/supabase-js');
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
  for (const t of ['profiles', 'user_state', 'subscriptions', 'workflows', 'workflow_likes', 'follows', 'creators']) {
    const { error } = await db.from(t).select('*', { head: true, count: 'exact' }).limit(1);
    error ? bad(`${t}: ${error.message}`) : ok(`${t} table is reachable`);
  }
}

console.log(failed ? `\n${failed} check(s) need attention.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
