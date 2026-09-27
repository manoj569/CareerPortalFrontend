import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import {
  Box,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import type { PortfolioEditorResponse } from '../types/portfolioModels';
type PortfolioCompletenessProps = {
  portfolio: PortfolioEditorResponse;
};

type CompletionItem = {
  key: string;
  label: string;
  complete: boolean;
};

const hasText = (value?: string | null): boolean =>
  Boolean(value?.trim());

const PortfolioCompleteness = ({
  portfolio,
}: PortfolioCompletenessProps) => {
  const completionItems: CompletionItem[] = [
    {
      key: 'profile',
      label: 'Profile',
      complete:
        hasText(portfolio.displayName) &&
        hasText(portfolio.resumeHeadline) &&
        hasText(portfolio.profileSummary),
    },
    {
      key: 'skills',
      label: 'Skills',
complete: (portfolio.skills?.length ?? 0) > 0,    
    },
    {
      key: 'experience',
      label: 'Experience',
complete: (portfolio.experiences?.length ?? 0) > 0,    },
    {
      key: 'education',
      label: 'Education',
complete: (portfolio.education?.length ?? 0) > 0,    },
    {
      key: 'projects',
      label: 'Projects',
complete: (portfolio.projects?.length ?? 0) > 0,    },
    {
      key: 'links',
      label: 'Professional links',
complete: (portfolio.professionalLinks?.length ?? 0) > 0,    },
  ];

  const completedCount = completionItems.filter(
    (item) => item.complete,
  ).length;

  const percentage = Math.round(
    (completedCount / completionItems.length) * 100,
  );

  const remainingCount = completionItems.length - completedCount;

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        pb: 2.5,
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              color: 'text.primary',
              fontSize: '0.95rem',
              fontWeight: 700,
            }}
          >
            Portfolio completeness
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.78rem',
              mt: 0.25,
            }}
          >
            {percentage === 100
              ? 'Your portfolio is ready to stand out.'
              : `${remainingCount} ${
                  remainingCount === 1 ? 'section' : 'sections'
                } left to strengthen your portfolio.`}
          </Typography>
        </Box>

        <Typography
          color={percentage === 100 ? 'success.main' : 'primary.main'}
          sx={{
            flexShrink: 0,
            fontSize: '1.15rem',
            fontWeight: 800,
          }}
        >
          {percentage}%
        </Typography>
      </Stack>

      <LinearProgress
        aria-label="Portfolio completeness"
        value={percentage}
        variant="determinate"
        sx={{
          borderRadius: 999,
          height: 7,
          mt: 1.5,

          '& .MuiLinearProgress-bar': {
            borderRadius: 999,
          },
        }}
      />

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
        sx={{
          mt: 1.5,
        }}
      >
        {completionItems.map((item) => (
          <Tooltip
            arrow
            key={item.key}
            title={
              item.complete
                ? `${item.label} added`
                : `Add ${item.label.toLowerCase()} to improve your portfolio`
            }
          >
            <Stack
              alignItems="center"
              direction="row"
              spacing={0.5}
              sx={{
                bgcolor: item.complete
                  ? 'success.main'
                  : 'action.hover',
                borderRadius: 999,
                color: item.complete
                  ? 'success.contrastText'
                  : 'text.secondary',
                cursor: 'default',
                px: 1,
                py: 0.5,
                transition: (theme) =>
                  theme.transitions.create([
                    'background-color',
                    'color',
                  ]),
              }}
            >
              {item.complete ? (
                <CheckCircleRoundedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />
              ) : (
                <RadioButtonUncheckedRoundedIcon
                  sx={{
                    fontSize: 15,
                  }}
                />
              )}

              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
            </Stack>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
};

export default PortfolioCompleteness;