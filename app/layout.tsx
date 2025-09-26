import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { Providers } from '@/src/components/providers';
import { SiteNav } from '@/src/components/site-nav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ペア診断（LGBTQ+フレンドリー）',
  description:
    'あなたに合う“おそろい”を、偏見なく提案します。性別にとらわれないマッチングでショッピングをもっと自由に。',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="bg-slate-50">
      <body className={`${inter.className} min-h-screen`}> 
        <Providers>
          <SiteNav />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 md:pt-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
