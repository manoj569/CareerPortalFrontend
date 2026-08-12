import { yupResolver } from '@hookform/resolvers/yup';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  Alert, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Paper,
  Select, Stack, TextField, Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { isDashboardApiError } from '@/features/dashboard/api/dashboardApi';
import { useUpdatePortfolioSettingsMutation } from '../api/portfolioApi';
import type { CandidatePortfolioTemplate, PortfolioEditorResponse, PortfolioSectionSettingRequest } from '../types/portfolioModels';

interface SettingsValues { slug: string; template: CandidatePortfolioTemplate }
const schema: yup.ObjectSchema<SettingsValues> = yup.object({
  slug: yup.string().defined().trim().required('Portfolio slug is required.').min(3, 'Use at least 3 characters.').max(80, 'Use no more than 80 characters.').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens only.'),
  template: yup.mixed<CandidatePortfolioTemplate>().oneOf(['Professional', 'Developer']).required(),
});
const labels: Record<string, string> = { About: 'About', Skills: 'Skills', Experience: 'Experience', Education: 'Education', Projects: 'Projects', Certifications: 'Certifications', ProfessionalLinks: 'Professional links', Resume: 'Resume availability', CustomSections: 'Custom sections' };

export const PortfolioSettingsCard = ({ portfolio }: { portfolio: PortfolioEditorResponse }) => {
  const [sections, setSections] = useState<PortfolioSectionSettingRequest[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [updateSettings, updateState] = useUpdatePortfolioSettingsMutation();
  const { control, formState: { errors, isDirty }, handleSubmit, register, reset } = useForm<SettingsValues>({ resolver: yupResolver(schema), defaultValues: { slug: '', template: 'Professional' } });
  useEffect(() => {
    reset({ slug: portfolio.slug ?? '', template: portfolio.template ?? 'Professional' });
    setSections(portfolio.sectionSettings.map(({ displayOrder, isVisible, sectionType }) => ({ displayOrder, isVisible, sectionType })));
  }, [portfolio, reset]);
  const move = (index: number, direction: -1 | 1) => setSections((current) => {
    const next = [...current]; const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target]!, next[index]!];
    return next.map((item, order) => ({ ...item, displayOrder: order + 1 }));
  });
  const save = async (values: SettingsValues) => {
    setServerError(null);
    try {
      await updateSettings({ slug: values.slug.trim(), template: values.template, sections }).unwrap();
      enqueueSnackbar('Portfolio settings updated.', { variant: 'success' });
    } catch (error: unknown) { setServerError(isDashboardApiError(error) ? error.message : 'Unable to update portfolio settings.'); }
  };
  return <Paper component="section" sx={{ p: { xs: 2.5, md: 3 } }}><Stack spacing={2.5}><Typography component="h2" variant="h3">Portfolio settings</Typography>{serverError ? <Alert aria-live="assertive" severity="error">{serverError}</Alert> : null}<Stack component="form" noValidate onSubmit={(event) => void handleSubmit(save)(event)} spacing={2.5}><TextField disabled={updateState.isLoading} error={Boolean(errors.slug)} helperText={errors.slug?.message ?? 'Public URL uses lowercase letters, numbers, and hyphens.'} label="Portfolio slug" {...register('slug')} /><Controller control={control} name="template" render={({ field }) => <FormControl><InputLabel id="portfolio-template-label">Template</InputLabel><Select {...field} disabled={updateState.isLoading} label="Template" labelId="portfolio-template-label"><MenuItem value="Professional">Professional</MenuItem><MenuItem value="Developer">Developer</MenuItem></Select></FormControl>} /><Stack spacing={1}><Typography fontWeight={800}>Visible sections and order</Typography>{sections.map((section, index) => <Stack alignItems="center" direction="row" key={section.sectionType} spacing={1} sx={{ bgcolor: 'action.hover', borderRadius: 2, px: 1.5, py: .75 }}><FormControlLabel control={<Checkbox checked={section.isVisible} disabled={updateState.isLoading} onChange={(_, checked) => setSections((current) => current.map((item) => item.sectionType === section.sectionType ? { ...item, isVisible: checked } : item))} />} label={labels[section.sectionType]} sx={{ flex: 1 }} /><Button aria-label={`Move ${labels[section.sectionType]} up`} disabled={index === 0 || updateState.isLoading} onClick={() => move(index, -1)} size="small"><ArrowUpwardIcon /></Button><Button aria-label={`Move ${labels[section.sectionType]} down`} disabled={index === sections.length - 1 || updateState.isLoading} onClick={() => move(index, 1)} size="small"><ArrowDownwardIcon /></Button></Stack>)}</Stack><Button disabled={updateState.isLoading || (!isDirty && sections.every((section, index) => section.displayOrder === portfolio.sectionSettings[index]?.displayOrder && section.isVisible === portfolio.sectionSettings[index]?.isVisible))} type="submit" variant="contained">{updateState.isLoading ? 'Saving…' : 'Save settings'}</Button></Stack></Stack></Paper>;
};
