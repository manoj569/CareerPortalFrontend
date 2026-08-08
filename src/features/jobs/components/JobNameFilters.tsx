import { Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface JobNameFiltersProps {
  categoryName: string;
  companyName: string;
  onChange: (changes: { categoryName?: string; companyName?: string }) => void;
}

export const JobNameFilters = ({ categoryName, companyName, onChange }: JobNameFiltersProps) => {
  const [companyInput, setCompanyInput] = useState(companyName ?? '');
  const [categoryInput, setCategoryInput] = useState(categoryName ?? '');
  const companyDirty = useRef(false);
  const categoryDirty = useRef(false);
  const debouncedCompany = useDebouncedValue(companyInput, 350);
  const debouncedCategory = useDebouncedValue(categoryInput, 350);

  useEffect(() => {
    companyDirty.current = false;
    setCompanyInput(companyName ?? '');
  }, [companyName]);
  useEffect(() => {
    categoryDirty.current = false;
    setCategoryInput(categoryName ?? '');
  }, [categoryName]);

  useEffect(() => {
    if (debouncedCompany !== companyInput || debouncedCategory !== categoryInput) return;
    if (!companyDirty.current && !categoryDirty.current) return;

    const trimmedCompany = debouncedCompany.trim().slice(0, 250);
    const trimmedCategory = debouncedCategory.trim().slice(0, 250);
    if (trimmedCompany !== (companyName ?? '') || trimmedCategory !== (categoryName ?? '')) {
      companyDirty.current = false;
      categoryDirty.current = false;
      onChange({
        categoryName: trimmedCategory || undefined,
        companyName: trimmedCompany || undefined,
      });
    }
  }, [
    categoryInput,
    categoryName,
    companyInput,
    companyName,
    debouncedCategory,
    debouncedCompany,
    onChange,
  ]);

  return (
    <Stack spacing={2}>
      <TextField
        label="Company name"
        onChange={(event) => {
          companyDirty.current = true;
          setCompanyInput(event.target.value);
        }}
        placeholder="e.g. HARMAN"
        size="small"
        value={companyInput}
      />
      <TextField
        label="Category name"
        onChange={(event) => {
          categoryDirty.current = true;
          setCategoryInput(event.target.value);
        }}
        placeholder="e.g. Software, AI, Marketing"
        size="small"
        value={categoryInput}
      />
    </Stack>
  );
};
