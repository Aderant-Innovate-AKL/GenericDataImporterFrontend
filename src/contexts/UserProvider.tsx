import { ReactNode } from 'react';

import { useQuery } from '@tanstack/react-query';
import { getMockUser } from 'src/mocks/mockUser';
import { apiClient } from 'src/utils/apiClient';
import { API_ENDPOINTS, QUERY_KEYS } from 'src/utils/constants';

import { UserType } from './types';
import { UserContext } from './UserContext';

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const fetchUser = async (): Promise<UserType> => {
    // If no API base URL is configured, return mock user
    if (!import.meta.env.UI_API_BASE_URL) {
      return getMockUser();
    }

    try {
      const { data } = await apiClient.get<UserType>(API_ENDPOINTS.AUTH.WHO_AM_I);
      return data;
    } catch (error) {
      // If API call fails, fall back to mock user for hackathon development
      console.warn('Unable to fetch user from API, using mock user:', error);
      return getMockUser();
    }
  };

  const {
    data: user = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: fetchUser,
    retry: false, // Don't retry on error, just use mock user
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Always provide user context, even if still loading
  const contextUser = user || getMockUser();

  return (
    <UserContext.Provider value={{ user: contextUser, isLoading, error, refetch }}>
      {children}
    </UserContext.Provider>
  );
}
