import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import type { ResumeAnalysis } from '../types/aiResumeModels';
export const WorkflowPanel = ({
  children,
  tint = 'white',
}: {
  children: React.ReactNode;
  tint?: string;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2.5, md: 3 },
      borderRadius: 2.5,
      borderColor: '#e3eaf3',
      bgcolor: tint,
      boxShadow: '0 3px 15px rgba(25,50,90,.025)',
    }}
  >
    {children}
  </Paper>
);
export const AnalysisScreen = ({
  analysis: a,
  onContinue,
  onBack,
}: {
  analysis: ResumeAnalysis;
  onContinue: () => void;
  onBack: () => void;
}) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.85fr 1fr' }, gap: 3 }}>
    <Stack spacing={2.5}>
      <Typography variant="h5" fontWeight={700}>
        2. Analyze Job Requirements
      </Typography>
      <Typography color="text.secondary">
        We’ve analyzed the job description and compared it with your resume.
      </Typography>
      <WorkflowPanel tint="#f5f9ff">
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={a.overallMatchScore}
              size={90}
              thickness={4}
              color="success"
            />
            <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <Typography variant="h5" fontWeight={700}>
                {a.overallMatchScore}%
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography fontWeight={700}>Overall Match Score</Typography>
            <Typography color="text.secondary" mt={1}>
              Your resume matches {a.overallMatchScore}% of the key requirements.
            </Typography>
          </Box>
        </Stack>
      </WorkflowPanel>
      <Typography fontWeight={700}>
        Key Skills ({a.matchedSkills.length + a.partialMatches.length + a.missingSkills.length})
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Job Skills Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary">
        CareerHarbor only uses skills and experience supported by your resume. Missing skills remain
        gaps and are not added to your resume.
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {(
          [
            { label: 'In your resume', skills: a.matchedSkills, color: 'success' },
            { label: 'Partial match', skills: a.partialMatches, color: 'warning' },
            { label: 'Not found', skills: a.missingSkills, color: 'error' },
          ] as const
        ).map((group) =>
          group.skills.map((skill, i) => (
            <Chip
              key={`${group.label}-${i}`}
              icon={<CheckCircleIcon />}
              color={group.color}
              variant="outlined"
              label={`${skill} · ${group.label}`}
            />
          )),
        )}
      </Stack>
      <WorkflowPanel tint="#fff7eb">
        <Typography color="warning.dark" fontWeight={700}>
          <LightbulbOutlinedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Key insights for your resume
        </Typography>
        <ul>
          {a.suggestions.map((text, i) => (
            <li key={i}>
              <Typography variant="body2">{text}</Typography>
            </li>
          ))}
        </ul>
      </WorkflowPanel>
      <Stack direction="row" justifyContent="space-between">
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button variant="contained" onClick={onContinue}>
          Continue to Payment →
        </Button>
      </Stack>
      <Alert severity="info">
        This is free analysis. Your complete tailored resume is generated only after using a resume
        credit.
      </Alert>
    </Stack>
    <Stack spacing={2}>
      {[
        { title: 'Job Description Highlights', values: a.jobRequirements },
        { title: 'Your Strengths', values: a.strengths },
        { title: 'Areas to Improve', values: a.areasToImprove },
      ].map((group) => (
        <WorkflowPanel key={group.title} tint="#f5f9ff">
          <Typography fontWeight={700}>{group.title}</Typography>
          <ul>
            {group.values.map((text, i) => (
              <li key={i}>
                <Typography variant="body2">{text}</Typography>
              </li>
            ))}
          </ul>
        </WorkflowPanel>
      ))}
    </Stack>
  </Box>
);
