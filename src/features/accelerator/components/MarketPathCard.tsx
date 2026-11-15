import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutline';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import type {
  AcceleratorPathType,
  MarketPathCard as MarketPathCardModel,
} from '../types/marketIntelligence';

interface MarketPathCardProps {
  path: MarketPathCardModel;
  type: AcceleratorPathType;
  onExplore: (path: MarketPathCardModel) => void;
  onViewJobs: (path: MarketPathCardModel) => void;
}

const numberFormatter = new Intl.NumberFormat('en-IN');

const getDemandLabel = (
  activeJobCount: number,
): {
  label: string;
  background: string;
  color: string;
} => {
  if (activeJobCount >= 500) {
    return {
      label: 'High demand',
      background: '#eaf8ef',
      color: '#18794e',
    };
  }

  if (activeJobCount >= 100) {
    return {
      label: 'Growing demand',
      background: '#fff6df',
      color: '#946200',
    };
  }

  return {
    label: 'Market demand',
    background: '#eef3fb',
    color: '#4b5f7c',
  };
};

const isLearningPathAvailable = (status: string): boolean => {
  const normalized = status.trim().toLowerCase();

  return (
    normalized === 'available' ||
    normalized === 'active' ||
    normalized === 'published' ||
    normalized === 'ready'
  );
};

const TrendIcon = ({ value }: { value: number }) => {
  if (value > 0) {
    return (
      <TrendingUpRoundedIcon
        sx={{ fontSize: 17, color: '#18864b' }}
      />
    );
  }

  if (value < 0) {
    return (
      <TrendingDownRoundedIcon
        sx={{ fontSize: 17, color: '#c23b3b' }}
      />
    );
  }

  return (
    <TrendingFlatRoundedIcon
      sx={{ fontSize: 17, color: '#697586' }}
    />
  );
};

export const MarketPathCard = ({
  path,
  type,
  onExplore,
  onViewJobs,
}: MarketPathCardProps) => {
  const demand = getDemandLabel(path.demand.activeJobCount);
  const learningAvailable = isLearningPathAvailable(
    path.learningPathStatus,
  );

  const associations = path.topAssociations.slice(0, 6);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 3,
        borderColor: '#e2e8f0',
        boxShadow: '0 5px 18px rgba(25,39,70,0.035)',
        transition:
          'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#bdd0f3',
          boxShadow: '0 12px 28px rgba(25,39,70,0.08)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': {
            pb: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h3"
              sx={{
                color: '#1d2738',
                fontSize: '1.05rem',
                fontWeight: 800,
                lineHeight: 1.35,
              }}
            >
              {path.name}
            </Typography>

            {path.category && (
              <Typography
                sx={{
                  mt: 0.45,
                  color: '#7a8495',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                {path.category}
              </Typography>
            )}
          </Box>

          <Chip
            label={demand.label}
            size="small"
            sx={{
              flexShrink: 0,
              height: 25,
              bgcolor: demand.background,
              color: demand.color,
              fontWeight: 700,
              fontSize: 11,
            }}
          />
        </Stack>

        {path.description && (
          <Typography
            sx={{
              mt: 1.4,
              color: '#657084',
              fontSize: '0.84rem',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 42,
            }}
          >
            {path.description}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={2.25}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 2 }}
        >
          <Stack
            direction="row"
            spacing={0.65}
            alignItems="center"
          >
            <WorkOutlineRoundedIcon
              sx={{
                fontSize: 18,
                color: 'primary.main',
              }}
            />

            <Typography
              sx={{
                fontSize: '0.82rem',
                color: '#4c586d',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: '#273247',
                }}
              >
                {numberFormatter.format(path.demand.activeJobCount)}
              </Box>{' '}
              active jobs
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.65}
            alignItems="center"
          >
            <BusinessOutlinedIcon
              sx={{
                fontSize: 18,
                color: '#6f7b90',
              }}
            />

            <Typography
              sx={{
                fontSize: '0.82rem',
                color: '#4c586d',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: '#273247',
                }}
              >
                {numberFormatter.format(
                  path.demand.distinctCompanyCount,
                )}
              </Box>{' '}
              companies
            </Typography>
          </Stack>
        </Stack>

        {path.demand.trendPercent !== null && (
          <Stack
            direction="row"
            spacing={0.65}
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <TrendIcon value={path.demand.trendPercent} />

            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color:
                  path.demand.trendPercent > 0
                    ? '#18864b'
                    : path.demand.trendPercent < 0
                      ? '#c23b3b'
                      : '#697586',
              }}
            >
              {path.demand.trendPercent > 0 ? '+' : ''}
              {path.demand.trendPercent}% over the last 30 days
            </Typography>
          </Stack>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            sx={{
              mb: 1,
              color: '#697586',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {type === 'career'
              ? 'Top required skills'
              : 'Related roles & skills'}
          </Typography>

          {associations.length > 0 ? (
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              flexWrap="wrap"
            >
              {associations.map((association) => (
                <Chip
                  key={association.id}
                  label={association.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 27,
                    borderColor: '#dce4ef',
                    bgcolor: '#fafbfd',
                    color: '#445169',
                    fontSize: '0.73rem',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Typography
              sx={{
                color: '#8a94a5',
                fontSize: '0.8rem',
              }}
            >
              Market skill data is being prepared.
            </Typography>
          )}
        </Box>

        {type === 'skill' && (
          <Box sx={{ mt: 2 }}>
            <Chip
              label={
                learningAvailable
                  ? 'Learning path available'
                  : 'Learning path coming soon'
              }
              size="small"
              sx={{
                bgcolor: learningAvailable
                  ? '#eaf2ff'
                  : '#f4f5f7',
                color: learningAvailable
                  ? 'primary.main'
                  : '#697586',
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2.25 }}
        >
          {(type === 'career' || learningAvailable) && (
            <Button
              variant="contained"
              onClick={() => onExplore(path)}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                flex: 1,
                minHeight: 40,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: 'none',
              }}
            >
              {type === 'career'
                ? 'Explore Path'
                : 'Start Skill Path'}
            </Button>
          )}

          <Button
            variant={
              type === 'career' || learningAvailable
                ? 'outlined'
                : 'contained'
            }
            onClick={() => onViewJobs(path)}
            sx={{
              flex: 1,
              minHeight: 40,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            View Jobs
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};