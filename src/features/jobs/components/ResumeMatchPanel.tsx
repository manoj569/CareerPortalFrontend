import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { Chip, Stack, Typography } from '@mui/material';

export interface ResumeMatch {
  matchScore: number;
  matchReasons: string[];
}

export const ResumeMatchPanel = ({ match }: { match: ResumeMatch }) => (
  <Stack spacing={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 2 }}>
    <Chip label={`${match.matchScore}% Match`} color={match.matchScore >= 85 ? 'success' : match.matchScore >= 65 ? 'info' : 'warning'} size="small" sx={{ alignSelf: 'flex-start' }} variant="outlined" />
    <Typography fontWeight={700}>Why this job matches you</Typography>
    {match.matchReasons.slice(0, 3).map((reason) => <Stack direction="row" spacing={1} key={reason}><CheckOutlinedIcon color="success" fontSize="small" /><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{reason}</Typography></Stack>)}
  </Stack>
);
