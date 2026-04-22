import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AgeGate } from '@/components/age-gate';
import { ProModal } from '@/components/pro-modal';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TightandHard — AI Companions for Adults',
  description: 'Private, 18+ AI girlfriend companions. Chat, voice, memory.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body className={cn('bg-secondary', inter.className)}>
          <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
            <AgeGate />
            <ProModal />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
