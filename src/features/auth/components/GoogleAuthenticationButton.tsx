import { Alert, Box, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { getGoogleClientId, loadGoogleIdentityServices } from '../google/googleIdentityServices';

interface GoogleAuthenticationButtonProps {
  disabled?: boolean;
  onCredential: (credential: string) => void;
}

export const GoogleAuthenticationButton = ({ disabled = false, onCredential }: GoogleAuthenticationButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const clientId = getGoogleClientId();

  useEffect(() => {
    let active = true;
    if (!clientId || !containerRef.current) return;
    void loadGoogleIdentityServices()
      .then(() => {
        if (!active || !containerRef.current || !window.google?.accounts.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential && !disabled) onCredential(credential);
          },
        });
        containerRef.current.replaceChildren();
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline', size: 'large', text: 'continue_with', width: containerRef.current.clientWidth || 320,
        });
      })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [clientId, disabled, onCredential]);

  if (!clientId) {
    return import.meta.env.DEV ? <Typography color="text.secondary" role="status" variant="body2">Google sign-in is unavailable because its public client ID is not configured.</Typography> : null;
  }
  if (loadError) return <Alert severity="info">Google sign-in is temporarily unavailable.</Alert>;
  return <Box aria-label="Continue with Google" aria-disabled={disabled} ref={containerRef} sx={{ minHeight: 44, opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto', width: '100%' }} />;
};
