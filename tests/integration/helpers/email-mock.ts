import { vi } from 'vitest';

export const sentEmails: Array<{ to: string; subject: string; html: string; text: string; type: string }> = [];

export function mockEmailTransport() {
  vi.mock('@/lib/email/transport', () => ({
    getTransport: () => ({
      sendMail: async (opts: any) => {
        sentEmails.push({ to: opts.to, subject: opts.subject, html: opts.html, text: opts.text, type: 'mock' });
        return { messageId: 'mock' };
      }
    }),
    emailFrom: () => 'test@test.local'
  }));
}

export function clearSentEmails() { sentEmails.length = 0; }
