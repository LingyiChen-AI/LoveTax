'use client';
import { useState, useTransition } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createDeductionAction } from '@/lib/server-actions/create-deduction';

const CHIPS = [5, 10, 15, 20] as const;

export function DeductSheet({ partnerRemaining }: { partnerRemaining: number }) {
  const [points, setPoints] = useState<number>(10);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const disabled = partnerRemaining <= 0;

  function submit() {
    setError(null);
    start(async () => {
      const r = await createDeductionAction({ points, reason });
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
        <Button variant="primary" size="lg" disabled={disabled} className="w-full">
          {disabled ? 'Ta 今天已被打空' : '⚔️ 出招'}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetTitle className="text-center text-base font-extrabold">⚔️ 出招</SheetTitle>

        <div className="mt-4">
          <div className="text-[11px] font-extrabold tracking-widest uppercase mb-2">扣多少</div>
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
          <div className="text-xs text-muted mt-1">最多还能扣 {Math.min(CHIPS[3], partnerRemaining)} 分</div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-extrabold tracking-widest uppercase mb-2">原因</div>
          <textarea
            className="neo-input w-full min-h-[80px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="说说 Ta 哪里惹你了…"
            maxLength={500}
            required
          />
          <div className="text-xs text-muted text-right">{reason.length}/500</div>
        </div>

        {error && <p className="mt-2 text-sm font-bold text-danger">{error}</p>}

        <Button variant="danger" size="lg" className="w-full mt-4" disabled={pending || !reason.trim()} onClick={submit}>
          {pending ? '提交中…' : `确认 -${Math.min(points, partnerRemaining)} 分`}
        </Button>
        <SheetClose asChild>
          <button className="block mx-auto mt-2 text-xs font-bold text-muted">取消</button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
