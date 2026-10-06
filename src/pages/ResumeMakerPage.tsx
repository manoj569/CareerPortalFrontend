import { Alert, Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { ResumeWorkflow } from '@/features/aiResume/components/ResumeWorkflow';
import { resumeWorkflowStorage, validResumeId } from '@/features/aiResume/services/resumeWorkflow';
export const ResumeMakerPage = () => {
  const [params, setParams] = useSearchParams();
  const sessionId = params.get('sessionId') ?? resumeWorkflowStorage.get('session');
  if (sessionId && !validResumeId(sessionId))
    return (
      <Alert
        severity="error"
        action={
          <Button
            onClick={() => {
              resumeWorkflowStorage.remove('session');
              setParams({});
            }}
          >
            Start again
          </Button>
        }
      >
        The resume session reference is invalid.
      </Alert>
    );
  return <ResumeWorkflow key={sessionId ?? 'new'} sessionId={sessionId ?? undefined} />;
};
