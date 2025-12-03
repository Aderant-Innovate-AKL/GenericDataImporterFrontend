import { useMemo, useCallback } from 'react';

import './App.css';
import {
  PlatformLayout,
  PlatformPageContainer,
  type PlatformRouter,
  type PlatformNavigate,
  type PlatformUserSession,
  type LayoutAccountConfig,
} from '@aderant/stridyn-foundation';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import { useSearchParams, useLocation, useNavigate, Outlet } from 'react-router';
import { useUser } from 'src/contexts';
import { APP_METADATA } from 'src/utils/constants';

// Navigation configuration - add your pages here
const navConfig = [
  {
    segment: 'home',
    title: 'Home',
    icon: <DashboardOutlined />,
  },
];

// Minimal account configuration for hackathon (required by PlatformLayout)
const accountConfig: LayoutAccountConfig = {
  account: 'hackathon',
  accountOptions: [
    {
      value: 'hackathon',
      label: 'Hackathon Account',
    },
  ],
};

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useUser();

  const handleLogout = useCallback(async () => {
    // For hackathon: Simple logout - just reload the page
    // Add real logout logic here if you implement backend authentication
    window.location.reload();
  }, []);

  const navigateImplementation = useCallback<PlatformNavigate>(
    (url, { history = 'auto' } = {}) => {
      if (history === 'auto' || history === 'push') {
        return navigate(url);
      }
      if (history === 'replace') {
        return navigate(url, { replace: true });
      }
      throw new Error(`Invalid history option: ${history}`);
    },
    [navigate],
  );

  const routerImpl = useMemo<PlatformRouter>(
    () => ({
      pathname,
      searchParams,
      navigate: navigateImplementation,
    }),
    [pathname, searchParams, navigateImplementation],
  );

  const session: PlatformUserSession | null = user
    ? {
        platformUser: {
          id: user.id || '',
          name: `${user.spec.firstName} ${user.spec.lastName}`,
          email: user.spec.email || '',
        },
      }
    : null;

  return (
    <PlatformLayout
      appTitle={APP_METADATA.TITLE}
      navigation={navConfig}
      router={routerImpl}
      session={session}
      window={window}
      hideNavigation={false}
      onLogout={handleLogout}
      showStridynNavItems={false}
      accountConfig={accountConfig}
    >
      <PlatformPageContainer sx={{ height: '100%' }}>
        <Outlet />
      </PlatformPageContainer>
    </PlatformLayout>
  );
}
