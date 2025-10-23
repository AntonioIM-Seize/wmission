import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/context/language-context';
import { detectInitialLanguage } from '@/lib/i18n/detect-language';

import './globals.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '위루다 선교 기도 공동체',
  description: '선교지 소식과 기도 제목을 나누고 함께 기도하는 온라인 공동체',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = await detectInitialLanguage();

  return (
    <html lang={initialLanguage}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          본문으로 바로가기
        </a>
        <LanguageProvider initialLanguage={initialLanguage}>
          <div id="main-content" className="min-h-screen focus:outline-none">
            {children}
          </div>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
