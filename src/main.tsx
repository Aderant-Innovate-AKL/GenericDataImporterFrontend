import { StrictMode } from 'react';

import { LightBaseTheme } from '@aderant/stridyn-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { LicenseInfo } from '@mui/x-license';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { UserProvider } from './contexts';
import { router } from './Routes';
import { muiConfig } from './utils/runtimeConfig';

import './index.css';

LicenseInfo.setLicenseKey(muiConfig.licenseKey || 'invalid-license-key');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={LightBaseTheme}>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
