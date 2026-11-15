import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

interface AcceleratorHeroProps {
  onStartJourney: () => void;
  onHowItWorks: () => void;
}

const benefits = [
  'Build In-Demand Skills',
  'Showcase Your Portfolio',
  'Get Interview Ready',
  'Accelerate Your Career',
];

export const AcceleratorHero = ({
  onStartJourney,
  onHowItWorks,
}: AcceleratorHeroProps) => (
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: { xs: 3, md: 4 },
      border: '1px solid',
      borderColor: '#dbe7ff',
      background:
        'linear-gradient(115deg, #f3f8ff 0%, #edf4ff 48%, #f5f2ff 100%)',
      px: { xs: 2.25, sm: 3, md: 4.5 },
      py: { xs: 3, md: 4.5 },
      minHeight: { md: 300 },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(11,87,208,0.10) 0%, rgba(11,87,208,0) 70%)',
        right: -70,
        top: -90,
        pointerEvents: 'none',
      }}
    />

    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 1.25fr) minmax(320px, 0.75fr)',
        },
        gap: { xs: 3, md: 5 },
        alignItems: 'center',
      }}
    >
      <Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 1.25 }}
        >
          <AutoAwesomeOutlinedIcon
            sx={{
              color: 'primary.main',
              fontSize: 22,
            }}
          />

          <Typography
            variant="subtitle2"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: 0.1,
            }}
          >
            AI Career Accelerator
          </Typography>

          <Chip
            label="New"
            size="small"
            sx={{
              height: 22,
              bgcolor: '#e7f0ff',
              color: 'primary.main',
              fontWeight: 800,
              fontSize: 11,
            }}
          />
        </Stack>

        <Typography
          component="h1"
          sx={{
            maxWidth: 700,
            color: '#172033',
            fontWeight: 800,
            fontSize: {
              xs: '1.8rem',
              sm: '2.15rem',
              md: '2.55rem',
            },
            lineHeight: 1.13,
            letterSpacing: '-0.035em',
          }}
        >
          Learn • Practice • Build • Get Job Ready
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            maxWidth: 690,
            color: '#5d6678',
            fontSize: {
              xs: '0.94rem',
              md: '1rem',
            },
            lineHeight: 1.7,
          }}
        >
          Choose your career path, assess your skills, and follow a
          personalized roadmap to accelerate your career.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            mt: 3,
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Button
            variant="contained"
            size="large"
            endIcon={<KeyboardArrowRightRoundedIcon />}
            onClick={onStartJourney}
            sx={{
              minHeight: 46,
              px: 2.6,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            Start Your Journey
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayCircleOutlineRoundedIcon />}
            onClick={onHowItWorks}
            sx={{
              minHeight: 46,
              px: 2.6,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.55)',
            }}
          >
            How It Works
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: { xs: 'flex-start', md: 'center' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 390,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: '1px solid rgba(11,87,208,0.13)',
            bgcolor: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 16px 45px rgba(43,74,125,0.08)',
          }}
        >
          <Stack spacing={1.25}>
            {benefits.map((benefit) => (
              <Stack
                key={benefit}
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  minHeight: 46,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: '1px solid #edf1f7',
                }}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: 21,
                  }}
                />

                <Typography
                  sx={{
                    color: '#29344a',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  {benefit}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  </Box>
);