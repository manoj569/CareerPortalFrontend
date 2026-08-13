import { Alert, Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { getGoogleClientId, loadGoogleIdentityServices } from '../google/googleIdentityServices';

interface GoogleAuthenticationButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => void;
}

export const GoogleAuthenticationButton = ({ disabled = false, onCredential }: GoogleAuthenticationButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const disabledRef = useRef(disabled);
  const renderedWidthRef = useRef<number | undefined>(undefined);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [loadError, setLoadError] = useState(false);
  const clientId = getGoogleClientId();
  callbackRef.current = onCredential;
  disabledRef.current = disabled;

  useEffect(() => {
    let active = true;
    if (!clientId || !containerRef.current) return;
    void loadGoogleIdentityServices()
      .then(() => {
        if (!active || !containerRef.current || !window.google?.accounts.id) return;
        const render = () => {
          if (!containerRef.current || !window.google?.accounts.id) return;
          const width = Math.min(400, Math.floor(containerRef.current.clientWidth));
          if (width < 1 || renderedWidthRef.current === width) return;
          renderedWidthRef.current = width;
          containerRef.current.replaceChildren();
          window.google.accounts.id.renderButton(containerRef.current, { theme: 'outline', size: 'large', text: 'continue_with', width });
        };
        window.google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => { if (credential && !disabledRef.current) callbackRef.current(credential); } });
        render();
        observerRef.current?.disconnect();
        observerRef.current = new ResizeObserver(render);
        observerRef.current.observe(containerRef.current);
      })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; observerRef.current?.disconnect(); observerRef.current = null; };
  }, [clientId]);

  if (!clientId) {
    return import.meta.env.DEV ? <Typography color="text.secondary" role="status" variant="body2">Google sign-in is unavailable because its public client ID is not configured.</Typography> : null;
  }
  if (loadError) return <Alert severity="info">Google sign-in is temporarily unavailable.</Alert>;
  return <Box aria-label="Continue with Google" aria-disabled={disabled} ref={containerRef} sx={{ minHeight: 44, maxWidth: 400, mx: 'auto', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto', width: '100%' }} />;
};
