import { UserType } from './types';

/**
 * Simplified user interface for hackathon development
 * Use this instead of the complex production UserType when you don't need
 * all the organizational metadata and permissions
 */
export interface HackathonUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Adapter to convert from production UserType to simplified HackathonUser
 * Useful when integrating with a real backend that returns the full UserType
 */
export function toHackathonUser(user: UserType): HackathonUser {
  return {
    id: user.id,
    email: user.spec.email,
    name: `${user.spec.firstName} ${user.spec.lastName}`,
    firstName: user.spec.firstName,
    lastName: user.spec.lastName,
  };
}

/**
 * Adapter to convert from HackathonUser to production UserType
 * Creates a minimal valid UserType with default values for required fields
 */
export function toUserType(hackathonUser: HackathonUser): UserType {
  const now = new Date().toISOString();

  return {
    id: hackathonUser.id,
    group: 'user',
    version: 'v1',
    kind: 'User',
    organizationId: 'hackathon-org',
    metadata: {
      creationTimestamp: now,
      resourceVersion: '1',
      generation: 1,
    },
    spec: {
      email: hackathonUser.email,
      firstName: hackathonUser.firstName || hackathonUser.name.split(' ')[0] || 'Hackathon',
      lastName: hackathonUser.lastName || hackathonUser.name.split(' ')[1] || 'Developer',
      accountIds: [],
      products: [],
      identityUserId: hackathonUser.id,
      idpUserId: hackathonUser.id,
      state: 'active',
    },
    status: {
      message: 'Ready',
      ready: true,
      condition: 'Available',
      lastModifiedTimestamp: now,
      organizationPermissions: {},
      accountPermissions: {},
      effectiveState: 'active',
    },
  };
}
