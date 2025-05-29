'use client';

import { useCookieConsent } from './CookieConsentProvider'; // Ensure this path is correct
import { motion } from 'framer-motion';
import { Button } from '@/components/ui'; // Ensure this path is correct for your Button
import { useRef } from 'react';

export default function CookieBanner() {
  const { consent, accept, decline } = useCookieConsent();
  const constraintsRef = useRef(null); // Ref for the div that defines drag boundaries

  // Only show the banner if consent has not yet been given or denied
  if (consent !== 'unset') {
    return null;
  }

  return (
    <>
      {/* This invisible div acts as the boundary for dragging. 
        It covers the entire viewport.
      */}
      <div
        ref={constraintsRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0, // Ensures full width
          bottom: 0, // Ensures full height
          pointerEvents: 'none', // Crucial: allows clicks to pass through to elements behind it
        }}
      />

      <motion.div
        // className handles initial positioning, sizing, appearance, and drag cursor
        className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-xl -translate-x-1/2 rounded-xl bg-white p-4 shadow-lg sm:p-6 cursor-grab active:cursor-grabbing"
        
        // Animation for the banner appearing
        initial={{ y: 80, opacity: 0 }} // Starts 80px below its final position and transparent
        animate={{ y: 0, opacity: 1 }}   // Animates to its final CSS position and full opacity
        transition={{ type: 'spring', stiffness: 260, damping: 20 }} // Spring animation for a nice effect

        // Dragging properties
        drag // Enables dragging (equivalent to drag="true" for both axes)
        dragConstraints={constraintsRef} // Restricts dragging within the bounds of the constraintsRef div
        dragElastic={0.1} // A little "give" if dragged forcefully against constraints (0 = no give, 1 = full give)
        dragMomentum={false} // The banner stops immediately when the drag gesture ends
      >
        {/* Banner Content */}
        <p className="text-sm text-gray-700 mb-4">
          We use cookies to measure traffic and improve the service. We’ll set analytics
          cookies <strong>only if you accept</strong>.
        </p>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </motion.div>
    </>
  );
}