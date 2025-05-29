// components/AnalyticsListener.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function AnalyticsListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.size ? `?${searchParams}` : '');
    /* GA4 */
    window.gtag?.('event', 'page_view', { page_location: url });
    /* Plausible */
    window.plausible?.('pageview', { u: url });
  }, [pathname, searchParams]);

  return null;
}
