import { UserType } from '../contexts/types';

/**
 * Default mock user for hackathon development
 * This user is used when no backend API is configured or when API calls fail
 *
 * Customize this user to match your hackathon needs:
 * - Change name and email
 * - Add products if needed
 * - Modify permissions for testing
 */
export const DEFAULT_MOCK_USER: UserType = {
  id: 'hackathon-user',
  group: 'user',
  version: 'v1',
  kind: 'User',
  organizationId: 'hackathon-org',
  metadata: {
    creationTimestamp: new Date().toISOString(),
    resourceVersion: '1',
    generation: 1,
  },
  spec: {
    firstName: 'Hackathon',
    lastName: 'Developer',
    email: 'developer@hackathon.local',
    accountIds: [],
    products: [],
    identityUserId: 'hackathon-user',
    idpUserId: 'hackathon-user',
    state: 'active',
  },
  status: {
    message: 'Ready',
    ready: true,
    condition: 'Available',
    lastModifiedTimestamp: new Date().toISOString(),
    organizationPermissions: {},
    accountPermissions: {},
    effectiveState: 'active',
  },
};

/**
 * Get mock user with optional customization via environment variables
 * Supports:
 * - UI_MOCK_USER_FIRST_NAME
 * - UI_MOCK_USER_LAST_NAME
 * - UI_MOCK_USER_EMAIL
 */
export function getMockUser(): UserType {
  const firstName = import.meta.env.UI_MOCK_USER_FIRST_NAME || DEFAULT_MOCK_USER.spec.firstName;
  const lastName = import.meta.env.UI_MOCK_USER_LAST_NAME || DEFAULT_MOCK_USER.spec.lastName;
  const email = import.meta.env.UI_MOCK_USER_EMAIL || DEFAULT_MOCK_USER.spec.email;

  // If no customization, return default
  if (
    firstName === DEFAULT_MOCK_USER.spec.firstName &&
    lastName === DEFAULT_MOCK_USER.spec.lastName &&
    email === DEFAULT_MOCK_USER.spec.email
  ) {
    return DEFAULT_MOCK_USER;
  }

  // Return customized mock user
  return {
    ...DEFAULT_MOCK_USER,
    spec: {
      ...DEFAULT_MOCK_USER.spec,
      firstName,
      lastName,
      email,
    },
  };
}
