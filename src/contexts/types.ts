export interface UserType {
  group: string;
  version: string;
  kind: string;
  id: string;
  organizationId: string;
  metadata: MetadataType;
  spec: SpecType;
  status: StatusType;
}

export interface MetadataType {
  creationTimestamp: string;
  resourceVersion: string;
  generation: number;
}

export interface SpecType {
  accountIds: string[];
  email: string;
  firstName: string;
  lastName: string;
  products: ProductType[];
  identityUserId: string;
  idpUserId: string;
  state: string;
}

export interface ProductType {
  name: string;
  id: string;
  accountId: string;
}

export interface StatusType {
  message: string;
  ready: boolean;
  condition: string;
  lastModifiedTimestamp: string;
  organizationPermissions: OrganizationPermissions;
  accountPermissions: AccountPermissions;
  effectiveState: string;
}

export interface OrganizationPermissions {
  [organizationId: string]: unknown[];
}

export interface AccountPermissions {
  [accountId: string]: unknown[];
}
