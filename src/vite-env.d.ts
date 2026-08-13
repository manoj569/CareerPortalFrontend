/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface GoogleCodeResponse { code?: string }
interface GoogleCodeClientConfig { client_id: string; scope: string; ux_mode: 'popup'; include_granted_scopes: false; select_account: true; callback: (response: GoogleCodeResponse) => void; error_callback: (error: { type?: string }) => void }
interface GoogleCodeClient { requestCode: () => void }
interface Window { google?: { accounts: { oauth2: { initCodeClient: (configuration: GoogleCodeClientConfig) => GoogleCodeClient } } } }

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
