import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, AlertTitle } from '@mui/material';

export const SecurePaymentNotice = () => (
  <Alert icon={<LockOutlinedIcon />} severity="info">
    <AlertTitle>Secure, server-verified payment</AlertTitle>
    Razorpay collects your payment details. Career Portal does not store card, UPI, or banking
    information, and access is activated only after server verification.
  </Alert>
);
