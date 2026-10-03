import { useState } from 'react';
import {
  AddRounded,
  AccessTimeRounded,
  BusinessCenterRounded,
  CloseRounded,
  DeleteOutlineRounded,
  EditOutlined,
  LocalOfferOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { GuidanceForm } from './GuidanceForm';
import {
  numberValue,
  textValue,
} from '../utils/formValues';

import {
  useDeleteConsultantServiceMutation,
  useSaveConsultantServiceMutation,
} from '../api/profilesApi';

import type {
  ConsultantPrivateResponse,
  ConsultantServiceResponse,
} from '../types';

import { useGuidanceAction } from '../hooks/useGuidanceAction';

interface ConsultantServicesProps {
  profile: ConsultantPrivateResponse;
}

const serviceFields = [
  {
    name: 'serviceType',
    label: 'Service type',
    required: true,
    maxLength: 60,
    helper:
      'Example: Career Planning, Resume Review, Interview Preparation',
  },
  {
    name: 'title',
    label: 'Service title',
    required: true,
    maxLength: 160,
    helper:
      'Give candidates a clear name for this service.',
  },
  {
    name: 'description',
    label: 'Description',
    kind: 'textarea' as const,
    required: true,
    maxLength: 3000,
    helper:
      'Explain what the candidate will receive during this session.',
  },
  {
    name: 'durationMinutes',
    label: 'Duration (minutes)',
    kind: 'number' as const,
    required: true,
    min: 15,
    max: 180,
    step: 5,
  },
  {
    name: 'price',
    label: 'Price',
    kind: 'number' as const,
    required: true,
    min: 0,
    step: 0.01,
  },
  {
    name: 'currency',
    label: 'Currency',
    kind: 'select' as const,
    required: true,
    options: ['INR', 'USD', 'EUR', 'GBP'].map(
      (value) => ({
        label: value,
        value,
      }),
    ),
  },
];

function formatPrice(
  currency: string,
  price: number,
): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits:
        Number.isInteger(price) ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

function ServiceCard({
  service,
  busy,
  onEdit,
  onDeactivate,
}: {
  service: ConsultantServiceResponse;
  busy: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        transition:
          'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: 2,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.50',
            color: 'primary.main',
          }}
        >
          <BusinessCenterRounded />
        </Box>

        <Chip
          size="small"
          label={
            service.isActive
              ? 'Active'
              : 'Inactive'
          }
          color={
            service.isActive
              ? 'success'
              : 'default'
          }
          variant="outlined"
        />
      </Stack>

      <Typography
        variant="h6"
        component="h3"
        sx={{
          mt: 2,
          fontWeight: 700,
        }}
      >
        {service.title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.75,
          minHeight: 42,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {service.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <AccessTimeRounded
            sx={{
              fontSize: 19,
              color: 'text.secondary',
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {service.durationMinutes} min
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <LocalOfferOutlined
            sx={{
              fontSize: 19,
              color: 'text.secondary',
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formatPrice(
              service.currency,
              service.price,
            )}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <BusinessCenterRounded
            sx={{
              fontSize: 19,
              color: 'text.secondary',
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {service.serviceType}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mt: 2.5 }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditOutlined />}
          disabled={busy}
          onClick={onEdit}
        >
          Edit
        </Button>

        {service.isActive && (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={
              <DeleteOutlineRounded />
            }
            disabled={busy}
            onClick={onDeactivate}
          >
            Deactivate
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default function ConsultantServices({
  profile,
}: ConsultantServicesProps) {
  const action = useGuidanceAction();

  const [saveService] =
    useSaveConsultantServiceMutation();

  const [deleteService] =
    useDeleteConsultantServiceMutation();

  const [editorOpen, setEditorOpen] =
    useState(false);

  const [editingService, setEditingService] =
    useState<ConsultantServiceResponse | null>(
      null,
    );

  const [
    serviceToDeactivate,
    setServiceToDeactivate,
  ] =
    useState<ConsultantServiceResponse | null>(
      null,
    );

  const activeServices =
    profile.services.filter(
      (service) => service.isActive,
    );

  const inactiveServices =
    profile.services.filter(
      (service) => !service.isActive,
    );

  const openCreate = () => {
    setEditingService(null);
    setEditorOpen(true);
  };

  const openEdit = (
    service: ConsultantServiceResponse,
  ) => {
    setEditingService(service);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (action.busy) {
      return;
    }

    setEditorOpen(false);
    setEditingService(null);
  };

  const save = async (
    values: Record<
      string,
      string | number | boolean
    >,
  ) => {
    await action.execute(
      () =>
        saveService({
          id:
            editingService?.id ??
            undefined,

          request: {
            serviceType: textValue(
              values,
              'serviceType',
            ),

            title: textValue(
              values,
              'title',
            ),

            description: textValue(
              values,
              'description',
            ),

            durationMinutes:
              numberValue(
                values,
                'durationMinutes',
              ),

            price: numberValue(
              values,
              'price',
            ),

            currency: textValue(
              values,
              'currency',
            ),

            isActive:
              editingService?.isActive ??
              true,

            revision: profile.revision,
          },
        }).unwrap(),

      editingService
        ? 'Service updated.'
        : 'Service created.',
    );

    setEditorOpen(false);
    setEditingService(null);
  };

  const deactivate = async () => {
    if (!serviceToDeactivate) {
      return;
    }

    await action.execute(
      () =>
        deleteService({
          id: serviceToDeactivate.id,
          revision: profile.revision,
        }).unwrap(),

      'Service deactivated.',
    );

    setServiceToDeactivate(null);
  };

  return (
    <Stack spacing={2.5}>
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.50',
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <BusinessCenterRounded />
            </Box>

            <Box>
              <Typography
                variant="h5"
                component="h2"
                fontWeight={700}
              >
                Services
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Create and manage the career
                guidance services candidates can
                book with you.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreate}
            disabled={action.busy}
            sx={{
              minWidth: 150,
              alignSelf: {
                xs: 'stretch',
                sm: 'center',
              },
            }}
          >
            Create service
          </Button>
        </Stack>
      </Paper>

      {action.error && (
        <Alert severity="error">
          {action.error}
        </Alert>
      )}

      {activeServices.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            px: 3,
            py: 6,
            borderRadius: 3,
            textAlign: 'center',
            borderStyle: 'dashed',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.50',
              color: 'primary.main',
            }}
          >
            <AddRounded />
          </Box>

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Create your first service
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
              mb: 2.5,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Add a service to showcase your
            expertise and allow candidates to book
            guidance sessions with you.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreate}
          >
            Create service
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {activeServices.map((service) => (
            <Grid
              key={service.id}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <ServiceCard
                service={service}
                busy={action.busy}
                onEdit={() =>
                  openEdit(service)
                }
                onDeactivate={() =>
                  setServiceToDeactivate(
                    service,
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      {inactiveServices.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
          >
            Inactive services
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.25, mb: 2 }}
          >
            These services are not currently
            available for candidates to book.
          </Typography>

          <Stack spacing={1}>
            {inactiveServices.map(
              (service) => (
                <Stack
                  key={service.id}
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1.5}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                  }}
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      fontWeight={600}
                    >
                      {service.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {
                        service.durationMinutes
                      }{' '}
                      min ·{' '}
                      {formatPrice(
                        service.currency,
                        service.price,
                      )}
                    </Typography>
                  </Box>

                  <Chip
                    label="Inactive"
                    size="small"
                    variant="outlined"
                  />

                  <Button
                    size="small"
                    startIcon={
                      <EditOutlined />
                    }
                    onClick={() =>
                      openEdit(service)
                    }
                  >
                    Edit
                  </Button>
                </Stack>
              ),
            )}
          </Stack>
        </Paper>
      )}

      <Paper
        variant="outlined"
        sx={{
          px: 3,
          py: 4,
          borderRadius: 3,
          textAlign: 'center',
          borderStyle: 'dashed',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.50',
            color: 'primary.main',
          }}
        >
          <AddRounded />
        </Box>

        <Typography
          variant="subtitle1"
          fontWeight={700}
        >
          Create a new service
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, mb: 2 }}
        >
          Add another way for candidates to get
          guidance from you.
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={openCreate}
          disabled={action.busy}
        >
          Create service
        </Button>
      </Paper>

      <Dialog
        open={editorOpen}
        onClose={closeEditor}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                {editingService
                  ? 'Edit service'
                  : 'Create service'}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {editingService
                  ? 'Update the service information shown to candidates.'
                  : 'Add a career guidance service candidates can book.'}
              </Typography>
            </Box>

            <Button
              color="inherit"
              onClick={closeEditor}
              disabled={action.busy}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
              }}
            >
              <CloseRounded />
            </Button>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <GuidanceForm
            key={
              editingService?.id ??
              'create'
            }
            initial={
              editingService
                ? {
                    serviceType:
                      editingService.serviceType,

                    title:
                      editingService.title,

                    description:
                      editingService.description,

                    durationMinutes:
                      editingService.durationMinutes,

                    price:
                      editingService.price,

                    currency:
                      editingService.currency,
                  }
                : {
                    currency: 'INR',
                    durationMinutes: 30,
                  }
            }
            fields={serviceFields}
            busy={action.busy}
            submitLabel={
              editingService
                ? 'Save changes'
                : 'Create service'
            }
            onCancel={closeEditor}
            onSubmit={save}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(serviceToDeactivate)}
        onClose={() => {
          if (!action.busy) {
            setServiceToDeactivate(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Deactivate service?
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {serviceToDeactivate
              ? `"${serviceToDeactivate.title}" will no longer be available for new candidate bookings.`
              : ''}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            disabled={action.busy}
            onClick={() =>
              setServiceToDeactivate(null)
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={action.busy}
            onClick={() =>
              void deactivate()
            }
          >
            {action.busy
              ? 'Deactivating…'
              : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}