/**
 * Default configuration values
 * For hackathon: No API URL by default - app uses mock user
 */
export const CONFIG_DEFAULTS = {
  EMPTY_STRING: '',
  API_BASE_URL: '',
} as const;

/**
 * Environment variable keys used in configuration
 */
export const ENV_KEYS = {
  API_BASE_URL: 'UI_API_BASE_URL',
  MUI_X_LICENSE_KEY: 'UI_MUI_X_LICENSE_KEY',
} as const;
