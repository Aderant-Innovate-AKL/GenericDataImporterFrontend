import '@testing-library/jest-dom/vitest';
import { LicenseInfo } from '@mui/x-license';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

expect.extend(matchers);

// Set the license key for @mui/x-license and any other global variables/packages/etc..
const licenseKey = process.env.UI_MUI_X_LICENSE_KEY || 'invalid-license-key';
LicenseInfo.setLicenseKey(licenseKey);

// Mock useUser hook globally for all tests
vi.mock('src/contexts', () => ({
  useUser: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      organizationId: 'organization-1',
      spec: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

afterEach(() => {
  cleanup();
});
