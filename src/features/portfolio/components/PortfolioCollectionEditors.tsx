import { yupResolver } from '@hookform/resolvers/yup';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { isDashboardApiError } from '@/features/dashboard/api/dashboardApi';
import { employmentTypeOptions } from '@/features/jobs/constants/jobOptions';
import {
  useAddPortfolioCertificationMutation,
  useAddPortfolioEducationMutation,
  useAddPortfolioExperienceMutation,
  useAddPortfolioLinkMutation,
  useAddPortfolioProjectMutation,
  useDeletePortfolioCertificationMutation,
  useDeletePortfolioEducationMutation,
  useDeletePortfolioExperienceMutation,
  useDeletePortfolioLinkMutation,
  useDeletePortfolioProjectMutation,
  useUpdatePortfolioCertificationMutation,
  useUpdatePortfolioEducationMutation,
  useUpdatePortfolioExperienceMutation,
  useUpdatePortfolioLinkMutation,
  useUpdatePortfolioProjectMutation,
} from '../api/portfolioApi';
import type {
  PortfolioEditorResponse,
  ProfessionalLinkType,
} from '../types/portfolioModels';
import { PortfolioCustomSectionsEditor } from './PortfolioCustomSectionsEditor';

type Values = Record<string, string | boolean>;

type Kind =
  | 'experience'
  | 'education'
  | 'project'
  | 'certification'
  | 'link'
  | 'customSection'
  | 'customItem';

type CollectionKind = Exclude<
  Kind,
  'customSection' | 'customItem'
>;

type PortfolioRecord = {
  id: string;
  displayOrder: number;
};

interface Field {
  name: string;
  label: string;
  maxLength?: number;
  required?: boolean;
  type?:
    | 'text'
    | 'textarea'
    | 'date'
    | 'number'
    | 'url'
    | 'checkbox'
    | 'employment'
    | 'linkType';
}

const configurations: Record<
  Exclude<Kind, 'customItem'>,
  {
    title: string;
    fields: Field[];
  }
> = {
  experience: {
    title: 'Experience',
    fields: [
      {
        name: 'jobTitle',
        label: 'Job title',
        required: true,
        maxLength: 200,
      },
      {
        name: 'companyName',
        label: 'Company name',
        required: true,
        maxLength: 200,
      },
      {
        name: 'location',
        label: 'Location',
        maxLength: 200,
      },
      {
        name: 'employmentType',
        label: 'Employment type',
        type: 'employment',
      },
      {
        name: 'startDate',
        label: 'Start date',
        type: 'date',
        required: true,
      },
      {
        name: 'endDate',
        label: 'End date',
        type: 'date',
      },
      {
        name: 'isCurrent',
        label: 'I currently work here',
        type: 'checkbox',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        maxLength: 4000,
      },
    ],
  },

  education: {
    title: 'Education',
    fields: [
      {
        name: 'qualification',
        label: 'Qualification',
        required: true,
        maxLength: 200,
      },
      {
        name: 'institution',
        label: 'Institution',
        required: true,
        maxLength: 250,
      },
      {
        name: 'fieldOfStudy',
        label: 'Field of study',
        maxLength: 200,
      },
      {
        name: 'startYear',
        label: 'Start year',
        type: 'number',
      },
      {
        name: 'endYear',
        label: 'End year',
        type: 'number',
      },
      {
        name: 'grade',
        label: 'Grade',
        maxLength: 100,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        maxLength: 4000,
      },
    ],
  },

  project: {
    title: 'Projects',
    fields: [
      {
        name: 'name',
        label: 'Project name',
        required: true,
        maxLength: 200,
      },
      {
        name: 'role',
        label: 'Role',
        maxLength: 150,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        maxLength: 4000,
      },
      {
        name: 'technologies',
        label: 'Technologies (comma-separated)',
      },
      {
        name: 'sourceUrl',
        label: 'Source URL',
        type: 'url',
        maxLength: 2048,
      },
      {
        name: 'liveUrl',
        label: 'Live URL',
        type: 'url',
        maxLength: 2048,
      },
      {
        name: 'startDate',
        label: 'Start date',
        type: 'date',
      },
      {
        name: 'endDate',
        label: 'End date',
        type: 'date',
      },
    ],
  },

  certification: {
    title: 'Certifications',
    fields: [
      {
        name: 'name',
        label: 'Certification name',
        required: true,
        maxLength: 200,
      },
      {
        name: 'issuer',
        label: 'Issuer',
        maxLength: 200,
      },
      {
        name: 'issuedDate',
        label: 'Issued date',
        type: 'date',
      },
      {
        name: 'expiryDate',
        label: 'Expiry date',
        type: 'date',
      },
      {
        name: 'doesNotExpire',
        label: 'Does not expire',
        type: 'checkbox',
      },
      {
        name: 'credentialId',
        label: 'Credential ID',
        maxLength: 200,
      },
      {
        name: 'credentialUrl',
        label: 'Credential URL',
        type: 'url',
        maxLength: 2048,
      },
    ],
  },

  link: {
    title: 'Professional links',
    fields: [
      {
        name: 'type',
        label: 'Link type',
        type: 'linkType',
        required: true,
      },
      {
        name: 'label',
        label: 'Label',
        maxLength: 100,
      },
      {
        name: 'url',
        label: 'HTTPS URL',
        type: 'url',
        required: true,
        maxLength: 2048,
      },
    ],
  },

  customSection: {
    title: 'Custom sections',
    fields: [
      {
        name: 'title',
        label: 'Section title',
        required: true,
      },
    ],
  },
};

const descriptions: Record<CollectionKind, string> = {
  experience:
    'Add roles that demonstrate your professional experience and impact.',
  education:
    'Add qualifications and education that support your career profile.',
  project:
    'Show employers the projects, products and technical work you have built.',
  certification:
    'Highlight certifications and professional credentials you have earned.',
  link:
    'Connect employers to your LinkedIn, GitHub and other professional profiles.',
};

const plainText = (value?: string) =>
  !value ||
  (!value.includes('<') &&
    !value.includes('>') &&
    [...value].every(
      (character) => character.charCodeAt(0) >= 32,
    ));

const https = (value?: string) => {
  if (!value) {
    return true;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const schemaFor = (fields: Field[]) =>
  yup.object(
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.type === 'checkbox'
          ? yup.boolean().defined()
          : yup
              .string()
              .defined()
              .trim()
              .test(
                'plain',
                'Plain text only.',
                plainText,
              )
              .test(
                'https',
                'Enter a valid HTTPS URL.',
                (value) =>
                  field.type !== 'url' || https(value),
              )
              .test(
                'maximum',
                `${field.label} must be no more than ${field.maxLength} characters.`,
                (value) =>
                  !field.maxLength ||
                  value.length <= field.maxLength,
              )
              .test(
                'number',
                'Enter a valid number.',
                (value) =>
                  field.type !== 'number' ||
                  !value ||
                  Number.isInteger(Number(value)),
              )
              .test(
                'year-range',
                `Enter a year from 1900 to ${
                  new Date().getFullYear() + 10
                }.`,
                (value) =>
                  field.type !== 'number' ||
                  !value ||
                  (Number(value) >= 1900 &&
                    Number(value) <=
                      new Date().getFullYear() + 10),
              )
              .test(
                'required',
                `${field.label} is required.`,
                (value) =>
                  !field.required || Boolean(value),
              ),
      ]),
    ),
  );

const blank = (fields: Field[]): Values =>
  Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === 'checkbox'
        ? false
        : field.type === 'linkType'
          ? 'LinkedIn'
          : '',
    ]),
  );

const nullable = (value: unknown) =>
  typeof value === 'string' && value.trim()
    ? value.trim()
    : null;

const numberOrNull = (value: unknown) =>
  typeof value === 'string' && value
    ? Number(value)
    : null;

const read = (
  item: PortfolioRecord,
  field: string,
): unknown =>
  (item as unknown as Record<string, unknown>)[field];

const stringValue = (
  value: unknown,
): string | null =>
  typeof value === 'string' && value.trim()
    ? value.trim()
    : null;

const primaryLabel = (
  item: PortfolioRecord,
): string =>
  stringValue(read(item, 'jobTitle')) ??
  stringValue(read(item, 'qualification')) ??
  stringValue(read(item, 'name')) ??
  stringValue(read(item, 'label')) ??
  stringValue(read(item, 'url')) ??
  'Portfolio item';

const secondaryLabel = (
  item: PortfolioRecord,
  kind: CollectionKind,
): string | null => {
  if (kind === 'experience') {
    return stringValue(read(item, 'companyName'));
  }

  if (kind === 'education') {
    return stringValue(read(item, 'institution'));
  }

  if (kind === 'project') {
    return stringValue(read(item, 'role'));
  }

  if (kind === 'certification') {
    return stringValue(read(item, 'issuer'));
  }

  return stringValue(read(item, 'url'));
};
export type PortfolioCollectionEditorKind =
  | 'experience'
  | 'education'
  | 'project'
  | 'certification'
  | 'link'
  | 'customSection';

type PortfolioCollectionEditorsProps = {
  portfolio: PortfolioEditorResponse;
  only?: PortfolioCollectionEditorKind;
};

export const PortfolioCollectionEditors = ({
  portfolio,
  only,
}: PortfolioCollectionEditorsProps) => {
  if (only === 'experience') {
    return (
      <CollectionEditor
        items={portfolio.experiences}
        kind="experience"
      />
    );
  }

  if (only === 'education') {
    return (
      <CollectionEditor
        items={portfolio.education}
        kind="education"
      />
    );
  }

  if (only === 'project') {
    return (
      <CollectionEditor
        items={portfolio.projects}
        kind="project"
      />
    );
  }

  if (only === 'certification') {
    return (
      <CollectionEditor
        items={portfolio.certifications}
        kind="certification"
      />
    );
  }

  if (only === 'link') {
    return (
      <CollectionEditor
        items={portfolio.professionalLinks}
        kind="link"
      />
    );
  }

  if (only === 'customSection') {
    return (
      <PortfolioCustomSectionsEditor
        sections={portfolio.customSections}
      />
    );
  }

  return (
    <Stack spacing={2.5}>
      <CollectionEditor
        items={portfolio.experiences}
        kind="experience"
      />

      <CollectionEditor
        items={portfolio.education}
        kind="education"
      />

      <CollectionEditor
        items={portfolio.projects}
        kind="project"
      />

      <CollectionEditor
        items={portfolio.certifications}
        kind="certification"
      />

      <CollectionEditor
        items={portfolio.professionalLinks}
        kind="link"
      />

      <PortfolioCustomSectionsEditor
        sections={portfolio.customSections}
      />
    </Stack>
  );
};

const CollectionEditor = ({
  items,
  kind,
}: {
  items: PortfolioRecord[];
  kind: CollectionKind;
}) => {
  const config = configurations[kind];
  const fields = config.fields;

  const [editing, setEditing] = useState<
    PortfolioRecord | null | undefined
  >(undefined);

  const [deleting, setDeleting] =
    useState<PortfolioRecord | null>(null);

  const [error, setError] = useState<string | null>(
    null,
  );

  const addHooks = {
    experience: useAddPortfolioExperienceMutation,
    education: useAddPortfolioEducationMutation,
    project: useAddPortfolioProjectMutation,
    certification: useAddPortfolioCertificationMutation,
    link: useAddPortfolioLinkMutation,
  };

  const updateHooks = {
    experience: useUpdatePortfolioExperienceMutation,
    education: useUpdatePortfolioEducationMutation,
    project: useUpdatePortfolioProjectMutation,
    certification:
      useUpdatePortfolioCertificationMutation,
    link: useUpdatePortfolioLinkMutation,
  };

  const deleteHooks = {
    experience: useDeletePortfolioExperienceMutation,
    education: useDeletePortfolioEducationMutation,
    project: useDeletePortfolioProjectMutation,
    certification:
      useDeletePortfolioCertificationMutation,
    link: useDeletePortfolioLinkMutation,
  };

  const [add, addState] = addHooks[kind]();
  const [update, updateState] = updateHooks[kind]();
  const [remove, removeState] = deleteHooks[kind]();

  const form = useForm<Values>({
    resolver: yupResolver(schemaFor(fields)),
    defaultValues: blank(fields),
  });

  const saving =
    addState.isLoading || updateState.isLoading;

  const open = (
    item: null | PortfolioRecord,
  ) => {
    setError(null);

    form.reset(
      item
        ? Object.fromEntries(
            fields.map((field) => [
              field.name,
              field.type === 'checkbox'
                ? Boolean(read(item, field.name))
                : read(
                      item,
                      field.name,
                    )?.toString() ?? '',
            ]),
          )
        : blank(fields),
    );

    setEditing(item);
  };

  const payload = (values: Values) => {
    const base = {
      displayOrder:
        editing &&
        typeof editing.displayOrder === 'number'
          ? editing.displayOrder
          : items.length,
    };

    if (kind === 'experience') {
      return {
        ...base,
        jobTitle: String(values.jobTitle).trim(),
        companyName: String(
          values.companyName,
        ).trim(),
        location: nullable(values.location),
        employmentType: numberOrNull(
          values.employmentType,
        ),
        startDate: String(values.startDate),
        endDate: values.isCurrent
          ? null
          : nullable(values.endDate),
        isCurrent: Boolean(values.isCurrent),
        description: nullable(values.description),
      };
    }

    if (kind === 'education') {
      return {
        ...base,
        qualification: String(
          values.qualification,
        ).trim(),
        institution: String(
          values.institution,
        ).trim(),
        fieldOfStudy: nullable(values.fieldOfStudy),
        startYear: numberOrNull(values.startYear),
        endYear: numberOrNull(values.endYear),
        grade: nullable(values.grade),
        description: nullable(values.description),
      };
    }

    if (kind === 'project') {
      return {
        ...base,
        name: String(values.name).trim(),
        role: nullable(values.role),
        description: String(
          values.description,
        ).trim(),
        technologies: String(values.technologies)
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 30),
        sourceUrl: nullable(values.sourceUrl),
        liveUrl: nullable(values.liveUrl),
        startDate: nullable(values.startDate),
        endDate: nullable(values.endDate),
      };
    }

    if (kind === 'certification') {
      return {
        ...base,
        name: String(values.name).trim(),
        issuer: nullable(values.issuer),
        issuedDate: nullable(values.issuedDate),
        expiryDate: values.doesNotExpire
          ? null
          : nullable(values.expiryDate),
        doesNotExpire: Boolean(
          values.doesNotExpire,
        ),
        credentialId: nullable(values.credentialId),
        credentialUrl: nullable(
          values.credentialUrl,
        ),
      };
    }

    return {
      ...base,
      type: values.type as ProfessionalLinkType,
      label: nullable(values.label),
      url: String(values.url).trim(),
    };
  };

  const save = async (values: Values) => {
    setError(null);

    const start = String(
      values.startDate ??
        values.issuedDate ??
        '',
    );

    const end = String(
      values.endDate ??
        values.expiryDate ??
        '',
    );

    if (start && end && end < start) {
      setError(
        'End or expiry date must not be before the start or issued date.',
      );
      return;
    }

    if (
      kind === 'education' &&
      values.startYear &&
      values.endYear &&
      Number(values.endYear) <
        Number(values.startYear)
    ) {
      setError(
        'End year must not be before start year.',
      );
      return;
    }

    if (kind === 'project') {
      const technologies = String(
        values.technologies,
      )
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

      if (
        technologies.length > 30 ||
        technologies.some(
          (value) => value.length > 100,
        )
      ) {
        setError(
          'Add at most 30 technologies, each no more than 100 characters.',
        );
        return;
      }
    }

    try {
      if (editing) {
        await update({
          id: editing.id,
          data: payload(values),
        } as never).unwrap();
      } else {
        await add(
          payload(values) as never,
        ).unwrap();
      }

      setEditing(undefined);

      enqueueSnackbar(`${config.title} saved.`, {
        variant: 'success',
      });
    } catch (saveError: unknown) {
      setError(
        isDashboardApiError(saveError)
          ? saveError.message
          : `Unable to save ${config.title.toLowerCase()}.`,
      );
    }
  };

  const confirm = async () => {
    if (!deleting) {
      return;
    }

    try {
      await remove(deleting.id).unwrap();

      setDeleting(null);

      enqueueSnackbar('Record deleted.', {
        variant: 'success',
      });
    } catch (deleteError: unknown) {
      setError(
        isDashboardApiError(deleteError)
          ? deleteError.message
          : 'Unable to delete this record.',
      );
    }
  };

  const itemLabel = config.title
    .toLowerCase()
    .replace(/s$/, '');

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
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
        spacing={1.5}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: { xs: 2, sm: 2.5 },
          py: 2,
        }}
      >
        <Box>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <Typography
              component="h2"
              sx={{
                fontSize: '1rem',
                fontWeight: 800,
              }}
            >
              {config.title}
            </Typography>

            <Chip
              label={items.length}
              size="small"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                height: 22,
              }}
            />
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.76rem',
              lineHeight: 1.5,
              mt: 0.35,
            }}
          >
            {descriptions[kind]}
          </Typography>
        </Box>

        <Button
          onClick={() => {
            open(null);
          }}
          size="small"
          startIcon={<AddRoundedIcon />}
          variant="outlined"
        >
          Add {itemLabel}
        </Button>
      </Stack>

      <Stack
        spacing={1}
        sx={{
          p: { xs: 2, sm: 2.5 },
        }}
      >
        {!items.length ? (
          <Box
            sx={{
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              px: 2,
              py: 2.5,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              No {config.title.toLowerCase()} yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                lineHeight: 1.5,
                mt: 0.4,
              }}
            >
              Add {itemLabel} information when it
              strengthens your public portfolio.
            </Typography>
          </Box>
        ) : (
          items.map((item) => {
            const secondary = secondaryLabel(
              item,
              kind,
            );

            return (
              <Stack
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center',
                }}
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                justifyContent="space-between"
                key={item.id}
                spacing={1.5}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1.25,
                  transition: (theme) =>
                    theme.transitions.create([
                      'border-color',
                      'box-shadow',
                    ]),

                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) =>
                      theme.shadows[1],
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.84rem',
                      fontWeight: 750,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: {
                        xs: 'normal',
                        sm: 'nowrap',
                      },
                    }}
                  >
                    {primaryLabel(item)}
                  </Typography>

                  {secondary ? (
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: '0.72rem',
                        mt: 0.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: {
                          xs: 'normal',
                          sm: 'nowrap',
                        },
                      }}
                    >
                      {secondary}
                    </Typography>
                  ) : null}
                </Box>

                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    flexShrink: 0,
                  }}
                >
                  <Button
                    onClick={() => {
                      open(item);
                    }}
                    size="small"
                    startIcon={
                      <EditOutlinedIcon
                        sx={{ fontSize: 17 }}
                      />
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    color="error"
                    onClick={() => {
                      setDeleting(item);
                    }}
                    size="small"
                    startIcon={
                      <DeleteOutlineRoundedIcon
                        sx={{ fontSize: 17 }}
                      />
                    }
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            );
          })
        )}

        {error ? (
          <Alert
            aria-live="assertive"
            severity="error"
            sx={{ mt: 1 }}
          >
            {error}
          </Alert>
        ) : null}
      </Stack>

      <EditorDialog
        fields={fields}
        form={form}
        onClose={() => {
          if (!saving) {
            setEditing(undefined);
          }
        }}
        onSubmit={save}
        open={editing !== undefined}
        saving={saving}
        title={`${editing ? 'Edit' : 'Add'} ${itemLabel}`}
      />

      <ConfirmActionDialog
        actionLabel="Delete record"
        description="Delete this portfolio record?"
        error={error}
        isProcessing={removeState.isLoading}
        onClose={() => {
          if (!removeState.isLoading) {
            setDeleting(null);
          }
        }}
        onConfirm={() => {
          void confirm();
        }}
        open={Boolean(deleting)}
        title="Delete record?"
      />
    </Paper>
  );
};

type EditorDialogProps = {
  fields: Field[];
  form: ReturnType<typeof useForm<Values>>;
  onClose: () => void;
  onSubmit: (values: Values) => Promise<void>;
  open: boolean;
  saving: boolean;
  title: string;
};

const EditorDialog = ({
  fields,
  form,
  onClose,
  onSubmit,
  open,
  saving,
  title,
}: EditorDialogProps) => {
  const formId = `editor-${title.replaceAll(
    ' ',
    '-',
  )}`;

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          fontWeight: 800,
          pb: 2,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Stack
          component="form"
          id={formId}
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
          spacing={2}
          sx={{
            pt: 2,
          }}
        >
          {fields.map((field) => {
            if (field.type === 'checkbox') {
              return (
                <Controller
                  control={form.control}
                  key={field.name}
                  name={field.name}
                  render={({ field: input }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(
                            input.value,
                          )}
                          disabled={saving}
                          onChange={(_, checked) => {
                            input.onChange(checked);
                          }}
                        />
                      }
                      label={field.label}
                    />
                  )}
                />
              );
            }

            if (field.type === 'employment') {
              return (
                <Controller
                  control={form.control}
                  key={field.name}
                  name={field.name}
                  render={({ field: input }) => (
                    <FormControl>
                      <InputLabel
                        id={`${field.name}-label`}
                      >
                        {field.label}
                      </InputLabel>

                      <Select
                        {...input}
                        disabled={saving}
                        label={field.label}
                        labelId={`${field.name}-label`}
                      >
                        <MenuItem value="">
                          Not specified
                        </MenuItem>

                        {employmentTypeOptions.map(
                          (option) => (
                            <MenuItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </MenuItem>
                          ),
                        )}
                      </Select>
                    </FormControl>
                  )}
                />
              );
            }

            if (field.type === 'linkType') {
              return (
                <Controller
                  control={form.control}
                  key={field.name}
                  name={field.name}
                  render={({ field: input }) => (
                    <FormControl>
                      <InputLabel
                        id={`${field.name}-label`}
                      >
                        {field.label}
                      </InputLabel>

                      <Select
                        {...input}
                        disabled={saving}
                        label={field.label}
                        labelId={`${field.name}-label`}
                      >
                        {[
                          'LinkedIn',
                          'GitHub',
                          'Portfolio',
                          'Website',
                          'Behance',
                          'Dribbble',
                          'Kaggle',
                          'Other',
                        ].map((value) => (
                          <MenuItem
                            key={value}
                            value={value}
                          >
                            {value}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              );
            }

            return (
              <TextField
                disabled={saving}
                error={Boolean(
                  form.formState.errors[field.name],
                )}
                helperText={String(
                  form.formState.errors[field.name]
                    ?.message ?? '',
                )}
                key={field.name}
                label={field.label}
                minRows={
                  field.type === 'textarea'
                    ? 4
                    : undefined
                }
                multiline={
                  field.type === 'textarea'
                }
                type={
                  field.type === 'url'
                    ? 'url'
                    : field.type ?? 'text'
                }
                {...form.register(field.name)}
              />
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          px: 3,
          py: 2,
        }}
      >
        <Button
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          disabled={saving}
          form={formId}
          type="submit"
          variant="contained"
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};