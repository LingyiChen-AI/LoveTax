import type { Transporter } from 'nodemailer';

export type EmailType = 'deduction' | 'void' | 'invite' | 'password_reset';

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: EmailType;
  deductionId?: string | null;
}

export interface Mailer {
  send(args: SendArgs): Promise<void>;
}

export type Nodemailer = Transporter;
