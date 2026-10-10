import { UserRole } from '@/types';
import { Box, Button, Chip, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { DashboardNotification } from '../types/dashboardModels';
import { formatDashboardDate, getNotificationTypeLabel } from '../utils/dashboardFormatting';
import { getNotificationDestination } from '../utils/notificationDestination';
export const NotificationItem = ({
  notification,
  busy,
  onAction,
  compact = false,
  role = UserRole.Candidate,
}: {
  notification: DashboardNotification;
  busy: boolean;
  onAction: (notification: DashboardNotification, open: boolean) => void;
  compact?: boolean;
  role?: UserRole;
}) => {
  const path = getNotificationDestination(notification, role);
  return (
    <Paper
      component="article"
      aria-label={notification.title}
      sx={{
        borderLeft: 4,
        borderLeftColor: notification.isRead ? 'divider' : 'primary.main',
        p: compact ? 1.5 : { xs: 2, sm: 3 },
        overflowWrap: 'anywhere',
      }}
    >
      <Stack
        direction={compact ? 'column' : { xs: 'column', sm: 'row' }}
        gap={2}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
            <Typography component="h2" variant={compact ? 'subtitle1' : 'h3'}>
              {notification.title}
            </Typography>
            <Chip
              label={getNotificationTypeLabel(notification.type)}
              size="small"
              variant="outlined"
            />
            <Chip
              label={notification.isRead ? 'Read' : 'Unread'}
              size="small"
              color={notification.isRead ? 'default' : 'primary'}
            />
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
            {notification.message}
          </Typography>
          <Typography
            component="time"
            dateTime={notification.createdAtUtc}
            variant="body2"
            color="text.secondary"
          >
            {formatDashboardDate(notification.createdAtUtc) ?? 'Date unavailable'}
          </Typography>
        </Box>
        <Stack
          direction={compact ? 'row' : 'column'}
          gap={1}
          alignItems="flex-start"
          flexWrap="wrap"
          useFlexGap
        >
          {path && (
            <MuiLink
              component={Link}
              to={path}
              aria-disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                if (!busy) onAction(notification, true);
              }}
            >
              Open update
            </MuiLink>
          )}
          {!notification.isRead && (
            <Button size="small" disabled={busy} onClick={() => onAction(notification, false)}>
              Mark as read
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
