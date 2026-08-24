import { renderWithProviders } from '@/test/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AxiosRequestConfig } from 'axios';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { InterviewInsightCompanyResponse } from '../types/interviewInsightModels';
import { InterviewCompanyAutocomplete } from './InterviewInsightDialogs';

const requestMock = vi.hoisted(() =>
  vi.fn<(config: AxiosRequestConfig) => Promise<{ data: { data: unknown } }>>(),
);
vi.mock('@/api/apiClient', () => ({ apiClient: { request: requestMock } }));

const response = (data: unknown) => Promise.resolve({ data: { data } });
const company = { companyName: 'HARMAN', id: 'company-id' };

const Harness = ({ allowCreate = false }: { allowCreate?: boolean }) => {
  const [value, setValue] = useState<InterviewInsightCompanyResponse | null>(null);
  return (
    <>
      <InterviewCompanyAutocomplete allowCreate={allowCreate} onChange={setValue} value={value} />
      <output aria-label="Selected company id">{value?.id ?? 'none'}</output>
    </>
  );
};

describe('InterviewCompanyAutocomplete', () => {
  beforeEach(() => requestMock.mockReset());

  it('debounces search until two characters and supports keyboard selection', async () => {
    requestMock.mockImplementation((config) =>
      config?.url === '/candidate/companies/search' ? response([company]) : response([]),
    );
    renderWithProviders(<Harness />);
    const user = userEvent.setup();
    const input = screen.getByRole('combobox', { name: 'Company' });
    await user.type(input, 'H');
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    expect(requestMock).not.toHaveBeenCalled();
    await user.type(input, 'A');
    expect(await screen.findByRole('option', { name: 'HARMAN' })).toBeVisible();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByLabelText('Selected company id')).toHaveTextContent('company-id');
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { limit: 10, query: 'HA' },
        url: '/candidate/companies/search',
      }),
    );
  });

  it('never offers direct company creation in search-only mode', async () => {
    requestMock.mockResolvedValue({ data: { data: [] } });
    renderWithProviders(<Harness />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Company' }), 'Novel Company');
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    expect(screen.queryByRole('option', { name: /Add ‘Novel Company’/ })).not.toBeInTheDocument();
  });

  it('shows a loading indicator while a debounced company search is pending', async () => {
    let resolveSearch!: (value: { data: { data: unknown } }) => void;
    requestMock.mockImplementation(
      (config) =>
        !config
          ? response([])
          :
        new Promise<{ data: { data: unknown } }>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    renderWithProviders(<Harness />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Company' }), 'Ha');
    expect(await screen.findByRole('progressbar')).toBeVisible();
    resolveSearch({ data: { data: [] } });
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
  });

  it('adds a valid company, selects its returned id, and sends only companyName', async () => {
    requestMock.mockImplementation((config) => {
      if (config?.url === '/candidate/companies/search') return response([]);
      if (config?.url === '/candidate/companies' && config.method === 'POST')
        return response({ companyName: 'Novel Company', id: 'new-id' });
      return response([]);
    });
    renderWithProviders(<Harness allowCreate />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox', { name: 'Company' }), 'Novel Company');
    const add = await screen.findByRole('option', { name: "+ Add ‘Novel Company’" });
    await user.click(add);
    expect(await screen.findByText('Company added and selected.')).toBeVisible();
    expect(screen.getByLabelText('Selected company id')).toHaveTextContent('new-id');
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { companyName: 'Novel Company' },
        method: 'POST',
        url: '/candidate/companies',
      }),
    );
  });

  it('selects a normalized duplicate without claiming it was newly created', async () => {
    const existing = { companyName: 'Acme Corporation', id: 'existing-id' };
    requestMock.mockImplementation((config) => {
      if (config?.url === '/candidate/companies/search') return response([existing]);
      if (config?.url === '/candidate/companies') return response(existing);
      return response([]);
    });
    renderWithProviders(<Harness allowCreate />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox', { name: 'Company' }), 'Acme Corp');
    await user.click(await screen.findByRole('option', { name: "+ Add ‘Acme Corp’" }));
    await waitFor(() =>
      expect(screen.getByLabelText('Selected company id')).toHaveTextContent('existing-id'),
    );
    expect(screen.queryByText('Company added and selected.')).not.toBeInTheDocument();
  });

  it('shows a safe creation error and keeps the field unselected', async () => {
    requestMock.mockImplementation((config) => {
      if (!config) return response([]);
      if (config?.url === '/candidate/companies/search') return response([]);
      return Promise.reject(new Error('Company could not be added.'));
    });
    renderWithProviders(<Harness allowCreate />);
    const user = userEvent.setup();
    await user.type(screen.getByRole('combobox', { name: 'Company' }), 'Broken Company');
    await user.click(await screen.findByRole('option', { name: "+ Add ‘Broken Company’" }));
    expect(await screen.findByText('Company could not be added.')).toBeVisible();
    expect(screen.getByLabelText('Selected company id')).toHaveTextContent('none');
  });
});
