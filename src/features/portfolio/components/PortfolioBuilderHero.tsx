import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { Box, Paper, Stack, Typography } from '@mui/material';

const benefitItems = [
  'Increase profile visibility',
  'Showcase your real work',
  'Share with a custom link',
];

export const PortfolioBuilderHero = () => {
  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        background: (theme) =>
          `linear-gradient(
            110deg,
            ${theme.palette.primary.main}0D 0%,
            ${theme.palette.background.paper} 48%,
            ${theme.palette.primary.main}12 100%
          )`,
        px: {
          xs: 2.5,
          sm: 3,
          md: 4,
        },
        py: {
          xs: 3,
          md: 3.5,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.035,
          right: -60,
          top: -90,
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.025,
          right: 170,
          bottom: -80,
          pointerEvents: 'none',
        }}
      />

      <Stack
        alignItems={{
          xs: 'stretch',
          md: 'center',
        }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        justifyContent="space-between"
        spacing={3}
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* LEFT CONTENT */}
        <Stack
          spacing={2}
          sx={{
            maxWidth: 760,
          }}
        >
          <Stack spacing={0.75}>
            <Typography
              component="h2"
              sx={{
                color: 'text.primary',
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.75rem',
                },
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              Stand out to{' '}
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                }}
              >
                employers
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: {
                  xs: '0.925rem',
                  sm: '1rem',
                },
                lineHeight: 1.65,
                maxWidth: 650,
              }}
            >
              Build a professional portfolio that highlights your skills,
              experience, projects and achievements in one place.
            </Typography>
          </Stack>

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            flexWrap="wrap"
            gap={{
              xs: 1,
              sm: 2.5,
            }}
          >
            {benefitItems.map((item) => (
              <Stack
                alignItems="center"
                direction="row"
                key={item}
                spacing={0.75}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    color: 'success.main',
                    fontSize: 20,
                  }}
                />

                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* RIGHT VISUAL */}
        <Box
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },
            flexShrink: 0,
            minWidth: 300,
            position: 'relative',
            height: 120,
          }}
        >
          {/* Portfolio card */}
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              width: 190,
              height: 110,
              right: 35,
              top: 5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper',
              p: 1.75,
              transform: 'rotate(2deg)',
              boxShadow: (theme) => theme.shadows[3],
            }}
          >
            <Stack direction="row" spacing={1.25}>
              <Box
                sx={{
                  alignItems: 'center',
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  color: 'primary.contrastText',
                  display: 'flex',
                  flexShrink: 0,
                  height: 36,
                  justifyContent: 'center',
                  width: 36,
                }}
              >
                <DescriptionOutlinedIcon fontSize="small" />
              </Box>

              <Stack
                spacing={0.7}
                sx={{
                  flex: 1,
                  pt: 0.25,
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'text.primary',
                    borderRadius: 10,
                    height: 7,
                    opacity: 0.75,
                    width: '68%',
                  }}
                />

                <Box
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 10,
                    height: 6,
                    width: '100%',
                  }}
                />

                <Box
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 10,
                    height: 6,
                    width: '82%',
                  }}
                />
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                mt: 2,
              }}
            >
              {[44, 56, 38].map((width) => (
                <Box
                  key={width}
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: 10,
                    height: 6,
                    opacity: 0.16,
                    width,
                  }}
                />
              ))}
            </Stack>
          </Paper>

          {/* Visibility badge */}
          <Paper
            elevation={2}
            sx={{
              alignItems: 'center',
              borderRadius: 10,
              display: 'flex',
              gap: 0.75,
              left: 0,
              px: 1.5,
              py: 0.9,
              position: 'absolute',
              top: 15,
            }}
          >
            <VisibilityOutlinedIcon
              color="primary"
              sx={{
                fontSize: 18,
              }}
            />

            <Typography
              color="primary.main"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Get noticed
            </Typography>
          </Paper>

          {/* Skills badge */}
          <Paper
            elevation={2}
            sx={{
              alignItems: 'center',
              borderRadius: 10,
              bottom: 7,
              display: 'flex',
              gap: 0.75,
              left: 10,
              px: 1.5,
              py: 0.9,
              position: 'absolute',
            }}
          >
            <TrendingUpRoundedIcon
              color="primary"
              sx={{
                fontSize: 18,
              }}
            />

            <Typography
              color="primary.main"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Showcase skills
            </Typography>
          </Paper>

          {/* Opportunity badge */}
          <Paper
            elevation={2}
            sx={{
              alignItems: 'center',
              bgcolor: 'success.main',
              borderRadius: 10,
              bottom: 0,
              color: 'success.contrastText',
              display: 'flex',
              gap: 0.75,
              px: 1.5,
              py: 0.9,
              position: 'absolute',
              right: 0,
            }}
          >
            <WorkOutlineRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />

            <Typography
              sx={{
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              More opportunities
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Paper>
  );
};