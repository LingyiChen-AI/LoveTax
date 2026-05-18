export type AppErrorCode =
  | 'INVALID_POINTS'
  | 'INVALID_REASON'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'BLOOD_EMPTY'
  | 'NOT_PAIRED'
  | 'FORBIDDEN_VOID'
  | 'INVITE_INVALID'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL';

export class AppError extends Error {
  constructor(public code: AppErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
