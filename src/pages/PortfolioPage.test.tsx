import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGetProfileCompletionQuery } from '@/features/dashboard/api/dashboardApi';
import type * as DashboardApiModule from '@/features/dashboard/api/dashboardApi';
import type * as PortfolioApiModule from '@/features/portfolio/api/portfolioApi';
import {
  useCreatePortfolioMutation, useGetPortfolioPreviewQuery, useGetPortfolioQuery,
  usePublishPortfolioMutation, useUnpublishPortfolioMutation,
} from '@/features/portfolio/api/portfolioApi';
import type { PortfolioEditorResponse, PublicPortfolioResponse } from '@/features/portfolio/types/portfolioModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PortfolioPage } from './PortfolioPage';

vi.mock('./ProfilePage', () => ({ CandidateProfileContent: () => <button type="button">Save profile</button> }));
vi.mock('@/features/portfolio/components/PortfolioSettingsCard', () => ({ PortfolioSettingsCard: () => <div>Settings editor</div> }));
vi.mock('@/features/portfolio/components/PortfolioCollectionEditors', () => ({ PortfolioCollectionEditors: () => <div>Collection editors</div> }));
vi.mock('@/features/portfolio/api/portfolioApi', async (importOriginal) => {
  const actual=await importOriginal<typeof PortfolioApiModule>();
  return {...actual,useCreatePortfolioMutation:vi.fn(),useGetPortfolioPreviewQuery:vi.fn(),useGetPortfolioQuery:vi.fn(),usePublishPortfolioMutation:vi.fn(),useUnpublishPortfolioMutation:vi.fn()};
});
vi.mock('@/features/dashboard/api/dashboardApi', async (importOriginal) => {
  const actual=await importOriginal<typeof DashboardApiModule>();
  return {...actual,useGetProfileCompletionQuery:vi.fn()};
});

const editor: PortfolioEditorResponse={isCreated:true,id:'portfolio-id',slug:'avery-patel',status:'Draft',template:'Professional',publishedAtUtc:null,displayName:'Avery Patel',resumeHeadline:'Engineer',profileSummary:'Builds products.',skills:['React'],resumeAvailable:false,sectionSettings:[],experiences:[],education:[],projects:[],certifications:[],professionalLinks:[],customSections:[]};
const preview:PublicPortfolioResponse={slug:'avery-patel',template:'Professional',publishedAtUtc:null,candidate:{displayName:'Avery Patel',resumeHeadline:'Engineer',profileSummary:'Builds products.'},sectionOrder:['About','Skills'],sections:{skills:['React']}};
const query=(data?:unknown,overrides:Record<string,unknown>={})=>({data,isLoading:false,isError:false,refetch:vi.fn(),...overrides}) as never;
const mutation=(value?:unknown)=>{const unwrap=vi.fn().mockResolvedValue(value);const trigger=vi.fn(()=>({unwrap}));return {trigger,tuple:[trigger,{isLoading:false}] as never};};

describe('Portfolio workspace',()=>{
  beforeEach(()=>{
    vi.mocked(useGetProfileCompletionQuery).mockReturnValue(query({completionPercentage:40,completedSections:['basicDetails'],missingSections:['skills'],sections:[{section:'basicDetails',weight:15,isCompleted:true}]}));
    vi.mocked(useGetPortfolioQuery).mockReturnValue(query(editor));
    vi.mocked(useGetPortfolioPreviewQuery).mockReturnValue(query(preview));
    vi.mocked(useCreatePortfolioMutation).mockReturnValue(mutation(editor).tuple);
    vi.mocked(usePublishPortfolioMutation).mockReturnValue(mutation({published:true,missingRequirements:[],portfolio:{...editor,status:'Published'}}).tuple);
    vi.mocked(useUnpublishPortfolioMutation).mockReturnValue(mutation(editor).tuple);
  });
  const renderPage=()=>renderWithProviders(<MemoryRouter><PortfolioPage/></MemoryRouter>);

  it('shows the not-created state and explicitly creates a Draft',async()=>{
    const create=mutation(editor);vi.mocked(useGetPortfolioQuery).mockReturnValue(query({...editor,isCreated:false,id:null,slug:null,status:null,template:null}));vi.mocked(useCreatePortfolioMutation).mockReturnValue(create.tuple);renderPage();
    expect(screen.getByText('Not created')).toBeVisible();
    await userEvent.click(screen.getByRole('tab',{name:'Portfolio builder'}));
    await userEvent.click(screen.getByRole('button',{name:'Create portfolio'}));
    expect(create.trigger).toHaveBeenCalledWith({requestedSlug:null,template:'Professional'});
  });

  it('keeps private profile saves independent from publishing',async()=>{
    const publish=mutation();vi.mocked(usePublishPortfolioMutation).mockReturnValue(publish.tuple);renderPage();
    await userEvent.click(screen.getByRole('button',{name:'Save profile'}));
    expect(publish.trigger).not.toHaveBeenCalled();
    expect(screen.getByText(/does not create or publish/i)).toBeVisible();
  });

  it('keeps Draft when publish requirements are missing and names them',async()=>{
    const publish=mutation({published:false,missingRequirements:['skills','slug'],portfolio:editor});vi.mocked(usePublishPortfolioMutation).mockReturnValue(publish.tuple);renderPage();
    await userEvent.click(screen.getByRole('tab',{name:'Preview'}));
    await userEvent.click(screen.getByRole('button',{name:'Publish portfolio'}));
    expect(await screen.findByText('Complete these requirements before publishing:')).toBeVisible();
    expect(screen.getAllByText('Skills').length).toBeGreaterThan(0);
    expect(screen.getByText('Portfolio URL')).toBeVisible();
  });

  it('publishes, unpublishes, and copies only a published public link',async()=>{
    const publish=mutation({published:true,missingRequirements:[],portfolio:{...editor,status:'Published'}});const unpublish=mutation(editor);vi.mocked(useGetPortfolioQuery).mockReturnValue(query({...editor,status:'Published',publishedAtUtc:'2026-08-12T00:00:00Z'}));vi.mocked(usePublishPortfolioMutation).mockReturnValue(publish.tuple);vi.mocked(useUnpublishPortfolioMutation).mockReturnValue(unpublish.tuple);const writeText=vi.fn().mockResolvedValue(undefined);Object.assign(navigator,{clipboard:{writeText}});renderPage();
    await userEvent.click(screen.getByRole('button',{name:'Copy link'}));await waitFor(()=>expect(writeText).toHaveBeenCalledWith('https://careerharbor.in/p/avery-patel'));
    await userEvent.click(screen.getByRole('tab',{name:'Preview'}));await userEvent.click(screen.getByRole('button',{name:'Publish portfolio'}));expect(publish.trigger).toHaveBeenCalled();await userEvent.click(screen.getByRole('button',{name:'Unpublish portfolio'}));expect(unpublish.trigger).toHaveBeenCalled();
  });
});
