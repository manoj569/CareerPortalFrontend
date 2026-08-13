/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface GoogleCredentialResponse { credential: string }
interface GoogleIdConfiguration { client_id: string; callback: (response: GoogleCredentialResponse) => void }
interface GoogleButtonConfiguration { theme: 'outline'; size: 'large'; text: 'continue_with'; width?: number }
interface Window { google?: { accounts: { id: { initialize: (configuration: GoogleIdConfiguration) => void; renderButton: (parent: HTMLElement, configuration: GoogleButtonConfiguration) => void } } } }

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
