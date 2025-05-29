'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Consent = 'accepted' | 'declined' | 'unset';

interface Ctx {
  consent: Consent;
  accept: () => void;
  decline: () => void;
}

const CookieCtx = createContext<Ctx | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>('unset');

  /* 1️⃣ Hydrate state from localStorage once on the client */
  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent') as Consent | null;
    if (stored) setConsent(stored);
  }, []);

  /* 2️⃣ Persist every change */
  useEffect(() => {
    if (consent !== 'unset') localStorage.setItem('cookie_consent', consent);
  }, [consent]);

  return (
    <CookieCtx.Provider
      value={{
        consent,
        accept: () => setConsent('accepted'),
        decline: () => setConsent('declined'),
      }}
    >
      {children}
    </CookieCtx.Provider>
  );
}

/* Helper hook */
export function useCookieConsent() {
  const ctx = useContext(CookieCtx);
  if (!ctx) throw new Error('useCookieConsent must be within <CookieConsentProvider>');
  return ctx;
}
