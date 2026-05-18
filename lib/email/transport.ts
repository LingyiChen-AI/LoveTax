import nodemailer, { type Transporter } from 'nodemailer';

let cached: Transporter | null = null;

export function getTransport(): Transporter {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER || undefined;
  const pass = process.env.SMTP_PASS || undefined;
  if (!host) throw new Error('SMTP_HOST is required');
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined
  });
  return cached;
}

export function emailFrom(): string {
  return process.env.SMTP_FROM ?? 'LoveTax <no-reply@lovetax.local>';
}
