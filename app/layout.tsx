import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'LoveTax · 爱情税',
  description: '每天 100 分。Ta 不满意,就来收税。'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
