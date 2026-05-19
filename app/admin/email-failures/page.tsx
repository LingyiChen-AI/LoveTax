import { db } from '@/lib/db/client';
import { emailLog } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { adminResendEmail } from '@/lib/server-actions/admin/resend-email';

function fmtTime(d: Date) {
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

const TYPE_LABEL: Record<string, string> = {
  deduction: '扣分',
  void: '撤销',
  invite: '邀请',
  password_reset: '重置密码'
};

export default async function EmailFailures() {
  const rows = await db.select().from(emailLog).where(eq(emailLog.status, 'failed')).orderBy(desc(emailLog.sentAt)).limit(100);
  return (
    <div className="space-y-3">
      <h1 className="text-xs font-extrabold tracking-widest uppercase px-1">邮件失败 · {rows.length}</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-muted text-center py-6 neo p-4">无失败记录 🎉</p>
      ) : (
        <>
          <section className="space-y-2 md:hidden">
            {rows.map((r) => (
              <div key={r.id} className="neo p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] text-muted">{fmtTime(r.sentAt)}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 border-2 border-white rounded-chip bg-paper">{TYPE_LABEL[r.type] ?? r.type}</span>
                </div>
                <div className="text-sm font-bold truncate">{r.toEmail}</div>
                <div className="text-xs text-danger mt-1 break-words">{r.error}</div>
                <form action={async () => { 'use server'; await adminResendEmail(r.id); }} className="mt-2">
                  <button type="submit" className="w-full text-xs font-bold py-1.5 border-2 border-white rounded-chip bg-paper active:translate-x-[1px] active:translate-y-[1px]">
                    重发
                  </button>
                </form>
              </div>
            ))}
          </section>

          <section className="hidden md:block">
            <table className="w-full text-xs border-2 border-white bg-paper rounded-card overflow-hidden">
              <thead className="bg-bg"><tr><th className="p-2 text-left">时间</th><th className="p-2 text-left">类型</th><th className="p-2 text-left">收件人</th><th className="p-2 text-left">错误</th><th className="p-2 text-left">操作</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-pink/15">
                    <td className="p-2">{fmtTime(r.sentAt)}</td>
                    <td className="p-2">{TYPE_LABEL[r.type] ?? r.type}</td>
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
          </section>
        </>
      )}
    </div>
  );
}
