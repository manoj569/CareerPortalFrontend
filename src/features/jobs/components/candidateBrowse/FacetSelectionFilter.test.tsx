import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { FacetSelectionFilter } from './FacetSelectionFilter';

const options = Array.from({ length: 9 }, (_, i) => ({ key: `role-${i}`, label: `Backend role ${i}`, count: i }));
const renderFacet = (selected: string[] = []) => {
  const onApply = vi.fn();
  const rendered = renderWithProviders(<FacetSelectionFilter dialogTitle="Role category" facetLabel="Role category" onApply={onApply} options={options} searchLabel="Search role categories" selected={selected} />);
  return { ...rendered, onApply };
};

describe('Searchable backend facet', () => {
  afterEach(() => vi.restoreAllMocks());

  it('uses a full-screen dialog on mobile and keeps keyboard focus inside it', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('max-width'), media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: () => false,
    }));
    renderFacet();
    await userEvent.click(screen.getByRole('button', { name: 'View more role category' }));
    const dialog = screen.getByRole('dialog', { name: 'Role category' });
    expect(dialog).toHaveClass('MuiDialog-paperFullScreen');
    await waitFor(() => expect(within(dialog).getByRole('textbox')).toHaveFocus());
    for (let i = 0; i < 16; i++) await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
  it('shows only seven inline values and displays the exact backend count, including zero', () => {
    renderFacet();
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.getByRole('checkbox', { name: 'Backend role 0, 0 jobs' })).toBeEnabled();
    expect(screen.getByText('Backend role 0')).toBeVisible();
    expect(screen.getByText('(0)')).toBeVisible();
    expect(screen.queryByText('Backend role 8')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View more role category' })).toBeVisible();
  });

  it('searches in a dialog, applies backend values, and restores trigger focus', async () => {
    const { onApply } = renderFacet();
    const trigger = screen.getByRole('button', { name: 'View more role category' });
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Role category' });
    const search = within(dialog).getByRole('textbox', { name: 'Search role categories' });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'role 8');
    expect(within(dialog).getAllByRole('checkbox')).toHaveLength(1);
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Backend role 8, 8 jobs' }));
    expect(onApply).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledExactlyOnceWith(['role-8']);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('discards draft changes on Escape and supports Clear then Apply', async () => {
    const { onApply } = renderFacet(['role-1']);
    const trigger = screen.getByRole('button', { name: 'View more role category' });
    await userEvent.click(trigger);
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Clear' }));
    await userEvent.keyboard('{Escape}');
    expect(onApply).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('checkbox', { name: 'Backend role 1, 1 jobs' })).toBeChecked();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
    expect(onApply).toHaveBeenCalledExactlyOnceWith([]);
  });
});
