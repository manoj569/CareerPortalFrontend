import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';

import type { NavigationItem } from './navigationTypes';

interface NavigationListProps {
  ariaLabel?: string;
  items: NavigationItem[];
  onNavigate?: () => void;
}

export const NavigationList = ({
  ariaLabel = 'Primary navigation',
  items,
  onNavigate,
}: NavigationListProps) => (
  <List component="nav" aria-label={ariaLabel} sx={{ px: 1 }}>
    {items.map(({ end, icon: Icon, label, path }) => (
      <ListItemButton
        component={NavLink}
        end={end}
        key={path}
        onClick={onNavigate}
        sx={{
          borderRadius: 1.5,
          mb: 0.5,
          '&.active': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '& .MuiListItemIcon-root': { color: 'inherit' },
            '&:hover': { bgcolor: 'primary.dark' },
          },
        }}
        to={path}
      >
        {Icon ? (
          <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
            <Icon fontSize="small" />
          </ListItemIcon>
        ) : null}
        <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600 }} />
      </ListItemButton>
    ))}
  </List>
);
