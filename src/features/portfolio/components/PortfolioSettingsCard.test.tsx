import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import type * as PortfolioApiModule from '../api/portfolioApi';
import { useUpdatePortfolioSettingsMutation } from '../api/portfolioApi';
import {
  portfolioSectionTypes,
  type PortfolioEditorResponse,
  type UpdatePortfolioSettingsRequest,
} from '../types/portfolioModels';
import { PortfolioSettingsCard } from './PortfolioSettingsCard';

vi.mock('../api/portfolioApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof PortfolioApiModule>();

  return {
    ...actual,
    useUpdatePortfolioSettingsMutation: vi.fn(),
  };
});

const sections = portfolioSectionTypes.map(
  (sectionType, index) => ({
    id: `setting-${index}`,
    sectionType,
    isVisible: sectionType !== 'Resume',
    displayOrder: index + 1,
  }),
);

const portfolio = {
  slug: 'avery-patel',
  template: 'Professional',
  sectionSettings: sections,
} as PortfolioEditorResponse;

describe('portfolio settings', () => {
  const unwrap = vi.fn().mockResolvedValue(undefined);

  const trigger = vi.fn(
  (...args: [UpdatePortfolioSettingsRequest]) => {
    void args;

    return {
      unwrap,
    };
  },
);
  beforeEach(() => {
    trigger.mockClear();
    unwrap.mockClear();

    vi.mocked(
      useUpdatePortfolioSettingsMutation,
    ).mockReturnValue([
      trigger,
      {
        isLoading: false,
      },
    ] as never);
  });

  it(
    'validates slug and sends all nine section settings explicitly',
    async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <PortfolioSettingsCard portfolio={portfolio} />,
);

      const slug =
        screen.getByPlaceholderText('your-name');

      await user.clear(slug);
      await user.type(slug, 'Invalid Slug');

      await user.click(
        screen.getByRole('button', {
          name: 'Save changes',
        }),
      );

      expect(
        await screen.findByText(/lowercase letters/i),
      ).toBeVisible();

      expect(trigger).not.toHaveBeenCalled();

      await user.clear(slug);
      await user.type(slug, 'avery-developer');

    const developerTemplate = screen.getByRole(
  'button',
  {
    name: 'Developer',
  },
);

      await user.click(developerTemplate);

      expect(developerTemplate).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await user.click(
        screen.getByRole('button', {
          name: 'Save changes',
        }),
      );

      const expectedRequest: UpdatePortfolioSettingsRequest = {
        slug: 'avery-developer',
        template: 'Developer',
        sections: sections.map(
          ({
            sectionType,
            isVisible,
            displayOrder,
          }) => ({
            sectionType,
            isVisible,
            displayOrder,
          }),
        ),
      };

      await waitFor(() => {
        expect(trigger).toHaveBeenCalledWith(
          expectedRequest,
        );
      });

      expect(expectedRequest.sections).toHaveLength(9);
    },
  );

  it(
    'provides keyboard-operable visibility and deterministic ordering controls',
    async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <PortfolioSettingsCard portfolio={portfolio} />,
      );

      const aboutSwitch = screen.getByRole('switch', {
        name: 'About',
      });

      const resumeSwitch = screen.getByRole('switch', {
        name: 'Resume',
      });

      expect(aboutSwitch).toBeChecked();
      expect(resumeSwitch).not.toBeChecked();

      await user.click(aboutSwitch);

      expect(aboutSwitch).not.toBeChecked();

      const moveAbout = screen.getByRole('button', {
        name: 'Move About',
      });

      const moveSkills = screen.getByRole('button', {
        name: 'Move Skills',
      });

      expect(moveAbout).toBeEnabled();
      expect(moveSkills).toBeEnabled();

      await user.click(moveAbout);

      await user.click(
        screen.getByRole('button', {
          name: 'Save changes',
        }),
      );

      const expectedRequest: UpdatePortfolioSettingsRequest = {
        slug: 'avery-patel',
        template: 'Professional',
        sections: [
          {
            sectionType: 'Skills',
            isVisible: true,
            displayOrder: 1,
          },
          {
            sectionType: 'About',
            isVisible: false,
            displayOrder: 2,
          },
          {
            sectionType: 'Experience',
            isVisible: true,
            displayOrder: 3,
          },
          {
            sectionType: 'Education',
            isVisible: true,
            displayOrder: 4,
          },
          {
            sectionType: 'Projects',
            isVisible: true,
            displayOrder: 5,
          },
          {
            sectionType: 'Certifications',
            isVisible: true,
            displayOrder: 6,
          },
          {
            sectionType: 'ProfessionalLinks',
            isVisible: true,
            displayOrder: 7,
          },
          {
            sectionType: 'Resume',
            isVisible: false,
            displayOrder: 8,
          },
          {
            sectionType: 'CustomSections',
            isVisible: true,
            displayOrder: 9,
          },
        ],
      };

      await waitFor(() => {
        expect(trigger).toHaveBeenCalledWith(
          expectedRequest,
        );
      });

      expect(expectedRequest.sections).toHaveLength(9);
    },
      30_000,

  );
});