import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { applyApiValidationErrors } from '@/api/formErrors';
import { AppBrand } from '@/components/navigation/AppBrand';
import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { getAuthenticationErrorMessage } from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import {
  registrationSchema,
  sanitizeFullNameInput,
  sanitizeIndianMobileInput,
  type RegistrationFormValues,
} from '@/features/auth/validation/authSchemas';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const benefits = [
  'Discover verified internships and jobs',
  'Build one profile and apply faster',
  'Track every application',
];

const RegistrationHeader = () => (
  <Stack
    alignItems="center"
    component="header"
    direction="row"
    justifyContent="space-between"
    spacing={2}
  >
    <AppBrand />
    <Typography color="text.secondary" textAlign="right" variant="body2">
      Already registered?{' '}
      <MuiLink component={Link} fontWeight={700} to={ROUTES.LOGIN}>
        Log in
      </MuiLink>
    </Typography>
  </Stack>
);

const BenefitsPanel = () => (
  <Paper
    component="aside"
    sx={{
      background:
        'linear-gradient(145deg, color-mix(in srgb, var(--mui-palette-primary-main) 11%, var(--mui-palette-background-paper)), var(--mui-palette-background-paper))',
      height: '100%',
      overflow: 'hidden',
      p: { xs: 3, sm: 4 },
      position: 'relative',
    }}
  >
    <Box
      aria-hidden="true"
      sx={{
        display: { xs: 'none', sm: 'grid' },
        height: 190,
        mb: 3,
        placeItems: 'center',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'primary.main',
          borderRadius: 5,
          color: 'primary.contrastText',
          display: 'flex',
          height: 124,
          justifyContent: 'center',
          transform: 'rotate(-4deg)',
          width: 174,
        }}
      >
        <WorkOutlineIcon sx={{ fontSize: 58 }} />
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 3,
          color: 'primary.main',
          display: 'flex',
          height: 62,
          justifyContent: 'center',
          left: '7%',
          position: 'absolute',
          top: 18,
          width: 62,
        }}
      >
        <PersonSearchOutlinedIcon />
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          bottom: 12,
          boxShadow: 3,
          color: 'primary.main',
          display: 'flex',
          height: 58,
          justifyContent: 'center',
          position: 'absolute',
          right: '6%',
          width: 58,
        }}
      >
        <BusinessCenterOutlinedIcon />
      </Box>
    </Box>

    <Typography component="h2" variant="h2">
      Start your career journey
    </Typography>
    <Stack component="ul" spacing={2} sx={{ listStyle: 'none', mb: 0, mt: 3, p: 0 }}>
      {benefits.map((benefit) => (
        <Stack alignItems="flex-start" component="li" direction="row" key={benefit} spacing={1.5}>
          <CheckCircleOutlineIcon color="primary" fontSize="small" sx={{ mt: 0.25 }} />
          <Typography>{benefit}</Typography>
        </Stack>
      ))}
    </Stack>
  </Paper>
);

export const RegisterPage = () => {
  useDocumentMetadata(
    'Create a Candidate account | Career Portal',
    'Register for verified internships and jobs with Career Portal.',
  );
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm<RegistrationFormValues>({
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      phoneNumber: '',
      termsAccepted: false,
    },
    mode: 'onTouched',
    resolver: yupResolver(registrationSchema),
  });
  
  const fullNameField = register('fullName');
  const mobileField = register('phoneNumber');

  const submitRegistration = async (values: RegistrationFormValues) => {
    setServerError(null);
    setHasValidationErrors(false);
    setIsSuccess(false);

    try {
      await authService.register({
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        hasAcceptedTermsAndPrivacy: values.termsAccepted,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });
      
      // 👇 Show success message and popup
      setIsSuccess(true);
      enqueueSnackbar('Account created successfully! Redirecting to login...', {
        variant: 'success',
        autoHideDuration: 3000,
      });

      // 👇 Wait 3 seconds, then redirect to Login (using replace to prevent back button)
      setTimeout(() => {
        void navigate(ROUTES.LOGIN, { replace: true });
      }, 3000);

    } catch (error: unknown) {
      const hasFieldErrors = applyApiValidationErrors(
        error,
        ['fullName', 'email', 'password', 'phoneNumber'] as const,
        setError,
      );
      if (hasFieldErrors) {
        setHasValidationErrors(true);
        return;
      }
      setServerError(getAuthenticationErrorMessage(error));
    }
  };
  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <RegistrationHeader />
      <Grid alignItems="stretch" container spacing={{ xs: 3, md: 4 }}>
        <Grid order={{ xs: 2, md: 1 }} size={{ xs: 12, md: 4 }}>
          <BenefitsPanel />
        </Grid>
        <Grid order={{ xs: 1, md: 2 }} size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack spacing={3}>
              <AuthPageHeader
                description="Create one Candidate profile for internships, fresher roles, and experienced opportunities."
                title="Create your account"
              />

              {isSuccess ? (
                <Alert aria-live="polite" severity="success">
                  <Stack>
                    <Typography fontWeight={600}>
                      Account created successfully!
                    </Typography>
                    <Typography variant="body2">
                      We've sent a verification link to <strong>{control._defaultValues.email}</strong>. 
                      You will be redirected to login in a few seconds.
                    </Typography>
                  </Stack>
                </Alert>
              ) : null}

              {hasValidationErrors ? (
                <Alert aria-live="assertive" severity="error">
                  Please correct the highlighted fields before creating your account.
                </Alert>
              ) : null}
              {serverError ? (
                <Alert aria-live="assertive" severity="error">
                  {serverError}
                </Alert>
              ) : null}

              <Stack
                component="form"
                noValidate
                onSubmit={(event) => {
                  void handleSubmit(submitRegistration, (formErrors) => {
                    setHasValidationErrors(true);
                    const firstField = Object.keys(formErrors)[0] as
                      keyof RegistrationFormValues | undefined;
                    if (firstField) setFocus(firstField);
                  })(event);
                }}
                spacing={2.5}
              >
                <TextField
                  autoComplete="name"
                  disabled={isSubmitting || isSuccess}
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName?.message}
                  inputRef={fullNameField.ref}
                  label="Full name"
                  name={fullNameField.name}
                  onBlur={(event) => {
                    event.target.value = sanitizeFullNameInput(event.target.value).trim();
                    void fullNameField.onChange(event);
                    void fullNameField.onBlur(event);
                  }}
                  onChange={(event) => {
                    event.target.value = sanitizeFullNameInput(event.target.value);
                    void fullNameField.onChange(event);
                  }}
                  placeholder="Enter your full name"
                  required
                />
                <TextField
                  autoComplete="email"
                  disabled={isSubmitting || isSuccess}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  label="Email address"
                  placeholder="Enter your email address"
                  required
                  type="email"
                  {...register('email')}
                />
                <PasswordField
                  autoComplete="new-password"
                  disabled={isSubmitting || isSuccess}
                  errorMessage={errors.password?.message}
                  label="Password"
                  placeholder="Minimum 6 characters"
                  registration={register('password')}
                />
                <TextField
                  autoComplete="tel-national"
                  disabled={isSubmitting || isSuccess}
                  error={Boolean(errors.phoneNumber)}
                  helperText={errors.phoneNumber?.message}
                  inputRef={mobileField.ref}
                  label="Mobile number"
                  name={mobileField.name}
                  onBlur={(event) => void mobileField.onBlur(event)}
                  onChange={(event) => {
                    event.target.value = sanitizeIndianMobileInput(event.target.value);
                    void mobileField.onChange(event);
                  }}
                  placeholder="Enter 10-digit mobile number"
                  required
                  slotProps={{
                    htmlInput: {
                      inputMode: 'numeric',
                      maxLength: 10,
                      pattern: '[6-9][0-9]{9}',
                    },
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography aria-hidden="true" color="text.secondary">
                            +91
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                  }}
                  type="tel"
                />
                <Box>
                  <Controller
                    control={control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            disabled={isSubmitting || isSuccess}
                            inputRef={field.ref}
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={(_, checked) => field.onChange(checked)}
                            required
                          />
                        }
                        label={
                          <Typography variant="body2">
                            I agree to the{' '}
                            <MuiLink component={Link} to={ROUTES.TERMS_OF_USE}>
                              Terms of Use
                            </MuiLink>{' '}
                            and{' '}
                            <MuiLink component={Link} to={ROUTES.PRIVACY_POLICY}>
                              Privacy Policy
                            </MuiLink>
                            .
                          </Typography>
                        }
                      />
                    )}
                  />
                  {errors.termsAccepted ? (
                    <FormHelperText error>{errors.termsAccepted.message}</FormHelperText>
                  ) : null}
                </Box>
                <Button
                  disabled={isSubmitting || isSuccess}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  {isSuccess ? 'Success! Redirecting...' : isSubmitting ? 'Creating account…' : 'Create account'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};