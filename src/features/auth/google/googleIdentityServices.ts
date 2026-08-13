const GIS_SCRIPT_ID = 'career-harbor-google-identity-services';
const GIS_SRC = 'https://accounts.google.com/gsi/client';

let scriptPromise: Promise<void> | null = null;

export const getGoogleClientId = (): string | null => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  return clientId?.endsWith('.apps.googleusercontent.com') ? clientId : null;
};

export const loadGoogleIdentityServices = (): Promise<void> => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    const finish = () =>
      window.google?.accounts?.id ? resolve() : reject(new Error('Google Identity Services did not initialize.'));
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => reject(new Error('Google Identity Services could not be loaded.')), {
      once: true,
    });
    if (!existing) {
      script.id = GIS_SCRIPT_ID;
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  }).catch((error: unknown) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
};
