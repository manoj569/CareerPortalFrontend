import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import SearchIcon from '@mui/icons-material/Search';

type ActivityCategory =
  | 'Job Update'
  | 'Candidate'
  | 'Interview'
  | 'Offer';

type ActivityGroup = 'Today' | 'Yesterday' | 'Earlier';

type JobActivity = {
  id: number;
  title: string;
  description: string;
  category: ActivityCategory;
  group: ActivityGroup;
  time: string;
  actor: string;
  candidate?: string;
};

const demoActivities: JobActivity[] = [
  {
    id: 1,
    title: 'Rohan Sharma applied for this job',
    description:
      'A new application was received for Senior React Developer.',
    category: 'Candidate',
    group: 'Today',
    time: '10:42 AM',
    actor: 'Candidate',
    candidate: 'Rohan Sharma',
  },
  {
    id: 2,
    title: 'Ananya Patel moved to Screening',
    description:
      'Candidate stage changed from Applied to Screening.',
    category: 'Candidate',
    group: 'Today',
    time: '10:15 AM',
    actor: 'Rohit Sharma',
    candidate: 'Ananya Patel',
  },
  {
    id: 3,
    title: 'Interview scheduled with Mohan Kumar',
    description:
      'Technical interview scheduled for Nov 20, 2026 at 11:30 AM.',
    category: 'Interview',
    group: 'Today',
    time: '9:30 AM',
    actor: 'Rohit Sharma',
    candidate: 'Mohan Kumar',
  },
  {
    id: 4,
    title: 'Job details updated',
    description:
      'Salary range and required skills were updated.',
    category: 'Job Update',
    group: 'Yesterday',
    time: '4:20 PM',
    actor: 'Rohit Sharma',
  },
  {
    id: 5,
    title: 'Arjun Mehta moved to Offer',
    description:
      'Candidate successfully completed the interview stage and moved to Offer.',
    category: 'Offer',
    group: 'Yesterday',
    time: '2:45 PM',
    actor: 'Rohit Sharma',
    candidate: 'Arjun Mehta',
  },
  {
    id: 6,
    title: 'Priya Kulkarni completed skills assessment',
    description:
      'Skills assessment completed with a score of 86%.',
    category: 'Candidate',
    group: 'Yesterday',
    time: '12:10 PM',
    actor: 'System',
    candidate: 'Priya Kulkarni',
  },
  {
    id: 7,
    title: 'Offer sent to Kavya Joshi',
    description:
      'Employment offer was prepared and sent to the candidate.',
    category: 'Offer',
    group: 'Yesterday',
    time: '10:25 AM',
    actor: 'Rohit Sharma',
    candidate: 'Kavya Joshi',
  },
  {
    id: 8,
    title: 'Kavya Joshi accepted the offer',
    description:
      'Candidate accepted the employment offer and moved to Hired.',
    category: 'Offer',
    group: 'Earlier',
    time: 'Nov 16, 3:15 PM',
    actor: 'Candidate',
    candidate: 'Kavya Joshi',
  },
  {
    id: 9,
    title: 'Senior React Developer was published',
    description:
      'The job became visible to candidates on CareerHarbor.',
    category: 'Job Update',
    group: 'Earlier',
    time: 'Nov 14, 11:05 AM',
    actor: 'Rohit Sharma',
  },
  {
    id: 10,
    title: 'Hiring stages configured',
    description:
      'Applied, Screening, Interview, Offer and Hired stages were configured.',
    category: 'Job Update',
    group: 'Earlier',
    time: 'Nov 14, 10:52 AM',
    actor: 'Rohit Sharma',
  },
  {
    id: 11,
    title: 'Screening configuration added',
    description:
      'Resume screening and skills assessment were enabled.',
    category: 'Job Update',
    group: 'Earlier',
    time: 'Nov 14, 10:45 AM',
    actor: 'Rohit Sharma',
  },
  {
    id: 12,
    title: 'Job created',
    description:
      'Senior React Developer was created as a new job opening.',
    category: 'Job Update',
    group: 'Earlier',
    time: 'Nov 14, 10:30 AM',
    actor: 'Rohit Sharma',
  },
];

const groups: ActivityGroup[] = [
  'Today',
  'Yesterday',
  'Earlier',
];

export const EmployerJobActivityTab = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return demoActivities.filter((activity) => {
      const matchesSearch =
        !query ||
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.actor.toLowerCase().includes(query) ||
        activity.candidate
          ?.toLowerCase()
          .includes(query);

      const matchesCategory =
        category === 'all' ||
        activity.category === category;

      const matchesTime =
        timeRange === 'all' ||
        (timeRange === 'today' &&
          activity.group === 'Today') ||
        (timeRange === 'yesterday' &&
          activity.group === 'Yesterday') ||
        (timeRange === 'earlier' &&
          activity.group === 'Earlier');

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTime
      );
    });
  }, [search, category, timeRange]);

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setTimeRange('all');
  };

  const hasFilters =
    search.trim() !== '' ||
    category !== 'all' ||
    timeRange !== 'all';

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
      }}
    >
      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.3 },
          border: '1px solid #e0e7f1',
          borderRadius: '15px',
          mb: 2,
        }}
      >
        <Box
          sx={{
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
            gap: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '11px',
                backgroundColor: '#e7f0ff',
                color: '#1261d7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccessTimeOutlinedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: '#101d37',
                }}
              >
                Activity
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: '0.76rem',
                  color: '#65738a',
                }}
              >
                Complete history of job changes and
                hiring actions.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
            sx={{
              width: {
                xs: '100%',
                lg: 'auto',
              },
            }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search activity..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        fontSize: 19,
                        color: '#65738a',
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: {
                  xs: '100%',
                  sm: 230,
                },

                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '9px',
                  fontSize: '0.74rem',
                },
              }}
            />

            <Select
              size="small"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              sx={selectStyles}
            >
              <MenuItem value="all">
                All Activity
              </MenuItem>

              <MenuItem value="Job Update">
                Job Updates
              </MenuItem>

              <MenuItem value="Candidate">
                Candidates
              </MenuItem>

              <MenuItem value="Interview">
                Interviews
              </MenuItem>

              <MenuItem value="Offer">
                Offers
              </MenuItem>
            </Select>

            <Select
              size="small"
              value={timeRange}
              onChange={(event) =>
                setTimeRange(event.target.value)
              }
              sx={selectStyles}
            >
              <MenuItem value="all">
                All Time
              </MenuItem>

              <MenuItem value="today">
                Today
              </MenuItem>

              <MenuItem value="yesterday">
                Yesterday
              </MenuItem>

              <MenuItem value="earlier">
                Earlier
              </MenuItem>
            </Select>
          </Stack>
        </Box>

        {hasFilters && (
          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
            sx={{
              mt: 1.5,
            }}
          >
            <FilterListOutlinedIcon
              sx={{
                fontSize: 17,
                color: '#68768c',
              }}
            />

            <Typography
              sx={{
                fontSize: '0.7rem',
                color: '#68768c',
              }}
            >
              Activity filters applied
            </Typography>

            <Button
              size="small"
              onClick={clearFilters}
              sx={{
                minWidth: 0,
                textTransform: 'none',
                fontSize: '0.7rem',
                fontWeight: 850,
              }}
            >
              Clear
            </Button>
          </Stack>
        )}
      </Paper>

      {/* SUMMARY */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 1.2,
          mb: 2,
        }}
      >
        <SummaryCard
          icon={<GroupsOutlinedIcon />}
          label="Candidate Events"
          value="5"
          background="#e5efff"
          color="#1261d7"
        />

        <SummaryCard
          icon={<EditOutlinedIcon />}
          label="Job Updates"
          value="4"
          background="#edf1f7"
          color="#40516d"
        />

        <SummaryCard
          icon={<EventAvailableOutlinedIcon />}
          label="Interview Events"
          value="1"
          background="#eee6ff"
          color="#6938c6"
        />

        <SummaryCard
          icon={<LocalOfferOutlinedIcon />}
          label="Offer Events"
          value="3"
          background="#fff0d7"
          color="#a85a00"
        />
      </Box>

      {/* ACTIVITY CONTENT */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e0e7f1',
          borderRadius: '15px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 1.6,
            borderBottom: '1px solid #e5ebf3',
            backgroundColor: '#fff',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: '#14213b',
                }}
              >
                Activity Timeline
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: '0.68rem',
                  color: '#748197',
                }}
              >
                Latest activity appears first.
              </Typography>
            </Box>

            <Chip
              label={`${filteredActivities.length} events`}
              size="small"
              sx={{
                backgroundColor: '#eef4fc',
                color: '#34445e',
                fontSize: '0.67rem',
                fontWeight: 850,
              }}
            />
          </Stack>
        </Box>

        {filteredActivities.length > 0 ? (
          <Box
            sx={{
              px: {
                xs: 1.5,
                md: 2.5,
              },
              py: 1.5,
            }}
          >
            {groups.map((group) => {
              const activities =
                filteredActivities.filter(
                  (activity) =>
                    activity.group === group,
                );

              if (activities.length === 0) {
                return null;
              }

              return (
                <Box
                  key={group}
                  sx={{
                    mb: 2.5,

                    '&:last-of-type': {
                      mb: 0,
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.8}
                    alignItems="center"
                    sx={{
                      mb: 1.3,
                    }}
                  >
                    <CalendarMonthOutlinedIcon
                      sx={{
                        fontSize: 17,
                        color: '#52627a',
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        color: '#34445e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {group}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      ml: {
                        xs: 0.5,
                        md: 1,
                      },
                    }}
                  >
                    {activities.map(
                      (activity, index) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          last={
                            index ===
                            activities.length - 1
                          }
                        />
                      ),
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <EmptyActivity
            onClear={clearFilters}
          />
        )}
      </Paper>

      <Typography
        sx={{
          mt: 1,
          fontSize: '0.66rem',
          color: '#7b8799',
        }}
      >
        Activity shown here is demo frontend data.
        Persistent audit history will be connected to
        the Employer activity API.
      </Typography>
    </Box>
  );
};

const ActivityItem = ({
  activity,
  last,
}: {
  activity: JobActivity;
  last: boolean;
}) => {
  const style =
    getActivityStyle(activity.category);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '42px minmax(0, 1fr)',
        gap: 1.2,
        position: 'relative',
      }}
    >
      {/* TIMELINE */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {!last && (
          <Box
            sx={{
              position: 'absolute',
              top: 37,
              bottom: -4,
              width: '1px',
              backgroundColor: '#dce4ee',
            }}
          />
        )}

        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: style.background,
            color: style.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,

            '& svg': {
              fontSize: 17,
            },
          }}
        >
          {getActivityIcon(activity.category)}
        </Box>
      </Box>

      {/* EVENT */}
      <Box
        sx={{
          pb: last ? 0.5 : 2,
        }}
      >
        <Box
          sx={{
            p: {
              xs: 1.2,
              md: 1.5,
            },
            border: '1px solid #e2e8f1',
            borderRadius: '11px',
            backgroundColor: '#fff',

            '&:hover': {
              borderColor: '#cbd8e9',
              backgroundColor: '#fcfdff',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              gap: 0.8,
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#15223d',
                  }}
                >
                  {activity.title}
                </Typography>

                <Chip
                  label={activity.category}
                  size="small"
                  sx={{
                    height: 22,
                    backgroundColor:
                      style.background,
                    color: style.color,
                    fontSize: '0.6rem',
                    fontWeight: 850,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: '0.7rem',
                  lineHeight: 1.5,
                  color: '#5e6d83',
                }}
              >
                {activity.description}
              </Typography>
            </Box>

            <Typography
              sx={{
                flexShrink: 0,
                fontSize: '0.65rem',
                color: '#7b8799',
                fontWeight: 700,
              }}
            >
              {activity.time}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{
              mt: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.64rem',
                color: '#8390a2',
              }}
            >
              By
            </Typography>

            <Typography
              sx={{
                fontSize: '0.65rem',
                color: '#40516b',
                fontWeight: 850,
              }}
            >
              {activity.actor}
            </Typography>

            {activity.candidate && (
              <>
                <Box
                  sx={{
                    width: 3,
                    height: 3,
                    borderRadius: '50%',
                    backgroundColor: '#9ba6b5',
                  }}
                />

                <Button
                  size="small"
                  startIcon={
                    <PersonAddAltOutlinedIcon />
                  }
                  sx={{
                    minWidth: 0,
                    p: 0,
                    textTransform: 'none',
                    fontSize: '0.64rem',
                    fontWeight: 850,

                    '& .MuiButton-startIcon': {
                      mr: 0.4,

                      '& svg': {
                        fontSize: 14,
                      },
                    },
                  }}
                >
                  View candidate
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
  background,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  background: string;
  color: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.4,
      border: '1px solid #e0e7f1',
      borderRadius: '12px',
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: '9px',
          backgroundColor: background,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          '& svg': {
            fontSize: 19,
          },
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: '1rem',
            fontWeight: 900,
            color: '#15223d',
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.64rem',
            color: '#69778c',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const EmptyActivity = ({
  onClear,
}: {
  onClear: () => void;
}) => (
  <Box
    sx={{
      py: 9,
      px: 2,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 58,
        height: 58,
        mx: 'auto',
        borderRadius: '50%',
        backgroundColor: '#eef3f9',
        color: '#718097',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AccessTimeOutlinedIcon />
    </Box>

    <Typography
      sx={{
        mt: 1.3,
        fontSize: '0.9rem',
        fontWeight: 900,
        color: '#34445e',
      }}
    >
      No activity found
    </Typography>

    <Typography
      sx={{
        mt: 0.4,
        fontSize: '0.72rem',
        color: '#7a879a',
      }}
    >
      Try changing your search or activity filters.
    </Typography>

    <Button
      onClick={onClear}
      size="small"
      sx={{
        mt: 1.2,
        textTransform: 'none',
        fontWeight: 850,
      }}
    >
      Clear filters
    </Button>
  </Box>
);

const getActivityStyle = (
  category: ActivityCategory,
) => {
  switch (category) {
    case 'Candidate':
      return {
        background: '#e5efff',
        color: '#1261d7',
      };

    case 'Interview':
      return {
        background: '#eee6ff',
        color: '#6938c6',
      };

    case 'Offer':
      return {
        background: '#fff0d7',
        color: '#a85a00',
      };

    case 'Job Update':
      return {
        background: '#edf1f7',
        color: '#40516d',
      };
  }
};

const getActivityIcon = (
  category: ActivityCategory,
) => {
  switch (category) {
    case 'Candidate':
      return <PersonAddAltOutlinedIcon />;

    case 'Interview':
      return <EventAvailableOutlinedIcon />;

    case 'Offer':
      return <LocalOfferOutlinedIcon />;

    case 'Job Update':
      return <DescriptionOutlinedIcon />;
  }
};

const selectStyles = {
  minWidth: 145,
  height: 40,
  borderRadius: '9px',
  fontSize: '0.72rem',
  fontWeight: 700,
};

export default EmployerJobActivityTab;