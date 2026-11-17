import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { ReactNode, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type ResourceFilter =
  | 'all'
  | 'video'
  | 'guide'
  | 'documentation'
  | 'practice';

type ResourceType =
  | 'video'
  | 'guide'
  | 'documentation'
  | 'practice';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  meta: string;
  skills: string[];
  recommended?: boolean;
}

/*
 * C15 FRONTEND-ONLY RESOURCE DATA
 *
 * This is presentation data for the approved screen.
 *
 * During backend integration replace this with the actual
 * Accelerator learning-resource API/admin-curated resources.
 *
 * Do not add random YouTube links here.
 */
const resources: LearningResource[] = [
  {
    id: 'database-design',
    title: 'Database Design & ER Modeling',
    description:
      'Learn how to identify entities, attributes, keys and relationships.',
    type: 'video',
    meta: 'YouTube Video • 18 min',
    skills: ['Database Design', 'ER Diagram'],
    recommended: true,
  },
  {
    id: 'normalization',
    title: 'Database Normalization Explained',
    description:
      'Understand 1NF, 2NF and 3NF using a practical sales database.',
    type: 'guide',
    meta: 'CareerHarbor Guide • 10 min read',
    skills: ['SQL', 'Normalization'],
  },
  {
    id: 'sql-docs',
    title: 'PostgreSQL / SQL Documentation',
    description:
      'Official reference for tables, constraints, keys and queries.',
    type: 'documentation',
    meta: 'Documentation',
    skills: ['SQL', 'PostgreSQL'],
  },
  {
    id: 'relationships-practice',
    title: 'Practice: Identify Database Relationships',
    description:
      'Test your understanding before continuing the project.',
    type: 'practice',
    meta: '5 questions • ~5 min',
    skills: ['Database Design', 'Relationships'],
  },
];

const recommendedResources: LearningResource[] = [
  {
    id: 'er-fundamentals',
    title: 'ER Diagram Fundamentals',
    description:
      'Learn entities, attributes and relationships.',
    type: 'video',
    meta: '12 min • Beginner',
    skills: ['Database Design', 'ER Modeling'],
  },
  {
    id: 'normalization-guide',
    title: 'Database Normalization',
    description:
      'Understand 1NF, 2NF and 3NF with practical examples.',
    type: 'guide',
    meta: '8 min read',
    skills: ['SQL', 'Normalization'],
  },
  {
    id: 'sql-relationships',
    title: 'SQL Relationships',
    description:
      'Learn primary and foreign keys.',
    type: 'video',
    meta: '15 min • Beginner',
    skills: ['SQL', 'Relationships'],
  },
];

export const ProjectResourcesPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [filter, setFilter] =
    useState<ResourceFilter>('all');

  const navigateToScreen = (screen: string) => {
    const params = new URLSearchParams(searchParams);

    params.set('screen', screen);

    setSearchParams(params);
  };

  const handleBack = () => {
    navigateToScreen('project');
  };

  const handleTutor = () => {
    navigateToScreen('ai-tutor');
  };

  const filteredResources = useMemo(() => {
    if (filter === 'all') {
      return resources;
    }

    return resources.filter(
      (resource) => resource.type === filter,
    );
  }, [filter]);

  /*
   * Resource actions remain intentionally frontend-only.
   *
   * Video/guide/documentation URLs must come from the
   * real curated resource contract during integration.
   */
  const handleResourceAction = (
    resource: LearningResource,
  ) => {
    if (resource.type === 'practice') {
      navigateToScreen('practice');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1500,
        mx: 'auto',
        px: {
          xs: 1.5,
          sm: 2,
          lg: 2.5,
        },
        py: {
          xs: 1.5,
          md: 2,
        },
      }}
    >
      {/* HERO */}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          px: {
            xs: 2.25,
            md: 3.5,
          },
          py: {
            xs: 2.4,
            md: 2.8,
          },
          color: '#fff',
          background:
            'linear-gradient(110deg, #075fc5 0%, #4137e7 52%, #8c00f5 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            right: -70,
            top: -180,
            bgcolor: 'rgba(255,255,255,0.08)',
          }}
        />

        <Stack
          direction="row"
          spacing={1.1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ position: 'relative' }}
        >
          <AutoAwesomeRoundedIcon />

          <Typography
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: {
                xs: '1.5rem',
                md: '2rem',
              },
              letterSpacing: '-0.03em',
            }}
          >
            AI Career Accelerator
          </Typography>

          <Box
            sx={{
              px: 1.2,
              py: 0.35,
              borderRadius: 5,
              border:
                '1px solid rgba(255,200,70,0.75)',
              bgcolor: 'rgba(255,180,40,0.15)',
              color: '#ffe49b',
              fontSize: '0.72rem',
              fontWeight: 850,
            }}
          >
            👑 Premium
          </Box>
        </Stack>

        <Typography
          sx={{
            position: 'relative',
            mt: 0.5,
            color: 'rgba(255,255,255,0.92)',
            fontSize: {
              xs: '0.82rem',
              md: '0.94rem',
            },
          }}
        >
          Your personalized, AI-powered journey from
          your current skills to your next dream role.
        </Typography>
      </Box>

      {/* PAGE HEADER */}

      <Box
        sx={{
          mt: 1.4,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1fr) auto',
          },
          gap: 1.5,
          alignItems: 'end',
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={handleBack}
            sx={{
              px: 0,
              minWidth: 0,
              color: '#17213b',
              textTransform: 'none',
              fontWeight: 850,
              '&:hover': {
                bgcolor: 'transparent',
                color: '#075fd6',
              },
            }}
          >
            Back to Project
          </Button>

          <Stack
            direction="row"
            spacing={1.1}
            alignItems="center"
            sx={{ mt: 0.4 }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                bgcolor: '#f1e8ff',
                color: '#7423e8',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <MenuBookRoundedIcon
                sx={{ fontSize: 33 }}
              />
            </Box>

            <Box>
              <Typography
                component="h2"
                sx={{
                  color: '#0d1538',
                  fontSize: {
                    xs: '1.55rem',
                    md: '2rem',
                  },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.035em',
                }}
              >
                Project Learning Resources
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#536078',
                  fontSize: '0.82rem',
                }}
              >
                Learn the concepts you need to
                successfully complete your current
                project.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={0.6}
          sx={{
            p: 0.6,
            border: '1px solid #dce3ee',
            borderRadius: 3,
            bgcolor: '#fff',
            overflowX: 'auto',
          }}
        >
          <HeaderButton
            icon={<PsychologyRoundedIcon />}
            label="AI Tutor"
            onClick={handleTutor}
          />

          <HeaderButton
            active
            icon={<MenuBookRoundedIcon />}
            label="Learning Resources"
          />
        </Stack>
      </Box>

      {/* CURRENT PROJECT */}

      <Box
        sx={{
          ...cardSx,
          mt: 1.7,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(300px, 0.8fr) minmax(0, 1.2fr)',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1.3}
          alignItems="center"
        >
          <Box
            sx={{
              width: 100,
              height: 82,
              borderRadius: 2.3,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: '#fff',
              background:
                'linear-gradient(145deg, #0c69e9 0%, #2c21bd 100%)',
            }}
          >
            <StorageRoundedIcon
              sx={{ fontSize: 49 }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#5d687c',
                fontSize: '0.68rem',
                fontWeight: 800,
              }}
            >
              Current Project
            </Typography>

            <Typography
              sx={{
                mt: 0.1,
                color: '#111a38',
                fontSize: '1.15rem',
                fontWeight: 900,
              }}
            >
              Sales Management System
            </Typography>

            <Chip
              label="Milestone 2 • Database Design"
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: '#edf0ff',
                color: '#202a63',
                fontWeight: 850,
                fontSize: '0.68rem',
              }}
            />
          </Box>
        </Stack>

        <Box
          sx={{
            pl: {
              xs: 0,
              lg: 2,
            },
            borderLeft: {
              xs: 'none',
              lg: '1px solid #dce3ee',
            },
          }}
        >
          <Stack
            direction="row"
            spacing={0.6}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
          >
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.75rem',
                fontWeight: 900,
                mr: 0.4,
              }}
            >
              Skills:
            </Typography>

            {[
              'SQL',
              'Database Design',
              'Normalization',
              'ER Modeling',
            ].map((skill) => (
              <SkillChip
                key={skill}
                label={skill}
              />
            ))}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.76rem',
                fontWeight: 900,
              }}
            >
              Project Progress
            </Typography>

            <Typography
              sx={{
                color: '#111a38',
                fontSize: '0.82rem',
                fontWeight: 900,
              }}
            >
              20%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={20}
            sx={{
              mt: 0.5,
              height: 10,
              borderRadius: 10,
              bgcolor: '#d9e1f4',
              '& .MuiLinearProgress-bar': {
                borderRadius: 10,
                bgcolor: '#16a72d',
              },
            }}
          />
        </Box>
      </Box>

      {/* RECOMMENDED */}

      <SectionHeading
        icon={<AutoAwesomeRoundedIcon />}
        title="Recommended for your current milestone"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {recommendedResources.map(
          (resource) => (
            <RecommendedCard
              key={resource.id}
              resource={resource}
              onAction={() =>
                handleResourceAction(resource)
              }
            />
          ),
        )}
      </Box>

      {/* ALL RESOURCES */}

      <SectionHeading
        icon={<MenuBookRoundedIcon />}
        title="All Learning Resources"
      />

      <Stack
        direction="row"
        spacing={0.7}
        useFlexGap
        flexWrap="wrap"
        sx={{ mb: 1 }}
      >
        <FilterButton
          active={filter === 'all'}
          label="All"
          onClick={() => setFilter('all')}
        />

        <FilterButton
          active={filter === 'video'}
          icon={<PlayArrowRoundedIcon />}
          label="Videos"
          onClick={() => setFilter('video')}
        />

        <FilterButton
          active={filter === 'guide'}
          icon={<MenuBookRoundedIcon />}
          label="Guides"
          onClick={() => setFilter('guide')}
        />

        <FilterButton
          active={filter === 'documentation'}
          icon={<DescriptionOutlinedIcon />}
          label="Documentation"
          onClick={() =>
            setFilter('documentation')
          }
        />

        <FilterButton
          active={filter === 'practice'}
          icon={<ScienceOutlinedIcon />}
          label="Practice"
          onClick={() => setFilter('practice')}
        />
      </Stack>

      <Box
        sx={{
          border: '1px solid #dce3ee',
          borderRadius: 3,
          bgcolor: '#fff',
          overflow: 'hidden',
        }}
      >
        {filteredResources.length > 0 ? (
          filteredResources.map(
            (resource, index) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                divider={
                  index <
                  filteredResources.length - 1
                }
                onAction={() =>
                  handleResourceAction(resource)
                }
              />
            ),
          )
        ) : (
          <Box
            sx={{
              py: 5,
              px: 2,
              textAlign: 'center',
            }}
          >
            <MenuBookRoundedIcon
              sx={{
                color: '#9aa7ba',
                fontSize: 42,
              }}
            />

            <Typography
              sx={{
                mt: 0.7,
                color: '#111a38',
                fontWeight: 900,
              }}
            >
              No resources available
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                color: '#758096',
                fontSize: '0.76rem',
              }}
            >
              Resources for this category will
              appear here.
            </Typography>
          </Box>
        )}
      </Box>

      {/* AI TUTOR CTA */}

      <Box
        sx={{
          mt: 1.5,
          mb: 2,
          px: {
            xs: 1.4,
            md: 2,
          },
          py: 1.3,
          border: '1px solid #b88cff',
          borderRadius: 3,
          background:
            'linear-gradient(90deg, #fbf7ff 0%, #f5f0ff 100%)',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1fr) auto',
          },
          gap: 1.3,
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              bgcolor: '#eee3ff',
              color: '#7624e8',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <PsychologyRoundedIcon
              sx={{ fontSize: 29 }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#111a38',
                fontSize: '1rem',
                fontWeight: 900,
              }}
            >
              Need Help Understanding Something?
            </Typography>

            <Typography
              sx={{
                mt: 0.15,
                color: '#536078',
                fontSize: '0.74rem',
              }}
            >
              Ask AI Tutor to explain any resource
              or concept using your current project
              as context.
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          onClick={handleTutor}
          sx={{
            minWidth: 180,
            minHeight: 44,
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 900,
            boxShadow: 'none',
            background:
              'linear-gradient(90deg, #7b14e8 0%, #5b15d7 100%)',
          }}
        >
          Ask AI Tutor
        </Button>
      </Box>
    </Box>
  );
};

/* =====================================================
   RECOMMENDED CARD
===================================================== */

interface RecommendedCardProps {
  resource: LearningResource;
  onAction: () => void;
}

const RecommendedCard = ({
  resource,
  onAction,
}: RecommendedCardProps) => {
  const isVideo = resource.type === 'video';

  return (
    <Box
      sx={{
        ...cardSx,
        p: 1.4,
        minHeight: 210,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ResourceTypeBadge
        type={resource.type}
      />

      <Box
        sx={{
          mt: 0.8,
          display: 'grid',
          gridTemplateColumns:
            '145px minmax(0, 1fr)',
          gap: 1.2,
          flex: 1,
        }}
      >
        <ResourceIllustration
          type={resource.type}
        />

        <Box>
          <Typography
            sx={{
              color: '#111a38',
              fontSize: '0.93rem',
              lineHeight: 1.15,
              fontWeight: 900,
            }}
          >
            {resource.title}
          </Typography>

          <Typography
            sx={{
              mt: 0.45,
              color: '#46536b',
              fontSize: '0.72rem',
              lineHeight: 1.4,
            }}
          >
            {resource.description}
          </Typography>

          <Stack
            direction="row"
            spacing={0.4}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 0.7 }}
          >
            {resource.skills.map(
              (skill) => (
                <SkillChip
                  key={skill}
                  label={skill}
                  small
                />
              ),
            )}
          </Stack>
        </Box>
      </Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
        >
          <TimerOutlinedIcon
            sx={{ fontSize: 17 }}
          />

          <Typography
            sx={{
              color: '#26324a',
              fontSize: '0.69rem',
              fontWeight: 750,
            }}
          >
            {resource.meta}
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          startIcon={
            isVideo ? (
              <PlayArrowRoundedIcon />
            ) : (
              <MenuBookRoundedIcon />
            )
          }
          endIcon={
            !isVideo ? (
              <ArrowForwardRoundedIcon />
            ) : undefined
          }
          onClick={onAction}
          sx={resourceButtonSx}
        >
          {isVideo
            ? 'Watch Video'
            : 'Read Guide'}
        </Button>
      </Stack>
    </Box>
  );
};

/* =====================================================
   RESOURCE ROW
===================================================== */

interface ResourceRowProps {
  resource: LearningResource;
  divider: boolean;
  onAction: () => void;
}

const ResourceRow = ({
  resource,
  divider,
  onAction,
}: ResourceRowProps) => (
  <Box
    sx={{
      px: {
        xs: 1.2,
        md: 1.7,
      },
      py: 1,
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        lg:
          '130px minmax(260px, 1.2fr) minmax(220px, 0.8fr) auto',
      },
      gap: 1.2,
      alignItems: 'center',
      borderBottom: divider
        ? '1px solid #e1e6ef'
        : 'none',
    }}
  >
    <ResourceIllustration
      type={resource.type}
      compact
    />

    <Box>
      <Stack
        direction="row"
        spacing={0.6}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <Typography
          sx={{
            color: '#111a38',
            fontSize: '0.82rem',
            fontWeight: 900,
          }}
        >
          {resource.title}
        </Typography>

        {resource.recommended && (
          <Chip
            icon={
              <WorkspacePremiumRoundedIcon />
            }
            label="Recommended"
            size="small"
            sx={{
              height: 23,
              bgcolor: '#e5f8e5',
              color: '#18752b',
              fontSize: '0.6rem',
              fontWeight: 850,
              '& .MuiChip-icon': {
                color: '#15962e',
              },
            }}
          />
        )}
      </Stack>

      <Typography
        sx={{
          mt: 0.15,
          color: '#536078',
          fontSize: '0.68rem',
        }}
      >
        {resource.description}
      </Typography>

      <Typography
        sx={{
          mt: 0.2,
          color: '#536078',
          fontSize: '0.63rem',
          fontWeight: 700,
        }}
      >
        {resource.meta}
      </Typography>
    </Box>

    <Stack
      direction="row"
      spacing={0.4}
      useFlexGap
      flexWrap="wrap"
      alignItems="center"
    >
      <Typography
        sx={{
          color: '#26324a',
          fontSize: '0.64rem',
          fontWeight: 800,
          mr: 0.3,
        }}
      >
        Skills:
      </Typography>

      {resource.skills.map(
        (skill) => (
          <SkillChip
            key={skill}
            label={skill}
            small
          />
        ),
      )}
    </Stack>

    <ResourceActionButton
      type={resource.type}
      onClick={onAction}
    />
  </Box>
);

/* =====================================================
   RESOURCE ACTION
===================================================== */

interface ResourceActionButtonProps {
  type: ResourceType;
  onClick: () => void;
}

const ResourceActionButton = ({
  type,
  onClick,
}: ResourceActionButtonProps) => {
  const config = {
    video: {
      label: 'Watch',
      icon: <PlayArrowRoundedIcon />,
    },
    guide: {
      label: 'Read',
      icon: <MenuBookRoundedIcon />,
    },
    documentation: {
      label: 'Open',
      icon: <OpenInNewRoundedIcon />,
    },
    practice: {
      label: 'Start Practice',
      icon: <ScienceOutlinedIcon />,
    },
  }[type];

  return (
    <Button
      variant="outlined"
      startIcon={config.icon}
      endIcon={<ArrowForwardRoundedIcon />}
      onClick={onClick}
      sx={{
        ...resourceButtonSx,
        minWidth:
          type === 'practice'
            ? 155
            : 120,
      }}
    >
      {config.label}
    </Button>
  );
};

/* =====================================================
   RESOURCE ILLUSTRATION
===================================================== */

interface ResourceIllustrationProps {
  type: ResourceType;
  compact?: boolean;
}

const ResourceIllustration = ({
  type,
  compact = false,
}: ResourceIllustrationProps) => {
  const icon =
    type === 'video' ? (
      <PlayArrowRoundedIcon />
    ) : type === 'guide' ? (
      <MenuBookRoundedIcon />
    ) : type === 'documentation' ? (
      <CodeRoundedIcon />
    ) : (
      <ScienceOutlinedIcon />
    );

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: compact
          ? 54
          : 105,
        borderRadius: 2,
        background:
          'linear-gradient(145deg, #d7e9ff 0%, #e7e6ff 100%)',
        color: '#245ad7',
        display: 'grid',
        placeItems: 'center',
        '& svg': {
          fontSize: compact
            ? 32
            : 48,
        },
      }}
    >
      {icon}
    </Box>
  );
};

/* =====================================================
   FILTER
===================================================== */

interface FilterButtonProps {
  active: boolean;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

const FilterButton = ({
  active,
  label,
  icon,
  onClick,
}: FilterButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: 90,
      minHeight: 36,
      px: 1.5,
      borderRadius: 5,
      border:
        active
          ? '1px solid #6e28e8'
          : '1px solid #cbd4e2',
      color:
        active
          ? '#fff'
          : '#17213b',
      bgcolor:
        active
          ? '#6a2ce8'
          : '#fff',
      textTransform: 'none',
      fontSize: '0.7rem',
      fontWeight: 850,
      '&:hover': {
        bgcolor:
          active
            ? '#5920d5'
            : '#f5f7fb',
      },
    }}
  >
    {label}
  </Button>
);

/* =====================================================
   SECTION HEADING
===================================================== */

interface SectionHeadingProps {
  icon: ReactNode;
  title: string;
}

const SectionHeading = ({
  icon,
  title,
}: SectionHeadingProps) => (
  <Stack
    direction="row"
    spacing={0.8}
    alignItems="center"
    sx={{
      mt: 1.7,
      mb: 0.9,
    }}
  >
    <Box
      sx={{
        color: '#6d24e8',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{
        color: '#111a38',
        fontSize: '1.05rem',
        fontWeight: 900,
      }}
    >
      {title}
    </Typography>
  </Stack>
);

/* =====================================================
   TYPE BADGE
===================================================== */

interface ResourceTypeBadgeProps {
  type: ResourceType;
}

const ResourceTypeBadge = ({
  type,
}: ResourceTypeBadgeProps) => {
  const config = {
    video: {
      label: 'VIDEO',
      icon: <PlayArrowRoundedIcon />,
    },
    guide: {
      label: 'CONCEPT GUIDE',
      icon: <MenuBookRoundedIcon />,
    },
    documentation: {
      label: 'DOCUMENTATION',
      icon: <DescriptionOutlinedIcon />,
    },
    practice: {
      label: 'PRACTICE',
      icon: <ScienceOutlinedIcon />,
    },
  }[type];

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      sx={{
        alignSelf: 'flex-start',
        height: 24,
        bgcolor: '#f0e4ff',
        color: '#6320d7',
        fontSize: '0.6rem',
        fontWeight: 900,
        '& .MuiChip-icon': {
          color: '#7424e8',
        },
      }}
    />
  );
};

/* =====================================================
   SKILL CHIP
===================================================== */

interface SkillChipProps {
  label: string;
  small?: boolean;
}

const SkillChip = ({
  label,
  small = false,
}: SkillChipProps) => (
  <Chip
    label={label}
    size="small"
    sx={{
      height: small
        ? 21
        : 25,
      bgcolor: '#edf0ff',
      color: '#24318d',
      fontSize: small
        ? '0.57rem'
        : '0.64rem',
      fontWeight: 850,
    }}
  />
);

/* =====================================================
   HEADER BUTTON
===================================================== */

interface HeaderButtonProps {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

const HeaderButton = ({
  active = false,
  icon,
  label,
  onClick,
}: HeaderButtonProps) => (
  <Button
    startIcon={icon}
    onClick={onClick}
    sx={{
      minWidth: {
        xs: 155,
        md: 205,
      },
      minHeight: 47,
      borderRadius: 2.3,
      color:
        active
          ? '#fff'
          : '#17213b',
      bgcolor:
        active
          ? '#6428e8'
          : '#f8f9fc',
      textTransform: 'none',
      fontWeight: 900,
      '&:hover': {
        bgcolor:
          active
            ? '#501bd2'
            : '#eef2f8',
      },
    }}
  >
    {label}
  </Button>
);

const cardSx = {
  border: '1px solid #dce3ee',
  borderRadius: 3,
  bgcolor: '#fff',
  p: {
    xs: 1.4,
    md: 1.6,
  },
};

const resourceButtonSx = {
  minHeight: 34,
  borderRadius: 5,
  borderColor: '#7629ed',
  color: '#4b18c9',
  textTransform: 'none',
  fontSize: '0.68rem',
  fontWeight: 900,
  whiteSpace: 'nowrap',
};