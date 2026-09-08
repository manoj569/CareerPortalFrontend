/* eslint-disable @typescript-eslint/no-unsafe-return */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import { ExternalSessionCaptureStatus, ExternalSessionSite } from '../types/aiApplyModels';
import { SecureExternalSessionCapture } from './SecureExternalSessionCapture';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  dispose: vi.fn().mockResolvedValue(undefined),
  navigateBack: vi.fn().mockResolvedValue(undefined),
  requestFrame: vi.fn(),
  resizeViewport: vi.fn().mockResolvedValue(undefined),
  sendKeyPress: vi.fn().mockResolvedValue(undefined),
  sendPointerClick: vi.fn().mockResolvedValue(undefined),
  sendScroll: vi.fn().mockResolvedValue(undefined),
  sendTextInput: vi.fn().mockResolvedValue(undefined),
  connect: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../services/externalSessionCaptureTransport', () => ({
  createExternalSessionCaptureTransport: (...args: unknown[]) => mocks.create(...args),
}));

const capture = {
  captureId: 'owned-capture-id',
  site: ExternalSessionSite.LinkedIn,
  displayName: 'LinkedIn',
  status: ExternalSessionCaptureStatus.AwaitingCandidate,
  expiresAtUtc: '2026-09-04T12:30:00Z',
  requiresCandidateAction: true,
  interactionAvailable: true,
  interactionMode: 'SignalRRemoteBrowser',
  message: 'Sign in securely.',
};

const frame = (data: string, width = 1280, height = 800) => ({
  data,
  contentType: 'image/jpeg',
  width,
  height,
  capturedAtUtc: '2026-09-04T12:00:00Z',
});

const renderCapture = (overrides?: {
  onCancel?: () => Promise<void>;
  onComplete?: () => Promise<typeof capture>;
}) =>
  renderWithProviders(
    <SecureExternalSessionCapture
      capture={capture}
      onCancel={overrides?.onCancel ?? vi.fn().mockResolvedValue(undefined)}
      onComplete={
        overrides?.onComplete ??
        vi.fn().mockResolvedValue({ ...capture, status: ExternalSessionCaptureStatus.Completed })
      }
    />,
  );

describe('secure external session capture view', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue(undefined);
    mocks.dispose.mockResolvedValue(undefined);
    mocks.requestFrame.mockResolvedValue(frame('/9j/AA=='));
    mocks.create.mockReturnValue({
      connect: mocks.connect,
      dispose: mocks.dispose,
      navigateBack: mocks.navigateBack,
      requestFrame: mocks.requestFrame,
      resizeViewport: mocks.resizeViewport,
      sendKeyPress: mocks.sendKeyPress,
      sendPointerClick: mocks.sendPointerClick,
      sendScroll: mocks.sendScroll,
      sendTextInput: mocks.sendTextInput,
    });
  });

  it('attaches the exact capture, renders an in-memory frame, and never persists it', async () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const view = renderCapture();
    expect(screen.queryByRole('button', { name: "I've finished signing in" })).toBeDisabled();
    await waitFor(() => expect(mocks.connect).toHaveBeenCalledWith('owned-capture-id'));
    const image = await screen.findByRole('img', { name: 'Current LinkedIn sign-in screen' });
    expect(image).toHaveAttribute('src', 'data:image/jpeg;base64,/9j/AA==');
    expect(screen.getByRole('button', { name: "I've finished signing in" })).toBeEnabled();
    expect(localStorageSpy).not.toHaveBeenCalled();
    view.unmount();
    await waitFor(() => expect(mocks.dispose).toHaveBeenCalled());
  });

  it('maps frame clicks and sends scrolling and typed text without a credential field', async () => {
    renderCapture();
    const image = await screen.findByRole('img', { name: 'Current LinkedIn sign-in screen' });
    vi.spyOn(image, 'getBoundingClientRect').mockReturnValue({
      bottom: 450,
      height: 400,
      left: 10,
      right: 650,
      top: 50,
      width: 640,
      x: 10,
      y: 50,
      toJSON: () => ({}),
    });
    fireEvent.click(image, { clientX: 330, clientY: 250 });
    expect(mocks.sendPointerClick).toHaveBeenCalledWith(640, 400);
    const viewport = screen.getByRole('application', { name: 'LinkedIn secure browser viewport' });
    fireEvent.wheel(viewport, { deltaX: 7000, deltaY: -7000 });
    expect(mocks.sendScroll).toHaveBeenCalledWith(5000, -5000);
    fireEvent.keyDown(viewport, { key: 's' });
    fireEvent.keyDown(viewport, { key: 'Enter' });
    expect(mocks.sendTextInput).toHaveBeenCalledWith('s');
    expect(mocks.sendKeyPress).toHaveBeenCalledWith('Enter');
    expect(screen.queryByLabelText(/password|otp|mfa|url/i)).not.toBeInTheDocument();
  });

  it('uses REST completion callback only after attach and stops on authoritative completion', async () => {
    const onComplete = vi
      .fn()
      .mockResolvedValue({ ...capture, status: ExternalSessionCaptureStatus.Completed });
    renderCapture({ onComplete });
    const button = await screen.findByRole('button', { name: "I've finished signing in" });
    await waitFor(() => expect(button).toBeEnabled());
    fireEvent.click(button);
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(mocks.dispose).toHaveBeenCalled();
  });

  it('cancels through the REST callback and disposes the transport', async () => {
    const onCancel = vi.fn().mockResolvedValue(undefined);
    renderCapture({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel sign-in' }));
    await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    expect(mocks.dispose).toHaveBeenCalled();
  });

  it('shows a safe attach failure and never enables completion', async () => {
    mocks.connect.mockRejectedValue(new Error('internal hub details'));
    renderCapture();
    expect(
      await screen.findByText('Secure sign-in could not be opened. Please restart the connection.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "I've finished signing in" })).toBeDisabled();
    expect(screen.queryByText('internal hub details')).not.toBeInTheDocument();
  });
});
