import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Button, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { getGoogleClientId, loadGoogleIdentityServices } from '../google/googleIdentityServices';

interface Props { disabled?: boolean; onCode: (code: string) => void; onPopupError: (message: string) => void }

export const GoogleAuthorizationCodeButton = ({ disabled = false, onCode, onPopupError }: Props) => {
  const clientId = getGoogleClientId();
  const clientRef = useRef<GoogleCodeClient | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    let active = true;
    if (!clientId) return;
    void loadGoogleIdentityServices().then(() => {
      if (!active || !window.google?.accounts.oauth2) return;
      clientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId, scope: 'openid email profile', ux_mode: 'popup', include_granted_scopes: false, select_account: true,
        callback: ({ code }) => { busyRef.current = false; if (code) onCode(code); else onPopupError('Google sign-in is temporarily unavailable. Please try again.'); },
        error_callback: ({ type }) => { busyRef.current = false; onPopupError(type === 'popup_failed_to_open' ? 'Google sign-in was blocked. Allow pop-ups and try again.' : type === 'popup_closed' ? 'Google sign-in was cancelled.' : 'Google sign-in is temporarily unavailable. Please try again.'); },
      });
      setReady(true);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [clientId, onCode, onPopupError]);

  if (!clientId) return import.meta.env.DEV ? <Typography color="text.secondary" role="status" variant="body2">Google sign-in is unavailable because its public client ID is not configured.</Typography> : null;
  if (failed) return <Alert severity="info">Google sign-in is temporarily unavailable. Please try again.</Alert>;
  return <Button aria-label="Continue with Google" disabled={disabled || !ready} fullWidth onClick={() => { if (!busyRef.current && clientRef.current) { busyRef.current = true; clientRef.current.requestCode(); } }} size="large" startIcon={<GoogleIcon />} sx={{ minHeight: 48, textTransform: 'none' }} variant="outlined">Continue with Google</Button>;
};
