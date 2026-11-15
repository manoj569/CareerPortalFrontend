import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

import {
  getCareerPaths,
  getSkillPaths,
} from '../api/acceleratorMarketApi';
import { AcceleratorHero } from '../components/AcceleratorHero';
import { MarketPathCard } from '../components/MarketPathCard';
import type {
  AcceleratorPathType,
  MarketPathCard as MarketPathCardModel,
} from '../types/marketIntelligence';

const PAGE_SIZE = 20;

const fallbackCategories = [
  'All',
  'Software Engineering',
  'Data & AI',
  'Product',
  'Cloud & DevOps',
  'QA',
  'Business',
];

const normalizeType = (
  value: string | null,
): AcceleratorPathType =>
  value === 'skill' ? 'skill' : 'career';

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'We could not load career market data right now.';
};

export const AIAcceleratorPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pathType = normalizeType(searchParams.get('type'));

  const initialSearch = searchParams.get('search') ?? '';
  const initialCategory = searchParams.get('category') ?? 'All';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] =
    useState(initialSearch);
  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);

  const [paths, setPaths] = useState<MarketPathCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discoverySectionRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        paths
          .map((path) => path.category?.trim())
          .filter((category): category is string =>
            Boolean(category),
          ),
      ),
    );

    if (dynamicCategories.length === 0) {
      return fallbackCategories;
    }

    return ['All', ...dynamicCategories];
  }, [paths]);

  const updateUrl = useCallback(
    (
      nextType: AcceleratorPathType,
      search: string,
      category: string,
    ) => {
      const params = new URLSearchParams();

      params.set('type', nextType);

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (category && category !== 'All') {
        params.set('category', category);
      }

      setSearchParams(params, {
        replace: true,
      });
    },
    [setSearchParams],
  );

  const loadPaths = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const query = {
          search: appliedSearch.trim() || undefined,
          category:
            selectedCategory === 'All'
              ? undefined
              : selectedCategory,
          page: 1,
          pageSize: PAGE_SIZE,
        };

        const result =
          pathType === 'career'
            ? await getCareerPaths(query)
            : await getSkillPaths(query);

        setPaths(Array.isArray(result) ? result : []);
      } catch (requestError) {
        setPaths([]);
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [appliedSearch, pathType, selectedCategory],
  );

  useEffect(() => {
    void loadPaths();
  }, [loadPaths]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    value: AcceleratorPathType,
  ) => {
    setSearchInput('');
    setAppliedSearch('');
    setSelectedCategory('All');

    updateUrl(value, '', 'All');
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    setAppliedSearch(nextSearch);
    updateUrl(pathType, nextSearch, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateUrl(pathType, appliedSearch, category);
  };

  const handleStartJourney = () => {
    discoverySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleHowItWorks = () => {
    discoverySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleExplore = (path: MarketPathCardModel) => {
    /*
     * Detailed Career Path / Skill Path pages are intentionally
     * not part of Screen 1.
     *
     * Until that phase is implemented, keep the user on the
     * discovery page and expose the selected path through the URL.
     */
    const params = new URLSearchParams(searchParams);

    params.set('selected', path.id);

    setSearchParams(params);
  };

  const handleViewJobs = (path: MarketPathCardModel) => {
    const query =
      path.jobFilter?.trim() ||
      path.name.trim();

    navigate(
      `${ROUTES.DASHBOARD_JOBS}?q=${encodeURIComponent(query)}`,
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1500,
        mx: 'auto',
        px: {
          xs: 1.5,
          sm: 2,
          lg: 2.5,
        },
        py: {
          xs: 2,
          md: 2.5,
        },
      }}
    >
      <AcceleratorHero
        onStartJourney={handleStartJourney}
        onHowItWorks={handleHowItWorks}
      />

      <Box
        ref={discoverySectionRef}
        sx={{
          pt: {
            xs: 3.5,
            md: 4.5,
          },
          scrollMarginTop: 90,
        }}
      >
        <Typography
          component="h2"
          sx={{
            color: '#1c2738',
            fontWeight: 800,
            fontSize: {
              xs: '1.3rem',
              md: '1.55rem',
            },
            letterSpacing: '-0.02em',
          }}
        >
          What career do you want to accelerate?
        </Typography>

        <Typography
          sx={{
            mt: 0.65,
            color: '#6c7688',
            fontSize: '0.9rem',
          }}
        >
          Explore career paths and skills using CareerHarbor&apos;s
          current job-market intelligence.
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{
            mt: 2.25,
            display: 'flex',
            gap: 1,
            width: '100%',
            maxWidth: 760,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder={
              pathType === 'career'
                ? 'Search roles, skills or technologies…'
                : 'Search skills or technologies…'
            }
            inputProps={{
              'aria-label':
                pathType === 'career'
                  ? 'Search career paths'
                  : 'Search skill paths',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{
                      color: '#7b8799',
                      fontSize: 21,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 44,
                bgcolor: '#fff',
                borderRadius: 2,
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              minWidth: {
                xs: 92,
                sm: 110,
              },
              minHeight: 44,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            Search
          </Button>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            borderBottom: '1px solid #e7ebf1',
          }}
        >
          <Tabs
            value={pathType}
            onChange={handleTabChange}
            aria-label="Accelerator path type"
            sx={{
              minHeight: 42,
              '& .MuiTab-root': {
                minHeight: 42,
                px: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
              },
            }}
          >
            <Tab
              value="career"
              label="Career Paths"
            />

            <Tab
              value="skill"
              label="Skill Paths"
            />
          </Tabs>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{
            mt: 2,
          }}
        >
          {categories.map((category) => {
            const selected =
              selectedCategory === category;

            return (
              <Chip
                key={category}
                label={category}
                clickable
                onClick={() =>
                  handleCategoryChange(category)
                }
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                sx={{
                  height: 32,
                  borderRadius: 1.7,
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  bgcolor: selected
                    ? undefined
                    : '#fff',
                  borderColor: selected
                    ? undefined
                    : '#dce3ed',
                }}
              />
            );
          })}
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            mt: 3,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: '#253047',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              {pathType === 'career'
                ? 'Career Paths'
                : 'Skill Paths'}
            </Typography>

            {!loading && !error && (
              <Typography
                sx={{
                  mt: 0.25,
                  color: '#8490a2',
                  fontSize: '0.76rem',
                }}
              >
                {paths.length}{' '}
                {paths.length === 1
                  ? 'path'
                  : 'paths'}{' '}
                found
              </Typography>
            )}
          </Box>

          {!loading && (
            <Button
              size="small"
              startIcon={
                refreshing ? (
                  <CircularProgress
                    size={15}
                    color="inherit"
                  />
                ) : (
                  <RefreshRoundedIcon />
                )
              }
              disabled={refreshing}
              onClick={() => void loadPaths(true)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Refresh
            </Button>
          )}
        </Stack>

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => void loadPaths()}
              >
                Try again
              </Button>
            }
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            We couldn&apos;t load CareerHarbor market data.
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  p: 2.5,
                  minHeight: 320,
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  bgcolor: '#fff',
                }}
              >
                <Stack spacing={1.5}>
                  <Skeleton
                    variant="text"
                    width="55%"
                    height={30}
                  />

                  <Skeleton
                    variant="text"
                    width="35%"
                  />

                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={46}
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Skeleton
                      variant="rounded"
                      width={100}
                      height={26}
                    />
                    <Skeleton
                      variant="rounded"
                      width={85}
                      height={26}
                    />
                  </Stack>

                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={90}
                  />

                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={40}
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        ) : !error && paths.length === 0 ? (
          <Box
            sx={{
              py: 7,
              px: 2,
              textAlign: 'center',
              border: '1px dashed #d9e0ea',
              borderRadius: 3,
              bgcolor: '#fbfcfe',
            }}
          >
            <SearchRoundedIcon
              sx={{
                fontSize: 42,
                color: '#a3adbb',
              }}
            />

            <Typography
              sx={{
                mt: 1,
                color: '#344054',
                fontWeight: 800,
              }}
            >
              {pathType === 'career'
                ? 'No career paths match your search.'
                : 'No skills match your search.'}
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color: '#7b8697',
                fontSize: '0.86rem',
              }}
            >
              Try another search or select a different category.
            </Typography>

            <Button
              variant="text"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                setSelectedCategory('All');

                updateUrl(pathType, '', 'All');
              }}
              sx={{
                mt: 1.5,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Clear filters
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {paths.map((path) => (
              <MarketPathCard
                key={path.id}
                path={path}
                type={pathType}
                onExplore={handleExplore}
                onViewJobs={handleViewJobs}
              />
            ))}
          </Box>
        )}

        <Box
          sx={{
            mt: 4,
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            background:
              'linear-gradient(110deg, #0b57d0 0%, #315fda 55%, #6957d8 100%)',
            color: '#fff',
            px: {
              xs: 2.25,
              sm: 3,
            },
            py: {
              xs: 2.5,
              sm: 3,
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: -60,
              top: -80,
              width: 240,
              height: 240,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.07)',
            }}
          />

          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            alignItems={{
              xs: 'flex-start',
              md: 'center',
            }}
            spacing={2.5}
            sx={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                }}
              >
                <EmojiEventsOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: {
                      xs: '1rem',
                      sm: '1.15rem',
                    },
                  }}
                >
                  Complete the Accelerator and build your Career
                  Readiness Score
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: 'rgba(255,255,255,0.82)',
                    fontSize: '0.85rem',
                  }}
                >
                  Build your Skill Passport and showcase verified
                  progress to employers.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              endIcon={<AutoAwesomeOutlinedIcon />}
              disabled
              sx={{
                minWidth: 175,
                minHeight: 42,
                bgcolor: '#fff',
                color: '#2455bf',
                textTransform: 'none',
                fontWeight: 800,
                boxShadow: 'none',
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255,255,255,0.88)',
                  color: '#62769e',
                },
              }}
            >
              View My Progress
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};