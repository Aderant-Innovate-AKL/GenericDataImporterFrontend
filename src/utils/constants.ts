/**
 * Application-wide constants
 * Use this file to define constant values that are used across the application
 */

/**
 * Query keys for TanStack Query
 * Centralize query keys to avoid typos and make refactoring easier
 */
export const QUERY_KEYS = {
  USER: ['user'],
  // Add more query keys as needed
  // EXAMPLE: ['myData', 'list']
} as const;

/**
 * API endpoints
 * Centralize API endpoints for easier maintenance
 * Note: AUTH endpoints are optional - app will use mock user if not available
 */
export const API_ENDPOINTS = {
  AUTH: {
    WHO_AM_I: '/heimdall/authn/whoami/',
    LOGOUT: '/logout',
  },
  // Add your API endpoints here
  // EXAMPLE: { GET_LIST: '/api/data' }
} as const;

/**
 * Route paths
 * Centralize route paths to avoid typos and make routing changes easier
 */
export const ROUTES = {
  HOME: '/home',
  // Add more routes as needed
  // EXAMPLE: SETTINGS: '/settings'
} as const;

/**
 * Application metadata
 */
export const APP_METADATA = {
  TITLE: 'Hackathon App', // TODO: Update with your app name
  DESCRIPTION: 'Hackathon Project',
} as const;
