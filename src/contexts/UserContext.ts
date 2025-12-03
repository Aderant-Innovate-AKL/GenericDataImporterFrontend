import { createContext } from 'react';

import { UserType } from './types';

export interface UserContextType {
  user: UserType;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
