import { Box, Paper, Typography } from '@mui/material';
import { useId, useMemo, useState } from 'react';

import type { CandidateCompanyLogo } from '../types/jobModels';
import { selectCompanyLogos } from '../utils/companyLogoSelection';
import './CompanyLogoMarquee.css';

export const CompanyLogoMarquee = ({
  companies,
}: {
  companies: readonly CandidateCompanyLogo[];
}) => {
  const headingId = useId();
  const logos = useMemo(() => selectCompanyLogos(companies), [companies]);
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(() => new Set());
  const visible = logos.filter((logo) => !failedUrls.has(logo.logoUrl));
  if (!visible.length) return null;

  const renderLogos = (duplicate: boolean) =>
    visible.map((company) => (
      <li className="company-logo-marquee__card" key={company.key} title={company.name}>
        <img
          src={company.logoUrl}
          alt={duplicate ? '' : `${company.name} logo`}
          width={72}
          height={48}
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrls((previous) => new Set([...previous, company.logoUrl]))}
        />
      </li>
    ));

  return (
    <Paper
      component="section"
      aria-labelledby={headingId}
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Typography id={headingId} component="h2" sx={{ fontSize: '1rem', fontWeight: 700 }}>
        Jobs from top companies
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.25, mb: 1.5 }}>
        Real opportunities from leading companies.
      </Typography>
      <Box
        className="company-logo-marquee"
        role="group"
        aria-label="Company logos"
        tabIndex={0}
        data-static={visible.length === 1 || undefined}
      >
        <div
          className="company-logo-marquee__track"
          style={{ animationDuration: `${Math.max(32, visible.length * 3)}s` }}
        >
          <ul className="company-logo-marquee__group" aria-label="Companies with active jobs">
            {renderLogos(false)}
          </ul>
          <ul
            className="company-logo-marquee__group company-logo-marquee__duplicate"
            aria-hidden="true"
          >
            {renderLogos(true)}
          </ul>
        </div>
      </Box>
    </Paper>
  );
};
