import { db } from '@/lib/db/client';
import { emailLog } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { adminResendEmail } from '@/lib/server-actions/admin/resend-email';

export default async function EmailFailures() {
  const rows = await db.select().from(emailLog).where(eq(emailLog.status, 'failed')).orderBy(desc(emailLog.sentAt)).limit(100);
  return (
    <div className="space-y-2">
      <h1 className="font-extrabold">邮件失败</h1>
      {rows.length === 0 ? <p className="text-sm text-muted">无失败记录</p> : (
        <table className="w-full text-xs border-2 border-ink bg-paper rounded-card overflow-hidden">
          <thead className="bg-bg"><tr><th className="p-2 text-left">时间</th><th className="p-2 text-left">类型</th><th className="p-2 text-left">收件人</th><th className="p-2 text-left">错误</th><th className="p-2 text-left">操作</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-ink/20">
                <td className="p-2">{r.sentAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                <td className="p-2">{r.type}</td>
                <td className="p-2">{r.toEmail}</td>
                <td className="p-2 truncate max-w-xs text-danger">{r.error}</td>
                <td className="p-2">
                  <form action={async () => { 'use server'; await adminResendEmail(r.id); }}>
                    <button className="text-xs underline" type="submit">重发</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
