import { yupResolver } from '@hookform/resolvers/yup';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  Controller,
  useForm,
} from 'react-hook-form';
import * as yup from 'yup';

import { isDashboardApiError } from '@/features/dashboard/api/dashboardApi';
import { useUpdatePortfolioSettingsMutation } from '../api/portfolioApi';
import type {
  CandidatePortfolioTemplate,
  PortfolioEditorResponse,
  PortfolioSectionSettingRequest,
  PortfolioSectionType,
} from '../types/portfolioModels';
import PortfolioSectionRow from './PortfolioSectionRow';

interface SettingsValues {
  slug: string;
  template: CandidatePortfolioTemplate;
}

const schema: yup.ObjectSchema<SettingsValues> =
  yup.object({
    slug: yup
      .string()
      .defined()
      .trim()
      .required('Portfolio slug is required.')
      .min(3, 'Use at least 3 characters.')
      .max(80, 'Use no more than 80 characters.')
      .matches(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Use lowercase letters, numbers, and single hyphens only.',
      ),

    template: yup
      .mixed<CandidatePortfolioTemplate>()
      .oneOf([
        'Professional',
        'Developer',
      ])
      .required(),
  });

type SectionMeta = {
  label: string;
  description: string;
  icon: ReactNode;
};

const sectionMeta: Record<
  PortfolioSectionType,
  SectionMeta
> = {
  About: {
    label: 'About',
    description:
      'Introduce yourself, your career goals and what makes you unique.',
    icon: <AccountCircleOutlinedIcon />,
  },

  Skills: {
    label: 'Skills',
    description:
      'Showcase your technical and soft skills.',
    icon: <BadgeOutlinedIcon />,
  },

  Experience: {
    label: 'Experience',
    description:
      'Your work experience and key achievements.',
    icon: <WorkOutlineRoundedIcon />,
  },

  Education: {
    label: 'Education',
    description:
      'Your academic background and qualifications.',
    icon: <SchoolOutlinedIcon />,
  },

  Projects: {
    label: 'Projects',
    description:
      'Highlight your key projects with links and descriptions.',
    icon: <FolderOutlinedIcon />,
  },

  Certifications: {
    label: 'Certifications',
    description:
      'Show your certifications and achievements.',
    icon: <EmojiEventsOutlinedIcon />,
  },

  ProfessionalLinks: {
    label: 'Professional links',
    description:
      'Add LinkedIn, GitHub and other professional profiles.',
    icon: <LinkRoundedIcon />,
  },

  Resume: {
    label: 'Resume',
    description:
      'Let employers know your resume is available.',
    icon: <DescriptionOutlinedIcon />,
  },

  CustomSections: {
    label: 'Custom sections',
    description:
      'Add additional portfolio content.',
    icon: <SettingsSuggestOutlinedIcon />,
  },
};

const normalizeSections = (
  sections: PortfolioSectionSettingRequest[],
): PortfolioSectionSettingRequest[] =>
  sections
    .slice()
    .sort(
      (first, second) =>
        first.displayOrder -
        second.displayOrder,
    )
    .map(
      (
        {
          sectionType,
          isVisible,
        },
        index,
      ) => ({
        sectionType,
        isVisible,
        displayOrder: index + 1,
      }),
    );

const sameSections = (
  current: PortfolioSectionSettingRequest[],
  original: PortfolioEditorResponse['sectionSettings'],
): boolean => {
  const normalizedCurrent =
    normalizeSections(current);

  const normalizedOriginal =
    normalizeSections(original);

  if (
    normalizedCurrent.length !==
    normalizedOriginal.length
  ) {
    return false;
  }

  return normalizedCurrent.every(
    (section, index) => {
      const existing =
        normalizedOriginal[index];

      return (
        existing?.sectionType ===
          section.sectionType &&
        existing.isVisible ===
          section.isVisible &&
        existing.displayOrder ===
          section.displayOrder
      );
    },
  );
};

const hasText = (
  value?: string | null,
): boolean =>
  Boolean(value?.trim());

const calculateCompleteness = (
  portfolio: PortfolioEditorResponse,
): {
  percentage: number;
  completed: number;
  total: number;
} => {
  const items = [
    hasText(portfolio.displayName) &&
      hasText(portfolio.resumeHeadline) &&
      hasText(portfolio.profileSummary),

    (portfolio.skills?.length ?? 0) > 0,

    (portfolio.experiences?.length ?? 0) >
      0,

    (portfolio.education?.length ?? 0) >
      0,

    (portfolio.projects?.length ?? 0) > 0,

    (portfolio.professionalLinks?.length ??
      0) > 0,
  ];

  const completed =
    items.filter(Boolean).length;

  const total = items.length;

  return {
    completed,
    total,
    percentage: Math.round(
      (completed / total) * 100,
    ),
  };
};

type PortfolioSettingsCardProps = {
  portfolio: PortfolioEditorResponse;

  onEditSection?: (
    sectionType: PortfolioSectionType,
  ) => void;

  onTemplateChange?: (
    template: CandidatePortfolioTemplate,
  ) => void;
};

export const PortfolioSettingsCard = ({
  portfolio,
  onEditSection,
  onTemplateChange,
}: PortfolioSettingsCardProps) => {
  const [
    sections,
    setSections,
  ] = useState<
    PortfolioSectionSettingRequest[]
  >([]);

  const [
    serverError,
    setServerError,
  ] = useState<string | null>(null);

  const [
    updateSettings,
    updateState,
  ] =
    useUpdatePortfolioSettingsMutation();

  const {
    control,
    formState: {
      errors,
      isDirty,
    },
    handleSubmit,
    register,
    reset,
  } = useForm<SettingsValues>({
    resolver: yupResolver(schema),

    defaultValues: {
      slug: '',
      template: 'Professional',
    },
  });

  useEffect(() => {
    const savedTemplate =
      portfolio.template ??
      'Professional';

    reset({
      slug: portfolio.slug ?? '',
      template: savedTemplate,
    });

    setSections(
      normalizeSections(
        portfolio.sectionSettings,
      ),
    );

    /*
     * Keep the live preview synchronized
     * when fresh portfolio data arrives.
     */
    onTemplateChange?.(
      savedTemplate,
    );
  }, [
    portfolio,
    reset,
    onTemplateChange,
  ]);

  const sectionsChanged = useMemo(
    () =>
      !sameSections(
        sections,
        portfolio.sectionSettings,
      ),
    [
      portfolio.sectionSettings,
      sections,
    ],
  );

  const completeness = useMemo(
    () =>
      calculateCompleteness(portfolio),
    [portfolio],
  );

  const move = (
    index: number,
    direction: -1 | 1,
  ) => {
    setSections((current) => {
      const next = [...current];

      const target =
        index + direction;

      if (
        target < 0 ||
        target >= next.length
      ) {
        return current;
      }

      [
        next[index],
        next[target],
      ] = [
        next[target]!,
        next[index]!,
      ];

      return next.map(
        (item, order) => ({
          ...item,
          displayOrder: order + 1,
        }),
      );
    });
  };

  const updateVisibility = (
    sectionType: PortfolioSectionType,
    isVisible: boolean,
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.sectionType ===
        sectionType
          ? {
              ...section,
              isVisible,
            }
          : section,
      ),
    );
  };

  const resetOrder = () => {
    setSections((current) => {
      const originalOrder =
        normalizeSections(
          portfolio.sectionSettings,
        );

      return originalOrder.map(
        (originalSection) => {
          const currentSection =
            current.find(
              (section) =>
                section.sectionType ===
                originalSection.sectionType,
            );

          return {
            ...originalSection,

            isVisible:
              currentSection?.isVisible ??
              originalSection.isVisible,
          };
        },
      );
    });
  };

  const selectTemplate = (
    template: CandidatePortfolioTemplate,
    onChange: (
      value: CandidatePortfolioTemplate,
    ) => void,
  ) => {
    onChange(template);

    /*
     * Preview immediately.
     * Persistence still happens only
     * through Save changes.
     */
    onTemplateChange?.(template);
  };

  const save = async (
    values: SettingsValues,
  ) => {
    setServerError(null);

    try {
      await updateSettings({
        slug: values.slug.trim(),
        template: values.template,
        sections,
      }).unwrap();

      /*
       * Keep preview on the value that
       * was successfully persisted.
       */
      onTemplateChange?.(
        values.template,
      );

      enqueueSnackbar(
        'Portfolio settings updated.',
        {
          variant: 'success',
        },
      );
    } catch (error: unknown) {
      setServerError(
        isDashboardApiError(error)
          ? error.message
          : 'Unable to update portfolio settings.',
      );
    }
  };

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack
        alignItems={{
          xs: 'stretch',
          md: 'center',
        }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',

          px: {
            xs: 2,
            sm: 2.25,
          },

          py: 1.75,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={1.25}
        >
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              color: 'primary.main',
              display: 'flex',
              flexShrink: 0,
              height: 40,
              justifyContent: 'center',
              width: 40,
            }}
          >
            <SettingsSuggestOutlinedIcon
              sx={{
                fontSize: 21,
              }}
            />
          </Box>

          <Box>
            <Typography
              component="h2"
              sx={{
                color: 'text.primary',
                fontSize: '1rem',
                fontWeight: 800,
                lineHeight: 1.3,
              }}
            >
              Portfolio settings
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.74rem',
                mt: 0.2,
              }}
            >
              Customize your portfolio and
              choose what to show publicly.
            </Typography>
          </Box>
        </Stack>

        <Stack
          alignItems="center"
          direction="row"
          spacing={1.25}
          sx={{
            minWidth: {
              xs: 0,
              md: 245,
            },
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              border: 4,
              borderColor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              flexShrink: 0,
              height: 54,
              justifyContent: 'center',
              position: 'relative',
              width: 54,
            }}
          >
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: '0.78rem',
                fontWeight: 800,
              }}
            >
              {completeness.percentage}%
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              Profile completeness
            </Typography>

            <LinearProgress
              aria-label="Portfolio completeness"
              value={
                completeness.percentage
              }
              variant="determinate"
              sx={{
                borderRadius: 999,
                height: 6,
                mt: 0.7,

                '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 999,
                  },
              }}
            />

            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.67rem',
                mt: 0.45,
              }}
            >
              {completeness.completed} of{' '}
              {completeness.total}{' '}
              sections completed
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack
        component="form"
        noValidate
        onSubmit={(event) => {
          void handleSubmit(save)(event);
        }}
        spacing={2.25}
        sx={{
          p: {
            xs: 2,
            sm: 2.25,
          },
        }}
      >
        {serverError ? (
          <Alert
            aria-live="assertive"
            severity="error"
          >
            {serverError}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: 'grid',
            gap: 2,

            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',

              md:
                'minmax(0, 1.08fr) minmax(260px, 0.92fr)',
            },
          }}
        >
          <Stack spacing={0.75}>
            <Stack
              alignItems="center"
              direction="row"
              spacing={0.7}
            >
              <LanguageRoundedIcon
                sx={{
                  color: 'text.secondary',
                  fontSize: 17,
                }}
              />

              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                Portfolio slug
              </Typography>
            </Stack>

            <TextField
              disabled={
                updateState.isLoading
              }
              error={Boolean(
                errors.slug,
              )}
              fullWidth
              helperText={
                errors.slug?.message ??
                'Use lowercase letters, numbers and hyphens.'
              }
              inputProps={{
                'aria-label':
                  'Portfolio slug',
              }}
              placeholder="your-name"
              size="small"
              {...register('slug')}
              InputProps={{
                startAdornment: (
                  <Typography
                    color="text.secondary"
                    sx={{
                      flexShrink: 0,
                      fontSize:
                        '0.78rem',
                      mr: 0.45,
                      userSelect:
                        'none',
                    }}
                  >
                    /portfolio/
                  </Typography>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius: 2,
                  },

                '& .MuiFormHelperText-root':
                  {
                    fontSize:
                      '0.67rem',
                    mx: 0,
                  },
              }}
            />
          </Stack>

          <Stack spacing={0.75}>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              Template
            </Typography>

            <Controller
              control={control}
              name="template"
              render={({ field }) => (
                <Box
                  aria-label="Template"
                  role="group"
                  sx={{
                    display: 'grid',
                    gap: 1,

                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                  }}
                >
                  <TemplateOption
                    description="Clean professional layout"
                    disabled={
                      updateState.isLoading
                    }
                    icon={
                      <WorkOutlineRoundedIcon />
                    }
                    label="Professional"
                    onSelect={() => {
                      selectTemplate(
                        'Professional',
                        field.onChange,
                      );
                    }}
                    selected={
                      field.value ===
                      'Professional'
                    }
                  />

                  <TemplateOption
                    description="Technical portfolio layout"
                    disabled={
                      updateState.isLoading
                    }
                    icon={
                      <CodeRoundedIcon />
                    }
                    label="Developer"
                    onSelect={() => {
                      selectTemplate(
                        'Developer',
                        field.onChange,
                      );
                    }}
                    selected={
                      field.value ===
                      'Developer'
                    }
                  />
                </Box>
              )}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            pt: 2,
          }}
        >
          <Stack
            alignItems={{
              xs: 'stretch',
              sm: 'center',
            }}
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={1.25}
            sx={{
              mb: 1.25,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                }}
              >
                Visible sections and order
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '0.7rem',
                  mt: 0.15,
                }}
              >
                Choose which sections employers
                can see and adjust their display
                order.
              </Typography>
            </Box>

            <Button
              disabled={
                updateState.isLoading ||
                !sectionsChanged
              }
              onClick={resetOrder}
              size="small"
              startIcon={
                <RestartAltRoundedIcon />
              }
              type="button"
              variant="outlined"
              sx={{
                alignSelf: {
                  xs: 'flex-start',
                  sm: 'center',
                },
                borderRadius: 2,
                flexShrink: 0,
                fontSize: '0.72rem',
                fontWeight: 700,
                minHeight: 34,
                px: 1.4,
              }}
            >
              Reset order
            </Button>
          </Stack>

          <Stack spacing={0.75}>
            {sections.map(
              (
                section,
                index,
              ) => {
                const meta =
                  sectionMeta[
                    section.sectionType
                  ];

                return (
                  <PortfolioSectionRow
                    canMoveDown={
                      index <
                      sections.length -
                        1
                    }
                    canMoveUp={
                      index > 0
                    }
                    description={
                      meta.description
                    }
                    disabled={
                      updateState.isLoading
                    }
                    icon={
                      meta.icon
                    }
                    key={
                      section.sectionType
                    }
                    label={
                      meta.label
                    }
                    onEdit={() => {
                      onEditSection?.(
                        section.sectionType,
                      );
                    }}
                    onMoveDown={() => {
                      move(
                        index,
                        1,
                      );
                    }}
                    onMoveUp={() => {
                      move(
                        index,
                        -1,
                      );
                    }}
                    onVisibilityChange={(
                      visible,
                    ) => {
                      updateVisibility(
                        section.sectionType,
                        visible,
                      );
                    }}
                    sectionType={
                      section.sectionType
                    }
                    visible={
                      section.isVisible
                    }
                  />
                );
              },
            )}
          </Stack>
        </Box>

        <Stack
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          justifyContent="space-between"
          spacing={1.25}
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            pt: 1.75,
          }}
        >
          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.72rem',
            }}
          >
            {isDirty ||
            sectionsChanged
              ? 'You have unsaved portfolio changes.'
              : 'Your portfolio settings are up to date.'}
          </Typography>

          <Button
            disabled={
              updateState.isLoading ||
              (!isDirty &&
                !sectionsChanged)
            }
            type="submit"
            variant="contained"
            sx={{
              borderRadius: 2,
              fontSize: '0.76rem',
              fontWeight: 700,
              minWidth: 130,
              px: 2,
            }}
          >
            {updateState.isLoading
              ? 'Saving...'
              : 'Save changes'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

type TemplateOptionProps = {
  label: CandidatePortfolioTemplate;
  description: string;
  icon: ReactNode;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

const TemplateOption = ({
  label,
  description,
  icon,
  selected,
  disabled,
  onSelect,
}: TemplateOptionProps) => (
  <Box
    aria-label={label}
    aria-pressed={selected}
    component="button"
    disabled={disabled}
    onClick={onSelect}
    type="button"
    sx={{
      appearance: 'none',

      bgcolor: selected
        ? 'action.selected'
        : 'background.paper',

      border: 2,

      borderColor: selected
        ? 'primary.main'
        : 'divider',

      borderRadius: 2,
      color: 'inherit',

      cursor: disabled
        ? 'not-allowed'
        : 'pointer',

      font: 'inherit',
      minHeight: 82,

      opacity: disabled
        ? 0.6
        : 1,

      p: 1.15,
      position: 'relative',
      textAlign: 'left',

      transition: (theme) =>
        theme.transitions.create([
          'border-color',
          'background-color',
          'box-shadow',
          'transform',
        ]),

      width: '100%',

      '&:hover': disabled
        ? undefined
        : {
            borderColor:
              'primary.main',

            boxShadow: (theme) =>
              theme.shadows[1],
          },

      '&:focus-visible': {
        outline: (theme) =>
          `3px solid ${theme.palette.primary.main}33`,

        outlineOffset: 2,
      },
    }}
  >
    {selected ? (
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'primary.main',
          borderRadius: '50%',

          color:
            'primary.contrastText',

          display: 'flex',
          height: 19,

          justifyContent:
            'center',

          position: 'absolute',
          right: 8,
          top: 8,
          width: 19,
        }}
      >
        <CheckRoundedIcon
          sx={{
            fontSize: 13,
          }}
        />
      </Box>
    ) : null}

    <Stack
      alignItems="center"
      direction="row"
      spacing={0.9}
    >
      <Box
        sx={{
          alignItems: 'center',

          bgcolor: selected
            ? 'primary.main'
            : 'action.hover',

          borderRadius: 1.5,

          color: selected
            ? 'primary.contrastText'
            : 'primary.main',

          display: 'flex',
          flexShrink: 0,
          height: 31,

          justifyContent:
            'center',

          width: 31,

          '& svg': {
            fontSize: 17,
          },
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          minWidth: 0,

          pr: selected
            ? 1.75
            : 0,
        }}
      >
        <Typography
          sx={{
            color: 'text.primary',
            fontSize: '0.76rem',
            fontWeight: 800,
            lineHeight: 1.25,
          }}
        >
          {label}
        </Typography>

        <Typography
          color="text.secondary"
          noWrap
          sx={{
            fontSize: '0.63rem',
            lineHeight: 1.35,
            mt: 0.2,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
  </Box>
);