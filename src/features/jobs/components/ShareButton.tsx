import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

interface ShareButtonProps {
  text: string;
  title: string;
  url: string;
}

export const ShareButton = ({ text, title, url }: ShareButtonProps) => {
  const [showManualCopy, setShowManualCopy] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text, title, url });
        return;
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      enqueueSnackbar('Job link copied to your clipboard.', { variant: 'success' });
    } catch {
      setShowManualCopy(true);
    }
  };

  return (
    <>
      <Button
        onClick={() => void handleShare()}
        startIcon={<ShareOutlinedIcon />}
        variant="outlined"
      >
        Share job
      </Button>
      <Dialog
        aria-describedby="manual-copy-description"
        aria-labelledby="manual-copy-title"
        onClose={() => setShowManualCopy(false)}
        open={showManualCopy}
      >
        <DialogTitle id="manual-copy-title">Copy job link</DialogTitle>
        <DialogContent>
          <Typography id="manual-copy-description" sx={{ mb: 2 }}>
            Automatic sharing is unavailable in this browser. Select and copy the link below.
          </Typography>
          <TextField
            autoFocus
            label="Job link"
            onFocus={(event) => event.currentTarget.select()}
            slotProps={{ htmlInput: { readOnly: true } }}
            value={url}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowManualCopy(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
