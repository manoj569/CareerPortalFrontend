import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import type { PublicPortfolioResponse } from '../types/portfolioModels';
import { PortfolioRenderer } from './PortfolioRenderer';

type PortfolioLivePreviewProps = {
  portfolio?: PublicPortfolioResponse;
  isLoading?: boolean;
  isFetching?: boolean;
  hasError?: boolean;
  onRefresh?: () => void;
  onOpenPreview?: () => void;
};

const PortfolioLivePreview = ({
  portfolio,
  isLoading = false,
  isFetching = false,
  hasError = false,
  onRefresh,
  onOpenPreview,
}: PortfolioLivePreviewProps) => {
  const loading = isLoading || isFetching;

  return (
    <Paper
      component="aside"
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        position: { lg: 'sticky' },
        top: { lg: 24 },
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: '0.95rem',
                fontWeight: 800,
              }}
            >
              Live preview
            </Typography>

            {isFetching && !isLoading ? (
              <CircularProgress size={14} thickness={5} />
            ) : null}
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.72rem',
              mt: 0.15,
            }}
          >
            See how your portfolio looks to employers
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5}>
          {onRefresh ? (
            <Button
              aria-label="Refresh portfolio preview"
              disabled={loading}
              onClick={onRefresh}
              size="small"
              startIcon={
                loading ? (
                  <CircularProgress size={14} />
                ) : (
                  <RefreshRoundedIcon />
                )
              }
              sx={{
                minWidth: 0,
                px: 1.25,
              }}
            >
              Refresh
            </Button>
          ) : null}

          {onOpenPreview ? (
            <Button
              aria-label="Open full portfolio preview"
              onClick={onOpenPreview}
              size="small"
              startIcon={<OpenInNewRoundedIcon />}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                minWidth: 0,
                px: 1.25,
              }}
            >
              Open
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Box
        sx={{
          bgcolor: 'action.hover',
          p: { xs: 1, sm: 1.5 },
        }}
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            height: {
              xs: 520,
              md: 620,
              lg: 'calc(100vh - 230px)',
            },
            minHeight: { lg: 560 },
            maxHeight: { lg: 760 },
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {loading && !portfolio ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                height: '100%',
                px: 3,
                textAlign: 'center',
              }}
            >
              <CircularProgress size={30} />

              <Typography
                color="text.secondary"
                sx={{ fontSize: '0.85rem' }}
              >
                Loading your portfolio preview...
              </Typography>
            </Stack>
          ) : null}

          {!loading && hasError && !portfolio ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.25}
              sx={{
                height: '100%',
                px: 3,
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                Preview unavailable
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '0.8rem',
                  maxWidth: 300,
                }}
              >
                We could not load the portfolio preview. Your changes are
                still safe.
              </Typography>

              {onRefresh ? (
                <Button
                  onClick={onRefresh}
                  size="small"
                  startIcon={<RefreshRoundedIcon />}
                  variant="outlined"
                >
                  Try again
                </Button>
              ) : null}
            </Stack>
          ) : null}

          {!loading && !hasError && !portfolio ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={0.75}
              sx={{
                height: '100%',
                px: 3,
                textAlign: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                }}
              >
                Preview will appear here
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '0.8rem',
                  maxWidth: 300,
                }}
              >
                Create your portfolio first, then you can preview it while
                editing.
              </Typography>
            </Stack>
          ) : null}

          {portfolio ? (
            <Box
              sx={{
                height: '100%',
                overflow: 'auto',
              }}
            >
              <Box
                sx={{
                  minWidth: 760,
                  transform: {
                    xs: 'scale(0.48)',
                    sm: 'scale(0.58)',
                    md: 'scale(0.64)',
                    lg: 'scale(0.56)',
                    xl: 'scale(0.62)',
                  },
                  transformOrigin: 'top left',
                  width: {
                    xs: '208.34%',
                    sm: '172.42%',
                    md: '156.25%',
                    lg: '178.58%',
                    xl: '161.3%',
                  },
                }}
              >
                <PortfolioRenderer
                  portfolio={portfolio}
                  preview
                />
              </Box>
            </Box>
          ) : null}

          {portfolio && isFetching ? (
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.55)',
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute',
              }}
            />
          ) : null}
        </Box>
      </Box>

      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={1}
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.25,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={0.75}
        >
          <Box
            sx={{
              bgcolor: portfolio ? 'success.main' : 'text.disabled',
              borderRadius: '50%',
              height: 7,
              width: 7,
            }}
          />

          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.72rem',
            }}
          >
            {portfolio ? 'Preview ready' : 'Waiting for portfolio'}
          </Typography>
        </Stack>

        {onOpenPreview ? (
          <Button
            onClick={onOpenPreview}
            size="small"
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
            }}
          >
            Full preview
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default PortfolioLivePreview;