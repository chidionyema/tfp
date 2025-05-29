/* types/analytics.d.ts
   Extend the Window interface so TS accepts gtag / plausible calls.
   This file is automatically picked up by Next.js’ default tsconfig. */
   declare global {
    interface Window {
      gtag?: (...args: any[]) => void;
      plausible?: (...args: any[]) => void;
    }
  }
  
  export {}; // marks this file as a module
  