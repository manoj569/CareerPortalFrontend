import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PortfolioApiModule from '@/features/portfolio/api/portfolioApi';
import { useGetPublicPortfolioQuery } from '@/features/portfolio/api/portfolioApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PublicPortfolioPage } from './PublicPortfolioPage';

vi.mock('@/features/portfolio/api/portfolioApi',async(importOriginal)=>{const actual=await importOriginal<typeof PortfolioApiModule>();return{...actual,useGetPublicPortfolioQuery:vi.fn()};});
const data={slug:'avery-patel',template:'Professional',publishedAtUtc:null,candidate:{displayName:'Avery Patel',resumeHeadline:'Frontend engineer'},sectionOrder:['Skills'],sections:{skills:['React']}};
const renderPage=()=>renderWithProviders(<MemoryRouter initialEntries={['/p/avery-patel']}><Routes><Route path="/p/:slug" element={<PublicPortfolioPage/>}/></Routes></MemoryRouter>);
describe('public portfolio page',()=>{
  beforeEach(()=>vi.mocked(useGetPublicPortfolioQuery).mockReturnValue({data,isLoading:false,isError:false} as never));
  it('renders an anonymous portfolio with route metadata',async()=>{renderPage();expect(screen.getByRole('heading',{name:'Avery Patel'})).toBeVisible();await waitFor(()=>expect(document.title).toBe('Avery Patel Portfolio | Career Harbor'));expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href','https://careerharbor.in/p/avery-patel');});
  it('uses a non-revealing unavailable state and noindex for 404/API errors',async()=>{vi.mocked(useGetPublicPortfolioQuery).mockReturnValue({data:undefined,isLoading:false,isError:true} as never);renderPage();expect(screen.getByRole('heading',{name:'Portfolio unavailable'})).toBeVisible();expect(screen.getByText(/may be unpublished/i)).toBeVisible();await waitFor(()=>expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow'));});
});
