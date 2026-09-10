import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageLoadingIndicator } from './PageLoadingIndicator';
import { RouteLoadingFallback } from './RouteLoadingFallback';

describe('Centered page loading', () => {
  it('shows one accessible busy status, a visible label and a spinner', () => {
    const { container } = render(<PageLoadingIndicator label="Loading jobs…" />);
    expect(screen.getByRole('status', { name: 'Loading jobs…' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading jobs…')).toBeVisible();
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({ alignItems: 'center', justifyContent: 'center', width: '100%' });
  });

  it('uses a compact centered area for smaller sections', () => {
    const { container } = render(<PageLoadingIndicator compact />);
    expect(screen.getByRole('status', { name: 'Loading…' })).toBeVisible();
    expect(container.firstElementChild).toHaveStyle({ minHeight: '120px' });
  });

  it('provides the same single status while a route module loads', () => {
    render(<RouteLoadingFallback />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByText('Loading page…')).toBeVisible();
  });

  it.each(['Loaded content', 'No results found', 'Unable to load. Retry'])('unmounts cleanly for %s', (result) => {
    const { rerender } = render(<PageLoadingIndicator />);
    rerender(<p>{result}</p>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText(result)).toBeVisible();
  });
});
