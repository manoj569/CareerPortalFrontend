import { Box, Button, Divider, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

interface LegalSection {
  id: string;
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
      'Paid membership features, prices, billing periods, and applicable taxes are shown before purchase. Payment processing may be handled by a payment provider. Access to paid features is subject to successful payment and the conditions presented at checkout.',
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
    title: '7. Cookies and local storage',
    paragraphs: [
      'Career Harbor uses cookies or local storage for login sessions, security, preferences, and other essential portal operation. These technologies help keep your session working and protect account access.',
    ],
  },
  {
    id: 'rights',
    title: '8. Your rights and profile updates',
    paragraphs: [
      'You can review and update supported profile information through your account. Depending on applicable law, you may also request access, correction, deletion, or information about how your personal data is handled.',
    ],
  },
  {
    id: 'children',
    title: '9. Children’s privacy',
    paragraphs: [
      'Career Harbor is not intended for children who are not legally able to use employment services or consent to data processing in their location. We do not knowingly seek personal information from such children.',
    ],
  },
  {
    id: 'policy-changes',
    title: '10. Changes to this Policy',
    paragraphs: [
      'We may revise this Policy when our practices, features, or legal obligations change. The latest version and its updated date will be published on this page.',
    ],
  },
  {
    id: 'privacy-contact',
    title: '11. Contact support',
    paragraphs: [
      'Contact Career Harbor support through the support channel provided on the website for privacy questions, profile assistance, or data requests.',
    ],
  },
];

interface LegalDocumentPageProps {
  title: string;
  introduction: string;
  sections: LegalSection[];
}

const LegalDocumentPage = ({ introduction, sections, title }: LegalDocumentPageProps) => {
  useDocumentMetadata(`${title} | Career Harbor`, `Read the Career Harbor ${title}.`);

  return (
    <Stack spacing={3} sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box component="header" textAlign={{ xs: 'left', sm: 'center' }}>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Last updated: 9 August 2026
        </Typography>
      </Box>
      <Paper component="article" sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
        <Stack spacing={3}>
          <Typography>{introduction}</Typography>
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
            </Box>
          ))}
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
    introduction="Please read these original Career Harbor Terms before creating or using an account."
    sections={termsSections}
    title="Terms of Use"
  />
);

export const PrivacyPolicyPage = () => (
  <LegalDocumentPage
    introduction="This Policy explains how Career Harbor handles personal information when you use the portal."
    sections={privacySections}
    title="Privacy Policy"
  />
);
