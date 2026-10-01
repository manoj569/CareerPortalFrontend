import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Divider,
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
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { toApiRequestError } from '@/api/apiError';
import { applyApiValidationErrors } from '@/api/formErrors';
import { AppBrand } from '@/components/navigation/AppBrand';
import { ROUTES } from '@/constants/routes';
import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
import { GoogleAuthorizationCodeButton } from '@/features/auth/components/GoogleAuthorizationCodeButton';
import { PasswordField } from '@/features/auth/components/PasswordField';
import {
  getAuthenticationErrorMessage,
  getGoogleAuthenticationErrorMessage,
} from '@/features/auth/services/authErrorMapper';
import { authService } from '@/features/auth/services/authService';
import { sessionRefreshed } from '@/features/auth/store/authSlice';
import { getSafeRedirectLocation } from '@/features/auth/utils/safeRedirect';
import {
  registrationSchema,
  sanitizeFullNameInput,
  sanitizeIndianMobileInput,
  type RegistrationFormValues,
} from '@/features/auth/validation/authSchemas';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { UserRole } from '@/types';

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
  const controlSx = { maxWidth: 440, mx: 'auto', width: '100%' };
  useDocumentMetadata(
    'Create Your Career Harbor Account | Career Harbor',
    'Create a Career Harbor candidate account to save jobs, upload your resume, apply to roles, and track applications.',
    { canonicalPath: ROUTES.REGISTER, noIndex: false },
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [googleAccountConflict, setGoogleAccountConflict] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const {
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
      termsAccepted: true,
    },
    mode: 'onTouched',
    resolver: yupResolver(registrationSchema),
  });

  const fullNameField = register('fullName');
  const mobileField = register('phoneNumber');
  const safeReturnLocation = getSafeRedirectLocation(
    (location.state as { from?: unknown } | null)?.from,
  );

  const submitRegistration = async (values: RegistrationFormValues) => {
    setServerError(null);
    setHasValidationErrors(false);
    setIsSuccess(false);
    setGoogleAccountConflict(false);

    try {
      await authService.register({
        email: values.email.trim(),
        fullName: values.fullName.trim(),
        hasAcceptedTermsAndPrivacy: values.termsAccepted,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });

      setRegisteredEmail(values.email.trim());
      setIsSuccess(true);
    } catch (error: unknown) {
      const registrationError = toApiRequestError(error);
      if (registrationError.status === 409 && registrationError.code === 'ACCOUNT_EXISTS_GOOGLE') {
        setGoogleAccountConflict(true);
        setServerError(
          'This email is already registered with Google. Continue with Google to sign in.',
        );
        return;
      }
      const hasFieldErrors = applyApiValidationErrors(
        error,
        ['fullName', 'email', 'password', 'phoneNumber'] as const,
        setError,
      );
      if (hasFieldErrors) {
        setHasValidationErrors(true);
        return;
      }

      // ✅ NEW: Check for a JSON error response from the backend
      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as { code?: string; message?: string };

        if (apiError.code === 'registration_email_exists') {
          setError('email', {
            type: 'server',
            message: 'An account already exists with this email. Please log in.',
          });
          setHasValidationErrors(true);
          return;
        }

        if (apiError.code === 'registration_phone_exists') {
          setError('phoneNumber', {
            type: 'server',
            message: 'An account already exists with this mobile number. Please log in.',
          });
          setHasValidationErrors(true);
          return;
        }

        if (apiError.code === 'registration_identity_exists') {
          setError('email', {
            type: 'server',
            message: 'An account already exists with this email. Please log in.',
          });
          setError('phoneNumber', {
            type: 'server',
            message: 'An account already exists with this mobile number. Please log in.',
          });
          setHasValidationErrors(true);
          return;
        }
      }

      setServerError(getAuthenticationErrorMessage(error));
    }
  };

  const submitGoogleRegistration = async (code: string) => {
    if (isSubmitting || isGoogleSubmitting || isSuccess) return;
    setServerError(null);
    setIsGoogleSubmitting(true);
    try {
      const response = await authService.googleAuthenticateWithCode({
        code,
        intent: googleAccountConflict ? 'Login' : 'Register',
        acceptTerms: !googleAccountConflict,
      });
      dispatch(sessionRefreshed(response));
      enqueueSnackbar(
        googleAccountConflict ? 'Signed in successfully.' : 'Account created successfully.',
        { variant: 'success' },
      );
      const destination =
        response.user.role === UserRole.Candidate
          ? `${safeReturnLocation?.pathname ?? ROUTES.DASHBOARD}${safeReturnLocation?.search ?? ''}${safeReturnLocation?.hash ?? ''}`
          : ROUTES.ADMIN;
      await navigate(destination, { replace: true });
    } catch (error: unknown) {
      setServerError(
        getGoogleAuthenticationErrorMessage(error, googleAccountConflict ? 'Login' : 'Register'),
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const googleButton = (
    <GoogleAuthorizationCodeButton
      disabled={isSubmitting || isSuccess || isGoogleSubmitting}
      onCode={(code) => {
        void submitGoogleRegistration(code);
      }}
      onPopupError={setServerError}
    />
  );

  return (
    <Stack spacing={{ xs: 3, md: 4 }}>
      <RegistrationHeader />
      <Grid alignItems="stretch" container spacing={{ xs: 3, md: 4 }}>
        <Grid order={{ xs: 2, md: 1 }} size={{ xs: 12, md: 4 }}>
          <BenefitsPanel />
        </Grid>
        <Grid order={{ xs: 1, md: 2 }} size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 2, sm: 4 } }}>
            <Stack spacing={3}>
              {isSuccess ? (
                <Stack
                  alignItems="center"
                  aria-live="polite"
                  spacing={2.5}
                  sx={controlSx}
                  textAlign="center"
                >
                  <Typography component="h1" variant="h2">
                    Check your email to verify your account
                  </Typography>

                  <Alert severity="success" sx={{ width: '100%' }}>
                    Your CareerHarbor account has been created successfully.
                  </Alert>

                  <Typography color="text.secondary">
                    We sent a verification link to <strong>{registeredEmail}</strong>. Open the link
                    to verify your email address, then log in to your account.
                  </Typography>

                  <Typography color="text.secondary" variant="body2">
                    Can't find the email? Check your spam or junk folder.
                  </Typography>
                  <Button
                    component={Link}
                    state={safeReturnLocation ? { from: safeReturnLocation } : undefined}
                    to={ROUTES.LOGIN}
                    variant="outlined"
                  >
                    Go to log in
                  </Button>
                </Stack>
              ) : (
                <>
                  <AuthPageHeader title="Create your account" />
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

                  {googleAccountConflict && <Box sx={controlSx}>{googleButton}</Box>}
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
                    sx={controlSx}
                  >
                    <TextField
                      autoComplete="name"
                      disabled={isSubmitting || isSuccess || isGoogleSubmitting}
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
                      disabled={isSubmitting || isSuccess || isGoogleSubmitting}
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
                      disabled={isSubmitting || isSuccess || isGoogleSubmitting}
                      errorMessage={errors.password?.message}
                      label="Password"
                      placeholder="Minimum 6 characters"
                      registration={register('password')}
                    />
                    <TextField
                      autoComplete="tel-national"
                      disabled={isSubmitting || isSuccess || isGoogleSubmitting}
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
                    <Typography color="text.secondary" variant="body2">
                      By creating an account, you agree to the{' '}
                      <MuiLink component={Link} to={ROUTES.TERMS_OF_USE}>
                        Terms of Use
                      </MuiLink>{' '}
                      and{' '}
                      <MuiLink component={Link} to={ROUTES.PRIVACY_POLICY}>
                        Privacy Policy
                      </MuiLink>
                      .
                    </Typography>
                    <Button
                      disabled={isSubmitting || isSuccess || isGoogleSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                    >
                      {isSubmitting ? 'Creating account…' : 'Create account'}
                    </Button>
                    <Divider aria-label="OR">OR</Divider>
                    <Typography color="text.secondary" variant="body2">
                      By continuing with Google, you agree to the{' '}
                      <MuiLink component={Link} to={ROUTES.TERMS_OF_USE}>
                        Terms of Use
                      </MuiLink>{' '}
                      and{' '}
                      <MuiLink component={Link} to={ROUTES.PRIVACY_POLICY}>
                        Privacy Policy
                      </MuiLink>
                      .
                    </Typography>
                    {!googleAccountConflict && googleButton}
                  </Stack>
                </>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
