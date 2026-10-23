import {
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { forwardRef, useEffect, useId, useState } from 'react';
import { matchPath, NavLink, useLocation, type NavLinkProps } from 'react-router-dom';
import {
  SHOW_RESUME_CHECKER_NAVIGATION,
  SHOW_RESUME_MAKER_NAVIGATION,
} from '@/constants/navigationVisibility';
import { ROUTES } from '@/constants/routes';
import type { NavigationItem } from './navigationTypes';

interface NavigationListProps {
  ariaLabel?: string;
  items: NavigationItem[];
  onNavigate?: () => void;
  onAction?: (action: string) => void;
  compact?: boolean;
}
// NavLink's pathname-only active class would also highlight ordinary jobs in referral mode.
const NavigationLink = forwardRef<HTMLAnchorElement, NavLinkProps>((props, ref) => (
  <NavLink
    {...props}
    ref={ref}
    className={() => (typeof props.className === 'string' ? props.className : '')}
  />
));
const visible = (item: NavigationItem) =>
  (SHOW_RESUME_CHECKER_NAVIGATION || item.label.trim().toLowerCase() !== 'resume checker') &&
  (SHOW_RESUME_MAKER_NAVIGATION || item.path !== ROUTES.RESUME_MAKER);
const isActive = (item: NavigationItem, pathname: string, search: string): boolean => {
  if (!item.path) return false;
  const [path, query] = item.path.split('?');
  if (item.activePaths?.some((pattern) => matchPath({ path: pattern, end: true }, pathname)))
    return true;
  if (!matchPath({ path: path!, end: item.end ?? false }, pathname)) return false;
  const params = new URLSearchParams(search);
  if (query)
    return [...new URLSearchParams(query)].every(([key, value]) => params.get(key) === value);
  // The regular jobs entry and referral jobs share a pathname.
  if (item.path === '/dashboard/jobs' && params.get('mode') === 'referral') return false;
  return true;
};
const itemSx = (compact: boolean) => ({
  borderRadius: 2,
  justifyContent: compact ? 'center' : 'flex-start',
  mb: 0.5,
  minHeight: compact ? 46 : 48,
  px: compact ? 1 : 1.75,
  '&.active': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '& .MuiListItemIcon-root': { color: 'inherit' },
    '&:hover': { bgcolor: 'primary.dark' },
  },
});
const NavigationEntry = ({
  item,
  onNavigate,
  onAction,
  compact = false,
}: {
  item: NavigationItem;
  onNavigate?: () => void;
  onAction?: (action: string) => void;
  compact?: boolean;
}) => {
  const location = useLocation();
  const children = item.children?.filter(visible);
  const active =
    children?.some((child) => isActive(child, location.pathname, location.search)) ??
    isActive(item, location.pathname, location.search);
  const [expanded, setExpanded] = useState(active);
  const childrenId = useId();
  useEffect(() => {
    if (active && children?.length) setExpanded(true);
  }, [active, location.pathname, location.search, children?.length]);
  const Icon = item.icon;
  const content = (
    <>
      {Icon && (
        <ListItemIcon
          sx={{ color: 'text.secondary', justifyContent: 'center', minWidth: compact ? 0 : 42 }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </ListItemIcon>
      )}
      {!compact && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontWeight: 650, fontSize: '0.9rem' }}
          secondary={item.secondaryLabel}
          secondaryTypographyProps={{ variant: 'caption' }}
        />
      )}
      {!compact && item.badge && (
        <Chip
          label={item.badge}
          size="small"
          color="primary"
          sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
        />
      )}
      {children?.length ? (
        expanded ? (
          <ExpandLessIcon fontSize="small" />
        ) : (
          <ExpandMoreIcon fontSize="small" />
        )
      ) : null}
    </>
  );
  return (
    <>
      <Tooltip placement="right" title={compact ? item.label : ''}>
        {children?.length ? (
          <ListItemButton
            component="button"
            type="button"
            aria-label={item.label}
            aria-expanded={expanded}
            aria-controls={childrenId}
            onClick={() => setExpanded((value) => !value)}
            sx={{ ...itemSx(compact), width: '100%', color: active ? 'primary.main' : undefined }}
          >
            {content}
          </ListItemButton>
        ) : item.action ? (
          <ListItemButton
            aria-label={item.secondaryLabel ? `${item.label}, ${item.secondaryLabel}` : item.label}
            component="button"
            onClick={() => {
              onAction?.(item.action!);
              onNavigate?.();
            }}
            sx={{ ...itemSx(compact), color: 'text.secondary', width: '100%' }}
            type="button"
          >
            {content}
          </ListItemButton>
        ) : (
          <ListItemButton
            aria-label={compact ? item.label : undefined}
            aria-current={active ? 'page' : false}
            component={NavigationLink}
            className={active ? 'active' : ''}
            end={item.end}
            onClick={onNavigate}
            sx={itemSx(compact)}
            state={
              item.preserveCurrentLocation
                ? { from: `${location.pathname}${location.search}${location.hash}` }
                : undefined
            }
            to={item.path ?? '#'}
          >
            {content}
          </ListItemButton>
        )}
      </Tooltip>
      {children?.length ? (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List
            id={childrenId}
            aria-label={`${item.label} navigation`}
            disablePadding
            sx={{ pl: compact ? 0 : 2 }}
          >
            {children.map((child) => (
              <NavigationEntry
                key={child.path}
                item={child}
                onNavigate={onNavigate}
                onAction={onAction}
                compact={compact}
              />
            ))}
          </List>
        </Collapse>
      ) : null}
    </>
  );
};
export const NavigationList = ({
  ariaLabel = 'Primary navigation',
  items,
  onNavigate,
  onAction,
  compact = false,
}: NavigationListProps) => (
  <List component="nav" aria-label={ariaLabel} sx={{ px: compact ? 0.75 : 1 }}>
    {items.filter(visible).map((item) => (
      <NavigationEntry key={item.path ?? item.action ?? item.label} item={item} onNavigate={onNavigate} onAction={onAction} compact={compact} />
    ))}
  </List>
);
