import { render } from '@react-email/render';
import Deduction, { type DeductionProps } from './templates/deduction';
import InviteTpl, { type InviteProps } from './templates/invite';
import PWReset, { type PWProps } from './templates/password-reset';
import Bonus, { type BonusProps } from './templates/bonus';

export async function renderDeduction(p: DeductionProps) {
  return {
    html: await render(Deduction(p)),
    text: await render(Deduction(p), { plainText: true })
  };
}

export async function renderInvite(p: InviteProps) {
  return {
    html: await render(InviteTpl(p)),
    text: await render(InviteTpl(p), { plainText: true })
  };
}

export async function renderPasswordReset(p: PWProps) {
  return {
    html: await render(PWReset(p)),
    text: await render(PWReset(p), { plainText: true })
  };
}

export async function renderBonus(p: BonusProps) {
  return {
    html: await render(Bonus(p)),
    text: await render(Bonus(p), { plainText: true })
  };
}
