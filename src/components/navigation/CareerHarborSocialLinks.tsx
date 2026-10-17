import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';

import {
  careerHarborSocialLinks,
  type CareerHarborSocialPlatform,
} from '@/config/careerHarborSocialLinks';

const icons: Partial<Record<CareerHarborSocialPlatform, typeof LinkedInIcon>> = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  whatsapp: WhatsAppIcon,
  facebook: FacebookIcon,
};

export const CareerHarborSocialLinks = ({
  mobile = false,
  footer = false,
}: {
  mobile?: boolean;
  footer?: boolean;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const configured = careerHarborSocialLinks.filter((link) => link.url.trim());
  const primary = configured.filter((link) => link.primary);
  const more = configured.filter((link) => !link.primary);
  if (!configured.length) return null;

  const openMore = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      {!footer ? (
        <Typography color="text.secondary" display="block" sx={{ mb: 0.75 }} variant="caption">
          {mobile ? 'Follow CareerHarbor' : 'Connect with CareerHarbor'}
        </Typography>
      ) : null}
      <Stack alignItems="center" direction="row" spacing={0.25}>
        {primary.map((link) => {
          const Icon = icons[link.id] ?? OpenInNewIcon;
          return (
            <Tooltip key={link.id} title={link.label}>
              <IconButton
                aria-label={`CareerHarbor on ${link.label}`}
                component="a"
                href={link.url}
                rel="noopener noreferrer"
                size="small"
                sx={{
                  color: footer ? 'rgba(255,255,255,.68)' : undefined,
                  '&:hover': footer
                    ? { bgcolor: 'rgba(255,255,255,.1)', color: 'common.white' }
                    : undefined,
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: footer ? 'common.white' : 'primary.main',
                  },
                }}
                target="_blank"
              >
                <Icon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        })}
        {more.length > 0 ? (
          <Tooltip title="More CareerHarbor channels">
            <IconButton
              aria-controls={anchor ? 'careerharbor-social-menu' : undefined}
              aria-expanded={Boolean(anchor)}
              aria-haspopup="menu"
              aria-label="More CareerHarbor social channels"
              onClick={openMore}
              size="small"
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
      <Menu
        anchorEl={anchor}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        id="careerharbor-social-menu"
        onClose={() => setAnchor(null)}
        open={Boolean(anchor)}
        PaperProps={{ sx: { maxWidth: 'calc(100vw - 32px)' } }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {more.map((link) => {
          const Icon = icons[link.id] ?? OpenInNewIcon;
          return (
            <MenuItem
              component="a"
              href={link.url}
              key={link.id}
              onClick={() => setAnchor(null)}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              CareerHarbor on {link.label}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
