import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBrand } from '@/components/navigation/AppBrand';
import { ROUTES } from '@/constants/routes';
import { SupportButton } from '@/features/support/SupportButton';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

const industries = [
  'Information Technology',
  'Software / SaaS',
  'Financial Services',
  'Banking',
  'Insurance',
  'Healthcare',
  'E-commerce',
  'Retail',
  'Manufacturing',
  'Education',
  'Consulting',
  'Telecommunications',
  'Media & Entertainment',
  'Logistics',
  'Real Estate',
  'Other',
];

const companySizes = [
  '1–10',
  '11–50',
  '51–200',
  '201–500',
  '501–1,000',
  '1,001–5,000',
  '5,000+',
];

const designations = [
  'HR / Recruiter',
  'Talent Acquisition',
  'Hiring Manager',
  'Founder / Co-founder',
  'Business Owner',
  'Other',
];

export const EmployerCompanySetupPage = () => {
  useDocumentMetadata(
    'Set Up Your Company | Career Harbor',
    'Set up your company profile to start hiring on Career Harbor.',
    {
      canonicalPath: ROUTES.EMPLOYER_COMPANY_SETUP,
      noIndex: true,
    },
  );

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [designation, setDesignation] = useState('');
  const [hiringLocation, setHiringLocation] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState('');

  const isFormValid =
    companyName.trim().length > 0 &&
    industry.length > 0 &&
    companySize.length > 0 &&
    designation.length > 0 &&
    hiringLocation.trim().length > 0;

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setLogoError('');

    if (!file) {
      setLogoFile(null);
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg'];

    if (!allowedTypes.includes(file.type)) {
      setLogoFile(null);
      setLogoError('Please upload a PNG or JPG image.');
      event.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setLogoFile(null);
      setLogoError('Company logo must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    setLogoFile(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    /*
     * Frontend-only for now.
     *
     * Do not invent or call a company setup API until the Employer backend
     * contract is confirmed.
     *
     * Once the backend is connected:
     * 1. Save company profile.
     * 2. Upload company logo if provided.
     * 3. Mark employer onboarding complete.
     * 4. Navigate to Employer Dashboard.
     */

    navigate(ROUTES.EMPLOYERS);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7faff',
        backgroundImage:
          'radial-gradient(circle at 50% 20%, rgba(215,229,255,.70), transparent 34%), linear-gradient(135deg, #fbfdff 0%, #eef5ff 100%)',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          bgcolor: 'rgba(255,255,255,.96)',
          borderBottom: '1px solid rgba(15,23,42,.08)',
        }}
      >
        <Box
          sx={{
            width: 'min(calc(100% - 32px), 1480px)',
            minHeight: { xs: 68, md: 76 },
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <AppBrand />

          <Stack alignItems="flex-end" spacing={0.5}>
            <Typography
              color="primary.main"
              fontWeight={800}
              sx={{
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.9rem',
                },
              }}
            >
              Step 1 of 1
            </Typography>

            <Box
              sx={{
                width: { xs: 78, sm: 110 },
                height: 5,
                bgcolor: 'primary.main',
                borderRadius: 999,
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Content */}
      <Box
        component="main"
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 5, md: 6 },
          boxSizing: 'border-box',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 820,
            mx: 'auto',
            p: {
              xs: 2.25,
              sm: 4,
              md: 5,
            },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: { xs: 3, sm: 4 },
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.09)',
          }}
        >
          <Stack spacing={{ xs: 3, sm: 3.5 }}>
            {/* Heading */}
            <Stack alignItems="center" textAlign="center" spacing={1.25}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 64,
                  height: 64,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 3,
                  bgcolor: 'rgba(11,87,208,.10)',
                  color: 'primary.main',
                }}
              >
                <BusinessOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Box>
                <Typography
                  component="h1"
                  sx={{
                    color: '#101828',
                    fontSize: {
                      xs: '1.65rem',
                      sm: '2rem',
                    },
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  Set up your company
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    fontSize: {
                      xs: '0.9rem',
                      sm: '1rem',
                    },
                  }}
                >
                  Tell us about your company to start hiring on CareerHarbor.
                </Typography>
              </Box>
            </Stack>

            <Stack
              component="form"
              noValidate
              onSubmit={handleSubmit}
              spacing={2.25}
            >
              {/* Company Name */}
              <TextField
                autoComplete="organization"
                fullWidth
                label="Company Name"
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Enter company name"
                required
                value={companyName}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlinedIcon
                          color="action"
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Website */}
              <TextField
                autoComplete="url"
                fullWidth
                label="Company Website"
                onChange={(event) => setCompanyWebsite(event.target.value)}
                placeholder="https://company.com"
                type="url"
                value={companyWebsite}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkOutlinedIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Industry + Size */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },
                  gap: 2,
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel id="employer-industry-label">
                    Industry
                  </InputLabel>

                  <Select
                    label="Industry"
                    labelId="employer-industry-label"
                    onChange={(event) => setIndustry(event.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <LayersOutlinedIcon
                          color="action"
                          fontSize="small"
                        />
                      </InputAdornment>
                    }
                    value={industry}
                  >
                    {industries.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel id="employer-company-size-label">
                    Company Size
                  </InputLabel>

                  <Select
                    label="Company Size"
                    labelId="employer-company-size-label"
                    onChange={(event) => setCompanySize(event.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <GroupsOutlinedIcon
                          color="action"
                          fontSize="small"
                        />
                      </InputAdornment>
                    }
                    value={companySize}
                  >
                    {companySizes.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Designation + Location */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },
                  gap: 2,
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel id="employer-designation-label">
                    Your Designation
                  </InputLabel>

                  <Select
                    label="Your Designation"
                    labelId="employer-designation-label"
                    onChange={(event) => setDesignation(event.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <BusinessCenterOutlinedIcon
                          color="action"
                          fontSize="small"
                        />
                      </InputAdornment>
                    }
                    value={designation}
                  >
                    {designations.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  autoComplete="address-level2"
                  fullWidth
                  label="Hiring Location"
                  onChange={(event) =>
                    setHiringLocation(event.target.value)
                  }
                  placeholder="e.g. Pune, India"
                  required
                  value={hiringLocation}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlinedIcon
                            color="action"
                            fontSize="small"
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <TextField
                fullWidth
                label="Company Description"
                minRows={4}
                multiline
                onChange={(event) =>
                  setCompanyDescription(event.target.value.slice(0, 500))
                }
                placeholder="Tell candidates about your company, culture, products, and what it's like to work here..."
                value={companyDescription}
                slotProps={{
                  htmlInput: {
                    maxLength: 500,
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                        }}
                      >
                        <DescriptionOutlinedIcon
                          color="action"
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                helperText={`${companyDescription.length}/500`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: 'right',
                    mr: 0,
                  },
                }}
              />

              {/* Logo Upload */}
              <Box>
                <Typography
                  component="label"
                  fontWeight={700}
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: '#101828',
                  }}
                >
                  Company Logo
                </Typography>

                <input
                  ref={fileInputRef}
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={handleLogoChange}
                  type="file"
                />

                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  sx={{
                    minHeight: 108,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    px: 2,
                    py: 2.5,
                    border: '1.5px dashed',
                    borderColor: logoError
                      ? 'error.main'
                      : 'rgba(11,87,208,.45)',
                    borderRadius: 2.5,
                    bgcolor: 'rgba(247,250,255,.75)',
                    cursor: 'pointer',
                    transition:
                      'border-color 160ms ease, background-color 160ms ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(11,87,208,.035)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <CloudUploadOutlinedIcon
                    color="primary"
                    sx={{ fontSize: 38 }}
                  />

                  <Box>
                    <Typography color="primary.main" fontWeight={800}>
                      {logoFile ? logoFile.name : 'Upload Company Logo'}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 0.25 }}
                      variant="body2"
                    >
                      PNG or JPG, max 2 MB
                    </Typography>
                  </Box>
                </Box>

                {logoError && (
                  <Typography
                    color="error.main"
                    sx={{ mt: 0.75 }}
                    variant="caption"
                  >
                    {logoError}
                  </Typography>
                )}
              </Box>

              {/* Continue */}
              <Button
                disabled={!isFormValid}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{
                  minHeight: 54,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                Complete Setup &amp; Continue
              </Button>

              {/* Support */}
              <Stack
                alignItems="center"
                spacing={0.5}
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  pt: 2.25,
                  textAlign: 'center',
                }}
              >
                <Typography color="text.secondary" variant="body2">
                  Need help?
                </Typography>

                <SupportButton initialCategory="Registration">
                  Contact Support
                </SupportButton>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};