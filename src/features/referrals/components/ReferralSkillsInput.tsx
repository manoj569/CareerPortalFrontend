import { useRef, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const ReferralSkillsInput = ({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}) => {
  const [draft, setDraft] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const add = () => {
    const skill = draft.trim();
    if (!skill) return;
    if (!value.some((existing) => existing.trim().toLowerCase() === skill.toLowerCase()))
      onChange([...value, skill]);
    setDraft('');
    input.current?.focus();
  };
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" gap={1} alignItems="flex-start">
        <TextField
          label="Skills"
          inputRef={input}
          value={draft}
          placeholder="Type skill here"
          required={!value.length}
          error={Boolean(error)}
          helperText={error}
          size="small"
          sx={{ flex: 1, minWidth: 0 }}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              event.stopPropagation();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="outlined"
          aria-label="Add skill"
          disabled={!draft.trim()}
          onClick={add}
          sx={{ flexShrink: 0, mt: 2.5, minHeight: 40 }}
        >
          Add
        </Button>
      </Stack>
      <Stack
        direction="row"
        gap={0.75}
        flexWrap="wrap"
        useFlexGap
        mt={value.length ? 1 : 0}
        aria-label="Added skills"
      >
        {value.map((skill) => (
          <Chip
            key={skill.toLowerCase()}
            sx={{
              maxWidth: '100%',
              height: 'auto',
              '& .MuiChip-label': { whiteSpace: 'normal', py: 0.25, overflowWrap: 'anywhere' },
            }}
            label={
              <Stack component="span" direction="row" alignItems="center" gap={0.5}>
                <span>{skill}</span>
                <IconButton
                  type="button"
                  size="small"
                  aria-label={`Remove skill ${skill}`}
                  onClick={() => {
                    onChange(value.filter((existing) => existing !== skill));
                    input.current?.focus();
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            }
          />
        ))}
      </Stack>
    </Box>
  );
};
