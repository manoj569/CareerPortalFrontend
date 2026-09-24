import { Box, Button, Stack, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const ReferralPremiumBanner = ({
  access,
  onAccess,
}: {
  access: 'active' | 'inactive' | 'checking' | 'unknown';
  onAccess: () => void;
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 290px' },
      gap: 3,
      borderRadius: 1.5,
      background: 'linear-gradient(110deg, #eeeeff 0%, #eaf0ff 70%, #f4f6ff 100%)',
      p: { xs: 2.5, md: 3 },
      minHeight: { md: 244 },
      color: '#101b3c',
    }}
  >
    <Stack spacing={3.5} sx={{ p: { md: 1 }, justifyContent: 'center' }}>
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box
          sx={{
            position: 'relative',
            bgcolor: '#dfdfff',
            borderRadius: 1.5,
            p: 2.5,
            flexShrink: 0,
          }}
        >
          <GroupsIcon sx={{ fontSize: 52, color: '#4940d7' }} />
          <WorkspacePremiumIcon
            sx={{ position: 'absolute', right: -5, top: -8, fontSize: 30, color: '#eebd31' }}
          />
        </Box>
        <Box>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: 22, lg: 26 }, fontWeight: 800, lineHeight: 1.3 }}
          >
            Connect with employees who can help you get referred
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 15, lineHeight: 1.6 }}>
            Get 30-day Referral Contact Access and connect with referrers across all eligible
            referral jobs.
          </Typography>
        </Box>
      </Stack>
      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        gap={2.5}
        sx={{ justifyContent: 'space-between' }}
      >
        {[
          'See employee referrers',
          'Direct contact access (LinkedIn / Email)',
          'Apply with confidence',
          'One plan. Multiple referral connections.',
        ].map((benefit) => (
          <Stack key={benefit} direction="row" alignItems="center" spacing={1.5}>
            <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 19 }} />
            <Typography sx={{ fontSize: 13 }}>{benefit}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{
        background: 'linear-gradient(#fff, #f5fff9)',
        borderRadius: 1.5,
        p: 2.5,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ color: '#28119a', fontSize: 24, fontWeight: 800 }}>
        {access === 'active' ? 'Referral Contact Access active' : '₹299 for 30 days'}
      </Typography>
      <Typography sx={{ fontSize: 14, maxWidth: 240, lineHeight: 1.5 }}>
        {access === 'active'
          ? 'Your plan covers contact access across eligible referral jobs.'
          : 'Unlock referrer contact details across all eligible referral jobs.'}
      </Typography>
      <Button
        fullWidth
        variant={access === 'active' ? 'outlined' : 'contained'}
        disabled={access === 'checking'}
        onClick={onAccess}
        endIcon={<ArrowForwardIcon />}
        sx={{ minHeight: 48, px: 2, py: 1.25, fontSize: 14 }}
      >
        {access === 'active'
          ? 'Manage access'
          : access === 'checking'
            ? 'Checking access…'
            : access === 'unknown'
              ? 'Check Referral Contact Access'
              : 'Get Referral Contact Access'}
      </Button>
      <Typography sx={{ fontSize: 13, color: '#237439', fontWeight: 600 }}>
        One plan. Many opportunities.
      </Typography>
    </Stack>
  </Box>
);
