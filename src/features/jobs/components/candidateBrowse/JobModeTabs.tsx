import { Paper, Tab, Tabs } from '@mui/material';

export type CandidateBrowseMode = 'all' | 'recommended';
export type CandidateBrowseTab = CandidateBrowseMode | 'internships' | 'fresher' | 'experienced';

interface JobModeTabsProps {
  mode: CandidateBrowseTab;
  onChange: (mode: CandidateBrowseTab) => void;
  resumeMatchesEnabled: boolean;
}

export const JobModeTabs = ({ mode, onChange, resumeMatchesEnabled }: JobModeTabsProps) => (
  <Paper component="section" sx={{ px: 1 }}>
    <Tabs
      allowScrollButtonsMobile
      aria-label="Browse jobs mode"
      onChange={(_, value: CandidateBrowseTab) => onChange(value)}
      scrollButtons="auto"
      value={mode}
      variant="scrollable"
    >
      <Tab label="All jobs" value="all" />
      <Tab disabled={!resumeMatchesEnabled} label="Resume matches" value="recommended" />
      <Tab label="Internships" value="internships" />
      <Tab label="Fresher" value="fresher" />
      <Tab label="Experienced" value="experienced" />
    </Tabs>
  </Paper>
);
