// import { yupResolver } from '@hookform/resolvers/yup';
// import { Alert, Button, Link as MuiLink, Stack, Typography } from '@mui/material';
// import { enqueueSnackbar } from 'notistack';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Link, useLocation, useNavigate } from 'react-router-dom';

// import { ROUTES } from '@/constants/routes';
// import { AuthPageHeader } from '@/features/auth/components/AuthPageHeader';
// import { IndianMobileField } from '@/features/auth/components/IndianMobileField';
// import { OtpInput } from '@/features/auth/components/OtpInput';
// import { useOtpCooldown } from '@/features/auth/hooks/useOtpCooldown';
// import {
//   getAuthenticationErrorMessage,
//   getRetryAfterSeconds,
// } from '@/features/auth/services/authErrorMapper';
// import { authService } from '@/features/auth/services/authService';
// import { loginWithOtp } from '@/features/auth/store/authSlice';
// import { getSafeRedirectPath } from '@/features/auth/utils/safeRedirect';
// import {
//   mobileNumberSchema,
//   type MobileNumberFormValues,
// } from '@/features/auth/validation/authSchemas';
// import { useAppDispatch } from '@/hooks/reduxHooks';
// import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

// interface OtpLoginLocationState {
//   from?: unknown;
// }

// // export const MobileOtpLoginPage = () => {
// //   useDocumentMetadata(
// //     'Log in with mobile OTP | Career Portal',
// //     'Candidate login using a verified Indian mobile number and one-time password.',
// //   );
//   const dispatch = useAppDispatch();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const locationState = location.state as OtpLoginLocationState | null;
//   const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
//   const [otp, setOtp] = useState('');
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [feedback, setFeedback] = useState<string | null>(null);
//   const { restart, secondsRemaining } = useOtpCooldown();
//   const {
//     formState: { errors, isSubmitting },
//     handleSubmit,
//     register,
//     setFocus,
//   } = useForm<MobileNumberFormValues>({
//     defaultValues: { phoneNumber: '' },
//     mode: 'onTouched',
//     resolver: yupResolver(mobileNumberSchema),
//   });

//   const requestOtp = async (values: MobileNumberFormValues) => {
//     setErrorMessage(null);
//     try {
//       await authService.requestLoginOtp({ phoneNumber: values.phoneNumber });
//       setPhoneNumber(values.phoneNumber);
//       setFeedback('If the mobile number is eligible, a verification code has been sent.');
//       restart(60);
//     } catch (error: unknown) {
//       setErrorMessage(getAuthenticationErrorMessage(error));
//       const retryAfter = getRetryAfterSeconds(error);
//       if (retryAfter) restart(retryAfter);
//     }
//   };

//   const verifyOtp = async () => {
//     if (!phoneNumber || otp.length !== 6 || isVerifying) return;
//     setIsVerifying(true);
//     setErrorMessage(null);
//     try {
//       await dispatch(loginWithOtp({ otp, phoneNumber })).unwrap();
//       enqueueSnackbar('Welcome back.', { variant: 'success' });
//       await navigate(getSafeRedirectPath(locationState?.from) ?? ROUTES.DASHBOARD, {
//         replace: true,
//       });
//     } catch (error: unknown) {
//       setErrorMessage(typeof error === 'string' ? error : 'Unable to log in. Please try again.');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   const resend = async () => {
//     if (!phoneNumber || secondsRemaining > 0 || isResending) return;
//     setIsResending(true);
//     setErrorMessage(null);
//     try {
//       await authService.requestLoginOtp({ phoneNumber });
//       setOtp('');
//       setFeedback('If the mobile number is eligible, a new verification code has been sent.');
//       restart(60);
//     } catch (error: unknown) {
//       setErrorMessage(getAuthenticationErrorMessage(error));
//       restart(getRetryAfterSeconds(error) ?? 60);
//     } finally {
//       setIsResending(false);
//     }
//   };

//   return (
//     <Stack spacing={3}>
//       <AuthPageHeader
//         description="Mobile OTP login is available to Candidate accounts with a verified number."
//         title="Log in with mobile OTP"
//       />
//       {errorMessage ? (
//         <Alert aria-live="assertive" id="login-otp-error" severity="error">
//           {errorMessage}
//         </Alert>
//       ) : null}
//       {feedback ? (
//         <Alert aria-live="polite" severity="info">
//           {feedback}
//         </Alert>
//       ) : null}

//       {!phoneNumber ? (
//         <Stack
//           component="form"
//           noValidate
//           onSubmit={(event) => void handleSubmit(requestOtp, () => setFocus('phoneNumber'))(event)}
//           spacing={2.5}
//         >
//           <IndianMobileField
//             autoFocus
//             disabled={isSubmitting}
//             errorMessage={errors.phoneNumber?.message}
//             registration={register('phoneNumber')}
//           />
//           <Button disabled={isSubmitting || secondsRemaining > 0} type="submit" variant="contained">
//             {isSubmitting
//               ? 'Sending…'
//               : secondsRemaining > 0
//                 ? `Try again in ${secondsRemaining}s`
//                 : 'Send OTP'}
//           </Button>
//         </Stack>
//       ) : (
//         <Stack spacing={2.5}>
//           <OtpInput
//             autoFocus
//             describedBy={errorMessage ? 'login-otp-error' : undefined}
//             disabled={isVerifying}
//             hasError={Boolean(errorMessage)}
//             onChange={(value) => {
//               setOtp(value);
//               setErrorMessage(null);
//             }}
//             value={otp}
//           />
//           <Button
//             disabled={otp.length !== 6 || isVerifying}
//             onClick={() => void verifyOtp()}
//             variant="contained"
//           >
//             {isVerifying ? 'Logging in…' : 'Verify and log in'}
//           </Button>
//           <Button
//             aria-live={secondsRemaining > 0 ? 'polite' : undefined}
//             disabled={secondsRemaining > 0 || isResending}
//             onClick={() => void resend()}
//           >
//             {isResending
//               ? 'Sending…'
//               : secondsRemaining > 0
//                 ? `Resend code in ${secondsRemaining}s`
//                 : 'Resend code'}
//           </Button>
//           <Button
//             onClick={() => {
//               setPhoneNumber(null);
//               setOtp('');
//               setFeedback(null);
//               setErrorMessage(null);
//             }}
//           >
//             Use a different mobile number
//           </Button>
//         </Stack>
//       )}

//       <Typography color="text.secondary" textAlign="center">
//         <MuiLink
//           component={Link}
//           state={locationState?.from ? { from: locationState.from } : undefined}
//           to={ROUTES.LOGIN}
//         >
//           Log in with password
//         </MuiLink>
//       </Typography>
//     </Stack>
//   );
// };
