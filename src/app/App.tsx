import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';
import { AppProviders } from './AppProviders';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);
