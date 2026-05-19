import 'dotenv/config';
import nodemailer from 'nodemailer';

async function main() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const from = process.env.SMTP_FROM!;
  const to = process.argv[2] ?? user; // default: send to self

  const t = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  console.log(`[smtp-test] host=${host}:${port} user=${user} → ${to}`);
  await t.verify();
  console.log('[smtp-test] verify OK');

  const info = await t.sendMail({
    from,
    to,
    subject: '[LoveTax] SMTP 测试 — ' + new Date().toISOString().slice(0, 16),
    text: '这是 LoveTax 的 SMTP 接入测试邮件。如果你收到了,说明配置 OK。',
    html: '<div style="font-family:sans-serif;padding:24px;background:#FFE6F4"><div style="background:#FFFFFF;border:2px solid #FFCDE8;border-radius:18px;padding:20px;max-width:420px;box-shadow:3px 3px 0 #FFB6E6"><h2 style="margin:0 0 8px;color:#5B3A8A">✨ LoveTax SMTP 测试</h2><p style="color:#5B3A8A;margin:0">这是一封 LoveTax 的 SMTP 接入测试邮件。如果你收到了,说明配置 OK。</p></div></div>'
  });
  console.log('[smtp-test] sent', info.messageId);
}

main().catch((e) => { console.error('[smtp-test] FAILED:', e.message); process.exit(1); });
