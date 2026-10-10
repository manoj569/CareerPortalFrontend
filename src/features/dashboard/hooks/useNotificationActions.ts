import { useAppSelector } from '@/hooks/reduxHooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { UserRole } from '@/types';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { useMarkNotificationReadMutation } from '../api/dashboardApi';
import type { DashboardNotification } from '../types/dashboardModels';
import { getNotificationDestination } from '../utils/notificationDestination';
export const useNotificationActions = () => {
  const navigate = useNavigate();
  const role = useAppSelector(selectCurrentUser)?.role ?? UserRole.Candidate;
  const [markRead] = useMarkNotificationReadMutation();
  const guard = useRef(false);
  const [busy, setBusy] = useState(false);
  const act = async (notification: DashboardNotification, open = false): Promise<boolean> => {
    if (guard.current) return false;
    const path = open ? getNotificationDestination(notification, role) : null;
    if (open && !path) return false;
    guard.current = true;
    setBusy(true);
    try {
      if (!notification.isRead) await markRead(notification.id).unwrap();
      if (path) void navigate(path);
      return true;
    } catch {
      enqueueSnackbar('Unable to mark this notification as read. Please try again.', {
        variant: 'error',
      });
      return false;
    } finally {
      guard.current = false;
      setBusy(false);
    }
  };
  return { act, busy, role };
};
