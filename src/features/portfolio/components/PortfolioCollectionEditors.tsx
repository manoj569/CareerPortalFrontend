import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import { isDashboardApiError } from '@/features/dashboard/api/dashboardApi';
import { employmentTypeOptions } from '@/features/jobs/constants/jobOptions';
import { ConfirmActionDialog } from '@/features/admin/components/ConfirmActionDialog';
import {
  useAddPortfolioCertificationMutation,
  useAddPortfolioEducationMutation, useAddPortfolioExperienceMutation, useAddPortfolioLinkMutation,
  useAddPortfolioProjectMutation, useDeletePortfolioCertificationMutation,
  useDeletePortfolioEducationMutation, useDeletePortfolioExperienceMutation,
  useDeletePortfolioLinkMutation, useDeletePortfolioProjectMutation, useUpdatePortfolioCertificationMutation,
  useUpdatePortfolioEducationMutation,
  useUpdatePortfolioExperienceMutation, useUpdatePortfolioLinkMutation, useUpdatePortfolioProjectMutation,
} from '../api/portfolioApi';
import type { PortfolioEditorResponse, ProfessionalLinkType } from '../types/portfolioModels';
import { PortfolioCustomSectionsEditor } from './PortfolioCustomSectionsEditor';

type Values = Record<string, string | boolean>;
type Kind = 'experience' | 'education' | 'project' | 'certification' | 'link' | 'customSection' | 'customItem';
type PortfolioRecord = { id: string; displayOrder: number };
interface Field { name: string; label: string; maxLength?: number; required?: boolean; type?: 'text'|'textarea'|'date'|'number'|'url'|'checkbox'|'employment'|'linkType' }
const configurations: Record<Exclude<Kind, 'customItem'>, { title: string; fields: Field[] }> = {
  experience: { title: 'Experience', fields: [{name:'jobTitle',label:'Job title',required:true,maxLength:200},{name:'companyName',label:'Company name',required:true,maxLength:200},{name:'location',label:'Location',maxLength:200},{name:'employmentType',label:'Employment type',type:'employment'},{name:'startDate',label:'Start date',type:'date',required:true},{name:'endDate',label:'End date',type:'date'},{name:'isCurrent',label:'I currently work here',type:'checkbox'},{name:'description',label:'Description',type:'textarea',maxLength:4000}] },
  education: { title: 'Education', fields: [{name:'qualification',label:'Qualification',required:true,maxLength:200},{name:'institution',label:'Institution',required:true,maxLength:250},{name:'fieldOfStudy',label:'Field of study',maxLength:200},{name:'startYear',label:'Start year',type:'number'},{name:'endYear',label:'End year',type:'number'},{name:'grade',label:'Grade',maxLength:100},{name:'description',label:'Description',type:'textarea',maxLength:4000}] },
  project: { title: 'Projects', fields: [{name:'name',label:'Project name',required:true,maxLength:200},{name:'role',label:'Role',maxLength:150},{name:'description',label:'Description',type:'textarea',required:true,maxLength:4000},{name:'technologies',label:'Technologies (comma-separated)'},{name:'sourceUrl',label:'Source URL',type:'url',maxLength:2048},{name:'liveUrl',label:'Live URL',type:'url',maxLength:2048},{name:'startDate',label:'Start date',type:'date'},{name:'endDate',label:'End date',type:'date'}] },
  certification: { title: 'Certifications', fields: [{name:'name',label:'Certification name',required:true,maxLength:200},{name:'issuer',label:'Issuer',maxLength:200},{name:'issuedDate',label:'Issued date',type:'date'},{name:'expiryDate',label:'Expiry date',type:'date'},{name:'doesNotExpire',label:'Does not expire',type:'checkbox'},{name:'credentialId',label:'Credential ID',maxLength:200},{name:'credentialUrl',label:'Credential URL',type:'url',maxLength:2048}] },
  link: { title: 'Professional links', fields: [{name:'type',label:'Link type',type:'linkType',required:true},{name:'label',label:'Label',maxLength:100},{name:'url',label:'HTTPS URL',type:'url',required:true,maxLength:2048}] },
  customSection: { title: 'Custom sections', fields: [{name:'title',label:'Section title',required:true}] },
};
const plainText = (value?: string) =>
  !value ||
  (!value.includes('<') &&
    !value.includes('>') &&
    [...value].every((character) => character.charCodeAt(0) >= 32));
const https = (value?: string) => { if (!value) return true; try { return new URL(value).protocol === 'https:'; } catch { return false; } };
const schemaFor = (fields: Field[]) => yup.object(Object.fromEntries(fields.map((field) => [field.name, field.type === 'checkbox' ? yup.boolean().defined() : yup.string().defined().trim().test('plain','Plain text only.', plainText).test('https','Enter a valid HTTPS URL.', (value) => field.type !== 'url' || https(value)).test('maximum', `${field.label} must be no more than ${field.maxLength} characters.`, (value) => !field.maxLength || value.length <= field.maxLength).test('number', 'Enter a valid number.', (value) => field.type !== 'number' || !value || Number.isInteger(Number(value))).test('year-range', `Enter a year from 1900 to ${new Date().getFullYear() + 10}.`, (value) => field.type !== 'number' || !value || (Number(value) >= 1900 && Number(value) <= new Date().getFullYear() + 10)).test('required',`${field.label} is required.`, (value) => !field.required || Boolean(value))])));
const blank = (fields: Field[]): Values => Object.fromEntries(fields.map((field) => [field.name, field.type === 'checkbox' ? false : field.type === 'linkType' ? 'LinkedIn' : '']));
const nullable = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
const numberOrNull = (value: unknown) => typeof value === 'string' && value ? Number(value) : null;

export const PortfolioCollectionEditors = ({ portfolio }: { portfolio: PortfolioEditorResponse }) => {
  const sections = [
    <CollectionEditor key="experience" kind="experience" items={portfolio.experiences} />,
    <CollectionEditor key="education" kind="education" items={portfolio.education} />,
    <CollectionEditor key="project" kind="project" items={portfolio.projects} />,
    <CollectionEditor key="certification" kind="certification" items={portfolio.certifications} />,
    <CollectionEditor key="link" kind="link" items={portfolio.professionalLinks} />,
  ];
  return <Stack spacing={2.5}>{sections}<PortfolioCustomSectionsEditor sections={portfolio.customSections} /></Stack>;
};

const read = (item: PortfolioRecord, field: string): unknown =>
  (item as unknown as Record<string, unknown>)[field];

const CollectionEditor = ({ items, kind }: { items: PortfolioRecord[]; kind: Exclude<Kind,'customSection'|'customItem'> }) => {
  const config = configurations[kind]; const fields = config.fields;
  const [editing, setEditing] = useState<PortfolioRecord | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<PortfolioRecord | null>(null); const [error,setError]=useState<string|null>(null);
  const addHooks = { experience:useAddPortfolioExperienceMutation,education:useAddPortfolioEducationMutation,project:useAddPortfolioProjectMutation,certification:useAddPortfolioCertificationMutation,link:useAddPortfolioLinkMutation };
  const updateHooks = { experience:useUpdatePortfolioExperienceMutation,education:useUpdatePortfolioEducationMutation,project:useUpdatePortfolioProjectMutation,certification:useUpdatePortfolioCertificationMutation,link:useUpdatePortfolioLinkMutation };
  const deleteHooks = { experience:useDeletePortfolioExperienceMutation,education:useDeletePortfolioEducationMutation,project:useDeletePortfolioProjectMutation,certification:useDeletePortfolioCertificationMutation,link:useDeletePortfolioLinkMutation };
  const [add,addState]=addHooks[kind](); const [update,updateState]=updateHooks[kind](); const [remove,removeState]=deleteHooks[kind]();
  const form=useForm<Values>({resolver:yupResolver(schemaFor(fields)),defaultValues:blank(fields)}); const saving=addState.isLoading||updateState.isLoading;
  const open=(item:null|PortfolioRecord)=>{ setError(null); form.reset(item ? Object.fromEntries(fields.map((field)=>[field.name, field.type==='checkbox' ? Boolean(read(item, field.name)) : read(item, field.name)?.toString() ?? ''])) : blank(fields)); setEditing(item); };
  const payload=(values:Values)=> { const base={displayOrder: editing && typeof editing.displayOrder==='number' ? editing.displayOrder : items.length}; if(kind==='experience')return {...base,jobTitle:String(values.jobTitle).trim(),companyName:String(values.companyName).trim(),location:nullable(values.location),employmentType:numberOrNull(values.employmentType),startDate:String(values.startDate),endDate:values.isCurrent?null:nullable(values.endDate),isCurrent:Boolean(values.isCurrent),description:nullable(values.description)}; if(kind==='education')return {...base,qualification:String(values.qualification).trim(),institution:String(values.institution).trim(),fieldOfStudy:nullable(values.fieldOfStudy),startYear:numberOrNull(values.startYear),endYear:numberOrNull(values.endYear),grade:nullable(values.grade),description:nullable(values.description)}; if(kind==='project')return {...base,name:String(values.name).trim(),role:nullable(values.role),description:String(values.description).trim(),technologies:String(values.technologies).split(',').map(x=>x.trim()).filter(Boolean).slice(0,30),sourceUrl:nullable(values.sourceUrl),liveUrl:nullable(values.liveUrl),startDate:nullable(values.startDate),endDate:nullable(values.endDate)}; if(kind==='certification')return {...base,name:String(values.name).trim(),issuer:nullable(values.issuer),issuedDate:nullable(values.issuedDate),expiryDate:values.doesNotExpire?null:nullable(values.expiryDate),doesNotExpire:Boolean(values.doesNotExpire),credentialId:nullable(values.credentialId),credentialUrl:nullable(values.credentialUrl)}; return {...base,type:values.type as ProfessionalLinkType,label:nullable(values.label),url:String(values.url).trim()}; };
  const save=async(values:Values)=>{setError(null);const start=String(values.startDate??values.issuedDate??'');const end=String(values.endDate??values.expiryDate??'');if(start&&end&&end<start){setError('End or expiry date must not be before the start or issued date.');return;}if(kind==='education'&&values.startYear&&values.endYear&&Number(values.endYear)<Number(values.startYear)){setError('End year must not be before start year.');return;}if(kind==='project'){const technologies=String(values.technologies).split(',').map(value=>value.trim()).filter(Boolean);if(technologies.length>30||technologies.some(value=>value.length>100)){setError('Add at most 30 technologies, each no more than 100 characters.');return;}}try{if(editing)await update({id:editing.id,data:payload(values)} as never).unwrap();else await add(payload(values) as never).unwrap();setEditing(undefined);enqueueSnackbar(`${config.title} saved.`,{variant:'success'});}catch(e){setError(isDashboardApiError(e)?e.message:`Unable to save ${config.title.toLowerCase()}.`);}};
  const confirm=async()=>{if(!deleting)return;try{await remove(deleting.id).unwrap();setDeleting(null);enqueueSnackbar('Record deleted.',{variant:'success'});}catch(e){setError(isDashboardApiError(e)?e.message:'Unable to delete this record.');}};
  const itemLabel = config.title.toLowerCase().replace(/s$/, '');
  return (
    <Paper component="section" sx={{ border: 1, borderColor: 'divider', p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={2}>
        <Stack alignItems={{ xs: 'flex-start', sm: 'center' }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography component="h2" variant="h3">{config.title}</Typography>
            <Typography color="text.secondary" variant="body2">{items.length}</Typography>
          </Stack>
          <Button onClick={() => open(null)} variant="outlined">Add {itemLabel}</Button>
        </Stack>
        {!items.length ? (
          <Typography color="text.secondary">No {config.title.toLowerCase()} added yet. Add one when it strengthens your public portfolio.</Typography>
        ) : items.map((item) => (
          <Stack
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            direction={{ xs: 'column', sm: 'row' }}
            key={item.id}
            justifyContent="space-between"
            spacing={1}
            sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}
          >
            <Typography fontWeight={750}>{String(read(item, 'jobTitle') ?? read(item, 'qualification') ?? read(item, 'name') ?? read(item, 'label') ?? read(item, 'url'))}</Typography>
            <Stack direction="row">
              <Button onClick={() => open(item)} size="small">Edit</Button>
              <Button color="error" onClick={() => setDeleting(item)} size="small">Delete</Button>
            </Stack>
          </Stack>
        ))}
        {error ? <Alert aria-live="assertive" severity="error">{error}</Alert> : null}
      </Stack>
      <EditorDialog
        fields={fields}
        form={form}
        onClose={() => !saving && setEditing(undefined)}
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
        onClose={() => !removeState.isLoading && setDeleting(null)}
        onConfirm={() => void confirm()}
        open={Boolean(deleting)}
        title="Delete record?"
      />
    </Paper>
  );
};

const EditorDialog=({fields,form,onClose,onSubmit,open,saving,title}:{fields:Field[];form:ReturnType<typeof useForm<Values>>;onClose:()=>void;onSubmit:(v:Values)=>Promise<void>;open:boolean;saving:boolean;title:string})=><Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}><DialogTitle>{title}</DialogTitle><DialogContent><Stack component="form" id={`editor-${title.replaceAll(' ','-')}`} onSubmit={(e)=>void form.handleSubmit(onSubmit)(e)} spacing={2} sx={{pt:1}}>{fields.map((field)=>field.type==='checkbox'?<Controller control={form.control} key={field.name} name={field.name} render={({field:input})=><FormControlLabel control={<Checkbox checked={Boolean(input.value)} disabled={saving} onChange={(_,checked)=>input.onChange(checked)} />} label={field.label} />} />:field.type==='employment'?<Controller control={form.control} key={field.name} name={field.name} render={({field:input})=><FormControl><InputLabel id={`${field.name}-label`}>{field.label}</InputLabel><Select {...input} disabled={saving} label={field.label} labelId={`${field.name}-label`}><MenuItem value="">Not specified</MenuItem>{employmentTypeOptions.map(o=><MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</Select></FormControl>} />:field.type==='linkType'?<Controller control={form.control} key={field.name} name={field.name} render={({field:input})=><FormControl><InputLabel id={`${field.name}-label`}>{field.label}</InputLabel><Select {...input} disabled={saving} label={field.label} labelId={`${field.name}-label`}>{['LinkedIn','GitHub','Portfolio','Website','Behance','Dribbble','Kaggle','Other'].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}</Select></FormControl>} />:<TextField disabled={saving} error={Boolean(form.formState.errors[field.name])} helperText={String(form.formState.errors[field.name]?.message??'')} key={field.name} label={field.label} minRows={field.type==='textarea'?4:undefined} multiline={field.type==='textarea'} type={field.type==='url'?'url':field.type??'text'} {...form.register(field.name)} />)}</Stack></DialogContent><DialogActions><Button disabled={saving} onClick={onClose}>Cancel</Button><Button disabled={saving} form={`editor-${title.replaceAll(' ','-')}`} type="submit" variant="contained">{saving?'Saving…':'Save'}</Button></DialogActions></Dialog>;
