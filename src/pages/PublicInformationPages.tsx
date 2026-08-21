import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import { PUBLIC_BUSINESS_DETAILS, SUPPORT_MAILTO } from '@/config/publicBusinessDetails';
import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const relatedPolicyLinks = [
  ['Terms of Use', ROUTES.TERMS_OF_USE],
  ['Privacy Policy', ROUTES.PRIVACY_POLICY],
  ['Refund and Cancellation Policy', ROUTES.REFUND_POLICY],
  ['Contact Us', ROUTES.CONTACT_US],
] as const;

export const MembershipPricingPage = () => {
  useDocumentMetadata(
    'Career Harbor Membership and Pricing',
    'Review the ₹99 Career Harbor Membership, its 30-day validity, included access, and payment policies.',
    { canonicalPath: ROUTES.PRICING, noIndex: false },
  );

  return (
    <Stack spacing={4} sx={{ maxWidth: 960, mx: 'auto' }}>
      <Box component="header" textAlign={{ xs: 'left', sm: 'center' }}>
        <Typography color="primary.main" fontWeight={800} variant="overline">
          Simple membership
        </Typography>
        <Typography component="h1" variant="h1">
          Career Harbor Membership
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          One clear price, a fixed access period, and no automatic renewal at launch.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {PUBLIC_BUSINESS_DETAILS.operatingStatement}
        </Typography>
      </Box>

      <Card component="section" sx={{ maxWidth: 720, mx: 'auto', width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography color="text.secondary">Inclusive membership price</Typography>
              <Typography component="p" fontWeight={900} variant="h1">
                ₹99
              </Typography>
              <Typography color="text.secondary">
                Valid for 30 days from successful payment. No auto-renewal or recurring billing at
                launch.
              </Typography>
            </Box>
            <Box component="section">
              <Typography component="h2" variant="h3">
                What membership provides
              </Typography>
              <Box component="ul" sx={{ mb: 0, pl: 3 }}>
                <li>Access to apply to eligible published jobs during the active period.</li>
                <li>
                  Access to approved recruiter contact details where that feature is available.
                </li>
                <li>Membership and payment status available in the candidate dashboard.</li>
              </Box>
            </Box>
            <Typography>
              Payment is completed through a supported third-party payment provider. The active
              checkout currently uses Razorpay; PhonePe is not yet enabled.
            </Typography>
            <Alert severity="info">
              Membership does not guarantee a job listing, recruiter response, interview, selection,
              placement, or employment.
            </Alert>
            <Button component={Link} to={ROUTES.REGISTER} variant="contained">
              Create an account
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <PolicyLinks />
    </Stack>
  );
};

export const AboutUsPage = () => {
  useDocumentMetadata(
    'About Career Harbor',
    'Learn how Career Harbor helps candidates discover opportunities, manage applications, and build their career profile.',
    { canonicalPath: ROUTES.ABOUT_US, noIndex: false },
  );

  return (
    <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography component="h1" variant="h1">
        About Us
      </Typography>
      <Paper component="article" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={3}>
          <Typography>
            Career Harbor is an online career and employment platform that helps candidates discover
            job opportunities, maintain a career profile and resume, save jobs, submit applications,
            and track application activity.
          </Typography>
          <Typography fontWeight={700}>{PUBLIC_BUSINESS_DETAILS.operatingStatement}</Typography>
          <Box component="section">
            <Typography component="h2" variant="h3">
              Our purpose
            </Typography>
            <Typography sx={{ mt: 1 }}>
              We aim to give candidates a focused place to organize their job search and present
              accurate career information. Employers remain responsible for their listings and
              hiring decisions.
            </Typography>
          </Box>
          <Alert severity="info">
            Career Harbor does not guarantee job availability, recruiter responses, interviews,
            selection, placement, or employment.
          </Alert>
          <Box component="section">
            <Typography component="h2" variant="h3">
              Business details
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>GSTIN:</strong> {PUBLIC_BUSINESS_DETAILS.gstin}
            </Typography>
            <BusinessAddress />
          </Box>
          <PolicyLinks />
        </Stack>
      </Paper>
    </Stack>
  );
};

export const ContactUsPage = () => {
  useDocumentMetadata(
    'Contact Career Harbor',
    'Contact Career Harbor about account access, jobs, membership payments, refunds, privacy, or platform misuse.',
    { canonicalPath: ROUTES.CONTACT_US, noIndex: false },
  );
  return (
    <Stack spacing={4} sx={{ maxWidth: 960, mx: 'auto' }}>
      <Box component="header">
        <Typography component="h1" variant="h1">
          Contact Us
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Contact Career Harbor about the online career and employment platform.
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {PUBLIC_BUSINESS_DETAILS.operatingStatement}
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Paper component="section" sx={{ flex: 1, p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={2}>
            <Typography component="h2" variant="h3">
              Business and support details
            </Typography>
            <Typography>
              <strong>Service:</strong> Career Harbor
            </Typography>
            <Typography>
              <strong>Operating business:</strong> {PUBLIC_BUSINESS_DETAILS.operatingBusiness}
            </Typography>
            <Typography>
              <strong>GSTIN:</strong> {PUBLIC_BUSINESS_DETAILS.gstin}
            </Typography>
            <MuiLink href={`mailto:${PUBLIC_BUSINESS_DETAILS.supportEmail}`}>
              {PUBLIC_BUSINESS_DETAILS.supportEmail}
            </MuiLink>
            <MuiLink href={PUBLIC_BUSINESS_DETAILS.supportPhoneHref}>
              {PUBLIC_BUSINESS_DETAILS.supportPhoneDisplay}
            </MuiLink>
            <BusinessAddress />
            <MuiLink component={Link} to={ROUTES.REFUND_POLICY}>
              Refund and Cancellation Policy
            </MuiLink>
            <MuiLink component={Link} to={ROUTES.GRIEVANCE_POLICY}>
              Grievance Redressal Policy
            </MuiLink>
          </Stack>
        </Paper>
        <Paper component="section" sx={{ flex: 1.35, p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={2.5}>
            <Typography component="h2" variant="h3">
              Contact support
            </Typography>
            <Typography>
              Use email for account access, job listing or application questions, payment support,
              refund requests, privacy requests, or reports of platform misuse.
            </Typography>
            <Button component="a" href={SUPPORT_MAILTO} variant="contained">
              Email support
            </Button>
            <Typography color="text.secondary" variant="caption">
              Email support opens your device’s email application with the subject “Career Harbor
              support request”. Career Harbor does not collect or submit contact-form data in your
              browser.
            </Typography>
            <Typography component="h3" variant="h4">
              Specialist contacts
            </Typography>
            <MuiLink href={`mailto:${PUBLIC_BUSINESS_DETAILS.privacyEmail}`}>
              Privacy: {PUBLIC_BUSINESS_DETAILS.privacyEmail}
            </MuiLink>
            <MuiLink href={`mailto:${PUBLIC_BUSINESS_DETAILS.refundEmail}`}>
              Refunds: {PUBLIC_BUSINESS_DETAILS.refundEmail}
            </MuiLink>
            <MuiLink href={`mailto:${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`}>
              Grievances: {PUBLIC_BUSINESS_DETAILS.grievanceEmail}
            </MuiLink>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};

const BusinessAddress = () => (
  <Box component="address" sx={{ fontStyle: 'normal' }}>
    <Typography fontWeight={700}>Registered address</Typography>
    {PUBLIC_BUSINESS_DETAILS.businessAddressLines.map((line) => (
      <Typography key={line}>{line}</Typography>
    ))}
  </Box>
);

const PolicyLinks = () => (
  <Stack
    aria-label="Related policies"
    component="nav"
    direction={{ xs: 'column', sm: 'row' }}
    flexWrap="wrap"
    gap={1.5}
  >
    {relatedPolicyLinks.map(([label, path]) => (
      <MuiLink component={Link} key={path} to={path}>
        {label}
      </MuiLink>
    ))}
  </Stack>
);
