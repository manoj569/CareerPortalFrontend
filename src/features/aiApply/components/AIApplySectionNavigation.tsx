import { Button, Stack } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
export const AIApplySectionNavigation = () => {
  const { pathname } = useLocation();
  return (
    <Stack
      aria-label="AI Apply sections"
      component="nav"
      direction="row"
      gap={1}
      sx={{ overflowX: 'auto' }}
    >
      <Button
        component={Link}
        to={ROUTES.AI_APPLY}
        variant={pathname === ROUTES.AI_APPLY ? 'contained' : 'text'}
      >
        Overview
      </Button>
      <Button
        component={Link}
        to={ROUTES.AI_APPLY_APPLICATIONS}
        variant={pathname.startsWith(ROUTES.AI_APPLY_APPLICATIONS) ? 'contained' : 'text'}
      >
        Applications
      </Button>
      <Button
        component={Link}
        to={ROUTES.AI_APPLY_QUESTIONS}
        variant={pathname.startsWith(ROUTES.AI_APPLY_QUESTIONS) ? 'contained' : 'text'}
      >
        Attention
      </Button>
      <Button
        component={Link}
        to={ROUTES.AI_APPLY_ANSWERS}
        variant={pathname.startsWith(ROUTES.AI_APPLY_ANSWERS) ? 'contained' : 'text'}
      >
        Answers
      </Button>
      <Button
        component={Link}
        to={ROUTES.AI_APPLY_SUBSCRIPTION}
        variant={pathname === ROUTES.AI_APPLY_SUBSCRIPTION ? 'contained' : 'text'}
      >
        Subscription
      </Button>
      <Button
        component={Link}
        to={ROUTES.AI_APPLY_CONNECTIONS}
        variant={pathname === ROUTES.AI_APPLY_CONNECTIONS ? 'contained' : 'text'}
      >
        Connections
      </Button>
      <Button
        component={Link}
        to={ROUTES.AI_APPLY_SETUP}
        variant={pathname === ROUTES.AI_APPLY_SETUP ? 'contained' : 'text'}
      >
        Setup
      </Button>
    </Stack>
  );
};
