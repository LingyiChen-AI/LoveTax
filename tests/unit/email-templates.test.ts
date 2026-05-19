import { describe, it, expect } from 'vitest';
import { renderDeduction, renderVoid, renderInvite, renderPasswordReset, renderBonus, renderBonusVoid } from '@/lib/email/render';

describe('email templates', () => {
  it('deduction renders + contains key fields', async () => {
    const { html, text } = await renderDeduction({
      appUrl: 'https://x', fromName: '宝宝', toName: '亲爱的',
      points: 10, reason: '玩手机太久', remaining: 90
    });
    expect(html).toContain('10');
    expect(html).toContain('玩手机太久');
    expect(html).toContain('90/100');
    expect(text).toContain('玩手机太久');
  });
  it('escapes HTML in reason (no <script>)', async () => {
    const { html } = await renderDeduction({
      appUrl: 'https://x', fromName: 'A', toName: 'B',
      points: 5, reason: '<script>alert(1)</script>', remaining: 95
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
  it('invite has accept URL', async () => {
    const { html } = await renderInvite({ inviterName: '宝宝', acceptUrl: 'https://x/invite/abc', expiresInDays: 7 });
    expect(html).toContain('https://x/invite/abc');
    expect(html).toContain('7 天');
  });
  it('password reset has temp pw', async () => {
    const { html } = await renderPasswordReset({ appUrl: 'https://x', email: 'a@b', tempPassword: 'Temp123!' });
    expect(html).toContain('Temp123!');
    expect(html).toContain('a@b');
  });
  it('void has remaining', async () => {
    const { html } = await renderVoid({ appUrl: 'https://x', fromName: 'A', toName: 'B', points: 5, reason: 'x', remaining: 95 });
    expect(html).toContain('95/100');
  });
});

describe('bonus email templates', () => {
  it('bonus renders + contains key fields', async () => {
    const { html, text } = await renderBonus({
      appUrl: 'https://x', fromName: '宝宝', toName: '亲爱的',
      points: 10, reason: '给我带了奶茶', remaining: 100
    });
    expect(html).toContain('+10');
    expect(html).toContain('给我带了奶茶');
    expect(html).toContain('100/100');
    expect(text).toContain('给我带了奶茶');
  });

  it('bonus escapes HTML in reason', async () => {
    const { html } = await renderBonus({
      appUrl: 'https://x', fromName: 'A', toName: 'B',
      points: 5, reason: '<script>alert(1)</script>', remaining: 100
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('bonus-void shows remaining', async () => {
    const { html } = await renderBonusVoid({
      appUrl: 'https://x', fromName: 'A', toName: 'B',
      points: 5, reason: 'x', remaining: 95
    });
    expect(html).toContain('95/100');
    expect(html).toContain('撤销');
  });
});
