import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

const actions = [
  { title: 'Find jobs for you', description: 'Discover roles matched to your skills.', label: 'Browse jobs', to: ROUTES.DASHBOARD_JOBS, icon: SearchRoundedIcon, color: '#0b57d0', tint: '#edf4ff' },
  { title: 'Get referred', description: 'Connect with employees for referrals.', label: 'Find referral jobs', to: `${ROUTES.DASHBOARD_JOBS}?mode=referral`, icon: GroupsOutlinedIcon, color: '#13795b', tint: '#eaf7f1' },
  { title: 'Prepare for interviews', description: 'Learn from real interview experiences.', label: 'Interview insights', to: ROUTES.INTERVIEW_INSIGHTS, icon: InsightsOutlinedIcon, color: '#5140b5', tint: '#f1efff' },
  { title: 'Learn and grow', description: 'Get career guidance from experienced mentors.', label: 'Career guidance', to: ROUTES.CAREER_GUIDANCE, icon: SchoolOutlinedIcon, color: '#6541a5', tint: '#f5efff' },
] as const;

export const DashboardQuickActions = () => (
  <Box component="section" aria-labelledby="dashboard-quick-actions">
    <Stack spacing={1.5}>
      <Typography id="dashboard-quick-actions" component="h2" variant="h5" fontWeight={750}>
        Explore CareerHarbor
      </Typography>
      <Grid container spacing={1.5}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid key={action.title} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card variant="outlined" sx={{ height: '100%', borderRadius: 2.5, transition: 'border-color 160ms ease, box-shadow 160ms ease', '&:hover': { borderColor: action.color, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)' } }}>
                <CardActionArea component={Link} to={action.to} sx={{ height: '100%', minHeight: 132, p: 1.75 }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box sx={{ display: 'grid', placeItems: 'center', flex: '0 0 42px', width: 42, height: 42, borderRadius: 2, bgcolor: action.tint, color: action.color }}>
                        <Icon aria-hidden="true" />
                      </Box>
                      <Stack spacing={0.4} sx={{ minWidth: 0 }}>
                        <Typography component="h3" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.3 }}>{action.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>{action.description}</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ pt: 0.5, color: action.color }}>
                          <Typography variant="body2" fontWeight={700}>{action.label}</Typography>
                          <ArrowForwardRoundedIcon aria-hidden="true" fontSize="small" />
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  </Box>
);
