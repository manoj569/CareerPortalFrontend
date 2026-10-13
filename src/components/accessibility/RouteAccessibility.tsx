import { visuallyHidden } from '@mui/utils';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

import { applyRouteMetadataPolicy } from '@/utils/documentMetadata';

const focusPageContent = (): string => {
  const heading = document.querySelector<HTMLElement>('main h1');
  const main = document.querySelector<HTMLElement>('main');
  const focusTarget = heading ?? main;

  if (focusTarget) {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: false });
  }

  return heading?.textContent?.trim() || document.title.split('|')[0]?.trim() || 'Page loaded';
};

export const RouteAccessibility = () => {
  const { pathname, search } = useLocation();
  const [announcement, setAnnouncement] = useState('');
  // Browse Jobs query updates change results within the page, not the focus destination.
  const focusLocation = pathname === ROUTES.DASHBOARD_JOBS ? pathname : pathname + search;

  useLayoutEffect(() => {
    applyRouteMetadataPolicy(pathname);
  }, [pathname]);

  useEffect(() => {
    let animationFrame = 0;
    const observer = new MutationObserver(() => {
      if (!document.querySelector('main h1')) return;
      observer.disconnect();
      animationFrame = window.requestAnimationFrame(() => {
        setAnnouncement(focusPageContent());
      });
    });

    observer.observe(document.getElementById('root') ?? document.body, {
      childList: true,
      subtree: true,
    });

    animationFrame = window.requestAnimationFrame(() => {
      setAnnouncement(focusPageContent());
      if (document.querySelector('main h1')) observer.disconnect();
    });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [focusLocation]);

  return (
    <>
      <span aria-atomic="true" aria-live="polite" style={visuallyHidden}>
        {announcement}
      </span>
      <Outlet />
    </>
  );
};
