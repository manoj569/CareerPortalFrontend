import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  BusinessCenterOutlined,
  CalendarMonthOutlined,
  GroupsOutlined,
  Search,
  SecurityOutlined,
  Star,
  StarBorder,
  VideocamOutlined,
} from '@mui/icons-material';

import { useGetConsultantsQuery } from '../api/profilesApi';
import { guidanceErrorMessage } from '../utils/errors';
import { guidanceRoutes } from '../utils/routes';
import { money } from '../utils/presentation';

const QUICK_EXPERTISE = [
  'Interview preparation',
  'Resume review',
  'Career transition',
  'Salary negotiation',
  'Product management',
  'Software engineering',
  'Data & AI',
  'HR & Recruitment',
];

const PAGE_SIZE = 8;

const getInitials = (name: string) => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const formatExperience = (years: number) => {
  if (years <= 0) {
    return 'Experience not specified';
  }

  const rounded = Number.isInteger(years)
    ? String(years)
    : years.toFixed(1);

  return `${rounded} ${years === 1 ? 'year' : 'years'} experience`;
};

export const MarketplacePage = () => {
  const [params, setParams] = useSearchParams();

  const page = Math.max(
    1,
    Math.min(
      1000000,
      Number(params.get('page')) || 1,
    ),
  );

  const [searchText, setSearchText] = useState(
    params.get('search') ?? '',
  );

  const [company, setCompany] = useState(
    params.get('company') ?? '',
  );

  const [role, setRole] = useState(
    params.get('role') ?? '',
  );

  const activeExpertise =
    params.get('expertise') ?? '';

  const query = useMemo(
    () => ({
      pageNumber: page,
      pageSize: PAGE_SIZE,
      search: params.get('search') || undefined,
      company: params.get('company') || undefined,
      role: params.get('role') || undefined,
      expertise:
        params.get('expertise') || undefined,
      language:
        params.get('language') || undefined,
      serviceType:
        params.get('serviceType') || undefined,
    }),
    [page, params],
  );

  const consultants = useGetConsultantsQuery(query);

  const applySearch = () => {
    const next = new URLSearchParams(params);

    if (searchText.trim()) {
      next.set('search', searchText.trim());
    } else {
      next.delete('search');
    }

    if (company.trim()) {
      next.set('company', company.trim());
    } else {
      next.delete('company');
    }

    if (role.trim()) {
      next.set('role', role.trim());
    } else {
      next.delete('role');
    }

    next.delete('page');

    setParams(next);
  };

  const selectExpertise = (expertise: string) => {
    const next = new URLSearchParams(params);

    if (
      params.get('expertise')?.toLowerCase() ===
      expertise.toLowerCase()
    ) {
      next.delete('expertise');
    } else {
      next.set('expertise', expertise);
    }

    next.delete('page');
    setParams(next);
  };

  const clearFilters = () => {
    setSearchText('');
    setCompany('');
    setRole('');
    setParams({});
  };

  return (
    <Stack spacing={3} sx={{ pb: 5 }}>
      {/* HERO */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(115deg, #eef5ff 0%, #f6f8ff 52%, #f2edff 100%)',
          p: {
            xs: 3,
            md: 4,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(25,118,210,0.06)',
            right: -70,
            top: -100,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 850,
          }}
        >
          <Typography
            variant="overline"
            color="primary.main"
            fontWeight={900}
          >
            Career Guidance
          </Typography>

          <Typography
            component="h1"
            sx={{
              mt: 0.5,
              maxWidth: 700,
              fontSize: {
                xs: '2rem',
                md: '2.75rem',
              },
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              fontWeight: 900,
              color: '#10213f',
            }}
          >
            Get expert guidance from industry
            professionals
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 2,
              maxWidth: 780,
              fontSize: {
                xs: '0.95rem',
                md: '1.05rem',
              },
              lineHeight: 1.65,
            }}
          >
            Connect with CareerHarbor-reviewed
            professionals for career guidance,
            interview preparation, resume feedback,
            role insights and more.
          </Typography>

          <Box
            sx={{
              mt: 3.5,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            {[
              {
                icon: <GroupsOutlined />,
                title: 'Industry professionals',
                text: 'Connect with professionals across different roles.',
              },
              {
                icon: <SecurityOutlined />,
                title: 'CareerHarbor reviewed',
                text: 'Consultant profiles are reviewed before publication.',
              },
              {
                icon: <VideocamOutlined />,
                title: 'One-on-one sessions',
                text: 'Choose from the services offered by each consultant.',
              },
              {
                icon: <StarBorder />,
                title: 'Published reviews',
                text: 'See eligible reviews from completed sessions.',
              },
            ].map((item) => (
              <Stack
                key={item.title}
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(25,118,210,0.09)',
                    color: 'primary.main',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>

                <Box>
                  <Typography
                    fontWeight={850}
                    variant="body2"
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.35,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* SEARCH */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 2.5,
        }}
      >
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(260px, 2fr) 1fr 1fr auto',
            },
            gap: 1.5,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search by name, company, role or expertise"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            size="small"
            value={company}
            onChange={(event) =>
              setCompany(event.target.value)
            }
            placeholder="Company"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessCenterOutlined fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            size="small"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            placeholder="Role"
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={<Search />}
            sx={{
              minWidth: 125,
              textTransform: 'none',
              fontWeight: 800,
            }}
          >
            Search
          </Button>
        </Box>

        <Stack
          direction="row"
          gap={1}
          flexWrap="wrap"
          sx={{ mt: 2 }}
        >
          {QUICK_EXPERTISE.map((expertise) => {
            const selected =
              activeExpertise.toLowerCase() ===
              expertise.toLowerCase();

            return (
              <Chip
                key={expertise}
                label={expertise}
                clickable
                color={
                  selected ? 'primary' : 'default'
                }
                variant={
                  selected ? 'filled' : 'outlined'
                }
                onClick={() =>
                  selectExpertise(expertise)
                }
                sx={{
                  fontWeight: selected ? 750 : 500,
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      {/* CONSULTANTS */}
      <Box>
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
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={900}
            >
              Find consultants
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.4 }}
            >
              Explore professionals currently available
              on CareerHarbor.
            </Typography>
          </Box>

          {params.size > 0 && (
            <Button
              size="small"
              onClick={clearFilters}
              sx={{
                textTransform: 'none',
              }}
            >
              Clear filters
            </Button>
          )}
        </Stack>

        {consultants.isLoading ? (
          <Paper
            variant="outlined"
            sx={{
              minHeight: 300,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
            }}
          >
            <Stack
              spacing={1.5}
              alignItems="center"
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Finding consultants…
              </Typography>
            </Stack>
          </Paper>
        ) : consultants.isError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                onClick={() => {
                  void consultants.refetch();
                }}
              >
                Retry
              </Button>
            }
          >
            {guidanceErrorMessage(
              consultants.error,
            )}
          </Alert>
        ) : !consultants.data?.items.length ? (
          <Paper
            variant="outlined"
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <Search
              color="primary"
              sx={{ fontSize: 46 }}
            />

            <Typography
              variant="h6"
              fontWeight={850}
              sx={{ mt: 1 }}
            >
              No consultants found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              Try another name, company, role or
              expertise.
            </Typography>

            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{ mt: 2 }}
            >
              Clear filters
            </Button>
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {consultants.data.items.map(
                (consultant) => {
                  const activeServices =
                    consultant.services.filter(
                      (service) =>
                        service.isActive,
                    );

                  const inrServices =
                    activeServices.filter(
                      (service) =>
                        service.currency.toUpperCase() ===
                        'INR',
                    );

                  const pricedServices =
                    inrServices.length > 0
                      ? inrServices
                      : activeServices;

                  const cheapest =
                    pricedServices.length > 0
                      ? pricedServices.reduce(
                          (lowest, current) =>
                            current.price <
                            lowest.price
                              ? current
                              : lowest,
                        )
                      : null;

                  return (
                    <Paper
                      key={consultant.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 360,
                        transition:
                          'transform 160ms ease, box-shadow 160ms ease',
                        '&:hover': {
                          transform:
                            'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor:
                              'primary.main',
                            fontWeight: 850,
                            fontSize: '1.15rem',
                          }}
                        >
                          {getInitials(
                            consultant.displayName,
                          )}
                        </Avatar>

                        <Box
                          sx={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Typography
                              fontWeight={900}
                              fontSize="1.05rem"
                            >
                              {
                                consultant.displayName
                              }
                            </Typography>

                            {consultant.isAcceptingBookings && (
                              <Chip
                                size="small"
                                label="Accepting bookings"
                                color="success"
                                variant="outlined"
                              />
                            )}
                          </Stack>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              lineHeight: 1.4,
                            }}
                          >
                            {
                              consultant.professionalHeadline
                            }
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        spacing={0.75}
                        sx={{ mt: 2 }}
                      >
                        {consultant.currentRole && (
                          <Typography
                            variant="body2"
                            fontWeight={650}
                          >
                            {consultant.currentRole}
                          </Typography>
                        )}

                        {consultant.companyName && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {
                              consultant.companyName
                            }
                          </Typography>
                        )}

                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <BusinessCenterOutlined
                            sx={{
                              fontSize: 17,
                              color:
                                'text.secondary',
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                          {consultant.yearsOfExperience !== null
  ? formatExperience(consultant.yearsOfExperience)
  : 'Experience not specified'}
                          </Typography>
                        </Stack>
                      </Stack>

                      {consultant.expertise.length >
                        0 && (
                        <Stack
                          direction="row"
                          gap={0.75}
                          flexWrap="wrap"
                          sx={{ mt: 2 }}
                        >
                          {consultant.expertise
                            .slice(0, 3)
                            .map((expertise) => (
                              <Chip
                                key={expertise}
                                size="small"
                                label={expertise}
                                sx={{
                                  bgcolor:
                                    '#eef5ff',
                                }}
                              />
                            ))}

                          {consultant.expertise
                            .length > 3 && (
                            <Chip
                              size="small"
                              label={`+${
                                consultant
                                  .expertise
                                  .length - 3
                              } more`}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      )}

                      <Box
                        sx={{
                          mt: 'auto',
                          pt: 2,
                        }}
                      >
                        <Divider sx={{ mb: 1.5 }} />

                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-end"
                          spacing={1}
                        >
                          <Box>
                            {consultant.averageRating ===
                            null ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                No published reviews yet
                              </Typography>
                            ) : (
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <Star
                                  sx={{
                                    fontSize: 18,
                                    color:
                                      '#f5a623',
                                  }}
                                />

                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                >
                                  {consultant.averageRating.toFixed(
                                    1,
                                  )}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  (
                                  {
                                    consultant.reviewCount
                                  }{' '}
                                  reviews)
                                </Typography>
                              </Stack>
                            )}
                          </Box>

                          {cheapest && (
                            <Box textAlign="right">
                              <Typography
                                fontWeight={900}
                                fontSize="1.05rem"
                              >
                                {money(
                                  cheapest.price,
                                  cheapest.currency,
                                )}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  cheapest.durationMinutes
                                }{' '}
                                min
                              </Typography>
                            </Box>
                          )}
                        </Stack>

                        <Button
                          fullWidth
                          variant="outlined"
                          component={Link}
                          to={guidanceRoutes.profile(
                            consultant.id,
                          )}
                          endIcon={
                            <ArrowForward />
                          }
                          sx={{
                            mt: 1.5,
                            textTransform: 'none',
                            fontWeight: 800,
                          }}
                        >
                          View profile
                        </Button>
                      </Box>
                    </Paper>
                  );
                },
              )}
            </Box>

            {consultants.data.totalPages > 1 && (
              <Stack
                alignItems="center"
                sx={{ mt: 3 }}
              >
                <Pagination
                  page={page}
                  count={
                    consultants.data.totalPages
                  }
                  color="primary"
                  onChange={(_, nextPage) => {
                    const next =
                      new URLSearchParams(params);

                    next.set(
                      'page',
                      String(nextPage),
                    );

                    setParams(next);
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* HOW IT WORKS */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{ mb: 2 }}
        >
          How it works
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {[
            {
              icon: <Search />,
              number: '1',
              title: 'Find a consultant',
              text: 'Search by name, company, role or expertise and explore available profiles.',
            },
            {
              icon: <CalendarMonthOutlined />,
              number: '2',
              title: 'Choose a service',
              text: 'Review the consultant’s services, duration, pricing and available times.',
            },
            {
              icon: <VideocamOutlined />,
              number: '3',
              title: 'Attend your session',
              text: 'Use the meeting details provided for your confirmed booking.',
            },
            {
              icon: <StarBorder />,
              number: '4',
              title: 'Share feedback',
              text: 'Eligible completed sessions can be reviewed to help other job seekers.',
            },
          ].map((item) => (
            <Stack
              key={item.number}
              direction="row"
              spacing={1.5}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: '#eef5ff',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </Box>

              <Box>
                <Typography fontWeight={850}>
                  {item.number}. {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    lineHeight: 1.55,
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>

      {/* SAFETY */}
      <Alert
        icon={<SecurityOutlined />}
        severity="warning"
        sx={{
          borderRadius: 3,
          alignItems: 'center',
        }}
      >
        <Typography fontWeight={850}>
          Independent career guidance
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 0.25 }}
        >
          Consultant sessions are independent career
          guidance and do not guarantee a job, interview
          or referral. Do not share employer-confidential
          or other sensitive information during sessions.
        </Typography>
      </Alert>
    </Stack>
  );
};