import { headers } from 'next/headers';

export function getClientIp(): string {
  const trust = process.env.TRUST_PROXY === 'true';
  const h = headers();
  if (trust) {
    const xff = h.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    const real = h.get('x-real-ip');
    if (real) return real.trim();
  }
  return h.get('x-vercel-forwarded-for') ?? '0.0.0.0';
}
