import { requirePaired } from '@/lib/auth/require-session';

export default async function Home() {
  const user = await requirePaired();
  return <div className="neo p-5 mt-10">主页占位 — {user.name}</div>;
}
