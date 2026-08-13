import { Button, type ButtonProps } from '@mui/material';

import { useOptionalCookieConsent } from './CookieConsentContext';

export const CookieSettingsButton = (props: Omit<ButtonProps, 'onClick' | 'children'>) => {
  const consent = useOptionalCookieConsent();
  if (!consent) return null;
  return (
    <Button {...props} onClick={consent.openPreferences}>
      Cookie settings
    </Button>
  );
};
