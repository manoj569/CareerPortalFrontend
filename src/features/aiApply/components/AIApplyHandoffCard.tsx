import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Alert, AlertTitle, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { buildAIApplyApplicationDetailsPath } from '@/constants/routes';
import type { AIApplyApplication } from '../types/aiApplyModels';
import { getAIApplyAttentionKind } from '../utils/aiApplyActions';

const details = {
  login: {
    title: 'Sign in required',
    description:
      'This application requires you to sign in to the external job site before Career Harbor can continue.',
    icon: <LockOutlinedIcon />,
  },
  verification: {
    title: 'Verification required',
    description:
      'The job site requires a verification step that Career Harbor cannot complete automatically.',
    icon: <VerifiedUserOutlinedIcon />,
  },
  review: {
    title: 'Submission needs review',
    description:
      'Career Harbor reached the final submission step but could not safely confirm whether the application was submitted.',
    icon: <ReportProblemOutlinedIcon />,
  },
} as const;

export const AIApplyHandoffCard = ({
  application,
  continueError,
  continuing = false,
  detailed = false,
  onContinue,
}: {
  application: AIApplyApplication;
  continueError?: string | null;
  continuing?: boolean;
  detailed?: boolean;
  onContinue?: () => void;
}) => {
  const kind = getAIApplyAttentionKind(application);
  if (kind !== 'login' && kind !== 'verification' && kind !== 'review') return null;
  const item = details[kind];
  const external = application.externalApplication;
  const canOpen =
    application.actions?.canOpenExternalApplication === true &&
    external?.canOpen === true &&
    Boolean(external.url);
  const canContinue = application.actions?.canContinue === true && kind !== 'review';
  return (
    <Card variant="outlined" role="alert">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" gap={1} alignItems="center" color="warning.main">
            {item.icon}
            <Typography variant="h5" color="text.primary">
              {item.title}
            </Typography>
          </Stack>
          <Typography>{application.message || item.description}</Typography>
          {detailed && kind !== 'review' && (
            <>
              <Alert severity="info">
                <AlertTitle>Your security</AlertTitle>Career Harbor will never ask you to share your
                job-site password, OTP, or MFA secret with us.
              </Alert>
              <Typography>
                {kind === 'login'
                  ? `Sign in to ${external?.displayName || 'the application site'} in the new tab. When you have completed the required action, return here and continue.`
                  : 'Complete CAPTCHA, OTP, MFA, or other verification directly on the application site. Then return here and continue.'}
              </Typography>
              {canOpen ? (
                <Button
                  component="a"
                  href={external?.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  variant="outlined"
                >
                  Open application site
                </Button>
              ) : null}
              {canContinue && onContinue ? (
                <Button disabled={continuing} onClick={onContinue} variant="contained">
                  {continuing
                    ? 'Continuing application…'
                    : "I've completed this — Continue application"}
                </Button>
              ) : null}
              {continueError ? (
                <Alert aria-live="assertive" severity="error">
                  {continueError}
                </Alert>
              ) : null}
            </>
          )}
          {detailed && kind === 'review' && (
            <Alert severity="warning">
              We could not safely confirm whether this application was submitted. Review the
              external application before taking further action. To avoid a duplicate application,
              no automatic retry is available.
            </Alert>
          )}
          {!detailed && (
            <Button
              component={Link}
              to={buildAIApplyApplicationDetailsPath(application.id)}
              sx={{ alignSelf: { sm: 'flex-start' } }}
            >
              Review
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
