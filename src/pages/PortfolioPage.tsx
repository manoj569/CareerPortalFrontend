import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/feedback/ErrorState';
import { buildPublicPortfolioPath } from '@/constants/routes';
import {
  isDashboardApiError,
} from '@/features/dashboard/api/dashboardApi';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import {
  useCreatePortfolioMutation,
  useGetPortfolioPreviewQuery,
  useGetPortfolioQuery,
  usePublishPortfolioMutation,
  useUnpublishPortfolioMutation,
} from '@/features/portfolio/api/portfolioApi';
import { PortfolioCollectionEditors } from '@/features/portfolio/components/PortfolioCollectionEditors';
import { PortfolioRenderer } from '@/features/portfolio/components/PortfolioRenderer';
import { PortfolioSettingsCard } from '@/features/portfolio/components/PortfolioSettingsCard';
import type {
  PortfolioEditorResponse,
  PortfolioPublishResponse,
} from '@/features/portfolio/types/portfolioModels';
import { publicPortfolioUrl } from '@/features/portfolio/utils/portfolioUrl';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { CandidateProfileContent } from './ProfilePage';

type TabValue = 'profile' | 'builder' | 'preview';
type PreviewWidth = 'desktop' | 'mobile';

const validTabs: TabValue[] = ['profile', 'builder', 'preview'];

export const PortfolioPage = () => {
  useDocumentMetadata(
    'Portfolio | Career Harbor',
    'Build your private Career Harbor profile and explicitly publish a professional portfolio when ready.',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const portfolio = useGetPortfolioQuery();
  const [createPortfolio, createState] = useCreatePortfolioMutation();
  const [publishPortfolio, publishState] = usePublishPortfolioMutation();
  const [unpublishPortfolio, unpublishState] = useUnpublishPortfolioMutation();
  const [publicationError, setPublicationError] = useState<string | null>(null);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const requestedTab = searchParams.get('tab');
  const tab: TabValue = validTabs.includes(requestedTab as TabValue)
    ? (requestedTab as TabValue)
    : 'profile';
  const editor = portfolio.data;
  const isCreated = Boolean(editor?.isCreated);
  const isPublished = editor?.status === 'Published';
  const publicUrl = isPublished && editor?.slug ? publicPortfolioUrl(editor.slug) : null;
  const frontendMissing = useMemo(() => getFrontendMissingRequirements(editor), [editor]);
  const canPublish = isCreated && !isPublished && frontendMissing.length === 0;

  const setTab = (nextTab: TabValue) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', nextTab);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (tab !== 'preview' || !editor || editor.isCreated) return;
    const next = new URLSearchParams(searchParams);
    next.set('tab', 'builder');
    setSearchParams(next, { replace: true });
  }, [editor, searchParams, setSearchParams, tab]);


  const copyLink = async () => {
    if (!publicUrl) return;
    setCopyStatus('idle');
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyStatus('copied');
      enqueueSnackbar('Portfolio link copied.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Unable to copy the portfolio link.', { variant: 'error' });
    }
  };

  const runPublish = async () => {
    if (publishState.isLoading || !isCreated) return;
    setPublicationError(null);
    try {
      const result = await publishPortfolio().unwrap();
      handlePublishResult(result, () => undefined);
    } catch (error: unknown) {
      setPublicationError(
        isDashboardApiError(error)
          ? error.message
          : 'Unable to publish your portfolio. Please review your details and try again.',
      );
    }
  };

  const runUnpublish = async () => {
    if (unpublishState.isLoading || !isPublished) return;
    setPublicationError(null);
    try {
      await unpublishPortfolio().unwrap();
      setUnpublishOpen(false);
      enqueueSnackbar('Portfolio unpublished. It is now private.', { variant: 'success' });
    } catch (error: unknown) {
      setPublicationError(
        isDashboardApiError(error)
          ? error.message
          : 'Unable to unpublish your portfolio. Please try again.',
      );
    }
  };

  if (portfolio.isLoading) {
    return (
      <Stack aria-label="Loading portfolio workspace" role="status" spacing={3}>
        <Skeleton height={90} variant="rounded" />
        <Skeleton height={180} variant="rounded" />
        <Skeleton height={480} variant="rounded" />
      </Stack>
    );
  }

  if (portfolio.isError || !editor) {
    return (
      <ErrorState
        description="Your portfolio workspace could not be loaded."
        headingLevel="h1"
        onRetry={() => void portfolio.refetch()}
        title="Portfolio is temporarily unavailable"
      />
    );
  }

  const publicPortfolioCard = (
    <PublicPortfolioCard
      canPublish={canPublish}
      copyStatus={copyStatus}
      editor={editor}
      isPublishing={publishState.isLoading}
      onBuilder={() => setTab('builder')}
      onCopy={() => void copyLink()}
      onPreview={() => setTab('preview')}
      onPublish={() => void runPublish()}
      onUnpublish={() => setUnpublishOpen(true)}
      publicUrl={publicUrl}
    />
  );

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', maxWidth: '100%', overflow: 'hidden' }}>
        <Tabs
          allowScrollButtonsMobile
          aria-label="Portfolio workspace views"
          onChange={(_, value: TabValue) => setTab(value)}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { minHeight: 52, minWidth: { xs: 138, sm: 160 }, textTransform: 'none' },
            minHeight: 52,
          }}
          value={tab}
          variant="scrollable"
        >
          <Tab label="Profile" value="profile" />
          <Tab label="Portfolio builder" value="builder" />
          <Tab disabled={!isCreated} label="Preview" value="preview" />
        </Tabs>
      </Box>

      {publicationError ? <Alert aria-live="assertive" severity="error">{publicationError}</Alert> : null}

      {tab === 'profile' ? (
        <CandidateProfileContent hidePageHeader />
      ) : null}

      {tab === 'builder' ? (
        !isCreated ? (
          <NotCreated createPortfolio={createPortfolio} isLoading={createState.isLoading} />
        ) : (
          <Stack spacing={2.5}>
            <BuilderWorkspace editor={editor} onPreview={() => setTab('preview')} />
            {publicPortfolioCard}
          </Stack>
        )
      ) : null}

      {tab === 'preview' && isCreated ? (
        <PortfolioPreviewWorkspace editor={editor} onBack={() => setTab('builder')} />
      ) : null}

      <ConfirmActionDialog
        actionLabel="Unpublish portfolio"
        description="Your public portfolio will no longer be available at its current link. Your private profile and portfolio content will be kept."
        error={publicationError}
        isProcessing={unpublishState.isLoading}
        onClose={() => !unpublishState.isLoading && setUnpublishOpen(false)}
        onConfirm={() => void runUnpublish()}
        open={unpublishOpen}
        title="Unpublish your portfolio?"
      />
    </Stack>
  );
};

const PublicPortfolioCard = ({
  canPublish,
  copyStatus,
  editor,
  isPublishing,
  onBuilder,
  onCopy,
  onPreview,
  onPublish,
  onUnpublish,
  publicUrl,
}: {
  canPublish: boolean;
  copyStatus: 'idle' | 'copied';
  editor: PortfolioEditorResponse;
  isPublishing: boolean;
  onBuilder: () => void;
  onCopy: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  publicUrl: string | null;
}) => {
  const published = editor.status === 'Published';
  return (
    <Paper
      component="section"
      id="candidate-public-portfolio"
      sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', height: '100%', p: { xs: 2.5, sm: 3 } }}
    >
      <Stack alignItems="flex-start" spacing={1.75}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} width="100%">
          <Stack alignItems="center" direction="row" spacing={1}>
            <WebOutlinedIcon />
            <Typography component="h2" variant="h3">Public portfolio</Typography>
          </Stack>
          <Chip color={published ? 'success' : 'warning'} label={published ? 'Published' : 'Draft'} size="small" />
        </Stack>
        <Typography sx={{ color: 'rgba(255,255,255,.78)' }} variant="body2">
          {published ? 'Your selected portfolio content is live.' : 'Profile edits stay private until you explicitly publish a portfolio.'}
        </Typography>
        {publicUrl ? <Typography sx={{ color: 'inherit', overflowWrap: 'anywhere' }} variant="body2">{publicUrl}</Typography> : null}
        <Stack alignItems="stretch" spacing={1} width="100%">
          {!editor.isCreated ? <Button color="inherit" onClick={onBuilder} variant="contained">Open portfolio builder</Button> : null}
          {editor.isCreated ? <Button color="inherit" onClick={onPreview} variant="outlined">Preview draft</Button> : null}
          {canPublish ? <Button color="inherit" disabled={isPublishing} onClick={onPublish} variant="contained">{isPublishing ? 'Publishing…' : 'Publish'}</Button> : null}
          {published && editor.slug ? (
            <Button color="inherit" component={Link} endIcon={<OpenInNewOutlinedIcon />} rel="noopener noreferrer" target="_blank" to={buildPublicPortfolioPath(editor.slug)} variant="outlined">View live portfolio</Button>
          ) : null}
          {published ? <Button color="inherit" onClick={onCopy} startIcon={<ContentCopyOutlinedIcon />}>{copyStatus === 'copied' ? 'Link copied' : 'Copy link'}</Button> : null}
          <Button color="inherit" onClick={onBuilder}>{published ? 'Manage portfolio' : 'Open portfolio builder'}</Button>
          {published ? <Button color="inherit" onClick={onUnpublish} sx={{ opacity: 0.82 }}>Unpublish</Button> : null}
        </Stack>
      </Stack>
    </Paper>
  );
};

const NotCreated = ({
  createPortfolio,
  isLoading,
}: {
  createPortfolio: ReturnType<typeof useCreatePortfolioMutation>[0];
  isLoading: boolean;
}) => {
  const [error, setError] = useState<string | null>(null);
  const create = async () => {
    if (isLoading) return;
    setError(null);
    try {
      await createPortfolio({ requestedSlug: null, template: 'Professional' }).unwrap();
      enqueueSnackbar('Portfolio draft created.', { variant: 'success' });
    } catch (createError: unknown) {
      setError(
        isDashboardApiError(createError)
          ? createError.message
          : 'Unable to create your portfolio draft. Please try again.',
      );
    }
  };

  return (
    <Paper component="section" sx={{ border: 1, borderColor: 'divider', p: { xs: 3, md: 5 } }}>
      <Stack alignItems="flex-start" spacing={2}>
        <Chip color="warning" label="Draft" variant="outlined" />
        <Typography component="h2" variant="h3">Create your public portfolio draft</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
          Choose what to show publicly, add portfolio-only career records, and preview everything first. Creating a draft does not publish it.
        </Typography>
        {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
        <Button disabled={isLoading} onClick={() => void create()} variant="contained">{isLoading ? 'Creating…' : 'Create portfolio'}</Button>
      </Stack>
    </Paper>
  );
};

const BuilderWorkspace = ({ editor, onPreview }: { editor: PortfolioEditorResponse; onPreview: () => void }) => (
  <Stack spacing={2.5}>
    <Paper component="section" sx={{ border: 1, borderColor: 'divider', p: { xs: 2.5, md: 3 } }}>
      <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
        <Stack spacing={0.5}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography component="h2" variant="h3">Portfolio builder</Typography>
            <Chip color={editor.status === 'Published' ? 'success' : 'warning'} label={editor.status ?? 'Draft'} size="small" variant="outlined" />
          </Stack>
          <Typography color="text.secondary">Choose public sections and manage content that belongs only to your portfolio.</Typography>
        </Stack>
        <Button onClick={onPreview} variant="outlined">Preview portfolio</Button>
      </Stack>
    </Paper>
    <Alert severity="info">
      Private profile data is saved separately. Only visible portfolio sections and portfolio-only records appear in the public preview; changes are never published automatically.
    </Alert>
    <PortfolioSettingsCard portfolio={editor} />
    <PortfolioCollectionEditors portfolio={editor} />
  </Stack>
);

const PortfolioPreviewWorkspace = ({ editor, onBack }: { editor: PortfolioEditorResponse; onBack: () => void }) => {
  const preview = useGetPortfolioPreviewQuery();
  const [width, setWidth] = useState<PreviewWidth>('desktop');

  return (
    <Stack spacing={2}>
      <Paper component="section" sx={{ border: 1, borderColor: 'divider', p: { xs: 2, sm: 2.5 } }}>
        <Stack alignItems={{ xs: 'flex-start', md: 'center' }} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Typography component="h2" variant="h3">Portfolio preview</Typography>
              <Chip color={editor.status === 'Published' ? 'success' : 'warning'} label={editor.status ?? 'Draft'} size="small" variant="outlined" />
            </Stack>
            <Typography color="text.secondary" variant="body2">This is the backend-generated preview of your currently visible public sections.</Typography>
          </Stack>
          <Stack alignItems={{ xs: 'stretch', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} spacing={1} width={{ xs: '100%', md: 'auto' }}>
            <Button onClick={onBack} startIcon={<ArrowBackOutlinedIcon />} variant="outlined">Back to builder</Button>
            <ToggleButtonGroup
              aria-label="Preview width"
              exclusive
              onChange={(_, value: PreviewWidth | null) => value && setWidth(value)}
              size="small"
              sx={{ '& .MuiToggleButton-root': { minHeight: 44, minWidth: 44 } }}
              value={width}
            >
              <ToggleButton aria-label="Desktop preview width" value="desktop"><DesktopWindowsOutlinedIcon fontSize="small" /></ToggleButton>
              <ToggleButton aria-label="Mobile preview width" value="mobile"><PhoneIphoneOutlinedIcon fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Paper>

      {preview.isLoading ? <Skeleton aria-label="Loading portfolio preview" height={600} variant="rounded" /> : null}
      {preview.isError ? (
        <Paper sx={{ p: 3 }}>
          <Alert action={<Button color="inherit" onClick={() => void preview.refetch()}>Retry</Button>} severity="error">Portfolio preview is unavailable.</Alert>
        </Paper>
      ) : null}
      {!preview.isLoading && !preview.isError && !preview.data ? (
        <Paper sx={{ p: 3 }}><Typography color="text.secondary">No portfolio preview is available yet. Return to the builder and add visible content.</Typography></Paper>
      ) : null}
      {preview.data ? (
        <Stack alignItems="center" spacing={1.5}>
          {preview.data.sectionOrder.length === 0 ? <Alert severity="info" sx={{ width: '100%' }}>No public sections are visible yet. Use the builder to choose what appears here.</Alert> : null}
          <Paper
            sx={{
              border: 1,
              borderColor: 'divider',
              maxWidth: '100%',
              overflow: 'hidden',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              transition: (theme) => theme.transitions.create('width'),
              width: width === 'mobile' ? 390 : '100%',
            }}
          >
            <PortfolioRenderer portfolio={preview.data} preview />
          </Paper>
        </Stack>
      ) : null}
    </Stack>
  );
};

const getFrontendMissingRequirements = (portfolio: PortfolioEditorResponse | undefined): string[] => {
  if (!portfolio?.isCreated) return [];
  const missing: string[] = [];
  if (!portfolio.displayName.trim()) missing.push('name');
  if (!portfolio.resumeHeadline?.trim()) missing.push('resumeHeadline');
  if (!portfolio.profileSummary?.trim()) missing.push('profileSummary');
  if (!portfolio.skills.length) missing.push('skills');
  if (!portfolio.slug?.trim()) missing.push('slug');
  return missing;
};

const handlePublishResult = (
  result: PortfolioPublishResponse,
  setMissing: (requirements: string[]) => void,
) => {
  if (!result.published) {
    setMissing(result.missingRequirements);
    return;
  }
  setMissing([]);
  enqueueSnackbar('Portfolio published.', { variant: 'success' });
};
