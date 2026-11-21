import type { Dispatch, SetStateAction } from 'react';
import { Alert, Checkbox, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';

import type { AssessmentQuestion } from '../api/journeyWorkApi';

type Option = string | boolean | number;

export function assessmentOptions(question: AssessmentQuestion): Option[] | null {
  if (question.type < 1 || question.type > 9) return null;
  if (question.type > 3) return [];
  try {
    const value: unknown = JSON.parse(question.optionsJson);
    if (
      Array.isArray(value) &&
      value.length &&
      value.every((item: unknown): item is Option =>
        ['string', 'boolean', 'number'].includes(typeof item),
      )
    )
      return value;
  } catch {
    return null;
  }
  return null;
}

export function AssessmentQuestionInput({
  question,
  options,
  choices,
  text,
  disabled,
  setChoices,
  setText,
}: {
  question: AssessmentQuestion;
  options: Option[] | null;
  choices: number[];
  text: string;
  disabled: boolean;
  setChoices: Dispatch<SetStateAction<number[]>>;
  setText: (value: string) => void;
}) {
  return (
    <>
      {options === null ? (
        <Alert severity="error">The available answer options could not be read.</Alert>
      ) : options.length === 0 ? (
        <TextField
          label="Your answer"
          value={text}
          multiline
          minRows={3}
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
        />
      ) : question.type === 2 ? (
        options.map((option, optionIndex) => (
          <FormControlLabel
            key={optionIndex}
            label={String(option)}
            control={
              <Checkbox
                disabled={disabled}
                checked={choices.includes(optionIndex)}
                onChange={(_, checked) =>
                  setChoices((previous) =>
                    checked
                      ? [...previous, optionIndex]
                      : previous.filter((item) => item !== optionIndex),
                  )
                }
              />
            }
          />
        ))
      ) : (
        <RadioGroup value={choices[0] ?? ''} onChange={(_, value) => setChoices([Number(value)])}>
          {options.map((option, optionIndex) => (
            <FormControlLabel
              key={optionIndex}
              value={optionIndex}
              disabled={disabled}
              control={<Radio />}
              label={String(option)}
            />
          ))}
        </RadioGroup>
      )}
    </>
  );
}
