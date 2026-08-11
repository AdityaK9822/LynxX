import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css';
import '../App.css';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// display: 'swap' prevents FOIT — text is readable immediately with fallback font
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'LynxX - Non-custodial Payments on Stellar',
  description: 'LynxX merges fast, non-custodial payments with real on-chain smart contracts — unlocking trustless transfers and crowdfunding on Stellar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Early connection to Google Fonts CDN reduces font load latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div id="root">
          {children}
          <Toaster position="top-center" theme="dark" richColors />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
