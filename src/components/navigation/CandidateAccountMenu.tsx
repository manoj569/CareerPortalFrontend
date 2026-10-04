import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { apiClient } from '@/api/apiClient';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';
import { SupportDialog } from '@/features/support/SupportDialog';
import { supportRoutes, type SupportCategory } from '@/features/support/supportApi';

interface CandidateAccountMenuProps {
  email?: string;
  firstName?: string;
  lastName?: string;
  onLogout: () => void;
  profilePath: string;
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim().charAt(0) ?? '';
  const last = lastName?.trim().charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || '?';
};

export const CandidateAccountMenu = ({
  email,
  firstName,
  lastName,
  onLogout,
  profilePath,
}: CandidateAccountMenuProps) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);
  const supportCategory: SupportCategory | undefined = location.pathname.includes('payment') ? 'Payment' : location.pathname.includes('membership') ? 'Membership' : location.pathname.includes('referral') || location.search.includes('referral') ? 'Referral' : location.pathname.includes('interview-insights') ? 'InterviewInsights' : location.pathname.includes('jobs') || location.pathname.includes('applications') ? 'JobApplication' : undefined;
  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
  const open = Boolean(anchorElement);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const loadPhoto = useCallback(async () => {
    try {
      const response = await apiClient.request<Blob>({ method: 'GET', responseType: 'blob', url: API_ENDPOINTS.CANDIDATE.PROFILE_PHOTO });
      const next = URL.createObjectURL(response.data);
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = next;
      setPhotoUrl(next);
    } catch {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
      setPhotoUrl(null);
    }
  }, []);

  useEffect(() => {
    void loadPhoto();
    const refresh = () => void loadPhoto();
    window.addEventListener('careerharbor:profile-photo-changed', refresh);
    return () => {
      window.removeEventListener('careerharbor:profile-photo-changed', refresh);
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, [loadPhoto]);

  useEffect(() => {
    setAnchorElement(null);
  }, [location.pathname, location.search]);

  const closeMenu = () => setAnchorElement(null);
  const handleLogout = () => {
    closeMenu();
    onLogout();
  };

  return (
    <>
      <IconButton
        aria-controls={open ? 'candidate-account-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="menu"
        aria-label="Open account menu"
        onClick={(event: MouseEvent<HTMLButtonElement>) => setAnchorElement(event.currentTarget)}
        size="small"
        sx={{ ml: 0.5 }}
      >
        <Avatar
          aria-hidden
          imgProps={{ onError: () => { if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current); photoUrlRef.current = null; setPhotoUrl(null); } }}
          src={photoUrl ?? undefined}
          sx={{ bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 800, height: 36, width: 36 }}
        >
          {getInitials(firstName, lastName)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorElement}
        id="candidate-account-menu"
        MenuListProps={{ 'aria-label': 'Candidate account menu' }}
        onClose={closeMenu}
        open={open}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 240, maxWidth: 'calc(100vw - 24px)' } } }}
      >
        {fullName || email ? (
          <Box sx={{ maxWidth: 280, px: 2, py: 1 }}>
            {fullName ? <Typography fontWeight={800}>{fullName}</Typography> : null}
            {email ? (
              <Typography color="text.secondary" noWrap title={email} variant="body2">
                {email}
              </Typography>
            ) : null}
          </Box>
        ) : null}
        <Divider />
        <MenuItem component={Link} onClick={closeMenu} to={profilePath}>
          <ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem component={Link} onClick={closeMenu} to={ROUTES.SETTINGS}>
          <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => { closeMenu(); setSupportOpen(true); }}>Help & Support</MenuItem>
        <MenuItem component={Link} onClick={closeMenu} to={supportRoutes.tickets}>My Support Requests</MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
      {supportOpen && <SupportDialog open onClose={() => setSupportOpen(false)} initialCategory={supportCategory} />}
    </>
  );
};
