import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import { isDashboardApiError } from '@/features/dashboard/api/dashboardApi';
import {
  useAddPortfolioCustomItemMutation,
  useAddPortfolioCustomSectionMutation,
  useDeletePortfolioCustomItemMutation,
  useDeletePortfolioCustomSectionMutation,
  useUpdatePortfolioCustomItemMutation,
  useUpdatePortfolioCustomSectionMutation,
} from '../api/portfolioApi';
import type {
  PortfolioCustomItem,
  PortfolioCustomSection,
} from '../types/portfolioModels';
import { getSafePortfolioUrl } from '../utils/portfolioUrl';

interface EditorState {
  kind: 'item' | 'section';
  sectionId?: string;
  section?: PortfolioCustomSection;
  item?: PortfolioCustomItem;
}
interface DeleteState { kind: 'item' | 'section'; id: string; label: string; sectionId?: string }

export const PortfolioCustomSectionsEditor = ({ sections }: { sections: PortfolioCustomSection[] }) => {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [deleting, setDeleting] = useState<DeleteState | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addSection, addSectionState] = useAddPortfolioCustomSectionMutation();
  const [updateSection, updateSectionState] = useUpdatePortfolioCustomSectionMutation();
  const [deleteSection, deleteSectionState] = useDeletePortfolioCustomSectionMutation();
  const [addItem, addItemState] = useAddPortfolioCustomItemMutation();
  const [updateItem, updateItemState] = useUpdatePortfolioCustomItemMutation();
  const [deleteItem, deleteItemState] = useDeletePortfolioCustomItemMutation();
  const saving = addSectionState.isLoading || updateSectionState.isLoading || addItemState.isLoading || updateItemState.isLoading;
  const deletingPending = deleteSectionState.isLoading || deleteItemState.isLoading;

  const openSection = (section?: PortfolioCustomSection) => {
    setError(null); setTitle(section?.title ?? ''); setDescription(''); setDate(''); setUrl('');
    setEditor({ kind: 'section', section });
  };
  const openItem = (sectionId: string, item?: PortfolioCustomItem) => {
    setError(null); setTitle(item?.title ?? ''); setDescription(item?.description ?? '');
    setDate(item?.date ?? ''); setUrl(item?.url ?? '');
    setEditor({ kind: 'item', sectionId, item });
  };
  const validate = (): string | null => {
    const trimmed = title.trim();
    if (!trimmed) return 'Title is required.';
    if (trimmed.includes('<') || trimmed.includes('>') || description.includes('<') || description.includes('>')) return 'Use plain text only.';
    if (editor?.kind === 'section' && trimmed.length > 120) return 'Section title must be no more than 120 characters.';
    if (editor?.kind === 'item' && trimmed.length > 200) return 'Item title must be no more than 200 characters.';
    if (description.length > 4000) return 'Description must be no more than 4,000 characters.';
    if (url.trim() && !getSafePortfolioUrl(url)) return 'Enter a valid HTTPS URL.';
    return null;
  };
  const save = async () => {
    if (!editor || saving) return;
    const validation = validate(); if (validation) { setError(validation); return; }
    setError(null);
    try {
      if (editor.kind === 'section') {
        const data = { displayOrder: editor.section?.displayOrder ?? sections.length, title: title.trim() };
        if (editor.section) await updateSection({ data, id: editor.section.id }).unwrap();
        else await addSection(data).unwrap();
      } else if (editor.sectionId) {
        const section = sections.find((candidate) => candidate.id === editor.sectionId);
        const data = { date: date || null, description: description.trim() || null, displayOrder: editor.item?.displayOrder ?? section?.items.length ?? 0, title: title.trim(), url: url.trim() || null };
        if (editor.item) await updateItem({ data, itemId: editor.item.id, sectionId: editor.sectionId }).unwrap();
        else await addItem({ data, sectionId: editor.sectionId }).unwrap();
      }
      setEditor(null); enqueueSnackbar('Custom portfolio content saved.', { variant: 'success' });
    } catch (saveError: unknown) { setError(isDashboardApiError(saveError) ? saveError.message : 'Unable to save custom portfolio content.'); }
  };
  const confirmDelete = async () => {
    if (!deleting || deletingPending) return;
    setError(null);
    try {
      if (deleting.kind === 'section') await deleteSection(deleting.id).unwrap();
      else if (deleting.sectionId) await deleteItem({ itemId: deleting.id, sectionId: deleting.sectionId }).unwrap();
      setDeleting(null); enqueueSnackbar('Custom portfolio content deleted.', { variant: 'success' });
    } catch (deleteError: unknown) { setError(isDashboardApiError(deleteError) ? deleteError.message : 'Unable to delete custom portfolio content.'); }
  };

  return <Paper component="section" sx={{ border: 1, borderColor: 'divider', p: { xs: 2.5, md: 3 } }}><Stack spacing={2}><Stack alignItems="center" direction="row" justifyContent="space-between"><Stack alignItems="center" direction="row" spacing={1}><Typography component="h2" variant="h3">Custom sections</Typography><Typography color="text.secondary" variant="body2">{sections.length}</Typography></Stack><Button disabled={sections.length >= 5 || saving} onClick={() => openSection()} variant="outlined">Add custom section</Button></Stack>{sections.length >= 5 ? <Alert severity="info">Maximum 5 custom sections reached.</Alert> : null}{error && !editor ? <Alert severity="error">{error}</Alert> : null}{!sections.length ? <Typography color="text.secondary">No custom sections added yet. Use one for portfolio content that does not fit the standard sections.</Typography> : sections.map((section) => <Stack key={section.id} spacing={1.25} sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}><Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between"><Stack alignItems="center" direction="row" spacing={1}><Typography component="h3" fontWeight={850}>{section.title}</Typography><Typography color="text.secondary" variant="body2">{section.items.length}</Typography></Stack><Stack direction="row"><Button onClick={() => openSection(section)} size="small">Edit section</Button><Button color="error" onClick={() => setDeleting({ id: section.id, kind: 'section', label: section.title })} size="small">Delete section</Button></Stack></Stack>{section.items.map((item) => <Stack alignItems="center" direction="row" justifyContent="space-between" key={item.id}><Typography>{item.title}</Typography><Stack direction="row"><Button onClick={() => openItem(section.id, item)} size="small">Edit item</Button><Button color="error" onClick={() => setDeleting({ id: item.id, kind: 'item', label: item.title, sectionId: section.id })} size="small">Delete item</Button></Stack></Stack>)}<Button disabled={section.items.length >= 10 || saving} onClick={() => openItem(section.id)} size="small" sx={{ alignSelf: 'flex-start' }}>Add item</Button>{section.items.length >= 10 ? <Typography color="text.secondary" variant="body2">Maximum 10 items reached.</Typography> : null}</Stack>)}</Stack><Dialog fullWidth maxWidth="sm" onClose={() => !saving && setEditor(null)} open={Boolean(editor)}><DialogTitle>{editor?.kind === 'section' ? `${editor.section ? 'Edit' : 'Add'} custom section` : `${editor?.item ? 'Edit' : 'Add'} custom item`}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}>{error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}<TextField autoFocus disabled={saving} label="Title" onChange={(event) => setTitle(event.target.value)} required value={title} />{editor?.kind === 'item' ? <><TextField disabled={saving} label="Description" minRows={4} multiline onChange={(event) => setDescription(event.target.value)} value={description} /><TextField disabled={saving} label="Date" onChange={(event) => setDate(event.target.value)} type="date" value={date} slotProps={{ inputLabel: { shrink: true } }} /><TextField disabled={saving} helperText="Optional HTTPS URL" label="URL" onChange={(event) => setUrl(event.target.value)} type="url" value={url} /></> : null}</Stack></DialogContent><DialogActions><Button disabled={saving} onClick={() => setEditor(null)}>Cancel</Button><Button disabled={saving} onClick={() => void save()} variant="contained">{saving ? 'Saving…' : 'Save'}</Button></DialogActions></Dialog><ConfirmActionDialog actionLabel={deleting?.kind === 'section' ? 'Delete section' : 'Delete item'} description={`Delete ${deleting?.label ?? 'this custom content'}?`} error={error} isProcessing={deletingPending} onClose={() => !deletingPending && setDeleting(null)} onConfirm={() => void confirmDelete()} open={Boolean(deleting)} title="Delete custom content?" /></Paper>;
};
