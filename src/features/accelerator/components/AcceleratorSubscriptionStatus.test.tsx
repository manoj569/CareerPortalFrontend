import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAcceleratorPlan, getAcceleratorSubscription } from '../api/acceleratorApi';
import { AcceleratorSubscriptionStatus } from './AcceleratorSubscriptionStatus';

vi.mock('../api/acceleratorApi', () => ({
  getAcceleratorPlan: vi.fn(),
  getAcceleratorSubscription: vi.fn(),
  startAcceleratorCheckout: vi.fn(),
}));

const getSubscription = vi.mocked(getAcceleratorSubscription);
const entitlement = (status: string) => ({
  status,
  startsAtUtc: null,
  endsAtUtc: null,
  usage: [],
});

describe('Accelerator subscription status', () => {
  beforeEach(() => {
    getSubscription.mockReset();
    vi.mocked(getAcceleratorPlan).mockResolvedValue({ checkoutAvailable: false });
  });

  it.each([
    ['Active', 'Active access'],
    ['Expired', 'Expired access'],
    ['None', 'No active access'],
  ])('shows the backend status %s', async (status, label) => {
    getSubscription.mockResolvedValue(entitlement(status));
    render(<AcceleratorSubscriptionStatus />);

    expect(screen.getByLabelText('Loading Accelerator access')).toBeInTheDocument();
    expect(await screen.findByText(label)).toBeInTheDocument();
  });

  it('lets the candidate retry an unavailable subscription read', async () => {
    getSubscription.mockRejectedValueOnce(new Error('backend unavailable'));
    getSubscription.mockResolvedValueOnce(entitlement('Active'));
    render(<AcceleratorSubscriptionStatus />);

    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Active access')).toBeInTheDocument();
    expect(getSubscription).toHaveBeenCalledTimes(2);
  });
});
