import { db } from '@/lib/db/client';
import { emailLog } from '@/lib/db/schema';
import { getTransport, emailFrom } from './transport';
import type { SendArgs } from './types';

const BACKOFF_MS = [1000, 5000, 30000];

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function sendWithRetry(args: SendArgs): Promise<{ ok: boolean; error?: string; attempts: number }> {
  const transport = getTransport();
  let lastError: string | undefined;
  let attempts = 0;

  for (let i = 0; i < BACKOFF_MS.length; i++) {
    attempts++;
    try {
      await transport.sendMail({
        from: emailFrom(),
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text
      });
      await db.insert(emailLog).values({
        deductionId: args.deductionId ?? null,
        type: args.type,
        toEmail: args.to,
        subject: args.subject,
        status: 'sent',
        attempts
      });
      return { ok: true, attempts };
    } catch (e: any) {
      lastError = e?.message ?? String(e);
      if (i < BACKOFF_MS.length - 1) await sleep(BACKOFF_MS[i]);
    }
  }

  try {
    await db.insert(emailLog).values({
      deductionId: args.deductionId ?? null,
      type: args.type,
      toEmail: args.to,
      subject: args.subject,
      status: 'failed',
      error: lastError ?? 'unknown',
      attempts
    });
  } catch {
    // even logging failed — swallow; do not throw
  }
  return { ok: false, error: lastError, attempts };
}
