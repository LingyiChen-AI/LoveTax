import { test, expect } from '@playwright/test';
import { waitForMailpitMessage, clearMailpit } from './helpers/mailpit';
import postgres from 'postgres';

const dbUrl = 'postgres://zchat:zchat@localhost:5433/zchat_test';

test.beforeAll(async () => {
  const sql = postgres(dbUrl);
  await sql`TRUNCATE TABLE rate_limits, email_log, deductions, invitations, users, couples RESTART IDENTITY CASCADE`;
  await sql.end();
});

test.beforeEach(async () => { await clearMailpit(); });

test('golden path: register A → invite B → B accepts → A deducts → email → A voids → email → trend', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await pageA.goto('/register');
  await pageA.fill('input[name=displayName]', 'A');
  await pageA.fill('input[name=email]', 'a@t.local');
  await pageA.fill('input[name=password]', 'Password1!');
  await pageA.click('button[type=submit]');
  await pageA.waitForURL('**/onboarding');

  await pageA.fill('input[name=inviteeEmail]', 'b@t.local');
  await pageA.click('button:has-text("发送邀请")');
  const inviteMsg = await waitForMailpitMessage({ to: 'b@t.local', subjectIncludes: '邀请你加入' });
  const fullMsg = await fetch(`http://localhost:8026/api/v1/message/${inviteMsg.ID}`).then((r) => r.json());
  const token = (fullMsg.Text as string).match(/invite\/([A-Za-z0-9_-]+)/)?.[1];
  expect(token).toBeTruthy();

  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await pageB.goto(`/register?invite=${token}`);
  await pageB.fill('input[name=displayName]', 'B');
  await pageB.fill('input[name=email]', 'b@t.local');
  await pageB.fill('input[name=password]', 'Password1!');
  await pageB.click('button[type=submit]');
  await pageB.waitForURL(/invite\//);
  await pageB.click('button:has-text("接受邀请")');
  await pageB.waitForURL('**/home');

  // A's JWT was issued before pairing; clear cookies and re-login so the session has coupleId
  await ctxA.clearCookies();
  await pageA.goto('/login');
  await pageA.fill('input[name=email]', 'a@t.local');
  await pageA.fill('input[name=password]', 'Password1!');
  await pageA.click('button[type=submit]');
  await pageA.waitForURL('**/home');

  await expect(pageA.locator('text=VS')).toBeVisible();

  await pageA.click('button:has-text("出招")');
  await pageA.click('button:has-text("10")');
  await pageA.fill('textarea', '玩手机太久');
  await pageA.click('button:has-text("确认")');

  await waitForMailpitMessage({ to: 'b@t.local', subjectIncludes: '10 分' });

  await pageA.waitForLoadState('networkidle');
  await expect(pageA.locator('text=玩手机太久')).toBeVisible();

  await pageA.click('button:has-text("撤销")');
  await pageA.click('button:has-text("确认撤销")');
  await waitForMailpitMessage({ to: 'b@t.local', subjectIncludes: '撤销' });

  await pageA.goto('/reports/trend');
  await expect(pageA.locator('svg.recharts-surface').first()).toBeVisible();
});
