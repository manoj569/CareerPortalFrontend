const accessibleName = (element: Element): string => {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const label = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (label) return label;
  }

  if (element instanceof HTMLImageElement) return element.alt.trim();
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return Array.from(element.labels ?? [])
      .map((label) => label.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
  }

  return element.textContent?.trim() || element.getAttribute('title')?.trim() || '';
};

export const findBasicAccessibilityIssues = (
  container: HTMLElement,
  { requirePageLandmarks = true }: { requirePageLandmarks?: boolean } = {},
): string[] => {
  const issues: string[] = [];
  const ids = new Set<string>();

  container.querySelectorAll<HTMLElement>('[id]').forEach((element) => {
    if (ids.has(element.id)) issues.push(`Duplicate id: ${element.id}`);
    ids.add(element.id);
  });

  container.querySelectorAll<HTMLElement>('[tabindex]').forEach((element) => {
    if (Number(element.getAttribute('tabindex')) > 0) {
      issues.push(`Positive tabindex on ${element.tagName.toLowerCase()}`);
    }
  });

  container.querySelectorAll('img').forEach((image) => {
    if (!image.hasAttribute('alt')) issues.push('Image is missing an alt attribute');
  });

  container
    .querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea')
    .forEach((element) => {
      if (!accessibleName(element)) {
        issues.push(`${element.tagName.toLowerCase()} is missing an accessible name`);
      }
    });

  container.querySelectorAll('table').forEach((table) => {
    if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
      issues.push('Table is missing a caption or accessible label');
    }
    table.querySelectorAll('th').forEach((header) => {
      if (!accessibleName(header)) issues.push('Table header is missing an accessible name');
    });
  });

  if (requirePageLandmarks) {
    if (container.querySelectorAll('main').length !== 1) {
      issues.push('Page must contain exactly one main landmark');
    }
    if (container.querySelectorAll('h1').length !== 1) {
      issues.push('Page must contain exactly one level-one heading');
    }
  }

  return issues;
};
