import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'zchat — 情侣每日扣分',
  description: '每天 100 分。Ta 不满,就来扣。'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
