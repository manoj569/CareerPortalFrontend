import { useState } from 'react';
import type { ReactNode } from 'react';

import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

type SettingsSection =
  | 'general'
  | 'branding'
  | 'team'
  | 'hiring'
  | 'assessments'
  | 'automation'
  | 'integrations'
  | 'notifications'
  | 'security'
  | 'billing';

type ThemeMode = 'light' | 'dark' | 'system';

const menuItems: {
  value: SettingsSection;
  label: string;
  icon: ReactNode;
}[] = [
  {
    value: 'general',
    label: 'General',
    icon: <SettingsOutlinedIcon />,
  },
  {
    value: 'branding',
    label: 'Company & Branding',
    icon: <BusinessOutlinedIcon />,
  },
  {
    value: 'team',
    label: 'Team & Roles',
    icon: <GroupsOutlinedIcon />,
  },
  {
    value: 'hiring',
    label: 'Hiring & Workflow',
    icon: <WorkOutlineOutlinedIcon />,
  },
  {
    value: 'assessments',
    label: 'Assessments',
    icon: <BadgeOutlinedIcon />,
  },
  {
    value: 'automation',
    label: 'AI & Automation',
    icon: <AutoAwesomeOutlinedIcon />,
  },
  {
    value: 'integrations',
    label: 'Integrations',
    icon: <IntegrationInstructionsOutlinedIcon />,
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: <NotificationsNoneOutlinedIcon />,
  },
  {
    value: 'security',
    label: 'Security & Access',
    icon: <SecurityOutlinedIcon />,
  },
  {
    value: 'billing',
    label: 'Billing & Subscription',
    icon: <AccountBalanceWalletOutlinedIcon />,
  },
];

export const EmployerSettingsPage = () => {
  const [section, setSection] =
    useState<SettingsSection>('general');

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        maxWidth: 1700,
        mx: 'auto',
      }}
    >
      {/* Breadcrumb */}
      <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
        sx={{ mb: 1.3 }}
      >
        <Typography sx={breadcrumbStyle}>
          CareerHarbor
        </Typography>

        <Typography sx={breadcrumbStyle}>/</Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Settings
        </Typography>
      </Stack>

      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #dddfff',
          borderRadius: '14px',
          px: { xs: 1.8, md: 2.4 },
          py: 1.8,
          background:
            'linear-gradient(110deg,#f7f5ff 0%,#eef3ff 54%,#eee9ff 100%)',
        }}
      >
        <Stack
          direction="row"
          spacing={1.3}
          alignItems="center"
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '11px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg,#2675f5 0%,#7b43ed 100%)',
            }}
          >
            <SettingsOutlinedIcon
              sx={{ fontSize: 28 }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: '1.15rem',
                  md: '1.42rem',
                },
                fontWeight: 950,
                color: '#0f1b39',
              }}
            >
              Settings
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                fontSize: '0.73rem',
                color: '#425477',
              }}
            >
              Configure your account, team,
              automation and hiring preferences.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Main settings */}
      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '270px minmax(0,1fr)',
          },
          gap: 1.3,
          alignItems: 'stretch',
        }}
      >
        <SettingsNavigation
          active={section}
          onChange={setSection}
        />

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.4, md: 2 },
            minHeight: 650,
            border: '1px solid #dfe6ef',
            borderRadius: '13px',
          }}
        >
          {section === 'general' && (
            <GeneralSettings />
          )}

          {section === 'branding' && (
            <BrandingSettings />
          )}

          {section === 'team' && (
            <TeamSettings />
          )}

          {section === 'hiring' && (
            <HiringSettings />
          )}

          {section === 'assessments' && (
            <AssessmentSettings />
          )}

          {section === 'automation' && (
            <AutomationSettings />
          )}

          {section === 'integrations' && (
            <IntegrationSettings />
          )}

          {section === 'notifications' && (
            <NotificationSettings />
          )}

          {section === 'security' && (
            <SecuritySettings />
          )}

          {section === 'billing' && (
            <BillingSettings />
          )}
        </Paper>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Settings are currently frontend demo
        controls until the Employer Settings API is
        connected.
      </Typography>
    </Box>
  );
};

/* =========================
   NAVIGATION
========================= */

const SettingsNavigation = ({
  active,
  onChange,
}: {
  active: SettingsSection;
  onChange: (value: SettingsSection) => void;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.2,
      border: '1px solid #dfe6ef',
      borderRadius: '13px',
    }}
  >
    <Stack>
      {menuItems.map((item, index) => {
        const selected = active === item.value;

        return (
          <Box key={item.value}>
            <Button
              fullWidth
              onClick={() =>
                onChange(item.value)
              }
              startIcon={item.icon}
              sx={{
                minHeight: 48,
                px: 1.5,
                justifyContent: 'flex-start',
                borderRadius: '9px',
                textTransform: 'none',
                color: selected
                  ? '#0758ce'
                  : '#263750',
                bgcolor: selected
                  ? '#e8f0ff'
                  : 'transparent',
                fontSize: '0.67rem',
                fontWeight: selected
                  ? 950
                  : 800,

                '&:hover': {
                  bgcolor: selected
                    ? '#e8f0ff'
                    : '#f7f9fc',
                },

                '& .MuiButton-startIcon': {
                  mr: 1.2,
                  color: selected
                    ? '#0758ce'
                    : '#40516b',

                  '& svg': {
                    fontSize: 19,
                  },
                },
              }}
            >
              {item.label}
            </Button>

            {index <
              menuItems.length - 1 && (
              <Divider
                sx={{
                  mx: 1,
                  borderColor: '#edf0f5',
                }}
              />
            )}
          </Box>
        );
      })}
    </Stack>
  </Paper>
);

/* =========================
   GENERAL
========================= */

const GeneralSettings = () => {
  const [workspaceName, setWorkspaceName] =
    useState('TechNova Solutions');

  const [email, setEmail] =
    useState('hr@technova.com');

  const [phone, setPhone] =
    useState('+91 98765 43210');

  const [timezone, setTimezone] =
    useState('ist');

  const [language, setLanguage] =
    useState('english');

  const [dateFormat, setDateFormat] =
    useState('ddmmm');

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [candidateUpdates, setCandidateUpdates] =
    useState(true);

  const [calendarSync, setCalendarSync] =
    useState(true);

  const [weeklyDigest, setWeeklyDigest] =
    useState(false);

  const [theme, setTheme] =
    useState<ThemeMode>('light');

  return (
    <Box>
      <SettingsHeader
        title="General Settings"
        description="Manage your account and workspace preferences."
      />

      <SettingsCard title="Account Information">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3,1fr)',
            },
            gap: 1.5,
          }}
        >
          <FieldGroup
            label="Workspace Name"
            required
          >
            <TextField
              fullWidth
              size="small"
              value={workspaceName}
              onChange={(event) =>
                setWorkspaceName(
                  event.target.value,
                )
              }
              sx={inputStyle}
            />
          </FieldGroup>

          <FieldGroup
            label="Contact Email"
            required
          >
            <TextField
              fullWidth
              size="small"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              sx={inputStyle}
            />
          </FieldGroup>

          <FieldGroup label="Phone Number">
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              sx={inputStyle}
            />
          </FieldGroup>

          <FieldGroup label="Time Zone">
            <Select
              fullWidth
              size="small"
              value={timezone}
              onChange={(event) =>
                setTimezone(
                  event.target.value,
                )
              }
              sx={selectStyle}
            >
              <MenuItem value="ist">
                (GMT+05:30) India Standard Time
              </MenuItem>

              <MenuItem value="utc">
                (GMT+00:00) UTC
              </MenuItem>

              <MenuItem value="est">
                (GMT-05:00) Eastern Time
              </MenuItem>
            </Select>
          </FieldGroup>

          <FieldGroup label="Language">
            <Select
              fullWidth
              size="small"
              value={language}
              onChange={(event) =>
                setLanguage(
                  event.target.value,
                )
              }
              sx={selectStyle}
            >
              <MenuItem value="english">
                English
              </MenuItem>

              <MenuItem value="hindi">
                Hindi
              </MenuItem>
            </Select>
          </FieldGroup>

          <FieldGroup label="Date Format">
            <Select
              fullWidth
              size="small"
              value={dateFormat}
              onChange={(event) =>
                setDateFormat(
                  event.target.value,
                )
              }
              sx={selectStyle}
            >
              <MenuItem value="ddmmm">
                DD MMM YYYY
              </MenuItem>

              <MenuItem value="ddmm">
                DD/MM/YYYY
              </MenuItem>

              <MenuItem value="mmdd">
                MM/DD/YYYY
              </MenuItem>
            </Select>
          </FieldGroup>
        </Box>
      </SettingsCard>

      <SettingsCard title="Platform Preferences">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            columnGap: 2,
          }}
        >
          <PreferenceSwitch
            icon={
              <NotificationsNoneOutlinedIcon />
            }
            title="Email Notifications"
            description="Get updates on applications, interviews and hiring."
            checked={emailNotifications}
            onChange={
              setEmailNotifications
            }
          />

          <PreferenceSwitch
            icon={<MailOutlineIcon />}
            title="Candidate Updates"
            description="Receive key updates from candidates."
            checked={candidateUpdates}
            onChange={setCandidateUpdates}
          />

          <PreferenceSwitch
            icon={
              <CalendarMonthOutlinedIcon />
            }
            title="Calendar Sync"
            description="Sync interview schedule with Google/Outlook."
            checked={calendarSync}
            onChange={setCalendarSync}
          />

          <PreferenceSwitch
            icon={<GridViewOutlinedIcon />}
            title="Weekly Analytics Digest"
            description="Get a weekly hiring performance summary."
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </Box>

        <Divider sx={{ my: 1.4 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '330px 1fr',
            },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <PaletteOutlinedIcon
              sx={{
                color: '#344861',
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  color: '#263750',
                }}
              >
                Theme
              </Typography>

              <Typography
                sx={{
                  mt: 0.1,
                  fontSize: '0.56rem',
                  color: '#64748b',
                }}
              >
                Choose your preferred interface
                theme.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3,1fr)',
              border:
                '1px solid #d5deea',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <ThemeButton
              active={theme === 'light'}
              icon={<LightModeOutlinedIcon />}
              label="Light"
              onClick={() =>
                setTheme('light')
              }
            />

            <ThemeButton
              active={theme === 'dark'}
              icon={<DarkModeOutlinedIcon />}
              label="Dark"
              onClick={() =>
                setTheme('dark')
              }
            />

            <ThemeButton
              active={theme === 'system'}
              icon={<GridViewOutlinedIcon />}
              label="System"
              onClick={() =>
                setTheme('system')
              }
            />
          </Box>
        </Box>
      </SettingsCard>
    </Box>
  );
};

/* =========================
   COMPANY & BRANDING
========================= */

const BrandingSettings = () => (
  <Box>
    <SettingsHeader
      title="Company & Branding"
      description="Manage how your employer brand appears to candidates."
    />

    <SettingsCard title="Brand Identity">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 1.5,
        }}
      >
        <FieldGroup label="Company Name">
          <TextField
            size="small"
            fullWidth
            defaultValue="TechNova Solutions"
            sx={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Company Website">
          <TextField
            size="small"
            fullWidth
            defaultValue="technova.com"
            sx={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Primary Brand Color">
          <TextField
            size="small"
            fullWidth
            defaultValue="#1261E8"
            sx={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Career Page URL">
          <TextField
            size="small"
            fullWidth
            defaultValue="careerharbor.in/company/technova"
            sx={inputStyle}
          />
        </FieldGroup>
      </Box>
    </SettingsCard>

    <SettingsCard title="Company Visibility">
      <SimpleSwitch
        title="Public Company Profile"
        description="Allow candidates to discover your employer profile."
        defaultChecked
      />

      <SimpleSwitch
        title="Show Company Rating"
        description="Display company rating on public jobs and company profile."
        defaultChecked
      />

      <SimpleSwitch
        title="Show Team Members"
        description="Display selected leadership and recruiting team members."
        defaultChecked
      />
    </SettingsCard>
  </Box>
);

/* =========================
   TEAM
========================= */

const TeamSettings = () => (
  <Box>
    <SettingsHeader
      title="Team & Roles"
      description="Manage recruiters, hiring managers and workspace permissions."
      action="Invite Member"
    />

    <SettingsCard title="Workspace Members">
      <MemberRow
        initials="AK"
        name="Amit Kulkarni"
        email="amit@technova.com"
        role="Admin"
      />

      <MemberRow
        initials="PS"
        name="Priya Shah"
        email="priya@technova.com"
        role="Recruiter"
      />

      <MemberRow
        initials="RM"
        name="Rahul Mehta"
        email="rahul@technova.com"
        role="Hiring Manager"
      />
    </SettingsCard>

    <SettingsCard title="Role Permissions">
      <SimpleSwitch
        title="Recruiters can publish jobs"
        description="Allow recruiter-role users to publish jobs without admin approval."
        defaultChecked
      />

      <SimpleSwitch
        title="Hiring managers can move candidates"
        description="Allow hiring managers to update pipeline stages."
        defaultChecked
      />

      <SimpleSwitch
        title="Restrict analytics access"
        description="Only admins can access organization-wide analytics."
      />
    </SettingsCard>
  </Box>
);

/* =========================
   HIRING
========================= */

const HiringSettings = () => (
  <Box>
    <SettingsHeader
      title="Hiring & Workflow"
      description="Configure default hiring stages and recruitment workflow."
    />

    <SettingsCard title="Default Hiring Pipeline">
      {[
        'Applied',
        'Screening',
        'Interview',
        'Offer',
        'Hired',
      ].map((stage, index) => (
        <Box
          key={stage}
          sx={{
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom:
              index === 4
                ? 'none'
                : '1px solid #edf0f5',
          }}
        >
          <Box
            sx={{
              width: 25,
              height: 25,
              borderRadius: '50%',
              bgcolor: '#e9f0ff',
              color: '#0758ce',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.57rem',
              fontWeight: 950,
            }}
          >
            {index + 1}
          </Box>

          <Typography
            sx={{
              flex: 1,
              fontSize: '0.64rem',
              fontWeight: 850,
              color: '#263750',
            }}
          >
            {stage}
          </Typography>

          <Button sx={miniAction}>
            Configure
          </Button>
        </Box>
      ))}
    </SettingsCard>

    <SettingsCard title="Workflow Rules">
      <SimpleSwitch
        title="Auto-archive rejected candidates"
        description="Automatically archive candidates after rejection."
        defaultChecked
      />

      <SimpleSwitch
        title="Candidate stage notifications"
        description="Notify candidates when their hiring stage changes."
        defaultChecked
      />

      <SimpleSwitch
        title="Require interview feedback"
        description="Require scorecard submission before advancing candidates."
        defaultChecked
      />
    </SettingsCard>
  </Box>
);

/* =========================
   ASSESSMENTS
========================= */

const AssessmentSettings = () => (
  <Box>
    <SettingsHeader
      title="Assessments"
      description="Configure candidate assessments and screening thresholds."
    />

    <SettingsCard title="Assessment Defaults">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1fr 1fr',
          },
          gap: 1.5,
        }}
      >
        <FieldGroup label="Default Passing Score">
          <TextField
            size="small"
            fullWidth
            defaultValue="70%"
            sx={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Assessment Expiry">
          <Select
            size="small"
            fullWidth
            defaultValue="7"
            sx={selectStyle}
          >
            <MenuItem value="3">
              3 days
            </MenuItem>
            <MenuItem value="7">
              7 days
            </MenuItem>
            <MenuItem value="14">
              14 days
            </MenuItem>
          </Select>
        </FieldGroup>
      </Box>
    </SettingsCard>

    <SettingsCard title="Assessment Rules">
      <SimpleSwitch
        title="Auto-shortlist high scorers"
        description="Automatically shortlist candidates above your configured threshold."
        defaultChecked
      />

      <SimpleSwitch
        title="Allow assessment retakes"
        description="Candidates may retake eligible assessments."
      />

      <SimpleSwitch
        title="AI assessment analysis"
        description="Use AI to summarize candidate assessment performance."
        defaultChecked
      />
    </SettingsCard>
  </Box>
);

/* =========================
   AI AUTOMATION
========================= */

const AutomationSettings = () => (
  <Box>
    <SettingsHeader
      title="AI & Automation"
      description="Control AI-assisted recruitment and workflow automation."
    />

    <SettingsCard title="AI Recruitment">
      <SimpleSwitch
        title="AI Candidate Matching"
        description="Rank candidates against job requirements using AI."
        defaultChecked
      />

      <SimpleSwitch
        title="AI Resume Screening"
        description="Generate candidate-job fit insights from resume data."
        defaultChecked
      />

      <SimpleSwitch
        title="AI Interview Insights"
        description="Generate structured interview summaries and insights."
      />
    </SettingsCard>

    <SettingsCard title="Automation">
      <SimpleSwitch
        title="Automatic interview reminders"
        description="Send reminders before scheduled interviews."
        defaultChecked
      />

      <SimpleSwitch
        title="Automatic candidate follow-up"
        description="Send configured follow-ups to inactive candidates."
      />

      <SimpleSwitch
        title="Pipeline automation"
        description="Run configured actions when candidates change stages."
        defaultChecked
      />
    </SettingsCard>
  </Box>
);

/* =========================
   INTEGRATIONS
========================= */

const IntegrationSettings = () => (
  <Box>
    <SettingsHeader
      title="Integrations"
      description="Connect external tools used by your hiring team."
    />

    <SettingsCard title="Connected Services">
      <IntegrationRow
        name="Google Calendar"
        description="Interview scheduling and calendar synchronization."
        status="Connected"
      />

      <IntegrationRow
        name="Microsoft Outlook"
        description="Email and calendar synchronization."
        status="Not Connected"
      />

      <IntegrationRow
        name="Microsoft Teams"
        description="Create interview meeting links."
        status="Not Connected"
      />

      <IntegrationRow
        name="Slack"
        description="Send hiring notifications to your team."
        status="Connected"
      />
    </SettingsCard>
  </Box>
);

/* =========================
   NOTIFICATIONS
========================= */

const NotificationSettings = () => (
  <Box>
    <SettingsHeader
      title="Notifications"
      description="Choose which recruitment events should notify you."
    />

    <SettingsCard title="Candidate Notifications">
      <SimpleSwitch
        title="New applications"
        description="Notify me when a candidate applies to an active job."
        defaultChecked
      />

      <SimpleSwitch
        title="Candidate messages"
        description="Notify me when candidates send new messages."
        defaultChecked
      />

      <SimpleSwitch
        title="Assessment completed"
        description="Notify me when a candidate completes an assessment."
        defaultChecked
      />
    </SettingsCard>

    <SettingsCard title="Interview Notifications">
      <SimpleSwitch
        title="Interview reminders"
        description="Notify interviewers before scheduled interviews."
        defaultChecked
      />

      <SimpleSwitch
        title="Interview feedback pending"
        description="Remind interviewers to submit feedback."
        defaultChecked
      />
    </SettingsCard>
  </Box>
);

/* =========================
   SECURITY
========================= */

const SecuritySettings = () => (
  <Box>
    <SettingsHeader
      title="Security & Access"
      description="Manage account security and workspace access controls."
    />

    <SettingsCard title="Authentication">
      <SimpleSwitch
        title="Multi-factor authentication"
        description="Require MFA for administrators."
        defaultChecked
      />

      <SimpleSwitch
        title="Require strong passwords"
        description="Enforce stronger password requirements for team members."
        defaultChecked
      />

      <SimpleSwitch
        title="Automatic session timeout"
        description="Sign inactive users out automatically."
        defaultChecked
      />
    </SettingsCard>

    <SettingsCard title="Access Control">
      <SettingsInfoRow
        icon={<LockOutlinedIcon />}
        title="Session Timeout"
        value="60 minutes"
      />

      <SettingsInfoRow
        icon={<SecurityOutlinedIcon />}
        title="Administrator Accounts"
        value="2 users"
      />

      <SettingsInfoRow
        icon={<GroupsOutlinedIcon />}
        title="Active Workspace Members"
        value="12 users"
      />
    </SettingsCard>
  </Box>
);

/* =========================
   BILLING
========================= */

const BillingSettings = () => (
  <Box>
    <SettingsHeader
      title="Billing & Subscription"
      description="Review your employer subscription and billing configuration."
    />

    <Paper
      elevation={0}
      sx={{
        p: 1.6,
        mb: 1.3,
        border:
          '1px solid #d8ddff',
        borderRadius: '11px',
        background:
          'linear-gradient(120deg,#f6f3ff,#eef4ff)',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.57rem',
          fontWeight: 900,
          color: '#6b45d8',
        }}
      >
        CURRENT PLAN
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: '1.05rem',
          fontWeight: 950,
          color: '#17233d',
        }}
      >
        Employer Growth
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: '0.61rem',
          color: '#52627a',
        }}
      >
        Demo subscription information until
        billing is connected.
      </Typography>

      <Button
        variant="contained"
        sx={{
          mt: 1.2,
          ...primaryButton,
        }}
      >
        Manage Subscription
      </Button>
    </Paper>

    <SettingsCard title="Billing Information">
      <SettingsInfoRow
        icon={
          <AccountBalanceWalletOutlinedIcon />
        }
        title="Billing Cycle"
        value="Monthly"
      />

      <SettingsInfoRow
        icon={<BusinessOutlinedIcon />}
        title="Company"
        value="TechNova Solutions"
      />

      <SettingsInfoRow
        icon={<MailOutlineIcon />}
        title="Billing Email"
        value="billing@technova.com"
      />
    </SettingsCard>
  </Box>
);

/* =========================
   REUSABLE
========================= */

const SettingsHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: string;
}) => (
  <Stack
    direction={{
      xs: 'column',
      sm: 'row',
    }}
    justifyContent="space-between"
    alignItems={{
      xs: 'flex-start',
      sm: 'center',
    }}
    spacing={1}
    sx={{ mb: 1.5 }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: '1.12rem',
          fontWeight: 950,
          color: '#17233d',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.2,
          fontSize: '0.65rem',
          color: '#52627a',
        }}
      >
        {description}
      </Typography>
    </Box>

    <Stack
      direction="row"
      spacing={0.7}
    >
      {!action && (
        <Button
          variant="outlined"
          sx={secondaryButton}
        >
          Discard Changes
        </Button>
      )}

      <Button
        variant="contained"
        startIcon={
          action ? undefined : (
            <SaveOutlinedIcon />
          )
        }
        sx={primaryButton}
      >
        {action ?? 'Save Changes'}
      </Button>
    </Stack>
  </Stack>
);

const SettingsCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      mb: 1.3,
      border: '1px solid #dfe6ef',
      borderRadius: '11px',
    }}
  >
    <Typography
      sx={{
        mb: 1.3,
        fontSize: '0.82rem',
        fontWeight: 950,
        color: '#17233d',
      }}
    >
      {title}
    </Typography>

    {children}
  </Paper>
);

const FieldGroup = ({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <Box>
    <Typography
      sx={{
        mb: 0.45,
        fontSize: '0.59rem',
        fontWeight: 850,
        color: '#263750',
      }}
    >
      {label}

      {required && (
        <Box
          component="span"
          sx={{
            ml: 0.25,
            color: '#e33b36',
          }}
        >
          *
        </Box>
      )}
    </Typography>

    {children}
  </Box>
);

const PreferenceSwitch = ({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <Box
    sx={{
      py: 1.15,
      display: 'grid',
      gridTemplateColumns:
        '35px minmax(0,1fr) auto',
      gap: 0.8,
      alignItems: 'center',
      borderBottom:
        '1px solid #e8edf3',
    }}
  >
    <Box
      sx={{
        color: '#263750',
        display: 'flex',

        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '0.63rem',
          fontWeight: 900,
          color: '#263750',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.1,
          fontSize: '0.54rem',
          color: '#64748b',
        }}
      >
        {description}
      </Typography>
    </Box>

    <Switch
      size="small"
      checked={checked}
      onChange={(event) =>
        onChange(event.target.checked)
      }
    />
  </Box>
);

const SimpleSwitch = ({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) => (
  <Box
    sx={{
      py: 0.9,
      display: 'flex',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 2,
      borderBottom:
        '1px solid #edf0f5',
    }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: '0.63rem',
          fontWeight: 900,
          color: '#263750',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          fontSize: '0.55rem',
          color: '#64748b',
        }}
      >
        {description}
      </Typography>
    </Box>

    <Switch
      size="small"
      defaultChecked={defaultChecked}
    />
  </Box>
);

const ThemeButton = ({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <Button
    onClick={onClick}
    startIcon={icon}
    sx={{
      minHeight: 38,
      borderRadius: 0,
      textTransform: 'none',
      fontSize: '0.61rem',
      fontWeight: active
        ? 950
        : 800,
      color: active
        ? '#0758ce'
        : '#52627a',
      bgcolor: active
        ? '#eef4ff'
        : '#fff',
      border: active
        ? '1px solid #1261e8'
        : '1px solid transparent',

      '&:hover': {
        bgcolor: active
          ? '#eef4ff'
          : '#f8fafc',
      },

      '& .MuiButton-startIcon svg': {
        fontSize: 17,
      },
    }}
  >
    {label}
  </Button>
);

const MemberRow = ({
  initials,
  name,
  email,
  role,
}: {
  initials: string;
  name: string;
  email: string;
  role: string;
}) => (
  <Box
    sx={{
      py: 1,
      display: 'grid',
      gridTemplateColumns:
        '38px minmax(0,1fr) 130px auto',
      gap: 1,
      alignItems: 'center',
      borderBottom:
        '1px solid #edf0f5',
    }}
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        bgcolor: '#e9e5ff',
        color: '#6033d4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.59rem',
        fontWeight: 950,
      }}
    >
      {initials}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '0.63rem',
          fontWeight: 900,
          color: '#263750',
        }}
      >
        {name}
      </Typography>

      <Typography
        sx={{
          fontSize: '0.53rem',
          color: '#64748b',
        }}
      >
        {email}
      </Typography>
    </Box>

    <Typography
      sx={{
        fontSize: '0.59rem',
        fontWeight: 800,
        color: '#40516b',
      }}
    >
      {role}
    </Typography>

    <Button sx={miniAction}>
      Manage
    </Button>
  </Box>
);

const IntegrationRow = ({
  name,
  description,
  status,
}: {
  name: string;
  description: string;
  status: 'Connected' | 'Not Connected';
}) => (
  <Box
    sx={{
      py: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 1,
      borderBottom:
        '1px solid #edf0f5',
    }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: '0.64rem',
          fontWeight: 900,
          color: '#263750',
        }}
      >
        {name}
      </Typography>

      <Typography
        sx={{
          mt: 0.15,
          fontSize: '0.54rem',
          color: '#64748b',
        }}
      >
        {description}
      </Typography>
    </Box>

    <Button
      variant={
        status === 'Connected'
          ? 'outlined'
          : 'contained'
      }
      sx={{
        ...miniAction,
        minWidth: 90,
      }}
    >
      {status === 'Connected'
        ? 'Manage'
        : 'Connect'}
    </Button>
  </Box>
);

const SettingsInfoRow = ({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) => (
  <Box
    sx={{
      py: 1,
      display: 'grid',
      gridTemplateColumns:
        '32px minmax(0,1fr) auto',
      gap: 0.8,
      alignItems: 'center',
      borderBottom:
        '1px solid #edf0f5',
    }}
  >
    <Box
      sx={{
        color: '#40516b',
        display: 'flex',

        '& svg': {
          fontSize: 18,
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        fontSize: '0.62rem',
        fontWeight: 850,
        color: '#263750',
      }}
    >
      {title}
    </Typography>

    <Typography
      sx={{
        fontSize: '0.6rem',
        fontWeight: 900,
        color: '#17233d',
      }}
    >
      {value}
    </Typography>
  </Box>
);

/* =========================
   STYLES
========================= */

const breadcrumbStyle = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: '7px',
    fontSize: '0.65rem',

    '& fieldset': {
      borderColor: '#ccd7e5',
    },
  },
};

const selectStyle = {
  height: 40,
  borderRadius: '7px',
  fontSize: '0.65rem',
  fontWeight: 700,
  color: '#263750',

  '& fieldset': {
    borderColor: '#ccd7e5',
  },
};

const primaryButton = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '7px',
  bgcolor: '#1261e8',
  textTransform: 'none',
  fontSize: '0.63rem',
  fontWeight: 900,
  boxShadow: 'none',

  '&:hover': {
    bgcolor: '#0758ce',
    boxShadow: 'none',
  },

  '& .MuiButton-startIcon svg': {
    fontSize: 17,
  },
};

const secondaryButton = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '7px',
  borderColor: '#ccd7e5',
  color: '#263750',
  textTransform: 'none',
  fontSize: '0.63rem',
  fontWeight: 900,
};

const miniAction = {
  minWidth: 0,
  textTransform: 'none',
  fontSize: '0.56rem',
  fontWeight: 900,
};

export default EmployerSettingsPage;