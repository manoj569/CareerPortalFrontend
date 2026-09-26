import {
  ArrowBackOutlined,
  BusinessCenterOutlined,
  CheckCircleOutlined,
  LanguageOutlined,
  LocationOnOutlined,
  SchoolOutlined,
  StarRounded,
  WorkOutlineOutlined,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetConsultantQuery } from '../api/profilesApi';
import { useGetPublicCareerReviewsQuery } from '../api/trustApi';
import {
  GuidanceError,
  GuidancePagination,
} from '../components/GuidanceUI';
import { CareerProfessionalType } from '../types';
import { enumLabel, money } from '../utils/presentation';
import { guidanceRoutes } from '../utils/routes';
import { isGuid } from '@/features/payments/utils/paymentReturnUrl';

const formatDate = (value: string | null) => {
  if (!value) return 'Present';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatEducationYears = (
  startYear: number | null,
  endYear: number | null,
  isCurrentlyStudying: boolean,
) => {
  if (!startYear && !endYear && !isCurrentlyStudying) {
    return null;
  }

  if (startYear && isCurrentlyStudying) {
    return `${startYear} – Present`;
  }

  if (startYear && endYear) {
    return `${startYear} – ${endYear}`;
  }

  if (startYear) {
    return `${startYear}`;
  }

  if (endYear) {
    return `${endYear}`;
  }

  return 'Currently studying';
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const ConsultantPublicPage = () => {
  const { consultantId = '' } = useParams();
  const [reviewPage, setReviewPage] = useState(1);

  const validConsultantId = isGuid(consultantId);

  const profile = useGetConsultantQuery(consultantId, {
    skip: !validConsultantId,
  });

  const reviews = useGetPublicCareerReviewsQuery(
    {
      consultantId,
      pageNumber: reviewPage,
      pageSize: 5,
    },
    {
      skip: !validConsultantId,
    },
  );

  const consultant = profile.data;

  const activeServices = useMemo(
    () => consultant?.services.filter((service) => service.isActive) ?? [],
    [consultant?.services],
  );

  const lowestServicePrice = useMemo(() => {
    if (!activeServices.length) return null;

    return activeServices.reduce((lowest, service) =>
      service.price < lowest.price ? service : lowest,
    );
  }, [activeServices]);

  if (!validConsultantId) {
    return (
      <GuidanceError
        error={new Error('Invalid consultant profile.')}
        retry={() => undefined}
      />
    );
  }

  if (profile.isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton height={36} width={240} />
        <Skeleton height={260} variant="rounded" />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Skeleton height={520} variant="rounded" />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton height={420} variant="rounded" />
          </Grid>
        </Grid>
      </Stack>
    );
  }

  if (!consultant || profile.isError) {
    return (
      <GuidanceError
        error={profile.error}
        retry={() => {
          void profile.refetch();
        }}
      />
    );
  }

  const professionalTypeLabel =
    consultant.professionalType !== null
      ? enumLabel(CareerProfessionalType, consultant.professionalType)
      : null;

  return (
    <Stack spacing={3}>
      {/* Breadcrumb / back navigation */}
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={1}
      >
        <Button
          component={Link}
          startIcon={<ArrowBackOutlined />}
          sx={{
            justifyContent: 'flex-start',
            px: 0,
            textTransform: 'none',
          }}
          to={guidanceRoutes.marketplace}
          variant="text"
        >
          Find a consultant
        </Button>

        <Typography color="text.disabled">/</Typography>

        <Typography color="text.secondary" variant="body2">
          Consultant profile
        </Typography>
      </Stack>

      {/* Profile hero */}
      <Paper
        component="section"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
          p: { xs: 2.5, md: 4 },
        }}
        variant="outlined"
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
            >
              <Avatar
                alt={consultant.displayName}
                src={consultant.profileImageUrl || undefined}
                sx={{
                  bgcolor: 'primary.main',
                  fontSize: 30,
                  fontWeight: 800,
                  height: 104,
                  width: 104,
                }}
              >
                {initials(consultant.displayName)}
              </Avatar>

              <Stack spacing={1.1}>
                <Stack
                  alignItems="center"
                  direction="row"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Typography
                    component="h1"
                    fontWeight={800}
                    variant="h4"
                  >
                    {consultant.displayName}
                  </Typography>

                  <Chip
                    color="success"
                    icon={<CheckCircleOutlined />}
                    label={consultant.approvalLabel || 'CareerHarbor reviewed'}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Typography
                  color="text.secondary"
                  fontWeight={600}
                  variant="body1"
                >
                  {consultant.professionalHeadline}
                </Typography>

                {(consultant.currentRole || consultant.companyName) && (
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={0.75}
                  >
                    <BusinessCenterOutlined
                      sx={{ color: 'text.secondary', fontSize: 18 }}
                    />

                    <Typography color="text.secondary" variant="body2">
                      {[consultant.currentRole, consultant.companyName]
                        .filter(Boolean)
                        .join(' at ')}
                    </Typography>
                  </Stack>
                )}

                <Stack
                  alignItems="center"
                  direction="row"
                  flexWrap="wrap"
                  gap={1.5}
                >
                  {consultant.averageRating !== null ? (
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={0.5}
                    >
                      <StarRounded
                        sx={{
                          color: 'warning.main',
                          fontSize: 20,
                        }}
                      />

                      <Typography fontWeight={700}>
                        {consultant.averageRating.toFixed(1)}
                      </Typography>

                      <Typography color="text.secondary" variant="body2">
                        ({consultant.reviewCount}{' '}
                        {consultant.reviewCount === 1 ? 'review' : 'reviews'})
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography color="text.secondary" variant="body2">
                      No published ratings yet
                    </Typography>
                  )}

                  {consultant.yearsOfExperience !== null && (
                    <Typography color="text.secondary" variant="body2">
                      {consultant.yearsOfExperience} years experience
                    </Typography>
                  )}

                  {consultant.location && (
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={0.4}
                    >
                      <LocationOnOutlined
                        sx={{
                          color: 'text.secondary',
                          fontSize: 18,
                        }}
                      />

                      <Typography color="text.secondary" variant="body2">
                        {consultant.location}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack
              alignItems={{ xs: 'flex-start', md: 'flex-end' }}
              height="100%"
              justifyContent="center"
              spacing={1}
            >
              <Chip
                color={consultant.isAcceptingBookings ? 'success' : 'default'}
                label={
                  consultant.isAcceptingBookings
                    ? 'Accepting bookings'
                    : 'Not accepting bookings'
                }
                variant="outlined"
              />

              {lowestServicePrice && (
                <Typography color="text.secondary" variant="body2">
                  Sessions from{' '}
                  <Box
                    component="span"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 800,
                    }}
                  >
                    {money(
                      lowestServicePrice.price,
                      lowestServicePrice.currency,
                    )}
                  </Box>
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Main profile content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* About */}
            <Paper
              component="section"
              sx={{
                borderRadius: 3,
                p: { xs: 2.5, md: 3.5 },
              }}
              variant="outlined"
            >
              <Stack spacing={2}>
                <Typography component="h2" fontWeight={800} variant="h5">
                  About
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {consultant.bio || 'No professional bio has been added yet.'}
                </Typography>

                {(professionalTypeLabel ||
                  consultant.industry ||
                  consultant.functionalArea) && (
                  <>
                    <Divider />

                    <Grid container spacing={2}>
                      {professionalTypeLabel && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                          >
                            Professional type
                          </Typography>

                          <Typography fontWeight={700}>
                            {professionalTypeLabel}
                          </Typography>
                        </Grid>
                      )}

                      {consultant.industry && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                          >
                            Industry
                          </Typography>

                          <Typography fontWeight={700}>
                            {consultant.industry}
                          </Typography>
                        </Grid>
                      )}

                      {consultant.functionalArea && (
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            color="text.secondary"
                            variant="caption"
                          >
                            Functional area
                          </Typography>

                          <Typography fontWeight={700}>
                            {consultant.functionalArea}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              </Stack>
            </Paper>

            {/* Expertise */}
            {(consultant.expertise.length > 0 ||
              consultant.languages.length > 0) && (
              <Paper
                component="section"
                sx={{
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3.5 },
                }}
                variant="outlined"
              >
                <Stack spacing={3}>
                  {consultant.expertise.length > 0 && (
                    <Stack spacing={1.5}>
                      <Typography
                        component="h2"
                        fontWeight={800}
                        variant="h5"
                      >
                        Areas of expertise
                      </Typography>

                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {consultant.expertise.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            sx={{ fontWeight: 600 }}
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Stack>
                  )}

                  {consultant.languages.length > 0 && (
                    <Stack spacing={1.5}>
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                      >
                        <LanguageOutlined color="action" />

                        <Typography fontWeight={800} variant="h6">
                          Languages
                        </Typography>
                      </Stack>

                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {consultant.languages.map((language) => (
                          <Chip key={language} label={language} size="small" />
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Work experience */}
            {consultant.workExperience.length > 0 && (
              <Paper
                component="section"
                sx={{
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3.5 },
                }}
                variant="outlined"
              >
                <Stack spacing={2.5}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                  >
                    <WorkOutlineOutlined color="action" />

                    <Typography
                      component="h2"
                      fontWeight={800}
                      variant="h5"
                    >
                      Work experience
                    </Typography>
                  </Stack>

                  {consultant.workExperience
                    .slice()
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((experience, index) => (
                      <Box
                        key={`${experience.companyName}-${experience.jobTitle}-${experience.startDate}`}
                      >
                        <Stack spacing={0.5}>
                          <Typography fontWeight={800}>
                            {experience.jobTitle}
                          </Typography>

                          <Typography color="text.secondary">
                            {experience.companyName}
                          </Typography>

                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            {formatDate(experience.startDate)} –{' '}
                            {experience.isCurrent
                              ? 'Present'
                              : formatDate(experience.endDate)}
                          </Typography>

                          {experience.description && (
                            <Typography
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.7,
                                pt: 0.5,
                                whiteSpace: 'pre-wrap',
                              }}
                              variant="body2"
                            >
                              {experience.description}
                            </Typography>
                          )}
                        </Stack>

                        {index < consultant.workExperience.length - 1 && (
                          <Divider sx={{ mt: 2.5 }} />
                        )}
                      </Box>
                    ))}
                </Stack>
              </Paper>
            )}

            {/* Education */}
            {consultant.education.length > 0 && (
              <Paper
                component="section"
                sx={{
                  borderRadius: 3,
                  p: { xs: 2.5, md: 3.5 },
                }}
                variant="outlined"
              >
                <Stack spacing={2.5}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                  >
                    <SchoolOutlined color="action" />

                    <Typography
                      component="h2"
                      fontWeight={800}
                      variant="h5"
                    >
                      Education
                    </Typography>
                  </Stack>

                  {consultant.education
                    .slice()
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((education, index) => {
                      const years = formatEducationYears(
                        education.startYear,
                        education.endYear,
                        education.isCurrentlyStudying,
                      );

                      return (
                        <Box
                          key={`${education.institution}-${education.qualification}-${education.displayOrder}`}
                        >
                          <Stack spacing={0.5}>
                            <Typography fontWeight={800}>
                              {education.qualification}
                            </Typography>

                            <Typography color="text.secondary">
                              {education.institution}
                            </Typography>

                            {education.fieldOfStudy && (
                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                {education.fieldOfStudy}
                              </Typography>
                            )}

                            {years && (
                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                {years}
                              </Typography>
                            )}
                          </Stack>

                          {index < consultant.education.length - 1 && (
                            <Divider sx={{ mt: 2.5 }} />
                          )}
                        </Box>
                      );
                    })}
                </Stack>
              </Paper>
            )}

            {/* Published reviews */}
            <Paper
              component="section"
              sx={{
                borderRadius: 3,
                p: { xs: 2.5, md: 3.5 },
              }}
              variant="outlined"
            >
              <Stack spacing={2.5}>
                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    component="h2"
                    fontWeight={800}
                    variant="h5"
                  >
                    Published reviews
                  </Typography>

                  {consultant.averageRating !== null && (
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={0.5}
                    >
                      <StarRounded
                        sx={{
                          color: 'warning.main',
                          fontSize: 22,
                        }}
                      />

                      <Typography fontWeight={800}>
                        {consultant.averageRating.toFixed(1)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                {reviews.isLoading ? (
                  <Stack spacing={2}>
                    <Skeleton height={120} variant="rounded" />
                    <Skeleton height={120} variant="rounded" />
                  </Stack>
                ) : reviews.isError ? (
                  <GuidanceError
                    error={reviews.error}
                    retry={() => {
                      void reviews.refetch();
                    }}
                  />
                ) : reviews.data?.items.length ? (
                  <Stack spacing={2}>
                    {reviews.data.items.map((review) => (
                      <Box
                        key={review.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack
                            alignItems={{
                              xs: 'flex-start',
                              sm: 'center',
                            }}
                            direction={{
                              xs: 'column',
                              sm: 'row',
                            }}
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Stack
                              alignItems="center"
                              direction="row"
                              spacing={1}
                            >
                              <Avatar
                                sx={{
                                  height: 36,
                                  width: 36,
                                }}
                              >
                                {initials(review.candidateDisplayName)}
                              </Avatar>

                              <Stack>
                                <Typography fontWeight={700}>
                                  {review.candidateDisplayName}
                                </Typography>

                                <Typography
                                  color="text.secondary"
                                  variant="caption"
                                >
                                  {new Intl.DateTimeFormat('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }).format(new Date(review.createdAtUtc))}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Rating
                              precision={1}
                              readOnly
                              size="small"
                              value={review.rating}
                            />
                          </Stack>

                          {review.title && (
                            <Typography fontWeight={700}>
                              {review.title}
                            </Typography>
                          )}

                          {review.comment && (
                            <Typography
                              color="text.secondary"
                              sx={{
                                lineHeight: 1.7,
                                whiteSpace: 'pre-wrap',
                              }}
                              variant="body2"
                            >
                              {review.comment}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    ))}

                    <GuidancePagination
                      count={reviews.data.totalPages}
                      onChange={setReviewPage}
                      page={reviewPage}
                    />
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    No published reviews yet.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Booking sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            component="aside"
            sx={{
              borderRadius: 3,
              p: { xs: 2.5, md: 3 },
              position: { lg: 'sticky' },
              top: { lg: 96 },
            }}
            variant="outlined"
          >
            <Stack spacing={2.5}>
              <Stack spacing={0.5}>
                <Typography component="h2" fontWeight={800} variant="h5">
                  Book a session
                </Typography>

                <Typography color="text.secondary" variant="body2">
                  Choose one of the consultant&apos;s available guidance
                  services.
                </Typography>
              </Stack>

              <Divider />

              {activeServices.length > 0 ? (
                <Stack spacing={1.5}>
                  {activeServices.map((service) => (
                    <Box
                      key={service.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Stack spacing={1.25}>
                        <Stack
                          alignItems="flex-start"
                          direction="row"
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Stack spacing={0.25}>
                            <Typography fontWeight={800}>
                              {service.title}
                            </Typography>

                            <Typography
                              color="text.secondary"
                              variant="body2"
                            >
                              {service.durationMinutes} minutes
                            </Typography>
                          </Stack>

                          <Typography
                            color="primary.main"
                            fontWeight={800}
                            whiteSpace="nowrap"
                          >
                            {money(service.price, service.currency)}
                          </Typography>
                        </Stack>

                        {service.description && (
                          <Typography
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.6,
                            }}
                            variant="body2"
                          >
                            {service.description}
                          </Typography>
                        )}

                        <Button
                          component={Link}
                          disabled={!consultant.isAcceptingBookings}
                          fullWidth
                          to={guidanceRoutes.book(
                            consultantId,
                            service.id,
                          )}
                          variant="contained"
                        >
                          {consultant.isAcceptingBookings
                            ? 'Check availability'
                            : 'Not accepting bookings'}
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No active guidance services are available right now.
                </Typography>
              )}

              <Divider />

              <Stack spacing={1}>
                <Typography fontWeight={700} variant="body2">
                  What happens next?
                </Typography>

                <Typography color="text.secondary" variant="body2">
                  1. Choose a service and an available time.
                </Typography>

                <Typography color="text.secondary" variant="body2">
                  2. Review the booking details and complete payment.
                </Typography>

                <Typography color="text.secondary" variant="body2">
                  3. After the session is completed, you can submit feedback.
                </Typography>
              </Stack>

              {consultant.guidanceDisclaimer && (
                <>
                  <Divider />

                  <Typography
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                    variant="caption"
                  >
                    {consultant.guidanceDisclaimer}
                  </Typography>
                </>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};