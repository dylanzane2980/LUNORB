// Shared helpers for the Netlify functions. Secrets come from environment variables only.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const env = (key) => {
  const v = process.env[key];
  if (!v) throw new HttpError(500, `Server is missing the ${key} setting`);
  return v;
};

let stripeClient, adminClient;
export const stripe = () => (stripeClient ??= new Stripe(env('STRIPE_SECRET_KEY')));
// Service-role client: bypasses row-level security, so only use it after verifying who is asking.
export const admin = () => (adminClient ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SECRET_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false },
}));

export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
});

export async function requireUser(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Please sign in first');
  const { data, error } = await admin().auth.getUser(token);
  if (error || !data?.user) throw new HttpError(401, 'Your session expired. Sign in again.');
  return data.user;
}

// Redirect targets are built from configuration, never from request headers.
export const siteUrl = (req) => (process.env.SITE_URL || new URL(req.url).origin).replace(/\/$/, '');

export function handler(fn, { methods = ['POST'] } = {}) {
  return async (req, context) => {
    if (!methods.includes(req.method)) return json(405, { error: 'Method not allowed' });
    try {
      return await fn(req, context);
    } catch (e) {
      if (e instanceof HttpError) return json(e.status, { error: e.message });
      console.error(e);
      return json(500, { error: 'Something went wrong on our side. Please try again.' });
    }
  };
}
