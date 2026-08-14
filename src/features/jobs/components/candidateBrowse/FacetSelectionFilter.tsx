import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useId, useMemo, useRef, useState } from 'react';

import { normalizeFacetIdentity } from './facetDisplay';

export interface FacetSelectionOption {
  count?: number;
  key: string;
  label: string;
}

interface FacetSelectionFilterProps {
  dialogTitle: string;
  facetLabel: string;
  onApply: (values: string[]) => void;
  options: FacetSelectionOption[];
  searchLabel: string;
  selected: string[];
}

const dedupeOptions = (options: FacetSelectionOption[]): FacetSelectionOption[] => {
  const byIdentity = new Map<string, FacetSelectionOption>();
  options.forEach((option) => {
    const key = option.key.trim();
    if (!key) return;
    const identity = normalizeFacetIdentity(key);
    const existing = byIdentity.get(identity);
    if (!existing) {
      byIdentity.set(identity, { ...option, key });
      return;
    }
    if (option.count !== undefined) {
      byIdentity.set(identity, {
        ...existing,
        count: (existing.count ?? 0) + option.count,
      });
    }
  });
  return Array.from(byIdentity.values());
};

const filterOptions = (
  options: FacetSelectionOption[],
  query: string,
  selectedIdentities: Set<string>,
): FacetSelectionOption[] => {
  const normalizedQuery = normalizeFacetIdentity(query);
  const matches = normalizedQuery
    ? options.filter((option) => normalizeFacetIdentity(option.label).includes(normalizedQuery))
    : options;
  const selected = options.filter((option) =>
    selectedIdentities.has(normalizeFacetIdentity(option.key)),
  );
  const selectedKeys = new Set(selected.map((option) => normalizeFacetIdentity(option.key)));
  return [
    ...selected,
    ...matches.filter((option) => !selectedKeys.has(normalizeFacetIdentity(option.key))),
  ];
};

const OptionCheckbox = ({
  checked,
  onChange,
  option,
}: {
  checked: boolean;
  onChange: () => void;
  option: FacetSelectionOption;
}) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        inputProps={{
          'aria-label': `${option.label}${option.count === undefined ? '' : `, ${option.count} jobs`}`,
        }}
        onChange={onChange}
        size="small"
      />
    }
    label={
      <Stack alignItems="baseline" direction="row" gap={0.75} minWidth={0}>
        <Typography component="span" variant="body2">{option.label}</Typography>
        {option.count === undefined ? null : (
          <Typography color="text.secondary" component="span" variant="caption">
            {option.count}
          </Typography>
        )}
      </Stack>
    }
    sx={{ alignItems: 'flex-start', m: 0, minWidth: 0 }}
  />
);

export const FacetSelectionFilter = ({
  dialogTitle,
  facetLabel,
  onApply,
  options,
  searchLabel,
  selected,
}: FacetSelectionFilterProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const dialogTitleId = useId();
  const viewMoreButtonRef = useRef<HTMLButtonElement>(null);
  const [inlineSearch, setInlineSearch] = useState('');
  const [dialogSearch, setDialogSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftSelection, setDraftSelection] = useState<string[]>([]);
  const uniqueOptions = useMemo(() => dedupeOptions(options), [options]);
  const selectedIdentities = useMemo(
    () => new Set(selected.map(normalizeFacetIdentity)),
    [selected],
  );
  const availableOptions = useMemo(
    () =>
      uniqueOptions.filter(
        (option) =>
          (option.count ?? 1) > 0 || selectedIdentities.has(normalizeFacetIdentity(option.key)),
      ),
    [selectedIdentities, uniqueOptions],
  );
  const mainOptions = filterOptions(availableOptions, inlineSearch, selectedIdentities).slice(0, 5);
  const draftIdentities = new Set(draftSelection.map(normalizeFacetIdentity));
  const dialogOptions = filterOptions(availableOptions, dialogSearch, draftIdentities);

  const toggle = (values: string[], key: string): string[] => {
    const identity = normalizeFacetIdentity(key);
    return values.some((value) => normalizeFacetIdentity(value) === identity)
      ? values.filter((value) => normalizeFacetIdentity(value) !== identity)
      : [...values, key];
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogSearch('');
  };

  if (availableOptions.length === 0) {
    return <Typography color="text.secondary" variant="body2">No options available.</Typography>;
  }

  return (
    <Stack spacing={1}>
      {availableOptions.length > 5 ? (
        <TextField
          fullWidth
          label={searchLabel}
          onChange={(event) => setInlineSearch(event.target.value)}
          size="small"
          value={inlineSearch}
        />
      ) : null}
      <Box component="fieldset" sx={{ border: 0, m: 0, p: 0 }}>
        <FormGroup>
          {mainOptions.map((option) => (
            <OptionCheckbox
              checked={selectedIdentities.has(normalizeFacetIdentity(option.key))}
              key={normalizeFacetIdentity(option.key)}
              onChange={() => onApply(toggle(selected, option.key))}
              option={option}
            />
          ))}
        </FormGroup>
      </Box>
      {availableOptions.length > 5 ? (
        <Button
          aria-label={`View more ${facetLabel.toLocaleLowerCase()}`}
          onClick={() => {
            setDraftSelection(selected);
            setDialogSearch('');
            setDialogOpen(true);
          }}
          ref={viewMoreButtonRef}
          size="small"
          sx={{ alignSelf: 'flex-start' }}
        >
          View more
        </Button>
      ) : null}

      <Dialog
        aria-labelledby={dialogTitleId}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
        onClose={closeDialog}
        open={dialogOpen}
        slotProps={{
          paper: {
            sx: { maxWidth: '100%', overflowX: 'hidden' },
          },
        }}
      >
        <DialogTitle
          component="div"
          id={`${dialogTitleId}-container`}
          sx={{ alignItems: 'center', display: 'flex', gap: 1, pr: 1 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h2" id={dialogTitleId} variant="h3">{dialogTitle}</Typography>
            <Typography aria-live="polite" color="text.secondary" variant="body2">
              {draftSelection.length} selected
            </Typography>
          </Box>
          <IconButton aria-label={`Close ${dialogTitle.toLocaleLowerCase()}`} onClick={closeDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ overflowX: 'hidden' }}>
          <TextField
            autoFocus
            fullWidth
            label={searchLabel}
            onChange={(event) => setDialogSearch(event.target.value)}
            sx={{ mb: 2 }}
            value={dialogSearch}
          />
          {dialogOptions.length ? (
            <Box
              component="fieldset"
              sx={{
                border: 0,
                display: 'grid',
                gap: 0.5,
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                m: 0,
                p: 0,
              }}
            >
              {dialogOptions.map((option) => (
                <OptionCheckbox
                  checked={draftIdentities.has(normalizeFacetIdentity(option.key))}
                  key={normalizeFacetIdentity(option.key)}
                  onChange={() => setDraftSelection((values) => toggle(values, option.key))}
                  option={option}
                />
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No matching options.</Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            bgcolor: 'background.paper',
            bottom: 0,
            flexWrap: 'wrap',
            gap: 1,
            position: 'sticky',
            px: { xs: 2, sm: 3 },
            py: 1.5,
          }}
        >
          <Button disabled={draftSelection.length === 0} onClick={() => setDraftSelection([])}>
            Clear selection
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={() => {
              onApply(draftSelection);
              closeDialog();
            }}
            variant="contained"
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
