import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  isAdminApiError,
  useGetAdminRecruiterContactQuery,
  useUpdateAdminRecruiterContactMutation,
} from '@/features/admin/api/adminApi';

interface RecruiterContactForm {
  contactName: string;
  contactRole: string;
  email: string;
  phoneNumber: string;
  isSharingApproved: boolean;
}

const emptyForm: RecruiterContactForm = {
  contactName: '',
  contactRole: '',
  email: '',
  phoneNumber: '',
  isSharingApproved: false,
};

export const AdminRecruiterContactCard = ({ jobId }: { jobId: string }) => {
  const contactQuery = useGetAdminRecruiterContactQuery(jobId);
  const [updateContact, updateState] = useUpdateAdminRecruiterContactMutation();
  const [form, setForm] = useState<RecruiterContactForm>(emptyForm);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!contactQuery.data) return;

    setForm({
      contactName: contactQuery.data.contactName,
      contactRole: contactQuery.data.contactRole,
      email: contactQuery.data.email,
      phoneNumber: contactQuery.data.phoneNumber ?? '',
      isSharingApproved: contactQuery.data.isSharingApproved,
    });
  }, [contactQuery.data]);

  const updateField = <Key extends keyof RecruiterContactForm>(
    field: Key,
    value: RecruiterContactForm[Key],
  ) => {
    setSuccessMessage(null);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSuccessMessage(null);

    try {
      await updateContact({
        jobId,
        request: {
          contactName: form.contactName.trim(),
          contactRole: form.contactRole.trim(),
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim() || null,
          isSharingApproved: form.isSharingApproved,
        },
      }).unwrap();

      setSuccessMessage('Recruiter contact saved successfully.');
    } catch {
      // The visible error below safely displays the API message.
    }
  };

  const loadError =
    contactQuery.isError &&
    (!isAdminApiError(contactQuery.error) || contactQuery.error.status !== 404);

  return (
    <Paper component="section" sx={{ p: { xs: 2.5, md: 4 } }}>
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography component="h2" variant="h3">
            Recruiter contact
          </Typography>
          <Typography color="text.secondary">
            Contact details are visible only to Candidates with an active portal membership when
            sharing is approved.
          </Typography>
        </Stack>

        {contactQuery.isLoading ? <Typography>Loading contact details…</Typography> : null}

        {loadError ? (
          <Alert severity="error">
            {isAdminApiError(contactQuery.error)
              ? contactQuery.error.message
              : 'We could not load recruiter contact details.'}
          </Alert>
        ) : null}

        {updateState.isError ? (
          <Alert severity="error">
            {isAdminApiError(updateState.error)
              ? updateState.error.message
              : 'We could not save recruiter contact details.'}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert aria-live="polite" severity="success">
            {successMessage}
          </Alert>
        ) : null}

        <TextField
          disabled={updateState.isLoading}
          fullWidth
          label="Recruiter name"
          onChange={(event) => updateField('contactName', event.target.value)}
          required
          value={form.contactName}
        />

        <TextField
          disabled={updateState.isLoading}
          fullWidth
          label="Recruiter role"
          onChange={(event) => updateField('contactRole', event.target.value)}
          placeholder="Example: Campus Recruiter"
          required
          value={form.contactRole}
        />

        <TextField
          disabled={updateState.isLoading}
          fullWidth
          label="Recruiter email"
          onChange={(event) => updateField('email', event.target.value)}
          required
          type="email"
          value={form.email}
        />

        <TextField
          disabled={updateState.isLoading}
          fullWidth
          label="Recruiter phone number"
          onChange={(event) => updateField('phoneNumber', event.target.value)}
          placeholder="+91 9876543210"
          type="tel"
          value={form.phoneNumber}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.isSharingApproved}
              disabled={updateState.isLoading}
              onChange={(_, checked) => updateField('isSharingApproved', checked)}
            />
          }
          label="I have permission to share these recruiter contact details with premium Candidates."
        />

        <Button
          disabled={
            updateState.isLoading ||
            !form.contactName.trim() ||
            !form.contactRole.trim() ||
            !form.email.trim()
          }
          onClick={() => void save()}
          sx={{ alignSelf: 'flex-start' }}
          variant="contained"
        >
          {updateState.isLoading ? 'Saving…' : 'Save recruiter contact'}
        </Button>
      </Stack>
    </Paper>
  );
};
