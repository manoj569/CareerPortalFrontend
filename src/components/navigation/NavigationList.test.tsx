import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { NavigationList } from './NavigationList';

describe('navigation feature visibility', () => {
  it.each([false, true])('hides only Resume Checker in compact=%s navigation', (compact) => {
    renderWithProviders(<MemoryRouter><NavigationList compact={compact} items={[
      { label: 'Resume Checker', path: '/resume-checker' },
      { label: 'Resume maker', path: '/resume-maker' },
      { label: 'Career Guidance', path: '/career-guidance' },
    ]} /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: 'Resume Checker' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resume maker' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Career Guidance' })).toBeVisible();
  });
});
