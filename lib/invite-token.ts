import { randomBytes } from 'node:crypto';

export function generateInviteToken(): string {
  return randomBytes(32).toString('base64url');
}

export function isInviteTokenShape(s: unknown): boolean {
  return typeof s === 'string' && s.length >= 40 && /^[A-Za-z0-9_-]+$/.test(s);
}
