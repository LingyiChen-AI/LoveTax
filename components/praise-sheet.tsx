'use client';
import { useState, useTransition } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { createBonusAction } from '@/lib/server-actions/create-bonus';

const CHIPS = [5, 10, 15, 20] as const;

export function PraiseSheet({ partnerRemaining }: { partnerRemaining: number }) {
  const [points, setPoints] = useState<number>(10);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const deficit = Math.max(0, 100 - partnerRemaining);
  const disabled = deficit === 0;

  function submit() {
    setError(null);
    start(async () => {
      const r = await createBonusAction({ points, reason });
      if ('error' in r) {
        setError(r.error);
        return;
      }
      setReason('');
      setPoints(10);
      setOpen(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          disabled={disabled}
          className="w-full bg-sky-grad shadow-neo-blue"
        >
          {disabled ? 'Ta 满血了' : '✨ 夸 Ta'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="text-center text-base font-extrabold">✨ 夸 Ta</SheetTitle>

        <div className="mt-4">
          <div className="text-[11px] font-extrabold tracking-widest uppercase mb-2">加多少</div>
          <div className="grid grid-cols-4 gap-2">
            {CHIPS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPoints(n)}
                data-active={points === n}
                className="neo-chip"
              >
                {n}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted mt-1">最多还能加 {Math.min(CHIPS[3], deficit)} 分</div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-extrabold tracking-widest uppercase mb-2">原因</div>
          <textarea
            className="neo-input w-full min-h-[80px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="说说 Ta 哪里让你开心了…"
            maxLength={500}
            required
          />
          <div className="text-xs text-muted text-right">{reason.length}/500</div>
        </div>

        {error && <p className="mt-2 text-sm font-bold text-danger">{error}</p>}

        <Button
          size="lg"
          className="w-full mt-4 bg-sky-grad shadow-neo-blue"
          disabled={pending || !reason.trim()}
          onClick={submit}
        >
          {pending ? '提交中…' : `✨ 确认 +${Math.min(points, deficit)} 分`}
        </Button>
        <SheetClose asChild>
          <button className="block mx-auto mt-2 text-xs font-bold text-muted">取消</button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
