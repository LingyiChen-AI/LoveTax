export const DAILY_MAX = 100;
export const MIN_POINTS = 1;
export const MAX_POINTS = 20;

export function capPoints(submitted: number, remaining: number): number {
  if (!Number.isInteger(submitted) || submitted < MIN_POINTS || submitted > MAX_POINTS) {
    throw new Error('INVALID_POINTS');
  }
  if (!Number.isInteger(remaining) || remaining < 0) {
    throw new Error('INVALID_REMAINING');
  }
  return Math.min(submitted, remaining);
}

export function remainingFromSum(sum: number): number {
  return Math.max(0, DAILY_MAX - sum);
}
