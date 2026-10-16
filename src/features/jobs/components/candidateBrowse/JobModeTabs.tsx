import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Paper, Tab, Tabs } from '@mui/material';

export type CandidateBrowseMode = 'all' | 'recommended';

export type CandidateBrowseTab =
  CandidateBrowseMode | 'internships' | 'fresher' | 'experienced' | 'referral';

interface JobModeTabsProps {
  mode: CandidateBrowseTab;
  onChange: (mode: CandidateBrowseTab) => void;
}

export const JobModeTabs = ({ mode, onChange }: JobModeTabsProps) => (
  <Paper
    component="section"
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: 'background.paper',
    }}
  >
    <Tabs
      allowScrollButtonsMobile
      aria-label="Browse jobs mode"
      onChange={(_, value: CandidateBrowseTab) => onChange(value)}
      scrollButtons="auto"
      value={mode}
      variant="scrollable"
      sx={{
        minHeight: 52,

        '& .MuiTabs-flexContainer': {
          minHeight: 52,
        },

        '& .MuiTabs-indicator': {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },

        '& .MuiTab-root': {
          minHeight: 52,
          minWidth: 'auto',
          px: { xs: 2, sm: 2.75 },
          py: 0,
          color: 'text.secondary',
          fontSize: '0.9rem',
          fontWeight: 600,
          textTransform: 'none',
          whiteSpace: 'nowrap',
        },

        '& .MuiTab-root.Mui-selected': {
          color: 'primary.main',
          fontWeight: 700,
        },

        '& .MuiTab-root.Mui-disabled': {
          opacity: 0.45,
        },
      }}
    >
      <Tab label="All jobs" value="all" />

      <Tab
        icon={<GroupsOutlinedIcon sx={{ fontSize: 19 }} />}
        iconPosition="start"
        label="Referral jobs"
        value="referral"
      />

<Tab label="Resume matches" value="recommended" />
      <Tab label="Internships" value="internships" />

      <Tab label="Fresher" value="fresher" />

      <Tab label="Experienced" value="experienced" />
    </Tabs>
  </Paper>
);
