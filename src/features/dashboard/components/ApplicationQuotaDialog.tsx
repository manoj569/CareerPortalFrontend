import { Avatar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import WorkspacePremiumOutlined from '@mui/icons-material/WorkspacePremiumOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

export function ApplicationQuotaDialog({ kind, resetsAtUtc, onClose, onUpgrade }: {
  kind: 'monthly' | 'daily' | null; resetsAtUtc?: string; onClose: () => void; onUpgrade: () => void;
}) {
  const monthly = kind === 'monthly';
  const reset = resetsAtUtc ? new Date(resetsAtUtc) : null;
  return <Dialog open={kind !== null} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="application-quota-title" aria-describedby="application-quota-description" PaperProps={{ sx: { borderRadius: 3, p: { xs: 1, sm: 2 } } }}>
    <DialogTitle id="application-quota-title">
      <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}><WorkspacePremiumOutlined /></Avatar>
      {monthly ? 'Unlock more job applications' : 'Daily application limit reached'}
    </DialogTitle>
    <DialogContent><Stack spacing={2}>
      <Typography id="application-quota-description">{monthly ? "You've used all 10 free job applications for this month." : "You've reached your 35-job application limit for today."}</Typography>
      <Typography color="text.secondary">{monthly ? 'Upgrade to CareerHarbor Premium and apply to up to 35 jobs per day.' : 'Your application allowance will reset for the next daily quota period.'}</Typography>
      {monthly ? <>
        <Chip label="Premium from ₹99" color="primary" sx={{ alignSelf: 'flex-start', fontWeight: 700 }} />
        {['Up to 35 job applications per day', 'Keep applying without waiting for your monthly free quota to reset', 'Your Premium application allowance becomes available after membership activation'].map(benefit => <Stack key={benefit} direction="row" spacing={1}><CheckCircleOutline color="success" /><Typography variant="body2">{benefit}</Typography></Stack>)}
      </> : reset && Number.isFinite(reset.getTime()) && <Typography variant="body2">Your application limit resets at {reset.toLocaleString()}.</Typography>}
    </Stack></DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexDirection: { xs: 'column', sm: 'row' }, '& button': { width: { xs: '100%', sm: 'auto' } } }}>
      {monthly ? <><Button onClick={onClose}>Maybe later</Button><Button variant="contained" onClick={onUpgrade}>Upgrade to Premium</Button></> : <Button variant="contained" onClick={onClose}>Got it</Button>}
    </DialogActions>
  </Dialog>;
}
