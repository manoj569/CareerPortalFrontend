/* eslint-disable @typescript-eslint/no-misused-promises */
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type WheelEvent,
} from 'react';

import {
  createExternalSessionCaptureTransport,
  type ExternalSessionBrowserFrame,
  type ExternalSessionCaptureTransport,
} from '../services/externalSessionCaptureTransport';
import type { ExternalSessionCapture } from '../types/aiApplyModels';
import { ExternalSessionCaptureStatus } from '../types/aiApplyModels';

interface SecureExternalSessionCaptureProps {
  capture: ExternalSessionCapture;
  onCancel: () => Promise<void>;
  onComplete: () => Promise<ExternalSessionCapture>;
}

const FRAME_INTERVAL_MS = 400;
const RESIZE_DELAY_MS = 300;
const allowedKeys = new Set([
  'Enter',
  'Tab',
  'Escape',
  'Backspace',
  'Delete',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

const toFrameSource = (frame: ExternalSessionBrowserFrame) => {
  if (frame.contentType !== 'image/jpeg') throw new Error('Unsupported frame format.');
  const base64 =
    typeof frame.data === 'string'
      ? frame.data
      : btoa(String.fromCharCode(...frame.data.map((value) => Math.max(0, Math.min(255, value)))));
  return `data:image/jpeg;base64,${base64}`;
};

export const SecureExternalSessionCapture = ({
  capture,
  onCancel,
  onComplete,
}: SecureExternalSessionCaptureProps) => {
  const transportRef = useRef<ExternalSessionCaptureTransport | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollRef = useRef(0);
  const activeRef = useRef(true);
  const requestNextFrameRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const [frame, setFrame] = useState<ExternalSessionBrowserFrame | null>(null);
  const [frameSource, setFrameSource] = useState<string | null>(null);
  const [status, setStatus] = useState<'attaching' | 'ready' | 'interrupted'>('attaching');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const stopTransport = useCallback(async () => {
    activeRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
    const transport = transportRef.current;
    transportRef.current = null;
    if (transport) await transport.dispose();
    setFrame(null);
    setFrameSource(null);
  }, []);

  useEffect(() => {
    activeRef.current = true;
    const transport = createExternalSessionCaptureTransport({
      onInterrupted: () => {
        if (activeRef.current) setStatus('interrupted');
      },
      onReattached: () => {
        if (activeRef.current) {
          setStatus('ready');
          void requestNextFrameRef.current();
        }
      },
    });
    transportRef.current = transport;

    const requestNextFrame = async () => {
      if (!activeRef.current || document.hidden) return;
      try {
        const nextFrame = await transport.requestFrame();
        if (!activeRef.current) return;
        setFrame(nextFrame);
        setFrameSource(toFrameSource(nextFrame));
        setStatus('ready');
        timerRef.current = setTimeout(requestNextFrame, FRAME_INTERVAL_MS);
      } catch {
        if (activeRef.current) {
          setStatus('interrupted');
          setError(
            'Secure sign-in connection was interrupted. Restart the connection to try again.',
          );
        }
      }
    };
    requestNextFrameRef.current = requestNextFrame;

    void transport
      .connect(capture.captureId)
      .then(() => {
        if (!activeRef.current) return;
        setStatus('ready');
        void requestNextFrame();
      })
      .catch(() => {
        if (!activeRef.current) return;
        setStatus('interrupted');
        setError('Secure sign-in could not be opened. Please restart the connection.');
        void transport.dispose();
      });

    const onVisibilityChange = () => {
      if (!document.hidden && activeRef.current && transportRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        void requestNextFrame();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      const activeTransport = transportRef.current;
      transportRef.current = null;
      if (activeTransport) void activeTransport.dispose();
    };
  }, [capture.captureId, stopTransport]);

  useEffect(() => {
    const target = viewportRef.current;
    const transport = transportRef.current;
    if (!target || !transport || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(() => {
        const width = Math.max(640, Math.min(1600, Math.round(entry.contentRect.width)));
        const height = Math.max(480, Math.min(1200, Math.round(width * 0.625)));
        void transport.resizeViewport(width, height).catch(() => undefined);
      }, RESIZE_DELAY_MS);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [status]);

  const clickFrame = (event: MouseEvent<HTMLImageElement>) => {
    if (!frame || status !== 'ready') return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.max(
      0,
      Math.min(frame.width, ((event.clientX - rect.left) / rect.width) * frame.width),
    );
    const y = Math.max(
      0,
      Math.min(frame.height, ((event.clientY - rect.top) / rect.height) * frame.height),
    );
    void transportRef.current?.sendPointerClick(x, y).catch(() => setStatus('interrupted'));
  };

  const scrollFrame = (event: WheelEvent<HTMLDivElement>) => {
    if (status !== 'ready' || Date.now() - lastScrollRef.current < 100) return;
    lastScrollRef.current = Date.now();
    event.preventDefault();
    const deltaX = Math.max(-5000, Math.min(5000, event.deltaX));
    const deltaY = Math.max(-5000, Math.min(5000, event.deltaY));
    void transportRef.current?.sendScroll(deltaX, deltaY).catch(() => setStatus('interrupted'));
  };

  const typeIntoFrame = (event: KeyboardEvent<HTMLDivElement>) => {
    if (status !== 'ready' || event.ctrlKey || event.metaKey || event.altKey) return;
    if (allowedKeys.has(event.key)) {
      event.preventDefault();
      void transportRef.current?.sendKeyPress(event.key).catch(() => setStatus('interrupted'));
    } else if (event.key.length === 1) {
      event.preventDefault();
      void transportRef.current?.sendTextInput(event.key).catch(() => setStatus('interrupted'));
    }
  };

  const complete = async () => {
    setChecking(true);
    setError(null);
    setResultMessage(null);
    try {
      const result = await onComplete();
      if (
        [
          ExternalSessionCaptureStatus.Completed,
          ExternalSessionCaptureStatus.Failed,
          ExternalSessionCaptureStatus.Expired,
          ExternalSessionCaptureStatus.Cancelled,
        ].includes(result.status)
      ) {
        await stopTransport();
      } else {
        setResultMessage(
          result.message ||
            'Complete any remaining sign-in or verification step in the secure site window.',
        );
      }
    } catch {
      setError('Career Harbor could not confirm the connection. Please start sign-in again.');
    } finally {
      setChecking(false);
    }
  };

  const cancel = async () => {
    await stopTransport();
    await onCancel();
  };

  return (
    <Stack spacing={2} aria-label={`Secure sign-in to ${capture.displayName}`}>
      <Box>
        <Typography component="h3" variant="h6">
          Secure sign-in to {capture.displayName}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Sign in directly on the external site shown here. Career Harbor does not ask for or store
          your external-site password. Complete verification directly in the secure site window.
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" aria-live="assertive">
          {error}
        </Alert>
      )}
      {resultMessage && (
        <Alert severity="info" aria-live="polite">
          {resultMessage}
        </Alert>
      )}
      {status === 'attaching' && (
        <Stack alignItems="center" direction="row" gap={1} role="status" aria-live="polite">
          <CircularProgress size={20} /> Opening secure sign-in…
        </Stack>
      )}
      <Box
        aria-label={`${capture.displayName} secure browser viewport`}
        onKeyDown={typeIntoFrame}
        onWheel={scrollFrame}
        ref={viewportRef}
        role="application"
        tabIndex={0}
        sx={{
          bgcolor: 'grey.950',
          border: 2,
          borderColor: 'divider',
          borderRadius: 2,
          lineHeight: 0,
          maxWidth: '100%',
          minHeight: 220,
          overflow: 'hidden',
          outlineOffset: 3,
          position: 'relative',
          '&:focus-visible': {
            borderColor: 'primary.main',
            outline: '3px solid',
            outlineColor: 'primary.light',
          },
        }}
      >
        {frameSource ? (
          <Box
            alt={`Current ${capture.displayName} sign-in screen`}
            component="img"
            draggable={false}
            onClick={clickFrame}
            onContextMenu={(event) => event.preventDefault()}
            ref={imageRef}
            src={frameSource}
            sx={{
              display: 'block',
              height: 'auto',
              maxWidth: '100%',
              userSelect: 'none',
              width: '100%',
            }}
          />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
            <Typography color="grey.300">Waiting for the secure site…</Typography>
          </Stack>
        )}
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
        <Button
          disabled={status !== 'ready' || checking}
          onClick={() => void transportRef.current?.navigateBack()}
          startIcon={<ArrowBackOutlinedIcon />}
        >
          Back
        </Button>
        <Button disabled={status !== 'ready' || checking} onClick={complete} variant="contained">
          {checking ? 'Checking connection…' : "I've finished signing in"}
        </Button>
        <Button color="inherit" disabled={checking} onClick={cancel}>
          Cancel sign-in
        </Button>
      </Stack>
    </Stack>
  );
};
