import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import XIcon from '@mui/icons-material/X';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';

type PortfolioShareDialogProps = {
  open: boolean;
  publicUrl: string | null;
  displayName?: string | null;
  copyStatus?: 'idle' | 'copied';
  onClose: () => void;
  onCopy: () => void;
  onUnpublish: () => void;
};

const PortfolioShareDialog = ({
  open,
  publicUrl,
  displayName,
  copyStatus = 'idle',
  onClose,
  onCopy,
  onUnpublish,
}: PortfolioShareDialogProps) => {
  const shareTitle = displayName?.trim()
    ? `${displayName.trim()} | Career Harbor Portfolio`
    : 'Career Harbor Portfolio';

  const shareText = displayName?.trim()
    ? `View ${displayName.trim()}'s professional portfolio on Career Harbor.`
    : 'View my professional portfolio on Career Harbor.';

  const openExternal = (url: string) => {
    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const nativeShare = async () => {
    if (!publicUrl) {
      return;
    }

    if (!navigator.share) {
      onCopy();

      enqueueSnackbar(
        'Sharing is not supported by this browser. The portfolio link was copied instead.',
        {
          variant: 'info',
        },
      );

      return;
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: publicUrl,
      });
    } catch (error: unknown) {
      /*
       * Browsers reject navigator.share when the user
       * closes the native share sheet. That is not an
       * application error, so no error snackbar is needed.
       */
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      enqueueSnackbar(
        'Unable to open sharing options.',
        {
          variant: 'error',
        },
      );
    }
  };

  const shareLinkedIn = () => {
    if (!publicUrl) {
      return;
    }

    openExternal(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        publicUrl,
      )}`,
    );
  };

  const shareWhatsApp = () => {
    if (!publicUrl) {
      return;
    }

    const message = `${shareText}\n${publicUrl}`;

    openExternal(
      `https://wa.me/?text=${encodeURIComponent(
        message,
      )}`,
    );
  };

  const shareEmail = () => {
    if (!publicUrl) {
      return;
    }

    const subject = shareTitle;
    const body = `${shareText}\n\n${publicUrl}`;

    window.location.href =
      `mailto:?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
  };

  const shareX = () => {
    if (!publicUrl) {
      return;
    }

    openExternal(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText,
      )}&url=${encodeURIComponent(publicUrl)}`,
    );
  };

  const viewLive = () => {
    if (!publicUrl) {
      return;
    }

    openExternal(publicUrl);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          borderRadius: {
            xs: 0,
            sm: 3,
          },
          overflow: 'hidden',
        },
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
          px: {
            xs: 2,
            sm: 2.5,
          },
          py: 1.5,
        }}
      >
        <Box>
          <Typography
            component="h2"
            sx={{
              fontSize: '1.05rem',
              fontWeight: 800,
            }}
          >
            Share your portfolio
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              mt: 0.15,
            }}
          >
            Share your work with recruiters and
            employers.
          </Typography>
        </Box>

        <IconButton
          aria-label="Close share portfolio"
          onClick={onClose}
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

      <DialogContent
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
          },
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            alignItems="center"
            spacing={1}
            sx={{
              py: 0.5,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'success.lighter',
                borderRadius: '50%',
                color: 'success.main',
                display: 'flex',
                height: 52,
                justifyContent: 'center',
                width: 52,
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 34,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: '1.05rem',
                fontWeight: 800,
              }}
            >
              Your portfolio is live
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.78rem',
                maxWidth: 400,
              }}
            >
              Your public portfolio is ready to
              share with recruiters, employers
              and your network.
            </Typography>
          </Stack>

          <Stack spacing={0.75}>
            <Typography
              sx={{
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              Your public portfolio
            </Typography>

            <TextField
              fullWidth
              inputProps={{
                'aria-label':
                  'Public portfolio URL',
                readOnly: true,
              }}
              size="small"
              value={publicUrl ?? ''}
              InputProps={{
                endAdornment: (
                  <Tooltip
                    arrow
                    title={
                      copyStatus === 'copied'
                        ? 'Copied'
                        : 'Copy link'
                    }
                  >
                    <IconButton
                      aria-label="Copy portfolio link"
                      disabled={!publicUrl}
                      edge="end"
                      onClick={onCopy}
                      size="small"
                    >
                      {copyStatus ===
                      'copied' ? (
                        <CheckCircleRoundedIcon
                          color="success"
                          fontSize="small"
                        />
                      ) : (
                        <ContentCopyOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },

                '& input': {
                  fontSize: '0.78rem',
                },
              }}
            />
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 1,

              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            <Button
              disabled={!publicUrl}
              onClick={onCopy}
              startIcon={
                copyStatus === 'copied' ? (
                  <CheckCircleRoundedIcon />
                ) : (
                  <ContentCopyOutlinedIcon />
                )
              }
              variant="contained"
            >
              {copyStatus === 'copied'
                ? 'Copied'
                : 'Copy link'}
            </Button>

            <Button
              disabled={!publicUrl}
              onClick={() => {
                void nativeShare();
              }}
              startIcon={
                <ShareOutlinedIcon />
              }
              variant="outlined"
            >
              Share
            </Button>

            <Button
              disabled={!publicUrl}
              onClick={viewLive}
              startIcon={
                <LaunchOutlinedIcon />
              }
              variant="outlined"
            >
              View live
            </Button>
          </Box>

          <Divider />

          <Stack spacing={1.25}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                }}
              >
                Share directly
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '0.7rem',
                  mt: 0.2,
                }}
              >
                Choose where you want to share
                your portfolio.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 1,

                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  sm: 'repeat(4, minmax(0, 1fr))',
                },
              }}
            >
              <ShareOption
                disabled={!publicUrl}
                icon={<LinkedInIcon />}
                label="LinkedIn"
                onClick={shareLinkedIn}
              />

              <ShareOption
                disabled={!publicUrl}
                icon={<WhatsAppIcon />}
                label="WhatsApp"
                onClick={shareWhatsApp}
              />

              <ShareOption
                disabled={!publicUrl}
                icon={<EmailOutlinedIcon />}
                label="Email"
                onClick={shareEmail}
              />

              <ShareOption
                disabled={!publicUrl}
                icon={<XIcon />}
                label="X"
                onClick={shareX}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 2,
              p: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              Make your portfolio easier to find
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.7rem',
                lineHeight: 1.55,
                mt: 0.35,
              }}
            >
              Add this link to your resume,
              LinkedIn profile, job applications
              and referral messages so employers
              can quickly view your work.
            </Typography>
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
            spacing={1}
            sx={{
              borderTop: 1,
              borderColor: 'divider',
              pt: 1.75,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.7rem',
              }}
            >
              You control whether this portfolio
              remains publicly available.
            </Typography>

            <Button
              color="error"
              onClick={onUnpublish}
              size="small"
              variant="text"
            >
              Unpublish
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

type ShareOptionProps = {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

const ShareOption = ({
  label,
  icon,
  disabled = false,
  onClick,
}: ShareOptionProps) => (
  <Button
    disabled={disabled}
    onClick={onClick}
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      color: 'text.primary',
      flexDirection: 'column',
      gap: 0.6,
      minHeight: 74,
      px: 1,
      py: 1,

      '& svg': {
        color: 'primary.main',
        fontSize: 22,
      },

      '&:hover': {
        bgcolor: 'action.hover',
        borderColor: 'primary.main',
      },
    }}
    type="button"
    variant="text"
  >
    {icon}

    <Typography
      component="span"
      sx={{
        fontSize: '0.68rem',
        fontWeight: 700,
      }}
    >
      {label}
    </Typography>
  </Button>
);

export default PortfolioShareDialog;