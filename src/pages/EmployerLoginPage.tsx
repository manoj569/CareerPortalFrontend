import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

export const EmployerLoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = () => {
    let valid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Work email is required.');
      valid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setEmailError('Enter a valid work email.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    if (!valid) {
      return;
    }

    /*
     * IMPORTANT:
     * Do not navigate to the employer dashboard
     * or show a fake login success yet.
     *
     * Connect the real Employer Login API here.
     */
  };

  return (
    <Box
      sx={{
        minHeight: {
          xs: 'calc(100vh - 72px)',
          md: 'calc(100vh - 76px)',
        },
        px: 2,
        py: {
          xs: 4,
          md: 5,
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: `
          radial-gradient(
            circle at 20% 85%,
            rgba(181, 207, 255, 0.42) 0%,
            rgba(181, 207, 255, 0) 27%
          ),
          radial-gradient(
            circle at 90% 70%,
            rgba(214, 200, 255, 0.38) 0%,
            rgba(214, 200, 255, 0) 30%
          ),
          linear-gradient(
            135deg,
            #f7f9ff 0%,
            #eef5ff 48%,
            #f6f1ff 100%
          )
        `,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 650,
          px: {
            xs: 2.3,
            sm: 4.5,
            md: 5.2,
          },
          py: {
            xs: 3,
            md: 3.8,
          },
          borderRadius: '24px',
          border: '1px solid #e0e6f0',
          bgcolor: 'rgba(255,255,255,0.97)',
          boxShadow:
            '0 16px 50px rgba(47, 73, 130, 0.12)',
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 62,
            height: 62,
            mx: 'auto',
            borderRadius: '14px',
            bgcolor: '#edf3ff',
            color: '#075bd8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessCenterOutlinedIcon
            sx={{
              fontSize: 36,
            }}
          />
        </Box>

        {/* Heading */}
        <Typography
          sx={{
            mt: 1.8,
            textAlign: 'center',
            color: '#10182f',
            fontSize: {
              xs: '1.6rem',
              md: '1.85rem',
            },
            lineHeight: 1.2,
            fontWeight: 900,
          }}
        >
          Employer Login
        </Typography>

        <Typography
          sx={{
            maxWidth: 490,
            mx: 'auto',
            mt: 1,
            mb: 3,
            textAlign: 'center',
            color: '#52627d',
            fontSize: {
              xs: '0.8rem',
              md: '0.9rem',
            },
            lineHeight: 1.5,
          }}
        >
          Sign in to your employer account to
          manage jobs, applications, interviews,
          and your company profile.
        </Typography>

        {/* Email */}
        <Typography sx={labelStyle}>
          Work Email{' '}
          <Box
            component="span"
            sx={{ color: '#e11d48' }}
          >
            *
          </Box>
        </Typography>

        <TextField
          fullWidth
          placeholder="Enter your work email (e.g., hr@company.com)"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);

            if (emailError) {
              setEmailError('');
            }
          }}
          error={Boolean(emailError)}
          helperText={emailError}
          autoComplete="email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon
                  sx={{
                    fontSize: 21,
                    color: '#536681',
                  }}
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyle}
        />

        {/* Password */}
        <Typography
          sx={{
            ...labelStyle,
            mt: 1.8,
          }}
        >
          Password{' '}
          <Box
            component="span"
            sx={{ color: '#e11d48' }}
          >
            *
          </Box>
        </Typography>

        <TextField
          fullWidth
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);

            if (passwordError) {
              setPasswordError('');
            }
          }}
          error={Boolean(passwordError)}
          helperText={passwordError}
          autoComplete="current-password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon
                  sx={{
                    fontSize: 21,
                    color: '#536681',
                  }}
                />
              </InputAdornment>
            ),

            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  edge="end"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon
                      sx={{ fontSize: 21 }}
                    />
                  ) : (
                    <VisibilityOutlinedIcon
                      sx={{ fontSize: 21 }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={fieldStyle}
        />

        {/* Remember / Forgot */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{
            mt: 0.7,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                sx={{
                  color: '#536681',

                  '&.Mui-checked': {
                    color: '#075bd8',
                  },
                }}
              />
            }
            label="Remember me"
            sx={{
              m: 0,

              '& .MuiFormControlLabel-label': {
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1d2941',
              },
            }}
          />

          <Button
            variant="text"
            onClick={() => {
              /*
               * Connect this to the employer
               * forgot-password route when ready.
               */
            }}
            sx={{
              p: 0,
              minWidth: 0,
              textTransform: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#075bd8',
            }}
          >
            Forgot password?
          </Button>
        </Stack>

        {/* Sign In */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 2,
            height: 48,
            borderRadius: '8px',
            bgcolor: '#075fe4',
            boxShadow: 'none',
            textTransform: 'none',
            fontSize: '0.88rem',
            fontWeight: 900,

            '&:hover': {
              bgcolor: '#0453ca',
              boxShadow: 'none',
            },
          }}
        >
          Sign In
        </Button>

        {/* Divider */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            my: 2,
          }}
        >
          <Divider sx={{ flex: 1 }} />

          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.75rem',
            }}
          >
            or
          </Typography>

          <Divider sx={{ flex: 1 }} />
        </Stack>

        {/* Google */}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            /*
             * UI only until Google employer
             * authentication is implemented.
             */
          }}
          startIcon={<GoogleIcon />}
          sx={socialButtonStyle}
        >
          Continue with Google
        </Button>

        {/* Microsoft */}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            /*
             * UI only until Microsoft employer
             * authentication is implemented.
             */
          }}
          startIcon={<MicrosoftIcon />}
          sx={{
            ...socialButtonStyle,
            mt: 1,
          }}
        >
          Continue with Microsoft
        </Button>

        {/* Register */}
        <Box
          sx={{
            mt: 2.2,
            px: 1.5,
            py: 1.3,
            borderRadius: '10px',
            bgcolor: '#f7f8fc',
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            alignItems="center"
            justifyContent="center"
            spacing={0.7}
          >
            <Typography
              sx={{
                color: '#52627d',
                fontSize: '0.76rem',
              }}
            >
              New to CareerHarbor?
            </Typography>

            <Button
              variant="text"
              endIcon={
                <ArrowForwardOutlinedIcon
                  sx={{
                    fontSize: '16px !important',
                  }}
                />
              }
              onClick={() =>
                navigate('/employers/register')
              }
              sx={{
                p: 0,
                minWidth: 0,
                color: '#075bd8',
                textTransform: 'none',
                fontSize: '0.76rem',
                fontWeight: 900,
              }}
            >
              Create an employer account
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

const GoogleIcon = () => (
  <Box
    sx={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.95rem',
      fontWeight: 950,
      color: '#4285f4',
      fontFamily: 'Arial, sans-serif',
    }}
  >
    G
  </Box>
);

const MicrosoftIcon = () => (
  <Box
    sx={{
      width: 18,
      height: 18,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '2px',
    }}
  >
    <Box sx={{ bgcolor: '#f35325' }} />
    <Box sx={{ bgcolor: '#81bc06' }} />
    <Box sx={{ bgcolor: '#05a6f0' }} />
    <Box sx={{ bgcolor: '#ffba08' }} />
  </Box>
);

const labelStyle = {
  mb: 0.65,
  color: '#111827',
  fontSize: '0.78rem',
  fontWeight: 800,
};

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    minHeight: 48,
    borderRadius: '8px',
    bgcolor: '#fff',
    fontSize: '0.8rem',

    '& fieldset': {
      borderColor: '#bfcadd',
    },

    '&:hover fieldset': {
      borderColor: '#8fa5c5',
    },

    '&.Mui-focused fieldset': {
      borderWidth: '1px',
      borderColor: '#075fe4',
    },
  },

  '& .MuiFormHelperText-root': {
    ml: 0.2,
    fontSize: '0.68rem',
  },
};

const socialButtonStyle = {
  height: 46,
  borderRadius: '8px',
  borderColor: '#aebcd0',
  color: '#111827',
  bgcolor: '#fff',
  boxShadow: 'none',
  textTransform: 'none',
  fontSize: '0.8rem',
  fontWeight: 800,

  '&:hover': {
    bgcolor: '#f8faff',
    borderColor: '#8298b8',
  },
};

export default EmployerLoginPage;