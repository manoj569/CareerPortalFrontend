import { HubConnectionState, type HubConnection } from '@microsoft/signalr';
import { describe, expect, it, vi } from 'vitest';

import { SignalRExternalSessionCaptureTransport } from './externalSessionCaptureTransport';

const connection = () => {
  const handlers: Record<string, () => void> = {};
  const value = {
    invoke: vi.fn().mockResolvedValue(undefined),
    onclose: vi.fn((handler: () => void) => {
      handlers.close = handler;
    }),
    onreconnected: vi.fn((handler: () => void) => {
      handlers.reconnected = handler;
    }),
    onreconnecting: vi.fn((handler: () => void) => {
      handlers.reconnecting = handler;
    }),
    start: vi.fn().mockResolvedValue(undefined),
    state: HubConnectionState.Connected,
    stop: vi.fn().mockResolvedValue(undefined),
  };
  return { handlers, value: value as unknown as HubConnection, spies: value };
};

describe('external session capture SignalR transport', () => {
  it('attaches and sends every bounded method with the original capture ID', async () => {
    const hub = connection();
    const transport = new SignalRExternalSessionCaptureTransport(hub.value, {
      onInterrupted: vi.fn(),
      onReattached: vi.fn(),
    });
    await transport.connect('capture-owner-id');
    await transport.sendPointerClick(320, 200);
    await transport.sendScroll(0, 100);
    await transport.sendTextInput('x');
    await transport.sendKeyPress('Enter');
    await transport.navigateBack();
    await transport.resizeViewport(1280, 800);
    expect(hub.spies.invoke.mock.calls).toEqual([
      ['AttachCapture', 'capture-owner-id'],
      ['SendPointerClick', 'capture-owner-id', 320, 200],
      ['SendScroll', 'capture-owner-id', 0, 100],
      ['SendTextInput', 'capture-owner-id', 'x'],
      ['SendKeyPress', 'capture-owner-id', 'Enter'],
      ['NavigateBack', 'capture-owner-id'],
      ['ResizeViewport', 'capture-owner-id', 1280, 800],
    ]);
  });

  it('detaches the same capture and stops exactly once during cleanup', async () => {
    const hub = connection();
    const transport = new SignalRExternalSessionCaptureTransport(hub.value, {
      onInterrupted: vi.fn(),
      onReattached: vi.fn(),
    });
    await transport.connect('capture-id');
    await transport.dispose();
    await transport.dispose();
    expect(hub.spies.invoke).toHaveBeenLastCalledWith('DetachCapture', 'capture-id');
    expect(hub.spies.stop).toHaveBeenCalledTimes(1);
  });

  it('reattaches only the owned capture after a bounded reconnect', async () => {
    const hub = connection();
    const onReattached = vi.fn();
    const transport = new SignalRExternalSessionCaptureTransport(hub.value, {
      onInterrupted: vi.fn(),
      onReattached,
    });
    await transport.connect('capture-id');
    hub.handlers.reconnected?.();
    await vi.waitFor(() => expect(onReattached).toHaveBeenCalled());
    expect(hub.spies.invoke).toHaveBeenLastCalledWith('AttachCapture', 'capture-id');
  });
});
