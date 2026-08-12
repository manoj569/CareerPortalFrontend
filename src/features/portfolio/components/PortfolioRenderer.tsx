import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Box, Chip, Link, Paper, Stack, Typography } from '@mui/material';

import { getEmploymentTypeLabel } from '@/features/jobs/constants/jobOptions';
import type {
  PortfolioSectionType,
  PublicPortfolioResponse,
} from '../types/portfolioModels';
import { getSafePortfolioUrl } from '../utils/portfolioUrl';

interface PortfolioRendererProps { portfolio: PublicPortfolioResponse; preview?: boolean }

export const PortfolioRenderer = ({ portfolio, preview = false }: PortfolioRendererProps) => {
  const developer = portfolio.template === 'Developer';
  return (
    <Box
      component="article"
      sx={{
        bgcolor: developer ? '#08111f' : '#f6f8fc',
        color: developer ? '#e5eefc' : 'text.primary',
        minHeight: preview ? 560 : '100vh',
        p: { xs: 2, sm: 3, md: 5 },
      }}
    >
      <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
        {preview ? <Chip color="info" label="Private preview" sx={{ mb: 2 }} /> : null}
        <Box component="header" sx={{ borderBottom: 1, borderColor: developer ? 'rgba(255,255,255,.16)' : 'divider', pb: 3 }}>
          <Typography component="h1" sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, fontWeight: 900, letterSpacing: '-.035em' }}>
            {portfolio.candidate.displayName}
          </Typography>
          {portfolio.candidate.resumeHeadline ? (
            <Typography sx={{ color: developer ? '#93c5fd' : 'primary.main', fontSize: { xs: '1.05rem', md: '1.3rem' }, mt: 1 }}>
              {portfolio.candidate.resumeHeadline}
            </Typography>
          ) : null}
        </Box>
        <Stack component="main" spacing={3} sx={{ mt: 3 }}>
          {portfolio.sectionOrder.map((type) => (
            <PortfolioSection developer={developer} key={type} portfolio={portfolio} type={type} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

const PortfolioSection = ({ developer, portfolio, type }: { developer: boolean; portfolio: PublicPortfolioResponse; type: PortfolioSectionType }) => {
  const { sections } = portfolio;
  const cardSx = { bgcolor: developer ? 'rgba(15,23,42,.88)' : 'background.paper', border: developer ? '1px solid rgba(148,163,184,.18)' : undefined, p: { xs: 2.5, md: 3.5 } };
  const heading = (text: string) => <Typography component="h2" sx={{ fontSize: '1.35rem', fontWeight: 850, mb: 2 }}>{text}</Typography>;
  if (type === 'About' && portfolio.candidate.profileSummary) return <Paper component="section" elevation={developer ? 0 : 1} sx={cardSx}>{heading('About')}<Typography sx={{ whiteSpace: 'pre-wrap' }}>{portfolio.candidate.profileSummary}</Typography></Paper>;
  if (type === 'Skills' && sections.skills?.length) return <Paper component="section" elevation={developer ? 0 : 1} sx={cardSx}>{heading('Skills')}<Stack direction="row" flexWrap="wrap" gap={1}>{sections.skills.map((skill) => <Chip key={skill} label={skill} variant={developer ? 'outlined' : 'filled'} sx={developer ? { color: 'inherit', borderColor: 'rgba(147,197,253,.5)' } : undefined} />)}</Stack></Paper>;
  if (type === 'Experience' && sections.experience?.length) return <Records title="Experience" developer={developer}>{sections.experience.map((item) => <Record key={item.id} title={item.jobTitle} subtitle={`${item.companyName}${item.location ? ` · ${item.location}` : ''}`} meta={`${item.startDate} – ${item.isCurrent ? 'Present' : item.endDate ?? ''}${item.employmentType ? ` · ${getEmploymentTypeLabel(item.employmentType)}` : ''}`} description={item.description} />)}</Records>;
  if (type === 'Education' && sections.education?.length) return <Records title="Education" developer={developer}>{sections.education.map((item) => <Record key={item.id} title={item.qualification} subtitle={item.institution} meta={[item.fieldOfStudy, item.startYear && item.endYear ? `${item.startYear}–${item.endYear}` : item.startYear ?? item.endYear, item.grade].filter(Boolean).join(' · ')} description={item.description} />)}</Records>;
  if (type === 'Projects' && sections.projects?.length) return <Records title="Projects" developer={developer}>{sections.projects.map((item) => <Record key={item.id} title={item.name} subtitle={item.role} description={item.description} tags={item.technologies} links={[['Source', item.sourceUrl], ['Live project', item.liveUrl]]} />)}</Records>;
  if (type === 'Certifications' && sections.certifications?.length) return <Records title="Certifications" developer={developer}>{sections.certifications.map((item) => <Record key={item.id} title={item.name} subtitle={item.issuer} meta={[item.issuedDate, item.doesNotExpire ? 'Does not expire' : item.expiryDate, item.credentialId].filter(Boolean).join(' · ')} links={[["View credential", item.credentialUrl]]} />)}</Records>;
  if (type === 'ProfessionalLinks' && sections.professionalLinks?.length) return <Paper component="section" elevation={developer ? 0 : 1} sx={cardSx}>{heading('Professional links')}<Stack direction="row" flexWrap="wrap" gap={1.5}>{sections.professionalLinks.map((item) => <SafeLink key={item.id} label={item.label || item.type} value={item.url} />)}</Stack></Paper>;
  if (type === 'CustomSections' && sections.customSections?.length) return <>{sections.customSections.map((section) => <Records developer={developer} key={section.id} title={section.title}>{section.items.map((item) => <Record key={item.id} title={item.title} meta={item.date} description={item.description} links={[["Open link", item.url]]} />)}</Records>)}</>;
  if (type === 'Resume' && sections.resumeAvailable) return <Paper component="section" elevation={developer ? 0 : 1} sx={cardSx}>{heading('Resume')}<Typography>Resume is available through the candidate’s Career Harbor profile.</Typography></Paper>;
  return null;
};

const Records = ({ children, developer, title }: { children: React.ReactNode; developer: boolean; title: string }) => <Paper component="section" elevation={developer ? 0 : 1} sx={{ bgcolor: developer ? 'rgba(15,23,42,.88)' : 'background.paper', border: developer ? '1px solid rgba(148,163,184,.18)' : undefined, p: { xs: 2.5, md: 3.5 } }}><Typography component="h2" sx={{ fontSize: '1.35rem', fontWeight: 850, mb: 2 }}>{title}</Typography><Stack spacing={2.5}>{children}</Stack></Paper>;
const Record = ({ description, links = [], meta, subtitle, tags = [], title }: { description?: string | null; links?: [string, string | null | undefined][]; meta?: string | number | null; subtitle?: string | null; tags?: string[]; title: string }) => <Box sx={{ '& + &': { borderTop: 1, borderColor: 'divider', pt: 2.5 } }}><Typography component="h3" fontWeight={850}>{title}</Typography>{subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}{meta ? <Typography color="text.secondary" variant="body2">{meta}</Typography> : null}{description ? <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{description}</Typography> : null}{tags.length ? <Stack direction="row" flexWrap="wrap" gap={.75} sx={{ mt: 1.5 }}>{tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}</Stack> : null}<Stack direction="row" gap={2} sx={{ mt: links.some(([, value]) => getSafePortfolioUrl(value)) ? 1.5 : 0 }}>{links.map(([label, value]) => <SafeLink key={label} label={label} value={value} />)}</Stack></Box>;
const SafeLink = ({ label, value }: { label: string; value: string | null | undefined }) => { const href = getSafePortfolioUrl(value); return href ? <Link href={href} rel="noopener noreferrer" target="_blank">{label}<LaunchOutlinedIcon fontSize="inherit" sx={{ ml: .5 }} /></Link> : null; };
