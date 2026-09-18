import { Chip, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';

import type { NavigationItem } from './navigationTypes';

interface NavigationListProps {
  ariaLabel?: string;
  items: NavigationItem[];
  onNavigate?: () => void;
  compact?: boolean;
}

export const NavigationList = ({
  ariaLabel = 'Primary navigation',
  items,
  onNavigate,
  compact = false,
}: NavigationListProps) => {
  const location = useLocation();
  const currentLocation = `${location.pathname}${location.search}${location.hash}`;

  return (
  <List component="nav" aria-label={ariaLabel} sx={{ px: compact ? 0.75 : 1 }}>
    {items.map(({ badge, end, icon: Icon, label, path, preserveCurrentLocation }) => (
      <Tooltip key={path} placement="right" title={compact ? label : ''}>
        <ListItemButton
          aria-label={compact ? label : undefined}
          component={NavLink}
          end={end}
          onClick={onNavigate}
          sx={{
            borderRadius: 1.5,
            justifyContent: compact ? 'center' : 'flex-start',
            mb: 0.5,
            minHeight: 44,
            px: compact ? 1 : 2,
            '&.active': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '& .MuiListItemIcon-root': { color: 'inherit' },
              '&:hover': { bgcolor: 'primary.dark' },
            },
          }}
          state={preserveCurrentLocation ? { from: currentLocation } : undefined}
          to={path}
        >
          {Icon ? (
            <ListItemIcon sx={{ color: 'text.secondary', justifyContent: 'center', minWidth: compact ? 0 : 40 }}>
              <Icon fontSize="small" />
            </ListItemIcon>
          ) : null}
          {compact ? null : <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600 }} />}
          {compact || !badge ? null : (
            <Chip label={badge} size="small" color="primary" sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
          )}
        </ListItemButton>
      </Tooltip>
    ))}
  </List>
  );
};
