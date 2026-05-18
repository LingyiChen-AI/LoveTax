const MAILPIT_API = 'http://localhost:8026/api/v1';

export async function waitForMailpitMessage(opts: { to?: string; subjectIncludes?: string; timeoutMs?: number }) {
  const deadline = Date.now() + (opts.timeoutMs ?? 10_000);
  while (Date.now() < deadline) {
    const res = await fetch(`${MAILPIT_API}/messages?limit=50`);
    const data = await res.json();
    const match = data.messages?.find((m: any) =>
      (!opts.to || m.To?.some((t: any) => t.Address === opts.to)) &&
      (!opts.subjectIncludes || m.Subject?.includes(opts.subjectIncludes))
    );
    if (match) return match;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Mailpit timeout');
}

export async function clearMailpit() {
  await fetch(`${MAILPIT_API}/messages`, { method: 'DELETE' });
}
