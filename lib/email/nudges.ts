/**
 * Tier-based "nudge" messages appended to a deduction email
 * when the recipient's remaining drops to 60 or below.
 *
 * Pure module: no I/O, deterministic with a custom rng.
 */

type Tier = 'mild' | 'warn' | 'critical' | 'zero';

interface Nudge {
  tier: Tier;
  text: string;
}

const NUDGES: Nudge[] = [
  // Tier 1 · mild — remaining 40-60
  { tier: 'mild', text: '⚠️ 你已经不及格啦,快去哄哄 Ta 吧 🌷' },
  { tier: 'mild', text: '⚠️ 不及格警告 — 这分数,Ta 心里在记账' },
  { tier: 'mild', text: '⚠️ 60 分万岁,不,你已经低于及格线啦' },
  { tier: 'mild', text: '⚠️ 心虚了吗?Ta 已经在嫌弃你了' },
  { tier: 'mild', text: '⚠️ 不及格了哦,补救还来得及,主动一点' },

  // Tier 2 · warn — remaining 20-39
  { tier: 'warn', text: '🟡 状况不妙啊,赶紧主动认个错吧' },
  { tier: 'warn', text: '🟡 这分数有点危险,Ta 怕是真生气了' },
  { tier: 'warn', text: '🟡 别再玩游戏 / 刷手机了,先去哄人' },
  { tier: 'warn', text: '🟡 再扣几下可能就空了,行动起来' },

  // Tier 3 · critical — remaining 1-19
  { tier: 'critical', text: '🔴 已经岌岌可危,救命要紧!' },
  { tier: 'critical', text: '🔴 现在不抢救,今天就要 0 分了' },
  { tier: 'critical', text: '🔴 Ta 这次是真生气了,赶紧去道歉' },
  { tier: 'critical', text: '🔴 再扣一次可能就空了,认错来得及' },

  // Tier 4 · zero — remaining = 0
  { tier: 'zero', text: '💀 你已经被打空,等明天复活吧' },
  { tier: 'zero', text: '💀 0 分归零,今天属于你的额度用完了' },
  { tier: 'zero', text: '💀 今日 KO,等明天东山再起' },
  { tier: 'zero', text: '💀 已经满血归零,先冷静一下吧' }
];

function tierFor(remaining: number): Tier | null {
  if (remaining > 60) return null;
  if (remaining === 0) return 'zero';
  if (remaining < 20) return 'critical';
  if (remaining < 40) return 'warn';
  return 'mild'; // 40..60
}

/**
 * Pick a random nudge message for the given remaining score.
 * Returns null when remaining > 60 (no nudge needed).
 * `rng` defaults to Math.random; pass a deterministic rng in tests.
 */
export function pickNudge(remaining: number, rng: () => number = Math.random): string | null {
  const tier = tierFor(remaining);
  if (!tier) return null;
  const pool = NUDGES.filter((n) => n.tier === tier);
  return pool[Math.floor(rng() * pool.length)].text;
}
