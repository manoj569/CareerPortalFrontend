import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { ResumeContent } from '../types/aiResumeModels';
const Heading = ({ children }: { children: React.ReactNode }) => (
  <Typography
    sx={{
      mt: 3,
      mb: 1,
      pb: 0.5,
      borderBottom: '1px solid #aab8d0',
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: 700,
    }}
  >
    {children}
  </Typography>
);
export const ResumePreview = ({ content }: { content: ResumeContent }) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2, md: 3 },
      bgcolor: 'white',
      borderRadius: 2,
      color: '#101932',
      minHeight: 550,
    }}
  >
    <Typography variant="h4" fontWeight={700}>
      {content.contact.name}
    </Typography>
    <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
      {[
        content.contact.email,
        content.contact.phone,
        content.contact.location,
        ...content.contact.links,
      ]
        .filter(Boolean)
        .map((text, i) => (
          <Typography key={`${i}-${text}`} variant="caption">
            {text}
          </Typography>
        ))}
    </Stack>
    <Heading>Professional Summary</Heading>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
      {content.professionalSummary}
    </Typography>
    <Heading>Skills</Heading>
    <Stack direction="row" flexWrap="wrap" gap={0.7}>
      {content.skills.map((skill, i) => (
        <Chip
          key={`${i}-${skill}`}
          label={skill}
          size="small"
          sx={{ bgcolor: '#eaf3fa', fontSize: 11 }}
        />
      ))}
    </Stack>
    {content.experience.length > 0 && (
      <>
        <Heading>Work experience</Heading>
        {content.experience.map((item, i) => (
          <Box key={i} mb={2}>
            <Typography variant="body2" fontWeight={700}>
              {item.role}
            </Typography>
            <Typography variant="caption">
              {item.employer} · {item.startDate} – {item.endDate}
            </Typography>
            <ul>
              {item.bullets.map((text, j) => (
                <li key={j}>
                  <Typography variant="body2">{text}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        ))}
      </>
    )}
    {content.projects.length > 0 && (
      <>
        <Heading>Projects</Heading>
        {content.projects.map((item, i) => (
          <Box key={i}>
            <Typography variant="body2" fontWeight={700}>
              {item.name}
            </Typography>
            <Typography variant="caption">{item.technologies.join(', ')}</Typography>
            <ul>
              {item.bullets.map((text, j) => (
                <li key={j}>
                  <Typography variant="body2">{text}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        ))}
      </>
    )}
    {content.education.length > 0 && (
      <>
        <Heading>Education</Heading>
        {content.education.map((item, i) => (
          <Stack key={i} mb={1}>
            <Typography variant="body2" fontWeight={700}>
              {item.qualification}
            </Typography>
            <Typography variant="body2">{item.institution}</Typography>
            <Typography variant="caption">
              {item.startDate} – {item.endDate}
            </Typography>
          </Stack>
        ))}
      </>
    )}
    {content.certifications.length > 0 && (
      <>
        <Heading>Certifications</Heading>
        {content.certifications.map((item, i) => (
          <Typography variant="body2" key={i}>
            {item.name} · {item.issuer} {item.date}
          </Typography>
        ))}
      </>
    )}
    {content.additionalInfo.length > 0 && (
      <>
        <Heading>Additional Info</Heading>
        {content.additionalInfo.map((text, i) => (
          <Typography variant="body2" key={i}>
            {text}
          </Typography>
        ))}
      </>
    )}
    <Divider sx={{ mt: 3 }} />
  </Paper>
);
