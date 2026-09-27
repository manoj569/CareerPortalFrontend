import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useGetPortfolioPreviewQuery } from '../api/portfolioApi';
import type {
  CandidatePortfolioTemplate,
  PortfolioEditorResponse,
  PortfolioSectionType,
} from '../types/portfolioModels';
import { PortfolioBuilderHero } from './PortfolioBuilderHero';
import {
  PortfolioCollectionEditors,
  type PortfolioCollectionEditorKind,
} from './PortfolioCollectionEditors';
import PortfolioLivePreview from './PortfolioLivePreview';
import { PortfolioSettingsCard } from './PortfolioSettingsCard';

type PortfolioBuilderWorkspaceProps = {
  portfolio: PortfolioEditorResponse;
  onOpenPreview: () => void;
  onEditProfile?: () => void;
};

type EditorState = {
  kind: PortfolioCollectionEditorKind;
  title: string;
} | null;

const collectionEditors: Partial<
  Record<
    PortfolioSectionType,
    {
      kind: PortfolioCollectionEditorKind;
      title: string;
    }
  >
> = {
  Experience: {
    kind: 'experience',
    title: 'Experience',
  },

  Education: {
    kind: 'education',
    title: 'Education',
  },

  Projects: {
    kind: 'project',
    title: 'Projects',
  },

  Certifications: {
    kind: 'certification',
    title: 'Certifications',
  },

  ProfessionalLinks: {
    kind: 'link',
    title: 'Professional links',
  },

  CustomSections: {
    kind: 'customSection',
    title: 'Custom sections',
  },
};

const profileSections = new Set<PortfolioSectionType>([
  'About',
  'Skills',
  'Resume',
]);

const PortfolioBuilderWorkspace = ({
  portfolio,
  onOpenPreview,
  onEditProfile,
}: PortfolioBuilderWorkspaceProps) => {
  const [editor, setEditor] =
    useState<EditorState>(null);

  const [
    draftTemplate,
    setDraftTemplate,
  ] = useState<CandidatePortfolioTemplate>(
    portfolio.template ?? 'Professional',
  );

  const preview =
    useGetPortfolioPreviewQuery(undefined, {
      skip: !portfolio.isCreated,
    });

  /*
   * Keep the local preview template synchronized with
   * the latest saved portfolio value.
   *
   * This matters after settings are saved and the
   * portfolio query refreshes.
   */
  useEffect(() => {
    setDraftTemplate(
      portfolio.template ?? 'Professional',
    );
  }, [portfolio.template]);

  /*
   * The backend preview contains the saved template.
   *
   * While the user is editing, replace only the template
   * in memory so Professional/Developer can be previewed
   * immediately without saving first.
   *
   * No backend data is modified here.
   */
  const livePreviewPortfolio = useMemo(() => {
    if (!preview.data) {
      return undefined;
    }

    return {
      ...preview.data,
      template: draftTemplate,
    };
  }, [
    draftTemplate,
    preview.data,
  ]);

  const handleEditSection = (
    sectionType: PortfolioSectionType,
  ) => {
    if (profileSections.has(sectionType)) {
      onEditProfile?.();
      return;
    }

    const collectionEditor =
      collectionEditors[sectionType];

    if (!collectionEditor) {
      return;
    }

    setEditor(collectionEditor);
  };

  const closeEditor = () => {
    setEditor(null);
  };

  return (
    <>
      <Stack
        spacing={{
          xs: 1.75,
          md: 2,
        }}
      >
        <PortfolioBuilderHero />

        <Box
          sx={{
            alignItems: 'start',
            display: 'grid',
            gap: {
              xs: 2,
              lg: 2,
            },

            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',

              lg:
                'minmax(0, 1.34fr) minmax(390px, 0.86fr)',

              xl:
                'minmax(0, 1.42fr) minmax(430px, 0.88fr)',
            },

            width: '100%',
          }}
        >
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <PortfolioSettingsCard
              onEditSection={
                handleEditSection
              }
              onTemplateChange={
                setDraftTemplate
              }
              portfolio={portfolio}
            />
          </Box>

          <Box
            sx={{
              alignSelf: 'start',
              minWidth: 0,

              position: {
                xs: 'static',
                lg: 'sticky',
              },

              top: {
                lg: 16,
              },
            }}
          >
            <PortfolioLivePreview
              hasError={preview.isError}
              isFetching={preview.isFetching}
              isLoading={preview.isLoading}
              onOpenPreview={onOpenPreview}
              onRefresh={() => {
                void preview.refetch();
              }}
              portfolio={
                livePreviewPortfolio
              }
            />
          </Box>
        </Box>
      </Stack>

      <Drawer
        anchor="right"
        onClose={closeEditor}
        open={Boolean(editor)}
        PaperProps={{
          sx: {
            width: {
              xs: '100%',
              sm: 560,
              md: 620,
            },
          },
        }}
      >
        {editor ? (
          <Stack
            sx={{
              height: '100%',
              minHeight: 0,
            }}
          >
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              spacing={2}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0,
                minHeight: 64,

                px: {
                  xs: 2,
                  sm: 2.5,
                },

                py: 1.25,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    lineHeight: 1.3,
                  }}
                >
                  Edit {editor.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: '0.72rem',
                    lineHeight: 1.4,
                    mt: 0.25,
                  }}
                >
                  Update the information
                  shown in your portfolio.
                </Typography>
              </Box>

              <IconButton
                aria-label="Close portfolio editor"
                onClick={closeEditor}
                size="small"
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',

                p: {
                  xs: 1.5,
                  sm: 2,
                },
              }}
            >
              <PortfolioCollectionEditors
                only={editor.kind}
                portfolio={portfolio}
              />
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </>
  );
};

export default PortfolioBuilderWorkspace;