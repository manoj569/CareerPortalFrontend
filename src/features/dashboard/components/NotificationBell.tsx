import { UserRole } from '@/types';
import { useState } from 'react';
import { Badge, Button, IconButton, Popover, Stack, Typography } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { Link } from 'react-router-dom';
import { useGetNotificationsQuery } from '../api/dashboardApi';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { NotificationItem } from './NotificationItem';
import { PageLoadingIndicator } from '@/components/feedback/PageLoadingIndicator';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/hooks/reduxHooks';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
export const NotificationBell = () => {
  const authenticated = useAppSelector(selectIsAuthenticated);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const query = useGetNotificationsQuery(
    { pageNumber: 1, pageSize: 5 },
    { skip: !authenticated, pollingInterval: authenticated ? 60000 : 0,
      skipPollingIfUnfocused: true, refetchOnMountOrArgChange: true },
  );
  const { act, busy, role } = useNotificationActions();
  const count = authenticated ? query.currentData?.unreadCount : undefined;
  if (!authenticated) return null;
  return (
    <>
      <IconButton
        color="inherit"
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
        aria-expanded={Boolean(anchor)}
        aria-controls={anchor ? 'notification-preview' : undefined}
        aria-haspopup="dialog"
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ mr: 0.5 }}
      >
        <Badge badgeContent={count} color="error" max={99} invisible={!count}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 420, maxWidth: 'calc(100vw - 32px)', maxHeight: 'min(640px, 80vh)' },
          },
        }}
      >
        <Stack
          id="notification-preview"
          role="dialog"
          aria-label="Recent notifications"
          gap={1.5}
          p={2}
        >
          <Typography component="h2" fontWeight={700}>
            Notifications
          </Typography>
          {query.isLoading ? (
            <PageLoadingIndicator label="Loading notifications" />
          ) : query.isError ? (
            <ErrorState onRetry={() => void query.refetch()} />
          ) : query.currentData ? (
            <>
              <Typography>{query.currentData.unreadCount} unread</Typography>
              {!query.currentData.page.items.length && (
                <Typography>No notifications yet.</Typography>
              )}
              {query.currentData.page.items.map((notification) => (
                <NotificationItem
                  role={role}
                  compact
                  key={notification.id}
                  notification={notification}
                  busy={busy}
                  onAction={(item, open) => {
                    void act(item, open).then((success) => {
                      if (success && open) setAnchor(null);
                    });
                  }}
                />
              ))}
            </>
          ) : null}
          <Button
            component={Link}
            to={role === UserRole.Administrator ? ROUTES.ADMIN_NOTIFICATIONS : ROUTES.NOTIFICATIONS}
            onClick={() => setAnchor(null)}
          >
            View all notifications
          </Button>
        </Stack>
      </Popover>
    </>
  );
};
