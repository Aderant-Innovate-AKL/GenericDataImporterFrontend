import axios from 'axios';

import { apiConfig } from './runtimeConfig';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  withCredentials: true,
});
