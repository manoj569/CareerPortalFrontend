import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import { Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { selectCurrentUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';
import {
  useGetSavedJobsQuery,
  useRemoveSavedJobMutation,
  useSaveJobMutation,
} from '../api/dashboardApi';

interface SaveJobButtonProps {
  jobId: string;
  jobTitle: string;
  knownSaved?: boolean;
}

export const SaveJobButton = ({ jobId, jobTitle, knownSaved }: SaveJobButtonProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const isCandidate = user?.role === UserRole.Candidate;
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isFetching } = useGetSavedJobsQuery(
    { pageNumber: 1, pageSize: 100 },
    { skip: !isAuthenticated || !isCandidate || knownSaved !== undefined },
  );
  const [saveJob, saveState] = useSaveJobMutation();
  const [removeSavedJob, removeState] = useRemoveSavedJobMutation();
  const isSaved = knownSaved ?? data?.items.some((item) => item.jobId === jobId) ?? false;
  const isWorking = saveState.isLoading || removeState.isLoading;

  const handleClick = async () => {
    if (!isAuthenticated) {
      await navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    if (!isCandidate) {
      await navigate(ROUTES.UNAUTHORIZED);
      return;
    }

    try {
      if (isSaved) {
        await removeSavedJob(jobId).unwrap();
        enqueueSnackbar(`${jobTitle} was removed from saved jobs.`, { variant: 'success' });
      } else {
        await saveJob(jobId).unwrap();
        enqueueSnackbar(`${jobTitle} was saved.`, { variant: 'success' });
      }
    } catch {
      enqueueSnackbar(`Unable to ${isSaved ? 'remove' : 'save'} this job. Please try again.`, {
        variant: 'error',
      });
    }
  };

  return (
    <Button
      aria-label={`${isSaved ? 'Remove' : 'Save'} ${jobTitle}${isSaved ? ' from saved jobs' : ''}`}
      disabled={
        isWorking || (isAuthenticated && isCandidate && knownSaved === undefined && isFetching)
      }
      onClick={() => void handleClick()}
      startIcon={isSaved ? <BookmarkOutlinedIcon /> : <BookmarkBorderOutlinedIcon />}
      variant="text"
    >
      {isWorking ? 'Updating…' : isSaved ? 'Saved' : 'Save'}
    </Button>
  );
};
