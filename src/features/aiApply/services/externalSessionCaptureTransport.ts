import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';

import { environment } from '@/config/environment';
import { authTokenStore } from '@/services/authTokenStore';

export interface ExternalSessionBrowserFrame {
  data: string | number[];
  contentType: string;
  width: number;
  height: number;
  capturedAtUtc: string;
}

export interface ExternalSessionCaptureTransportCallbacks {
  onInterrupted: () => void;
  onReattached: () => void;
}

export interface ExternalSessionCaptureTransport {
  connect: (captureId: string) => Promise<void>;
  requestFrame: () => Promise<ExternalSessionBrowserFrame>;
  sendPointerClick: (x: number, y: number) => Promise<void>;
  sendScroll: (deltaX: number, deltaY: number) => Promise<void>;
  sendTextInput: (text: string) => Promise<void>;
  sendKeyPress: (key: string) => Promise<void>;
  navigateBack: () => Promise<void>;
  resizeViewport: (width: number, height: number) => Promise<void>;
  dispose: () => Promise<void>;
}

export const EXTERNAL_SESSION_INTERACTION_MODE = 'SignalRRemoteBrowser';

const hubUrl = () => {
  const url = new URL(environment.apiBaseUrl);
  url.pathname = `${url.pathname.replace(/\/?api\/?$/, '').replace(/\/$/, '')}/hubs/ai-apply/external-session-capture`;
  url.search = '';
  url.hash = '';
  return url.toString();
};

export class SignalRExternalSessionCaptureTransport implements ExternalSessionCaptureTransport {
  private captureId: string | null = null;
  private disposed = false;

  constructor(
    private readonly connection: HubConnection,
    callbacks: ExternalSessionCaptureTransportCallbacks,
  ) {
    connection.onreconnecting(() => callbacks.onInterrupted());
    connection.onreconnected(() => {
      if (!this.captureId || this.disposed) return;
      void connection
        .invoke('AttachCapture', this.captureId)
        .then(() => callbacks.onReattached())
        .catch(() => callbacks.onInterrupted());
    });
    connection.onclose(() => {
      if (!this.disposed) callbacks.onInterrupted();
    });
  }

  async connect(captureId: string) {
    if (this.disposed) throw new Error('Transport has been disposed.');
    this.captureId = captureId;
    await this.connection.start();
    await this.connection.invoke('AttachCapture', captureId);
  }

  requestFrame() {
    return this.invoke<ExternalSessionBrowserFrame>('RequestFrame');
  }

  sendPointerClick(x: number, y: number) {
    return this.invoke<void>('SendPointerClick', x, y);
  }

  sendScroll(deltaX: number, deltaY: number) {
    return this.invoke<void>('SendScroll', deltaX, deltaY);
  }

  sendTextInput(text: string) {
    return this.invoke<void>('SendTextInput', text);
  }

  sendKeyPress(key: string) {
    return this.invoke<void>('SendKeyPress', key);
  }

  navigateBack() {
    return this.invoke<void>('NavigateBack');
  }

  resizeViewport(width: number, height: number) {
    return this.invoke<void>('ResizeViewport', width, height);
  }

  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const captureId = this.captureId;
    this.captureId = null;
    if (captureId && this.connection.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('DetachCapture', captureId);
      } catch {
        // The server also detaches the capture when the hub connection closes.
      }
    }
    await this.connection.stop();
  }

  private invoke<T>(method: string, ...args: unknown[]) {
    if (!this.captureId || this.connection.state !== HubConnectionState.Connected) {
      return Promise.reject(new Error('Secure transport is not connected.'));
    }
    return this.connection.invoke<T>(method, this.captureId, ...args);
  }
}

export const createExternalSessionCaptureTransport = (
  callbacks: ExternalSessionCaptureTransportCallbacks,
): ExternalSessionCaptureTransport => {
  const connection = new HubConnectionBuilder()
    .withUrl(hubUrl(), {
      accessTokenFactory: () => authTokenStore.getAccessToken() ?? '',
    })
    .withAutomaticReconnect([0, 2_000, 5_000])
    .configureLogging(LogLevel.None)
    .build();
  return new SignalRExternalSessionCaptureTransport(connection, callbacks);
};
