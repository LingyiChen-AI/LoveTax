'use client';
import { useState, useTransition } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { voidDeductionAction } from '@/lib/server-actions/void-deduction';

export function VoidButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs font-bold text-muted underline shrink-0">撤销</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-extrabold">撤销这次扣分?</DialogTitle>
        <p className="text-sm mt-2">撤销后会再发一封邮件通知 Ta。</p>
        {error && <p className="text-sm text-danger font-bold mt-2">{error}</p>}
        <div className="flex gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="ghost" className="flex-1">取消</Button>
          </DialogClose>
          <Button
            variant="danger"
            className="flex-1"
            disabled={pending}
            onClick={() => {
              setError(null);
              start(async () => {
                const r = await voidDeductionAction({ id });
                if ('error' in r) setError(r.error);
                else setOpen(false);
              });
            }}
          >
            {pending ? '撤销中…' : '确认撤销'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
