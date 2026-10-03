import {

  Alert,

  Avatar,

  Box,

  Button,

  Chip,

  Divider,

  Grid,

  Paper,

  Stack,

  Typography,

} from '@mui/material';

import {

  BadgeRounded,

  BusinessRounded,

  CheckCircleRounded,

  InfoOutlined,

  LanguageRounded,

  LaunchRounded,

  PersonRounded,

  PsychologyRounded,

  WorkRounded,

} from '@mui/icons-material';

import { Link } from 'react-router-dom';



import {

  GuidanceForm,

  type FormValues,

  type GuidanceField,

} from './GuidanceForm';

import {

  CareerProfessionalType,

  ConsultantVerificationStatus,

  type ConsultantPrivateResponse,

} from '../types';

import { enumOptions } from '../utils/presentation';

import { guidanceRoutes } from '../utils/routes';
import { useAuthenticatedProfilePhoto } from '../hooks/useAuthenticatedProfilePhoto';



interface ConsultantPublicProfileEditorProps {

  profile: ConsultantPrivateResponse;

  busy: boolean;

  onSubmit: (values: FormValues) => Promise<unknown>;

}



function statusLabel(status: ConsultantVerificationStatus) {

  switch (status) {

    case ConsultantVerificationStatus.Verified:

      return 'Approved';



    case ConsultantVerificationStatus.Pending:

      return 'Under review';



    case ConsultantVerificationStatus.Rejected:

      return 'Changes required';



    case ConsultantVerificationStatus.Suspended:

      return 'Restricted';



    case ConsultantVerificationStatus.Draft:

      return 'Draft';



    default:

      return 'Consultant';

  }

}



function statusColor(
  status: ConsultantVerificationStatus,
): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case ConsultantVerificationStatus.Verified:
      return 'success';

    case ConsultantVerificationStatus.Pending:
      return 'warning';

    case ConsultantVerificationStatus.Rejected:
      return 'error';

    case ConsultantVerificationStatus.Suspended:
      return 'error';

    case ConsultantVerificationStatus.Draft:
    default:
      return 'default';
  }
}



function SectionHeading({

  icon,

  title,

  description,

}: {

  icon: React.ReactNode;

  title: string;

  description: string;

}) {

  return (

    <Stack

      direction="row"

      spacing={1.5}

      alignItems="flex-start"

    >

      <Box

        sx={{

          width: 40,

          height: 40,

          borderRadius: 2,

          bgcolor: 'action.hover',

          color: 'primary.main',

          display: 'grid',

          placeItems: 'center',

          flexShrink: 0,

        }}

      >

        {icon}

      </Box>



      <Box>

        <Typography

          variant="h6"

          fontWeight={800}

        >

          {title}

        </Typography>



        <Typography

          variant="body2"

          color="text.secondary"

          sx={{ mt: 0.25 }}

        >

          {description}

        </Typography>

      </Box>

    </Stack>

  );

}



export default function ConsultantPublicProfileEditor({

  profile,

  busy,

  onSubmit,

}: ConsultantPublicProfileEditorProps) {
  const { photoUrl } = useAuthenticatedProfilePhoto();


  const isSuspended =

    profile.verificationStatus ===

    ConsultantVerificationStatus.Suspended;



  const initial: FormValues = {

    displayName: profile.profile.displayName,

    professionalHeadline:

      profile.profile.professionalHeadline,

    companyName: profile.profile.companyName,

    currentRole: profile.profile.currentRole,

    yearsOfExperience:

      profile.profile.yearsOfExperience ?? 0,

    professionalType:

      profile.profile.professionalType ??

      CareerProfessionalType.CurrentEmployee,

    linkedInUrl: profile.linkedInUrl,

    languages: profile.profile.languages.join(', '),

    expertise: profile.profile.expertise.join(', '),

    bio: profile.profile.bio,

    acceptIndependentGuidancePolicy: true,

  };



  const identityFields: GuidanceField[] = [

    {

      name: 'displayName',

      label: 'Display name',

      required: true,

      maxLength: 120,

      helper:

        'This name is shown to candidates on your public profile.',

    },

    {

      name: 'professionalHeadline',

      label: 'Professional headline',

      required: true,

      maxLength: 200,

      helper:

        'Example: Senior Software Engineer | Career Mentor',

    },

  ];



  const professionalFields: GuidanceField[] = [

    {

      name: 'companyName',

      label: 'Company name',

      required: true,

      maxLength: 200,

    },

    {

      name: 'currentRole',

      label: 'Current role',

      required: true,

      maxLength: 160,

    },

    {

      name: 'yearsOfExperience',

      label: 'Years of experience',

      kind: 'number',

      min: 0,

      max: 70,

      step: 0.1,

      required: true,

    },

    {

      name: 'professionalType',

      label: 'Professional type',

      kind: 'select',

      required: true,

      options: enumOptions(CareerProfessionalType),

    },

    {

      name: 'linkedInUrl',

      label: 'LinkedIn URL',

      required: true,

      maxLength: 500,

      helper:

        'Used as part of your professional profile verification.',

    },

  ];



  const expertiseFields: GuidanceField[] = [

    {

      name: 'languages',

      label: 'Languages',

      required: true,

      helper:

        'Enter multiple languages separated by commas.',

    },

    {

      name: 'expertise',

      label: 'Areas of expertise',

      required: true,

      helper:

        'Example: Career planning, Software engineering, Interview preparation',

    },

  ];



  const aboutFields: GuidanceField[] = [

    {

      name: 'bio',

      label: 'Professional bio',

      kind: 'textarea',

      required: true,

      maxLength: 4000,

      helper:

        'Explain your experience and how you can help candidates.',

    },

  ];



  const policyFields: GuidanceField[] = [

    {

      name: 'acceptIndependentGuidancePolicy',

      label:

        'I understand that Career Guidance is independent guidance and does not represent an employer or guarantee a job, interview, referral, or hiring outcome.',

      kind: 'checkbox',

      required: true,

    },

  ];



  const allFields = [

    ...identityFields,

    ...professionalFields,

    ...expertiseFields,

    ...aboutFields,

    ...policyFields,

  ];



  /*

   * GuidanceForm owns one state object for the complete form.

   * We use the full field collection below and provide visual

   * context above it without changing shared form behavior.

   */

  return (

    <Stack spacing={2.5}>

      <Paper

        variant="outlined"

        sx={{

          p: {

            xs: 2,

            md: 3,

          },

          borderRadius: 3,

        }}

      >

        <Stack

          direction={{

            xs: 'column',

            sm: 'row',

          }}

          justifyContent="space-between"

          alignItems={{

            xs: 'flex-start',

            sm: 'center',

          }}

          spacing={2}

        >

          <Stack

            direction="row"

            spacing={1.5}

            alignItems="center"

          >

            <Avatar

              src={photoUrl ?? undefined}

              alt={profile.profile.displayName}

              sx={{

                width: 52,

                height: 52,

                bgcolor: 'action.hover',

                color: 'primary.main',

              }}

            >

              <PersonRounded />

            </Avatar>



            <Box>

              <Stack

                direction="row"

                spacing={1}

                alignItems="center"

                flexWrap="wrap"

              >

                <Typography

                  variant="h5"

                  fontWeight={800}

                >

                  Public profile

                </Typography>



                <Chip

                  size="small"

                  color={statusColor(

                    profile.verificationStatus,

                  )}

                  label={statusLabel(

                    profile.verificationStatus,

                  )}

                />

              </Stack>



              <Typography

                variant="body2"

                color="text.secondary"

                sx={{ mt: 0.4 }}

              >

                Manage the professional information candidates

                see before booking your guidance services.

              </Typography>

            </Box>

          </Stack>



          <Button

            component={Link}

            to={guidanceRoutes.profile(

              profile.profile.id,

            )}

            variant="outlined"

            endIcon={<LaunchRounded />}

          >

            View public profile

          </Button>

        </Stack>

      </Paper>



      {profile.verificationStatus ===

      ConsultantVerificationStatus.Verified ? (

        <Alert

          severity="info"

          icon={<InfoOutlined />}

        >

          Your profile is currently approved. Material changes to

          your professional profile may require verification again

          before you can accept new bookings.

        </Alert>

      ) : null}



      {profile.verificationStatus ===

        ConsultantVerificationStatus.Rejected &&

      profile.verificationReason ? (

        <Alert severity="warning">

          Review feedback: {profile.verificationReason}

        </Alert>

      ) : null}



      {isSuspended ? (

        <Alert severity="error">

          This consultant profile is currently restricted. Profile

          editing is unavailable while the restriction is active.

        </Alert>

      ) : null}



      <Paper

        variant="outlined"

        sx={{

          p: {

            xs: 2,

            md: 3,

          },

          borderRadius: 3,

        }}

      >

        <Stack spacing={3}>

          <SectionHeading

            icon={<BadgeRounded />}

            title="Professional identity"

            description="Your name and headline are the first things candidates see."

          />



          <Divider />



          <Grid container spacing={2}>

            <Grid size={{ xs: 12, md: 6 }}>

              <Stack spacing={1}>

                <Typography

                  variant="caption"

                  color="text.secondary"

                  fontWeight={700}

                >

                  CURRENT DISPLAY NAME

                </Typography>



                <Typography fontWeight={700}>

                  {profile.profile.displayName}

                </Typography>

              </Stack>

            </Grid>



            <Grid size={{ xs: 12, md: 6 }}>

              <Stack spacing={1}>

                <Typography

                  variant="caption"

                  color="text.secondary"

                  fontWeight={700}

                >

                  CURRENT HEADLINE

                </Typography>



                <Typography fontWeight={700}>

                  {profile.profile.professionalHeadline}

                </Typography>

              </Stack>

            </Grid>

          </Grid>



          <SectionHeading

            icon={<BusinessRounded />}

            title="Professional details"

            description="Keep your current role, company and experience accurate."

          />



          <Divider />



          <Grid container spacing={2}>

            <Grid size={{ xs: 12, sm: 6 }}>

              <Stack

                direction="row"

                spacing={1}

                alignItems="center"

              >

                <BusinessRounded

                  fontSize="small"

                  color="action"

                />



                <Typography variant="body2">

                  {profile.profile.companyName ||

                    'Company not provided'}

                </Typography>

              </Stack>

            </Grid>



            <Grid size={{ xs: 12, sm: 6 }}>

              <Stack

                direction="row"

                spacing={1}

                alignItems="center"

              >

                <WorkRounded

                  fontSize="small"

                  color="action"

                />



                <Typography variant="body2">

                  {profile.profile.currentRole ||

                    'Role not provided'}

                </Typography>

              </Stack>

            </Grid>

          </Grid>



          <SectionHeading

            icon={<PsychologyRounded />}

            title="Expertise & communication"

            description="Help candidates understand the topics and languages you can support."

          />



          <Divider />



          <Stack spacing={1.5}>

            <Box>

              <Typography

                variant="caption"

                color="text.secondary"

                fontWeight={700}

              >

                LANGUAGES

              </Typography>



              <Stack

                direction="row"

                spacing={1}

                useFlexGap

                flexWrap="wrap"

                sx={{ mt: 1 }}

              >

                {profile.profile.languages.length ? (

                  profile.profile.languages.map(

                    (language) => (

                      <Chip

                        key={language}

                        size="small"

                        icon={<LanguageRounded />}

                        label={language}

                      />

                    ),

                  )

                ) : (

                  <Typography

                    variant="body2"

                    color="text.secondary"

                  >

                    No languages added.

                  </Typography>

                )}

              </Stack>

            </Box>



            <Box>

              <Typography

                variant="caption"

                color="text.secondary"

                fontWeight={700}

              >

                EXPERTISE

              </Typography>



              <Stack

                direction="row"

                spacing={1}

                useFlexGap

                flexWrap="wrap"

                sx={{ mt: 1 }}

              >

                {profile.profile.expertise.length ? (

                  profile.profile.expertise.map(

                    (expertise) => (

                      <Chip

                        key={expertise}

                        size="small"

                        variant="outlined"

                        label={expertise}

                      />

                    ),

                  )

                ) : (

                  <Typography

                    variant="body2"

                    color="text.secondary"

                  >

                    No expertise added.

                  </Typography>

                )}

              </Stack>

            </Box>

          </Stack>



          <Divider />



          <Box>

            <Typography

              variant="h6"

              fontWeight={800}

            >

              Edit profile information

            </Typography>



            <Typography

              variant="body2"

              color="text.secondary"

              sx={{ mt: 0.4, mb: 2 }}

            >

              Update the information below and save when you're

              finished.

            </Typography>



            <GuidanceForm

              key={profile.revision}

              initial={initial}

              fields={allFields}

              busy={busy}

              disabled={isSuspended}

              submitLabel="Save profile"

              onSubmit={onSubmit}

            />

          </Box>



          <Alert

            severity="info"

            icon={<CheckCircleRounded />}

          >

            Keep your public information accurate and avoid sharing

            confidential employer or candidate information.

          </Alert>

        </Stack>

      </Paper>

    </Stack>

  );

}