import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Box, Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

const actions = [
  { title: 'Find jobs for you', description: 'Explore jobs that match your skills and career goals.', label: 'Browse jobs', to: ROUTES.DASHBOARD_JOBS, icon: SearchRoundedIcon, color: '#df4e18', tint: '#fff1e8', iconTint: '#ffe2d0' },
  { title: 'Get referred', description: 'Share an open role and help others discover new opportunities.', label: 'Refer a job', to: `${ROUTES.DASHBOARD_JOBS}?mode=referral`, icon: GroupsOutlinedIcon, color: '#16803c', tint: '#edfbf0', iconTint: '#d7f6dc' },
  { title: 'Prepare for interviews', description: 'Get company insights, common questions and expert tips.', label: 'Interview insights', to: ROUTES.INTERVIEW_INSIGHTS, icon: InsightsOutlinedIcon, color: '#0758d7', tint: '#edf4ff', iconTint: '#d9e8ff' },
  { title: 'Learn and grow', description: 'Connect with professionals for career planning and guidance.', label: 'Career guidance', to: ROUTES.CAREER_GUIDANCE, icon: SchoolOutlinedIcon, color: '#6728dc', tint: '#f5efff', iconTint: '#eadcff' },
] as const;

export const DashboardQuickActions = () => (
  <Box component="section" aria-label="Explore CareerHarbor">
      <Grid container spacing={1.5}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid key={action.title} size={{ xs: 6, sm: 6, lg: 3 }} sx={{ minWidth: 0 }}>
              <Card variant="outlined" sx={{ height: '100%', minWidth: 0, borderRadius: 2.5, borderColor: action.iconTint, bgcolor: action.tint, boxShadow: '0 2px 8px rgba(37, 76, 145, .045)', transition: 'border-color 160ms ease, box-shadow 160ms ease', '&:hover': { borderColor: action.color, boxShadow: '0 5px 16px rgba(15, 23, 42, 0.09)' } }}>
                <CardActionArea component={Link} to={action.to} sx={{ height: '100%', minHeight: 128, p: { xs: 1.25, sm: 1.5, md: 1.75 } }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="flex-start" sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'grid', placeItems: 'center', flex: { xs: '0 0 40px', sm: '0 0 48px' }, width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: '50%', bgcolor: action.iconTint, color: action.color }}>
                        <Icon aria-hidden="true" />
                      </Box>
                      <Stack spacing={0.4} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        <Typography component="h3" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.3, overflowWrap: 'anywhere' }}>{action.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45, overflowWrap: 'anywhere' }}>{action.description}</Typography>
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
  </Box>
);
