import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PortfolioApiModule from '../api/portfolioApi';
import { useUpdatePortfolioSettingsMutation } from '../api/portfolioApi';
import { portfolioSectionTypes, type PortfolioEditorResponse } from '../types/portfolioModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PortfolioSettingsCard } from './PortfolioSettingsCard';

vi.mock('../api/portfolioApi',async(importOriginal)=>{const actual=await importOriginal<typeof PortfolioApiModule>();return{...actual,useUpdatePortfolioSettingsMutation:vi.fn()};});
const sections=portfolioSectionTypes.map((sectionType,index)=>({id:`setting-${index}`,sectionType,isVisible:sectionType!=='Resume',displayOrder:index+1}));
const portfolio={slug:'avery-patel',template:'Professional',sectionSettings:sections} as PortfolioEditorResponse;
describe('portfolio settings',()=>{
  const unwrap=vi.fn().mockResolvedValue(undefined);const trigger=vi.fn(()=>({unwrap}));
  beforeEach(()=>{trigger.mockClear();unwrap.mockClear();vi.mocked(useUpdatePortfolioSettingsMutation).mockReturnValue([trigger,{isLoading:false}] as never);});
  it('validates slug and sends all nine section settings explicitly',async()=>{renderWithProviders(<PortfolioSettingsCard portfolio={portfolio}/>);const slug=screen.getByRole('textbox',{name:'Portfolio slug'});await userEvent.clear(slug);await userEvent.type(slug,'Invalid Slug');await userEvent.click(screen.getByRole('button',{name:'Save settings'}));expect(await screen.findByText(/lowercase letters/i)).toBeVisible();expect(trigger).not.toHaveBeenCalled();await userEvent.clear(slug);await userEvent.type(slug,'avery-developer');await userEvent.click(screen.getByRole('combobox',{name:'Template'}));await userEvent.click(screen.getByRole('option',{name:'Developer'}));await userEvent.click(screen.getByRole('button',{name:'Save settings'}));await waitFor(()=>expect(trigger).toHaveBeenCalledWith({slug:'avery-developer',template:'Developer',sections:sections.map(({sectionType,isVisible,displayOrder})=>({sectionType,isVisible,displayOrder}))}));});
  it('provides keyboard-operable visibility and deterministic ordering controls',()=>{renderWithProviders(<PortfolioSettingsCard portfolio={portfolio}/>);expect(screen.getByRole('checkbox',{name:'About'})).toBeChecked();expect(screen.getByRole('button',{name:'Move About up'})).toBeDisabled();expect(screen.getByRole('button',{name:'Move Resume availability down'})).toBeEnabled();});
});
