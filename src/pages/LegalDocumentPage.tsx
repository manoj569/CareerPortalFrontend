import { Box, Button, Divider, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { PUBLIC_BUSINESS_DETAILS } from '@/config/publicBusinessDetails';
import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

interface LegalSection {
  id: string;
  links?: ReadonlyArray<readonly [string, string]>;
  title: string;
  paragraphs: string[];
}

const termsSections: LegalSection[] = [
  {
    id: 'purpose',
    title: '1. Purpose of Career Harbor',
    paragraphs: [
      'Career Harbor helps candidates discover job opportunities, maintain career information, and apply for roles offered by employers. These Terms govern use of the website and related candidate services.',
    ],
  },
  {
    id: 'accounts',
    title: '2. Candidate accounts and accurate information',
    paragraphs: [
      'You must provide accurate, current information, protect your account credentials, and promptly update details that change. You are responsible for activity performed through your account.',
    ],
  },
  {
    id: 'profiles-resumes',
    title: '3. Candidate profiles and resume uploads',
    paragraphs: [
      'You may create a profile and upload a resume that you have the right to use. You remain responsible for its accuracy and for avoiding sensitive information that is unnecessary for recruitment.',
    ],
  },
  {
    id: 'applications',
    title: '4. Applying to jobs',
    paragraphs: [
      'When you apply to a selected job, Career Harbor may share the relevant application details and resume with that employer so the employer can evaluate your application.',
    ],
  },
  {
    id: 'external-links',
    title: '5. External application links and listing accuracy',
    paragraphs: [
      'Some listings direct you to an employer or third-party website. Those sites operate under their own terms and privacy practices. Employers provide much of the listing information, and Career Harbor cannot guarantee that every description, deadline, requirement, or external link is complete or current.',
    ],
  },
  {
    id: 'acceptable-use',
    title: '6. Acceptable use',
    paragraphs: [
      'Use Career Harbor only for lawful career and recruitment purposes, respect other users, and follow reasonable technical limits and security controls.',
    ],
  },
  {
    id: 'prohibited-conduct',
    title: '7. Prohibited conduct',
    paragraphs: [
      'You must not use Career Harbor for fraud, spam, impersonation, abusive or unlawful content, scraping, automated bulk access, reverse engineering, interference with service operation, attempted unauthorized access, vulnerability exploitation, or other security abuse.',
    ],
  },
  {
    id: 'membership-payments',
    title: '8. Membership and payments',
    paragraphs: [
      'Career Harbor Membership costs ₹99 inclusive and lasts for 30 days from successful payment. There is no automatic renewal or recurring billing at launch. Payment is processed through a supported third-party payment provider.',
      'Completing payment does not guarantee a job, recruiter response, interview, selection, placement, or employment. Candidates remain responsible for truthful profile and application information. Career Harbor may suspend access for fraud, abuse, prohibited activity, or a material policy violation. Refunds and cancellations are governed by the Refund and Cancellation Policy.',
    ],
  },
  {
    id: 'suspension',
    title: '9. Suspension or account termination',
    paragraphs: [
      'We may restrict, suspend, or terminate access when reasonably necessary to protect users or the service, investigate misuse, comply with law, or address a material breach of these Terms.',
    ],
  },
  {
    id: 'disclaimer',
    title: '10. Service limitations and disclaimer',
    paragraphs: [
      'Career Harbor does not guarantee a job, interview, selection, offer, recruiter response, continuous service availability, or the accuracy of any job listing. Recruitment decisions belong to employers.',
    ],
  },
  {
    id: 'changes',
    title: '11. Changes to these Terms',
    paragraphs: [
      'We may update these Terms as the service or legal requirements change. We will publish the revised version and update the date shown on this page. Continued use after an update means the revised Terms apply.',
    ],
  },
  {
    id: 'contact',
    title: '12. Contact support',
    paragraphs: [
      'Contact Career Harbor support through the support channel provided on the website if you have questions about these Terms or need help with your account.',
    ],
  },
];

const privacySections: LegalSection[] = [
  {
    id: 'information',
    title: '1. Information we collect',
    paragraphs: [
      'We may collect your full name, email address, mobile number, profile data, uploaded resume file and file metadata, job applications, saved jobs, membership and payment status, and essential technical and security logs.',
    ],
  },
  {
    id: 'uses',
    title: '2. Why we use information',
    paragraphs: [
      'We use this information for account access, resume storage, job applications, membership access, security, fraud prevention, customer support, and responsible product improvement.',
    ],
  },
  {
    id: 'sharing',
    title: '3. When information is shared',
    paragraphs: [
      'Relevant candidate application information and the candidate’s resume are shared with an employer only when the candidate applies to that specific job. We may also use service providers that process information on our behalf under appropriate safeguards, or disclose information when legally required.',
    ],
  },
  {
    id: 'resume-privacy',
    title: '4. Resume privacy',
    paragraphs: [
      'Your resume is not public by default. It is shared for applications you choose to make or when you explicitly allow another supported sharing feature.',
    ],
  },
  {
    id: 'security',
    title: '5. Data storage and security',
    paragraphs: [
      'We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. No internet service or storage system can promise perfect security.',
    ],
  },
  {
    id: 'retention',
    title: '6. Data retention and deletion requests',
    paragraphs: [
      'We retain information for as long as needed to provide the service, meet legal obligations, resolve disputes, and protect the platform. You may request deletion, subject to records we must retain for lawful or security reasons.',
    ],
  },
  {
    id: 'cookies',
    title: '7. Essential browser storage',
    paragraphs: [
      'Career Harbor uses essential session storage and local storage for secure login, registration verification, privacy preferences, and other core portal operation. See the Cookie Policy for the current storage details.',
    ],
  },
  {
    id: 'payments',
    links: [['Razorpay Privacy Policy', 'https://razorpay.com/privacy-policy/']],
    title: '8. Payments',
    paragraphs: [
      'Career Harbor uses approved third-party payment providers to process membership payments. Razorpay is the currently enabled provider. PhonePe may be added after it is enabled, but it is not currently available in Career Harbor.',
      'Career Harbor receives only payment-related references and status information needed for orders, refunds, support, fraud prevention, accounting, and legal compliance. Career Harbor does not collect or store card numbers, CVV, UPI PINs, banking passwords, or payment-provider login credentials.',
      'Payment providers process payment information under their own privacy policies. A provider-policy link is presented only for a provider that is actually enabled.',
    ],
  },
  {
    id: 'rights',
    title: '9. Your rights and profile updates',
    paragraphs: [
      'You can review and update supported profile information through your account. Depending on applicable law, you may also request access, correction, deletion, or information about how your personal data is handled.',
    ],
  },
  {
    id: 'children',
    title: '10. Children’s privacy',
    paragraphs: [
      'Career Harbor is not intended for children who are not legally able to use employment services or consent to data processing in their location. We do not knowingly seek personal information from such children.',
    ],
  },
  {
    id: 'policy-changes',
    title: '11. Changes to this Policy',
    paragraphs: [
      'We may revise this Policy when our practices, features, or legal obligations change. The latest version and its updated date will be published on this page.',
    ],
  },
  {
    id: 'privacy-contact',
    links: [
      [
        `Email privacy support at ${PUBLIC_BUSINESS_DETAILS.privacyEmail}`,
        `mailto:${PUBLIC_BUSINESS_DETAILS.privacyEmail}`,
      ],
    ],
    title: '12. Contact support',
    paragraphs: [
      `Contact ${PUBLIC_BUSINESS_DETAILS.privacyEmail} for privacy questions, profile assistance, or data requests.`,
    ],
  },
];

const cookieSections: LegalSection[] = [
  {
    id: 'scope',
    title: '1. About this Cookie Policy',
    paragraphs: [
      'This Policy explains the essential browser storage used by Career Harbor. Although this page is called a Cookie Policy for clarity, the current frontend does not set cookies and does not load analytics, advertising, remarketing, or personalization technology.',
      'Google authentication is optional. Selecting Continue with Google opens a Google-controlled authentication popup, and Career Harbor sends the resulting single-use authorization code to its backend to complete authentication. Career Harbor does not store this code or use Google authentication for advertising or analytics.',
      'Google Identity Services is available only on the Login and Register pages. Career Harbor does not store that Google credential in browser storage.',
    ],
  },
  {
    id: 'login-storage',
    title: '2. Secure login session storage',
    paragraphs: [
      'Career Harbor stores refresh-token information under careerPortal.refreshToken and its expiry under careerPortal.refreshTokenExpiresAtUtc in sessionStorage. These entries support secure session continuity and token renewal after login.',
      'They remain available during the browser tab session until you log out, the token expires, the application clears invalid authentication data, or the tab session ends. The server-side token may have its own earlier expiry or revocation rules.',
    ],
  },
  {
    id: 'registration-storage',
    title: '3. Registration-verification storage',
    paragraphs: [
      'Career Harbor stores the current registration-verification challenge under careerPortal.registrationChallenge in sessionStorage. It contains the challenge identifier, masked phone number, and challenge expiry so registration verification can continue safely across navigation.',
      'The entry is removed after successful verification, when the flow is cleared, when invalid data is detected, or when the browser tab session ends. The challenge also becomes unusable after its recorded expiry.',
    ],
  },
  {
    id: 'preference-storage',
    title: '4. Privacy-preference storage',
    paragraphs: [
      'Career Harbor stores careerharbor_cookie_consent in localStorage. This small versioned record remembers that the storage notice was acknowledged and records the currently supported consent-category values and the time of the update.',
      'The frontend treats this record as valid for up to 180 days. It asks again when the record is missing, malformed, expired, or belongs to an older consent version.',
    ],
  },
  {
    id: 'optional-technologies',
    title: '5. Optional technologies',
    paragraphs: [
      'No analytics, advertising, remarketing, or personalization technology is currently active in Career Harbor. The preferences interface therefore shows only strictly necessary storage and does not ask you to consent to an optional technology that is not in use.',
    ],
  },
  {
    id: 'settings',
    title: '6. Cookie settings',
    paragraphs: [
      'You can reopen Cookie settings from the public footer or from the candidate and administration navigation areas. This lets you review the current storage information whenever you need it.',
    ],
  },
  {
    id: 'authentication',
    title: '7. Authentication storage and privacy preferences',
    paragraphs: [
      'Authentication and registration-verification storage is strictly necessary. Opening or changing privacy preferences never logs you out and never removes necessary authentication or security storage.',
    ],
  },
  {
    id: 'changes-contact',
    title: '8. Changes and contact',
    paragraphs: [
      'We will update this Policy if the browser storage or optional technologies used by Career Harbor change. Contact Career Harbor support through the support channel provided on the website if you have questions about these practices.',
    ],
  },
];

const refundSections: LegalSection[] = [
  {
    id: 'scope',
    title: '1. Scope and membership terms',
    paragraphs: [
      'This Policy applies to Career Harbor Membership. The inclusive price is ₹99, and access is valid for 30 days from successful payment. There is no automatic renewal or recurring billing at launch.',
    ],
  },
  {
    id: 'cancellation',
    title: '2. Cancellation',
    paragraphs: [
      'Before payment, you can cancel by leaving checkout without completing payment. After a successful payment and membership activation, access continues for the applicable 30-day period, subject to these terms and the refund rules below.',
    ],
  },
  {
    id: 'duplicate-payment',
    title: '3. Duplicate payments',
    paragraphs: [
      'Contact support with the registered email address and relevant transaction or order details. Career Harbor will verify the payment records and process an eligible duplicate-payment refund. Refunds are not automatic and remain subject to verification.',
    ],
  },
  {
    id: 'failed-payment',
    title: '4. Failed or uncertain payments',
    paragraphs: [
      'Membership access is not activated until the payment provider and Career Harbor backend confirm successful payment. If a payment is pending or appears unsuccessful, check its status or contact support before paying again.',
    ],
  },
  {
    id: 'eligibility',
    title: '5. Refund eligibility',
    paragraphs: [
      'A refund may be eligible after verification when there is a duplicate successful charge, payment was collected but membership was not activated after reasonable verification, or a transaction was later confirmed unsuccessful even though the user was charged.',
    ],
  },
  {
    id: 'not-refundable',
    title: '6. Non-refundable cases',
    paragraphs: [
      'Refunds are generally not available for a change of mind after membership access has been activated, dissatisfaction because a job, interview, recruiter reply, selection, placement, or employment was not received, or services already consumed where applicable.',
    ],
  },
  {
    id: 'processing',
    title: '7. Refund processing and method',
    paragraphs: [
      `An approved refund is processed ${PUBLIC_BUSINESS_DETAILS.refundProcessingTimeline}. It will be returned to the original payment source where supported by the payment provider.`,
    ],
  },
  {
    id: 'contact-escalation',
    links: [
      [
        `Email refunds at ${PUBLIC_BUSINESS_DETAILS.refundEmail}`,
        `mailto:${PUBLIC_BUSINESS_DETAILS.refundEmail}`,
      ],
      [
        `Email grievances at ${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`,
        `mailto:${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`,
      ],
    ],
    title: '8. Contact and grievance escalation',
    paragraphs: [
      `Email ${PUBLIC_BUSINESS_DETAILS.refundEmail} for payment or refund support and include the registered email address, transaction or order identifier, issue description, and supporting screenshots where relevant. Unresolved issues may be escalated to ${PUBLIC_BUSINESS_DETAILS.grievanceEmail} under the Grievance Redressal Policy.`,
    ],
  },
  {
    id: 'disclaimer',
    title: '9. Employment disclaimer',
    paragraphs: [
      'Career Harbor does not guarantee job listings, recruiter responses, interview calls, selection, placement, or employment.',
    ],
  },
];

const grievanceSections: LegalSection[] = [
  {
    id: 'complaints',
    title: '1. Matters you may raise',
    paragraphs: [
      'You may raise concerns about account access, membership payments, refunds, privacy, a job listing or report, or suspected misuse of the Career Harbor platform.',
    ],
  },
  {
    id: 'submit',
    links: [
      [
        `Email the Grievance Officer at ${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`,
        `mailto:${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`,
      ],
    ],
    title: '2. How to submit a grievance',
    paragraphs: [
      `Email ${PUBLIC_BUSINESS_DETAILS.grievanceEmail} or use the contact details below to submit a grievance.`,
    ],
  },
  {
    id: 'information',
    title: '3. Information to include',
    paragraphs: [
      'Include your registered email address, a clear description of the issue, the order or payment identifier where relevant, and supporting screenshots that do not expose passwords, PINs, or full payment credentials.',
    ],
  },
  {
    id: 'timelines',
    title: '4. Acknowledgement and resolution timelines',
    paragraphs: [
      `Career Harbor will acknowledge a grievance ${PUBLIC_BUSINESS_DETAILS.grievanceAcknowledgementTimeline} and aims to resolve it ${PUBLIC_BUSINESS_DETAILS.grievanceResolutionTimeline}.`,
    ],
  },
  {
    id: 'escalation',
    links: [
      [
        `Email ${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`,
        `mailto:${PUBLIC_BUSINESS_DETAILS.grievanceEmail}`,
      ],
      [PUBLIC_BUSINESS_DETAILS.supportPhoneDisplay, PUBLIC_BUSINESS_DETAILS.supportPhoneHref],
    ],
    title: '5. Escalation path',
    paragraphs: [
      `If the first support response does not resolve the concern, reply with the original request reference and ask for escalation to the Grievance Officer, ${PUBLIC_BUSINESS_DETAILS.grievanceOfficerName}. Contact: ${PUBLIC_BUSINESS_DETAILS.grievanceEmail}, ${PUBLIC_BUSINESS_DETAILS.supportPhoneDisplay}.`,
    ],
  },
];

interface LegalDocumentPageProps {
  canonicalPath: string;
  description: string;
  effectiveDate?: string;
  title: string;
  introduction: string;
  relatedLinks?: ReadonlyArray<readonly [string, string]>;
  sections: LegalSection[];
  updatedDate?: string;
}

const LegalDocumentPage = ({
  canonicalPath,
  description,
  effectiveDate,
  introduction,
  relatedLinks = [],
  sections,
  title,
  updatedDate = '9 August 2026',
}: LegalDocumentPageProps) => {
  useDocumentMetadata(`${title} | Career Harbor`, description, { canonicalPath, noIndex: false });

  return (
    <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box component="header" textAlign={{ xs: 'left', sm: 'center' }}>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {effectiveDate ? `Effective date: ${effectiveDate} · ` : null}Last updated: {updatedDate}
        </Typography>
      </Box>
      <Paper component="article" sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Typography>{introduction}</Typography>
          <Typography fontWeight={700}>{PUBLIC_BUSINESS_DETAILS.operatingStatement}</Typography>
          <Box component="nav" aria-label={`${title} table of contents`}>
            <Typography component="h2" fontWeight={700} variant="h3">
              On this page
            </Typography>
            <Box component="ol" sx={{ columns: { md: 2 }, mb: 0, pl: 3 }}>
              {sections.map((section) => (
                <Box component="li" key={section.id} sx={{ breakInside: 'avoid', mb: 0.75 }}>
                  <MuiLink href={`#${section.id}`}>
                    {section.title.replace(/^\d+\.\s*/, '')}
                  </MuiLink>
                </Box>
              ))}
            </Box>
          </Box>
          <Divider />
          {sections.map((section) => (
            <Box component="section" id={section.id} key={section.id} sx={{ scrollMarginTop: 96 }}>
              <Typography component="h2" variant="h3">
                {section.title}
              </Typography>
              {section.paragraphs.map((paragraph) => (
                <Typography key={paragraph} sx={{ mt: 1.25 }}>
                  {paragraph}
                </Typography>
              ))}
              {section.links?.map(([label, href]) => {
                const opensNewTab = href.startsWith('https://');
                return (
                  <MuiLink
                    href={href}
                    key={href}
                    rel={opensNewTab ? 'noopener noreferrer' : undefined}
                    sx={{ display: 'block', mt: 1.25 }}
                    target={opensNewTab ? '_blank' : undefined}
                  >
                    {label}
                    {opensNewTab ? ' (opens in a new tab)' : ''}
                  </MuiLink>
                );
              })}
            </Box>
          ))}
          {relatedLinks.length ? (
            <Stack
              aria-label={`${title} related policies`}
              component="nav"
              direction={{ xs: 'column', sm: 'row' }}
              flexWrap="wrap"
              gap={1.5}
            >
              {relatedLinks.map(([label, path]) => (
                <MuiLink component={Link} key={path} to={path}>
                  {label}
                </MuiLink>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Paper>
      <Button
        component={Link}
        sx={{ alignSelf: 'flex-start' }}
        to={ROUTES.REGISTER}
        variant="outlined"
      >
        Back to registration
      </Button>
    </Stack>
  );
};

export const TermsOfUsePage = () => (
  <LegalDocumentPage
    canonicalPath={ROUTES.TERMS_OF_USE}
    description="Read the terms that govern Career Harbor candidate accounts, job applications, acceptable use, membership, and platform access."
    introduction="Please read these original Career Harbor Terms before creating or using an account."
    relatedLinks={[
      ['Privacy Policy', ROUTES.PRIVACY_POLICY],
      ['Refund and Cancellation Policy', ROUTES.REFUND_POLICY],
      ['Grievance Redressal Policy', ROUTES.GRIEVANCE_POLICY],
      ['Contact Us', ROUTES.CONTACT_US],
    ]}
    sections={termsSections}
    title="Terms of Use"
    updatedDate="21 August 2026"
  />
);

export const PrivacyPolicyPage = () => (
  <LegalDocumentPage
    canonicalPath={ROUTES.PRIVACY_POLICY}
    description="Learn how Career Harbor collects, uses, stores, and shares candidate information, resumes, applications, and essential account data."
    introduction="This Policy explains how Career Harbor handles personal information when you use the portal."
    relatedLinks={[
      ['Refund and Cancellation Policy', ROUTES.REFUND_POLICY],
      ['Contact Us', ROUTES.CONTACT_US],
    ]}
    sections={privacySections}
    title="Privacy Policy"
    updatedDate="21 August 2026"
  />
);

export const CookiePolicyPage = () => (
  <LegalDocumentPage
    canonicalPath={ROUTES.COOKIE_POLICY}
    description="Learn which essential session-storage and local-storage entries Career Harbor uses for secure login, registration verification, and privacy preferences."
    introduction="This Policy provides an accurate account of Career Harbor’s current browser-storage practices."
    sections={cookieSections}
    title="Cookie Policy"
  />
);

export const RefundAndCancellationPolicyPage = () => (
  <LegalDocumentPage
    canonicalPath={ROUTES.REFUND_POLICY}
    description="Read the Career Harbor Membership cancellation, failed-payment, duplicate-payment, and refund eligibility policy."
    effectiveDate={PUBLIC_BUSINESS_DETAILS.refundPolicyEffectiveDate}
    introduction="This Policy explains how cancellation and verified refund requests are handled for Career Harbor Membership."
    relatedLinks={[
      ['Terms of Use', ROUTES.TERMS_OF_USE],
      ['Privacy Policy', ROUTES.PRIVACY_POLICY],
      ['Contact Us', ROUTES.CONTACT_US],
      ['Grievance Redressal Policy', ROUTES.GRIEVANCE_POLICY],
    ]}
    sections={refundSections}
    title="Refund and Cancellation Policy"
    updatedDate="21 August 2026"
  />
);

export const GrievanceRedressalPolicyPage = () => (
  <LegalDocumentPage
    canonicalPath={ROUTES.GRIEVANCE_POLICY}
    description="Learn how to raise and escalate account, payment, refund, privacy, job-listing, and platform-misuse concerns with Career Harbor."
    introduction="This Policy explains how Career Harbor users can submit and escalate a grievance."
    relatedLinks={[
      ['Contact Us', ROUTES.CONTACT_US],
      ['Refund and Cancellation Policy', ROUTES.REFUND_POLICY],
      ['Privacy Policy', ROUTES.PRIVACY_POLICY],
    ]}
    sections={grievanceSections}
    title="Grievance Redressal Policy"
    updatedDate="21 August 2026"
  />
);
