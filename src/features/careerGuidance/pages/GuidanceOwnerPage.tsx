import {
  Alert,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useLocation } from 'react-router-dom';

import ConsultantDisputes from '../components/ConsultantDisputes';
import {
  GuidanceNavigation,
  GuidancePage,
  GuidanceLoading,
  GuidanceError,
  StatusChip,
} from '../components/GuidanceUI';

import ConsultantOverview from '../components/ConsultantOverview';
import ConsultantPublicProfileEditor from '../components/ConsultantPublicProfileEditor';
import ConsultantServices from '../components/ConsultantServices';
import ConsultantAvailability from '../components/ConsultantAvailability';
import ConsultantPerformance from '../components/ConsultantPerformance';

import {
  numberValue,
  textValue,
} from '../utils/formValues';

import {
  useApplyConsultantMutation,
  useGetOwnProfileQuery,
  useUpdateOwnProfileMutation,
} from '../api/profilesApi';

import { ConsultantVerificationStatus } from '../types';

import { useGuidanceAction } from '../hooks/useGuidanceAction';

export default function GuidanceOwnerPage() {
  const section =
    useLocation().pathname.split('/').pop() ?? '';

  const profile = useGetOwnProfileQuery();
  const action = useGuidanceAction();

  const [apply] = useApplyConsultantMutation();
  const [update] = useUpdateOwnProfileMutation();

  const p = profile.data;

  const isOverview =
    section === 'consultant' || section === '';

  const submitProfile = (
    values: Record<
      string,
      string | number | boolean
    >,
  ) =>
    action.execute(
      () =>
        (p ? update : apply)({
          displayName: textValue(
            values,
            'displayName',
          ),

          professionalHeadline: textValue(
            values,
            'professionalHeadline',
          ),

          bio: textValue(values, 'bio'),

          companyId:
            p?.profile.companyId ?? null,

          companyName: textValue(
            values,
            'companyName',
          ),

          currentRole: textValue(
            values,
            'currentRole',
          ),

          yearsOfExperience: numberValue(
            values,
            'yearsOfExperience',
          ),

          professionalType: numberValue(
            values,
            'professionalType',
          ),

          linkedInUrl: textValue(
            values,
            'linkedInUrl',
          ),

          languages: textValue(
            values,
            'languages',
          )
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),

          expertise: textValue(
            values,
            'expertise',
          )
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),

          acceptIndependentGuidancePolicy:
            true,

          revision: p?.revision ?? null,
        }).unwrap(),

      p
        ? 'Profile saved; verification may be required again.'
        : 'Application submitted.',
    );

  return (
    <GuidancePage
      title={
        section === 'application'
          ? 'Consultant application'
          : 'Consultant workspace'
      }
      description="Consultant access is an account capability granted by backend verification."
    >
      <GuidanceNavigation owner />

      {profile.isLoading ? (
        <GuidanceLoading />
      ) : profile.isError ? (
        <GuidanceError
          error={profile.error}
          retry={profile.refetch}
        />
      ) : (
        <Stack spacing={2}>
          {p && isOverview && (
            <ConsultantOverview profile={p} />
          )}

          {!isOverview &&
            section !== 'profile' &&
            section !== 'analytics' &&
            section !== 'disputes' && (
              <Alert severity="info">
                Independent guidance does not
                represent an employer and does not
                guarantee a job, interview, or
                referral.
              </Alert>
            )}

          {p &&
            !isOverview &&
            section !== 'profile' &&
            section !== 'analytics' &&
            section !== 'disputes' && (
              <StatusChip
                values={
                  ConsultantVerificationStatus
                }
                value={p.verificationStatus}
              />
            )}

          {section === 'profile' && p && (
            <ConsultantPublicProfileEditor
              profile={p}
              busy={action.busy}
              onSubmit={submitProfile}
            />
          )}

          {section === 'application' && !p && (
            <Paper sx={{ p: 3 }}>
              <Typography
                component="h2"
                variant="h3"
                sx={{ mb: 2 }}
              >
                Application
              </Typography>

              <Alert
                severity="info"
                sx={{ mb: 2 }}
              >
                Complete consultant onboarding
                before submitting your application.
              </Alert>
            </Paper>
          )}

          {section === 'services' && p && (
            <ConsultantServices profile={p} />
          )}

          {section === 'availability' && p && (
            <ConsultantAvailability />
          )}

          {section === 'disputes' && p && (
            <ConsultantDisputes />
          )}

          {section === 'analytics' && p && (
            <ConsultantPerformance />
          )}
        </Stack>
      )}
    </GuidancePage>
  );
}