// app/layout.tsx
import './globals.css';
import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CookieConsentProvider } from '@/components/CookieConsentProvider';
import CookieBanner from '@/components/CookieBanner';
import AnalyticsScripts from '@/components/AnalyticsScripts';
import { AnalyticsListener } from '@/components/AnalyticsListener';

/* ───────── Default SEO metadata ───────── */
export const metadata: Metadata = {
  title: {
    default: 'TaskForPerks | On-Demand Micro-Task Service',
    template: '%s | TaskForPerks',
  },
  description:
    'On-demand micro-tasks—errands, legal drops, home care & more—any time, any place.',
  keywords: ['micro tasks', 'errand service', 'on demand', 'gig delivery'],
  alternates: { canonical: 'https://taskforperks.com' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

/* ───────── Viewport ───────── */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex justify-center min-h-screen bg-gray-100">
        <CookieConsentProvider>
          {/* Main app tree */}
          {children}

          {/* EU-style banner (only shows when consent === 'unset') */}
          <CookieBanner />

          {/* Analytics: injected only after explicit consent */}
          <Suspense fallback={null}>
            <AnalyticsScripts />
            <AnalyticsListener />
          </Suspense>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
