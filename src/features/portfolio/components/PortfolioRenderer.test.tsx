import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import type { PublicPortfolioResponse } from '../types/portfolioModels';
import { PortfolioRenderer } from './PortfolioRenderer';

const portfolio={slug:'avery',template:'Developer',publishedAtUtc:'2026-08-12T00:00:00Z',candidate:{displayName:'Avery Patel',resumeHeadline:'Engineer',profileSummary:'Safe public summary.',email:'private@example.com',phone:'9999999999'},sectionOrder:['About','ProfessionalLinks'],sections:{professionalLinks:[{id:'safe',type:'GitHub',label:'GitHub',url:'https://github.com/avery',displayOrder:0},{id:'unsafe',type:'Other',label:'Unsafe',url:'javascript:alert(1)',displayOrder:1}],applications:['private application'],salary:900000}} as unknown as PublicPortfolioResponse;

describe('shared portfolio renderer',()=>{
  it('renders public DTO content, blocks unsafe links, and ignores forbidden extra fields',()=>{
    renderWithProviders(<PortfolioRenderer portfolio={portfolio}/>);
    expect(screen.getByRole('heading',{name:'Avery Patel'})).toBeVisible();
    const link=screen.getByRole('link',{name:/GitHub/});expect(link).toHaveAttribute('href','https://github.com/avery');expect(link).toHaveAttribute('target','_blank');expect(link).toHaveAttribute('rel','noopener noreferrer');
    expect(screen.queryByRole('link',{name:/Unsafe/})).not.toBeInTheDocument();
    expect(screen.queryByText('private@example.com')).not.toBeInTheDocument();expect(screen.queryByText('9999999999')).not.toBeInTheDocument();expect(screen.queryByText('private application')).not.toBeInTheDocument();expect(screen.queryByText('900000')).not.toBeInTheDocument();
  });
});
