import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AppBrand } from '@/components/navigation/AppBrand';
import { ROUTES } from '@/constants/routes';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { SupportButton } from '@/features/support/SupportButton';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

export const EmployerRegisterPage = () => {
  useDocumentMetadata(
    'Create Employer Account | Career Harbor',
    'Create your Career Harbor employer account to post jobs, discover talent and hire faster.',
    {
      canonicalPath: ROUTES.EMPLOYER_REGISTER,
      noIndex: true,
    },
  );

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showBackendNotice, setShowBackendNotice] = useState(false);

  const handleMobileChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /*
     * IMPORTANT:
     * Do not call the existing candidate authService.register() here.
     *
     * This page is intentionally UI-ready while the Employer registration
     * backend contract is added/confirmed.
     */
    setShowBackendNotice(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7faff',
        backgroundImage:
          'radial-gradient(circle at 50% 25%, rgba(214,229,255,.65), transparent 38%), linear-gradient(135deg, #fbfdff 0%, #f2f7ff 100%)',
      }}
    >
      {/* Simple auth header */}
      <Box
        component="header"
        sx={{
          bgcolor: 'rgba(255,255,255,.96)',
          borderBottom: '1px solid rgba(15,23,42,.08)',
        }}
      >
        <Box
          sx={{
            width: 'min(calc(100% - 32px), 1480px)',
            minHeight: { xs: 68, md: 76 },
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <AppBrand />

          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 0.5, sm: 1 }}
          >
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Already registered?
            </Typography>

            <Button
              component={Link}
              to={ROUTES.LOGIN}
              sx={{
                minWidth: 0,
                fontWeight: 700,
              }}
            >
              Log in
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Registration content */}
      <Box
        component="main"
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 5, md: 6 },
          boxSizing: 'border-box',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 610,
            mx: 'auto',
            p: {
              xs: 2.5,
              sm: 4,
              md: 4.5,
            },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: { xs: 3, sm: 4 },
            boxShadow: '0 18px 55px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Stack spacing={3}>
            {/* Heading */}
            <Stack alignItems="center" textAlign="center" spacing={1.25}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 62,
                  height: 62,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 3,
                  bgcolor: 'rgba(11, 87, 208, 0.10)',
                  color: 'primary.main',
                }}
              >
                <BusinessCenterOutlinedIcon sx={{ fontSize: 31 }} />
              </Box>

              <Box>
                <Typography
                  component="h1"
                  sx={{
                    color: '#101828',
                    fontSize: {
  xs: '1.5rem',
  sm: '1.8rem',
},
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  Create your employer account
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem',
                    },
                  }}
                >
                  Post jobs, discover talent and hire faster on CareerHarbor.
                </Typography>
              </Box>
            </Stack>

            {showBackendNotice && (
              <Alert severity="info">
                Employer registration is being connected. The existing candidate
                registration API has not been used for this employer account.
              </Alert>
            )}

            <Stack
              component="form"
              noValidate
              onSubmit={handleSubmit}
              spacing={2.25}
            >
              {/* Full name */}
              <TextField
                autoComplete="name"
                fullWidth
                label="Full Name"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                required
                value={fullName}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon
                          color="action"
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Work email */}
              <TextField
                autoComplete="email"
                fullWidth
                label="Work Email"
                onChange={(event) => setWorkEmail(event.target.value)}
                placeholder="Enter your work email"
                required
                type="email"
                value={workEmail}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Password */}
              <PasswordField
                autoComplete="new-password"
                label="Password"
                placeholder="Create a password"
                registration={{
                  name: 'password',
                  onBlur: async () => undefined,
                  onChange: async (event) => {
                    setPassword(event.target.value);
                  },
                  ref: () => undefined,
                }}
              />

              {/* Mobile */}
              <TextField
                autoComplete="tel-national"
                fullWidth
                label="Mobile Number"
                onChange={(event) => handleMobileChange(event.target.value)}
                placeholder="Enter mobile number"
                required
                type="tel"
                value={mobileNumber}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    maxLength: 10,
                    pattern: '[6-9][0-9]{9}',
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon
                          color="action"
                          fontSize="small"
                          sx={{ mr: 1 }}
                        />

                        <Typography color="text.primary" fontWeight={600}>
                          +91
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Terms */}
              <FormControlLabel
                sx={{
                  alignItems: 'flex-start',
                  m: 0,
                  '& .MuiCheckbox-root': {
                    pt: 0.15,
                    pl: 0,
                  },
                }}
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(event) =>
                      setTermsAccepted(event.target.checked)
                    }
                  />
                }
                label={
                  <Typography variant="body2" sx={{ pt: 0.45 }}>
                    I agree to the{' '}
                    <MuiLink
                      component={Link}
                      fontWeight={700}
                      to={ROUTES.TERMS_OF_USE}
                    >
                      Terms of Use
                    </MuiLink>{' '}
                    and{' '}
                    <MuiLink
                      component={Link}
                      fontWeight={700}
                      to={ROUTES.PRIVACY_POLICY}
                    >
                      Privacy Policy
                    </MuiLink>
                  </Typography>
                }
              />

              {/* Create account */}
              <Button
                disabled={
                  !fullName.trim() ||
                  !workEmail.trim() ||
                  !password ||
                  mobileNumber.length !== 10 ||
                  !termsAccepted
                }
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{
                  minHeight: 52,
                  borderRadius: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Create Employer Account
              </Button>

              {/* Login */}
              <Box
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  pt: 2.25,
                  textAlign: 'center',
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  Already registered?{' '}
                  <MuiLink
                    component={Link}
                    fontWeight={800}
                    to={ROUTES.LOGIN}
                  >
                    Log in
                  </MuiLink>
                </Typography>
              </Box>

              {/* Support */}
              <Stack
                alignItems="center"
                spacing={0.5}
                sx={{
                  pt: 0.5,
                  textAlign: 'center',
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  Having trouble creating your employer account?
                </Typography>

                <SupportButton initialCategory="Registration">
                  Contact Support
                </SupportButton>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};