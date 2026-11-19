import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ImportExportOutlinedIcon from '@mui/icons-material/ImportExportOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';

type TalentTag =
  | 'High Potential'
  | 'Ready to Hire'
  | 'Engaged'
  | 'Re-Engage';

type TalentCandidate = {
  id: number;
  name: string;
  initials: string;
  email: string;
  role: string;
  company: string;
  experience: number;
  skills: string[];
  score: number;
  tag: TalentTag;
  lastEngagement: string;
};

const talentCandidates: TalentCandidate[] = [
  {
    id: 1,
    name: 'Rohan Sharma',
    initials: 'RS',
    email: 'rohan.sharma@email.com',
    role: 'Senior Frontend Developer',
    company: 'Infosys',
    experience: 5.5,
    skills: ['React', 'TS', 'Redux', '+2'],
    score: 96,
    tag: 'High Potential',
    lastEngagement: '2 days ago',
  },
  {
    id: 2,
    name: 'Ananya Patel',
    initials: 'AP',
    email: 'ananya.patel@email.com',
    role: 'Frontend Developer',
    company: 'TCS',
    experience: 6.2,
    skills: ['React', 'Next.js', 'JS'],
    score: 94,
    tag: 'Ready to Hire',
    lastEngagement: '5 days ago',
  },
  {
    id: 3,
    name: 'Mohan Kumar',
    initials: 'MK',
    email: 'mohan.kumar@email.com',
    role: 'Software Engineer',
    company: 'Wipro',
    experience: 5.8,
    skills: ['.NET', 'SQL', 'Azure'],
    score: 92,
    tag: 'Engaged',
    lastEngagement: '1 day ago',
  },
  {
    id: 4,
    name: 'Priya Kulkarni',
    initials: 'PK',
    email: 'priya.kulkarni@email.com',
    role: 'React Developer',
    company: 'Persistent',
    experience: 4.6,
    skills: ['React', 'TS', 'MUI'],
    score: 89,
    tag: 'High Potential',
    lastEngagement: '3 days ago',
  },
  {
    id: 5,
    name: 'Arjun Mehta',
    initials: 'AM',
    email: 'arjun.mehta@email.com',
    role: 'Frontend Lead',
    company: 'Capgemini',
    experience: 7.4,
    skills: ['React', 'Angular', 'JS'],
    score: 88,
    tag: 'Re-Engage',
    lastEngagement: '12 days ago',
  },
];

const tabs = [
  { value: 'all', label: 'All Talent', count: 2486 },
  { value: 'high', label: 'High Potential', count: 312 },
  { value: 'ready', label: 'Ready to Hire', count: 96 },
  { value: 'engaged', label: 'Engaged', count: 428 },
  { value: 'reengage', label: 'Re-Engage', count: 67 },
];

export const EmployerTalentPoolPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('all');
  const [experience, setExperience] = useState('all');
  const [tag, setTag] = useState('all');
  const [period, setPeriod] = useState('any');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return talentCandidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.company.toLowerCase().includes(query) ||
        candidate.skills.some((item) =>
          item.toLowerCase().includes(query),
        );

      const matchesSkill =
        skill === 'all' ||
        candidate.skills.some(
          (item) =>
            item.toLowerCase() === skill.toLowerCase(),
        );

      const matchesExperience =
        experience === 'all' ||
        (experience === '0-3' &&
          candidate.experience <= 3) ||
        (experience === '3-5' &&
          candidate.experience > 3 &&
          candidate.experience <= 5) ||
        (experience === '5-7' &&
          candidate.experience > 5 &&
          candidate.experience <= 7) ||
        (experience === '7+' &&
          candidate.experience > 7);

      const matchesTag =
        tag === 'all' || candidate.tag === tag;

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'high' &&
          candidate.tag === 'High Potential') ||
        (activeTab === 'ready' &&
          candidate.tag === 'Ready to Hire') ||
        (activeTab === 'engaged' &&
          candidate.tag === 'Engaged') ||
        (activeTab === 'reengage' &&
          candidate.tag === 'Re-Engage');

      return (
        matchesSearch &&
        matchesSkill &&
        matchesExperience &&
        matchesTag &&
        matchesTab
      );
    });
  }, [
    search,
    skill,
    experience,
    tag,
    activeTab,
  ]);

  const allVisibleSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((candidate) =>
      selected.includes(candidate.id),
    );

  const toggleCandidate = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    const visibleIds = filteredCandidates.map(
      (candidate) => candidate.id,
    );

    if (allVisibleSelected) {
      setSelected((current) =>
        current.filter(
          (id) => !visibleIds.includes(id),
        ),
      );
      return;
    }

    setSelected((current) => [
      ...new Set([...current, ...visibleIds]),
    ]);
  };

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

        <Typography sx={breadcrumbStyle}>
          /
        </Typography>

        <Typography
          sx={{
            ...breadcrumbStyle,
            color: '#17233d',
            fontWeight: 900,
          }}
        >
          Talent Pool
        </Typography>
      </Stack>

      {/* Hero */}
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
            'linear-gradient(110deg, #f7f5ff 0%, #eef3ff 54%, #eee9ff 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            right: 70,
            top: -190,
            border:
              '38px solid rgba(91,75,255,0.05)',
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              lg: 'center',
            },
            flexDirection: {
              xs: 'column',
              lg: 'row',
            },
            gap: 1.5,
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
                  'linear-gradient(135deg, #2675f5 0%, #7b43ed 100%)',
              }}
            >
              <GroupsOutlinedIcon
                sx={{ fontSize: 27 }}
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
                Talent Pool
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  fontSize: '0.73rem',
                  color: '#425477',
                }}
              >
                Build and manage a curated talent
                pool for future hiring and priority
                roles.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate(
                  '/employer/candidates',
                )
              }
              sx={heroButton}
            >
              Add to Talent Pool
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <ImportExportOutlinedIcon />
              }
              sx={heroButton}
            >
              Import Candidates
            </Button>

            <Button
              variant="outlined"
              startIcon={
                <SettingsOutlinedIcon />
              }
              sx={heroButton}
            >
              Pool Settings
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* KPIs */}
      <Paper
        elevation={0}
        sx={{
          mt: 1.4,
          p: 1.5,
          border: '1px solid #e0e7ef',
          borderRadius: '13px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(6, 1fr)',
            },
          }}
        >
          <SummaryItem
            icon={<GroupsOutlinedIcon />}
            value="2,486"
            label="Total Talent"
            iconBg="#eee7ff"
            iconColor="#6d35e3"
          />

          <SummaryItem
            icon={<StarBorderOutlinedIcon />}
            value="312"
            label="High Potential"
            iconBg="#e5f8e9"
            iconColor="#15943c"
            border
          />

          <SummaryItem
            icon={
              <BusinessCenterOutlinedIcon />
            }
            value="96"
            label="Ready to Hire"
            iconBg="#eee7ff"
            iconColor="#6d35e3"
            border
          />

          <SummaryItem
            icon={
              <PersonSearchOutlinedIcon />
            }
            value="428"
            label="Engaged"
            iconBg="#e7f0ff"
            iconColor="#1261d7"
            border
          />

          <SummaryItem
            icon={<RefreshOutlinedIcon />}
            value="67"
            label="Re-Engage"
            iconBg="#fff0dd"
            iconColor="#e36a00"
            border
          />

          <SummaryItem
            icon={
              <TrackChangesOutlinedIcon />
            }
            value="89%"
            label="Profile Completeness"
            iconBg="#eee7ff"
            iconColor="#6d35e3"
            border
          />
        </Box>
      </Paper>

      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          mt: 1.4,
          p: 1.2,
          border: '1px solid #e0e7ef',
          borderRadius: '13px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg:
                '1.5fr .75fr .85fr .75fr .85fr auto',
            },
            gap: 0.9,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, skill, role or company..."
            InputProps={{
              startAdornment: (
                <SearchIcon
                  sx={{
                    mr: 0.8,
                    fontSize: 19,
                    color: '#50617a',
                  }}
                />
              ),
            }}
            sx={filterFieldStyle}
          />

          <Select
            size="small"
            value={skill}
            onChange={(event) =>
              setSkill(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Skills
            </MenuItem>
            <MenuItem value="React">
              React
            </MenuItem>
            <MenuItem value="TS">
              TypeScript
            </MenuItem>
            <MenuItem value=".NET">
              .NET
            </MenuItem>
            <MenuItem value="SQL">
              SQL
            </MenuItem>
            <MenuItem value="Azure">
              Azure
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={experience}
            onChange={(event) =>
              setExperience(
                event.target.value,
              )
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Experience
            </MenuItem>
            <MenuItem value="0-3">
              0–3 years
            </MenuItem>
            <MenuItem value="3-5">
              3–5 years
            </MenuItem>
            <MenuItem value="5-7">
              5–7 years
            </MenuItem>
            <MenuItem value="7+">
              7+ years
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={tag}
            onChange={(event) =>
              setTag(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="all">
              All Tags
            </MenuItem>
            <MenuItem value="High Potential">
              High Potential
            </MenuItem>
            <MenuItem value="Ready to Hire">
              Ready to Hire
            </MenuItem>
            <MenuItem value="Engaged">
              Engaged
            </MenuItem>
            <MenuItem value="Re-Engage">
              Re-Engage
            </MenuItem>
          </Select>

          <Select
            size="small"
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
            sx={filterSelectStyle}
          >
            <MenuItem value="any">
              Any Time
            </MenuItem>
            <MenuItem value="today">
              Today
            </MenuItem>
            <MenuItem value="week">
              This Week
            </MenuItem>
            <MenuItem value="month">
              This Month
            </MenuItem>
          </Select>

          <Stack
            direction="row"
            spacing={0.6}
          >
            <IconButton
              sx={{
                ...viewButtonStyle,
                color: '#1261e8',
                borderColor: '#1261e8',
                bgcolor: '#f3f7ff',
              }}
            >
              <TableRowsOutlinedIcon />
            </IconButton>

            <IconButton
              sx={viewButtonStyle}
            >
              <ViewAgendaOutlinedIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Content */}
      <Box
        sx={{
          mt: 1.2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1fr) 330px',
          },
          gap: 1.2,
          alignItems: 'start',
        }}
      >
        {/* Talent table */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e0e7ef',
            borderRadius: '13px',
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) =>
              setActiveTab(value)
            }
            variant="scrollable"
            scrollButtons={false}
            sx={{
              px: 1,
              borderBottom:
                '1px solid #e3e9f1',
              minHeight: 48,

              '& .MuiTab-root': {
                minHeight: 48,
                px: 2,
                textTransform: 'none',
                fontSize: '0.64rem',
                fontWeight: 900,
                color: '#263750',
              },

              '& .Mui-selected': {
                color: '#fff !important',
                bgcolor: '#1261e8',
                borderRadius: '7px',
                my: 0.6,
                minHeight: 36,
              },

              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            {tabs.map((item) => (
              <Tab
                key={item.value}
                value={item.value}
                label={`${item.label} (${item.count.toLocaleString()})`}
              />
            ))}
          </Tabs>

          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1050 }}>
              {/* Table header */}
              <Box
                sx={{
                  px: 1.1,
                  py: 0.75,
                  display: 'grid',
                  gridTemplateColumns:
                    '35px 1.55fr 1.3fr .65fr 1.25fr .7fr .9fr .85fr 50px',
                  gap: 0.8,
                  alignItems: 'center',
                  bgcolor: '#f3f6fa',
                }}
              >
                <Checkbox
                  size="small"
                  checked={
                    allVisibleSelected
                  }
                  onChange={toggleAll}
                  sx={{
                    p: 0.3,
                    '& .MuiSvgIcon-root': {
                      fontSize: 18,
                    },
                  }}
                />

                {[
                  'Candidate',
                  'Current Role / Company',
                  'Experience',
                  'Top Skills',
                  'Talent Score',
                  'Tags',
                  'Last Engagement',
                  'Actions',
                ].map((heading) => (
                  <Typography
                    key={heading}
                    sx={tableHeaderStyle}
                  >
                    {heading}
                  </Typography>
                ))}
              </Box>

              {filteredCandidates.map(
                (candidate) => (
                  <TalentRow
                    key={candidate.id}
                    candidate={candidate}
                    selected={selected.includes(
                      candidate.id,
                    )}
                    onSelect={() =>
                      toggleCandidate(
                        candidate.id,
                      )
                    }
                    onOpen={() =>
                      navigate(
                        `/employer/candidates/${candidate.id}`,
                      )
                    }
                  />
                ),
              )}

              {filteredCandidates.length ===
                0 && (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <PersonSearchOutlinedIcon
                    sx={{
                      fontSize: 36,
                      color: '#a7b2c2',
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 0.8,
                      fontSize: '0.7rem',
                      color: '#758298',
                    }}
                  >
                    No talent matches the
                    selected filters.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: 1.5,
              py: 1.2,
              borderTop:
                '1px solid #e6ebf2',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.62rem',
                color: '#40516b',
              }}
            >
              Showing 1–5 of 2,486 talents
            </Typography>

            <Stack
              direction="row"
              spacing={0.25}
              alignItems="center"
            >
              <IconButton
                size="small"
                disabled={page === 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                  )
                }
              >
                ‹
              </IconButton>

              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <Button
                    key={item}
                    onClick={() =>
                      setPage(item)
                    }
                    sx={{
                      minWidth: 31,
                      height: 31,
                      p: 0,
                      borderRadius: '7px',
                      border:
                        page === item
                          ? '1px solid #1261e8'
                          : '1px solid transparent',
                      color:
                        page === item
                          ? '#0758ce'
                          : '#35445d',
                      bgcolor:
                        page === item
                          ? '#f2f6ff'
                          : 'transparent',
                      fontSize: '0.64rem',
                      fontWeight: 900,
                    }}
                  >
                    {item}
                  </Button>
                ),
              )}

              <Typography
                sx={{
                  px: 0.5,
                  fontSize: '0.65rem',
                  color: '#53627a',
                }}
              >
                ...
              </Typography>

              <Button
                onClick={() =>
                  setPage(498)
                }
                sx={{
                  minWidth: 36,
                  height: 31,
                  p: 0,
                  color: '#35445d',
                  fontSize: '0.64rem',
                  fontWeight: 900,
                }}
              >
                498
              </Button>

              <IconButton
                size="small"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      498,
                      current + 1,
                    ),
                  )
                }
              >
                ›
              </IconButton>
            </Stack>
          </Box>
        </Paper>

        {/* Insights */}
        <Stack spacing={1.2}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              border:
                '1px solid #ded8ff',
              borderRadius: '12px',
            }}
          >
            <Box
              sx={{
                px: 1.4,
                py: 1.1,
                background:
                  'linear-gradient(135deg, #f3eaff 0%, #eee8ff 100%)',
              }}
            >
              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
              >
                <AnalyticsOutlinedIcon
                  sx={{
                    fontSize: 20,
                    color: '#6b32e4',
                  }}
                />

                <Typography
                  sx={{
                    fontSize: '0.86rem',
                    fontWeight: 950,
                    color: '#17233d',
                  }}
                >
                  Talent Pool Insights
                </Typography>
              </Stack>
            </Box>

            <Stack
              spacing={1.25}
              sx={{ p: 1.5 }}
            >
              <PoolInsight
                label="High Potential"
                value={12}
                tone="purple"
              />

              <PoolInsight
                label="Ready to Hire"
                value={4}
                tone="green"
              />

              <PoolInsight
                label="Engaged"
                value={17}
                tone="blue"
              />

              <PoolInsight
                label="Re-Engage"
                value={3}
                tone="orange"
              />

              <PoolInsight
                label="Others"
                value={64}
                tone="gray"
              />
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border:
                '1px solid #e0e7ef',
              borderRadius: '12px',
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
            >
              <AnalyticsOutlinedIcon
                sx={{
                  fontSize: 20,
                  color: '#7436e5',
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.86rem',
                  fontWeight: 950,
                  color: '#17233d',
                }}
              >
                Top Skills in Talent Pool
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 1.3,
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: 0.8,
              }}
            >
              <SkillCount
                skill="React"
                count="1,238"
              />

              <SkillCount
                skill="JavaScript"
                count="1,012"
              />

              <SkillCount
                skill="TypeScript"
                count="987"
              />

              <SkillCount
                skill=".NET"
                count="781"
              />

              <SkillCount
                skill="SQL"
                count="760"
              />

              <SkillCount
                skill="Azure"
                count="642"
              />
            </Box>
          </Paper>
        </Stack>
      </Box>

      <Typography
        sx={{
          mt: 0.8,
          fontSize: '0.61rem',
          color: '#7b8799',
        }}
      >
        Talent Pool counts and candidate data
        shown here are frontend demo data until
        the Employer Talent Pool API is
        connected.
      </Typography>
    </Box>
  );
};

const TalentRow = ({
  candidate,
  selected,
  onSelect,
  onOpen,
}: {
  candidate: TalentCandidate;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) => (
  <Box
    sx={{
      px: 1.1,
      py: 0.85,
      display: 'grid',
      gridTemplateColumns:
        '35px 1.55fr 1.3fr .65fr 1.25fr .7fr .9fr .85fr 50px',
      gap: 0.8,
      alignItems: 'center',
      borderBottom:
        '1px solid #e7ecf2',

      '&:hover': {
        bgcolor: '#fbfcff',
      },
    }}
  >
    <Checkbox
      size="small"
      checked={selected}
      onChange={onSelect}
      sx={{
        p: 0.3,

        '& .MuiSvgIcon-root': {
          fontSize: 18,
        },
      }}
    />

    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
      minWidth={0}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor:
            candidate.initials === 'AM'
              ? '#fff0dd'
              : '#eee5ff',
          color:
            candidate.initials === 'AM'
              ? '#df6a00'
              : '#6332d5',
          fontSize: '0.67rem',
          fontWeight: 950,
        }}
      >
        {candidate.initials}
      </Avatar>

      <Box minWidth={0}>
        <Button
          onClick={onOpen}
          sx={{
            p: 0,
            minWidth: 0,
            display: 'block',
            color: '#15213a',
            textTransform: 'none',
            textAlign: 'left',
            fontSize: '0.65rem',
            lineHeight: 1.3,
            fontWeight: 950,
          }}
        >
          {candidate.name}
        </Button>

        <Typography
          sx={{
            mt: 0.1,
            fontSize: '0.55rem',
            color: '#52627a',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {candidate.email}
        </Typography>
      </Box>
    </Stack>

    <Box>
      <Typography sx={rowPrimaryStyle}>
        {candidate.role}
      </Typography>

      <Typography sx={rowSecondaryStyle}>
        {candidate.company}
      </Typography>
    </Box>

    <Typography sx={rowPrimaryStyle}>
      {candidate.experience} yrs
    </Typography>

    <Stack
      direction="row"
      spacing={0.35}
      flexWrap="wrap"
      useFlexGap
    >
      {candidate.skills.map(
        (item) => (
          <Chip
            key={item}
            size="small"
            label={item}
            sx={{
              height: 23,
              bgcolor: '#e8f0ff',
              color: '#0758ce',
              fontSize: '0.52rem',
              fontWeight: 900,
            }}
          />
        ),
      )}
    </Stack>

    <Chip
      size="small"
      label={`${candidate.score}%`}
      sx={{
        width: 'fit-content',
        height: 25,
        bgcolor: '#ddf7e2',
        color: '#108438',
        fontSize: '0.59rem',
        fontWeight: 950,
      }}
    />

    <TalentTagChip
      tag={candidate.tag}
    />

    <Typography sx={rowPrimaryStyle}>
      {candidate.lastEngagement}
    </Typography>

    <IconButton
      onClick={onOpen}
      sx={actionButtonStyle}
    >
      <MoreHorizIcon
        sx={{ fontSize: 18 }}
      />
    </IconButton>
  </Box>
);

const TalentTagChip = ({
  tag,
}: {
  tag: TalentTag;
}) => {
  const styles: Record<
    TalentTag,
    {
      background: string;
      color: string;
    }
  > = {
    'High Potential': {
      background: '#eee5ff',
      color: '#6531d2',
    },

    'Ready to Hire': {
      background: '#def7e4',
      color: '#108438',
    },

    Engaged: {
      background: '#e4efff',
      color: '#0758ce',
    },

    'Re-Engage': {
      background: '#fff0dd',
      color: '#df6900',
    },
  };

  const style = styles[tag];

  return (
    <Chip
      size="small"
      label={tag}
      sx={{
        width: 'fit-content',
        height: 24,
        bgcolor: style.background,
        color: style.color,
        fontSize: '0.53rem',
        fontWeight: 900,
      }}
    />
  );
};

const PoolInsight = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone:
    | 'purple'
    | 'green'
    | 'blue'
    | 'orange'
    | 'gray';
}) => {
  const colors = {
    purple: '#7637e8',
    green: '#43a920',
    blue: '#4d9df1',
    orange: '#ff7a00',
    gray: '#a6adb7',
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mb: 0.45 }}
      >
        <Typography
          sx={{
            fontSize: '0.61rem',
            fontWeight: 850,
            color: '#263750',
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.61rem',
            fontWeight: 950,
            color: '#17233d',
          }}
        >
          {value}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 10,
          bgcolor: '#e9edf5',

          '& .MuiLinearProgress-bar': {
            borderRadius: 10,
            backgroundColor:
              colors[tone],
          },
        }}
      />
    </Box>
  );
};

const SkillCount = ({
  skill,
  count,
}: {
  skill: string;
  count: string;
}) => (
  <Stack
    direction="row"
    spacing={0.7}
    alignItems="center"
  >
    <Chip
      size="small"
      label={skill}
      sx={{
        flex: 1,
        height: 27,
        justifyContent: 'flex-start',
        bgcolor: '#e7f0ff',
        color: '#0758ce',
        fontSize: '0.59rem',
        fontWeight: 900,
      }}
    />

    <Typography
      sx={{
        minWidth: 38,
        textAlign: 'right',
        fontSize: '0.59rem',
        fontWeight: 950,
        color: '#17233d',
      }}
    >
      {count}
    </Typography>
  </Stack>
);

const SummaryItem = ({
  icon,
  value,
  label,
  iconBg,
  iconColor,
  border = false,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  iconBg: string;
  iconColor: string;
  border?: boolean;
}) => (
  <Box
    sx={{
      px: 1.2,
      minHeight: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      borderLeft: {
        xs: 'none',
        md: border
          ? '1px solid #e2e8f0'
          : 'none',
      },
    }}
  >
    <Box
      sx={{
        width: 43,
        height: 43,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        '& svg': {
          fontSize: 21,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: '1rem',
          lineHeight: 1.05,
          fontWeight: 950,
          color: '#101b38',
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 0.3,
          fontSize: '0.62rem',
          color: '#344a6c',
        }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

const breadcrumbStyle = {
  fontSize: '0.65rem',
  color: '#64748b',
};

const heroButton = {
  minHeight: 38,
  px: 1.5,
  borderRadius: '8px',
  borderColor: '#d3ddec',
  bgcolor: '#fff',
  color: '#17233d',
  textTransform: 'none',
  fontSize: '0.67rem',
  fontWeight: 900,

  '&:hover': {
    bgcolor: '#f8fbff',
    borderColor: '#bdcbe0',
  },

  '& .MuiButton-startIcon svg': {
    fontSize: 18,
  },
};

const filterFieldStyle = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: '8px',
    fontSize: '0.68rem',

    '& fieldset': {
      borderColor: '#d5deea',
    },
  },
};

const filterSelectStyle = {
  height: 40,
  borderRadius: '8px',
  fontSize: '0.68rem',
  fontWeight: 800,
  color: '#24344e',

  '& fieldset': {
    borderColor: '#d5deea',
  },
};

const viewButtonStyle = {
  width: 40,
  height: 40,
  border: '1px solid #d5deea',
  borderRadius: '8px',
  color: '#31537e',

  '& svg': {
    fontSize: 18,
  },
};

const actionButtonStyle = {
  width: 34,
  height: 34,
  border: '1px solid #dce4ef',
  borderRadius: '8px',
  color: '#344861',
};

const tableHeaderStyle = {
  fontSize: '0.58rem',
  fontWeight: 900,
  color: '#263750',
};

const rowPrimaryStyle = {
  fontSize: '0.59rem',
  fontWeight: 850,
  color: '#24344e',
};

const rowSecondaryStyle = {
  mt: 0.12,
  fontSize: '0.55rem',
  color: '#52627a',
};

export default EmployerTalentPoolPage;