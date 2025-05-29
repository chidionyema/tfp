import LandingPage from '@/components/LandingPage'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fast Errands & Micro-Tasks',
  description:
    'From last-minute dry-cleaning to notarized document drops, TaskForPerks delivers in minutes.',
  alternates: { canonical: 'https://taskforperks.com' },
  openGraph: {
    title: 'Fast Errands & Micro-Tasks',
    description:
      'Need something done now? TaskForPerks sends a trusted runner straight away.',
    url: 'https://taskforperks.com',
    images: [
      {
        url: '/og/landing.png',
        width: 1200,
        height: 630,
        alt: 'TaskForPerks hero banner',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
  keywords: [
    'errand service',
    'gig delivery',
    'on-demand tasks',
    'micro tasks',
  ],
};
export default function Page() {
  return <LandingPage />
}
