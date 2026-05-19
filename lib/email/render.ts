import { render } from '@react-email/render';
import Deduction, { type DeductionProps } from './templates/deduction';
import VoidTpl, { type VoidProps } from './templates/void';
import InviteTpl, { type InviteProps } from './templates/invite';
import PWReset, { type PWProps } from './templates/password-reset';
import Bonus, { type BonusProps } from './templates/bonus';
import BonusVoid, { type BonusVoidProps } from './templates/bonus-void';

export async function renderDeduction(p: DeductionProps) {
  return {
    html: await render(Deduction(p)),
    text: await render(Deduction(p), { plainText: true })
  };
}

export async function renderVoid(p: VoidProps) {
  return {
    html: await render(VoidTpl(p)),
    text: await render(VoidTpl(p), { plainText: true })
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
  return { html: await render(Bonus(p)), text: await render(Bonus(p), { plainText: true }) };
}
export async function renderBonusVoid(p: BonusVoidProps) {
  return { html: await render(BonusVoid(p)), text: await render(BonusVoid(p), { plainText: true }) };
}
