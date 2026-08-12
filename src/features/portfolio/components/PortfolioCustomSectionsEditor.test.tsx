import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as PortfolioApiModule from '../api/portfolioApi';
import * as hooks from '../api/portfolioApi';
import type { PortfolioCustomSection } from '../types/portfolioModels';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PortfolioCustomSectionsEditor } from './PortfolioCustomSectionsEditor';

vi.mock('../api/portfolioApi',async(importOriginal)=>{const actual=await importOriginal<typeof PortfolioApiModule>();return{...actual,useAddPortfolioCustomItemMutation:vi.fn(),useAddPortfolioCustomSectionMutation:vi.fn(),useDeletePortfolioCustomItemMutation:vi.fn(),useDeletePortfolioCustomSectionMutation:vi.fn(),useUpdatePortfolioCustomItemMutation:vi.fn(),useUpdatePortfolioCustomSectionMutation:vi.fn()};});
const mutation=()=>{const unwrap=vi.fn().mockResolvedValue(undefined);const trigger=vi.fn(()=>({unwrap}));return [trigger,{isLoading:false}] as never;};
beforeEach(()=>{vi.mocked(hooks.useAddPortfolioCustomItemMutation).mockReturnValue(mutation());vi.mocked(hooks.useAddPortfolioCustomSectionMutation).mockReturnValue(mutation());vi.mocked(hooks.useDeletePortfolioCustomItemMutation).mockReturnValue(mutation());vi.mocked(hooks.useDeletePortfolioCustomSectionMutation).mockReturnValue(mutation());vi.mocked(hooks.useUpdatePortfolioCustomItemMutation).mockReturnValue(mutation());vi.mocked(hooks.useUpdatePortfolioCustomSectionMutation).mockReturnValue(mutation());});
const section=(index:number,itemCount=0):PortfolioCustomSection=>({id:`section-${index}`,title:`Section ${index}`,displayOrder:index,items:Array.from({length:itemCount},(_,item)=>({id:`item-${item}`,title:`Item ${item}`,description:null,date:null,url:null,displayOrder:item}))});
describe('custom portfolio content',()=>{
  it('enforces five-section and ten-item limits in the UI',()=>{renderWithProviders(<PortfolioCustomSectionsEditor sections={[section(0,10),section(1),section(2),section(3),section(4)]}/>);expect(screen.getByRole('button',{name:'Add custom section'})).toBeDisabled();expect(screen.getByText('Maximum 5 custom sections reached.')).toBeVisible();expect(screen.getAllByText('Maximum 10 items reached.')).toHaveLength(1);expect(screen.getAllByRole('button',{name:'Add item'})[0]).toBeDisabled();});
  it('uses an accessible plain-text dialog and rejects unsafe URLs',async()=>{renderWithProviders(<PortfolioCustomSectionsEditor sections={[section(0)]}/>);await userEvent.click(screen.getByRole('button',{name:'Add item'}));const dialog=screen.getByRole('dialog',{name:'Add custom item'});await userEvent.type(screen.getByRole('textbox',{name:'Title'}),'Speaking');await userEvent.type(screen.getByRole('textbox',{name:'URL'}),'http://unsafe.example');await userEvent.click(screen.getByRole('button',{name:'Save'}));expect(await screen.findByText('Enter a valid HTTPS URL.')).toBeVisible();expect(dialog).toBeVisible();});
});
