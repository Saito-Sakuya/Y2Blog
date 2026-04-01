'use client';

import { useEffect, useState } from 'react';
import SetupGuard from '@/components/ui/SetupGuard';

/**
 * SetupCheck — Client component that checks if the blog has been initialized.
 * If setup has not been completed, it renders the full-screen SetupGuard overlay.
 * Once setup is verified, it renders nothing and lets the normal page through.
 */
export default function SetupCheck() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    // Client-side: always use relative path through Nginx proxy
    fetch('/api/site-config')
      .then(res => res.json())
      .then(data => {
        setNeedsSetup(data.isSetup === false);
      })
      .catch(() => {
        // If API is unreachable, don't block the page — assume setup is done
        setNeedsSetup(false);
      });
  }, []);

  // Still loading — don't flash anything
  if (needsSetup === null) return null;

  // Needs setup — block the entire page with the setup guard
  if (needsSetup) return <SetupGuard />;

  // Setup complete — render nothing, let normal content through
  return null;
}
