'use client';

import Script from 'next/script';
import { useCookieConsent } from './CookieConsentProvider';

export default function AnalyticsScripts() {
  const { consent } = useCookieConsent();

  /* No consent ⇒ render nothing */
  if (consent !== 'accepted') return null;

  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      {/* Plausible – remove if not needed */}
      <Script
        strategy="lazyOnload"
        data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/plausible.js"
      />
    </>
  );
}
