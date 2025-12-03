import { CONFIG_DEFAULTS, ENV_KEYS } from './config';

interface InjectedEnv {
  [ENV_KEYS.API_BASE_URL]?: string;
  [ENV_KEYS.MUI_X_LICENSE_KEY]?: string;
}

interface WindowExtended extends Window {
  injectedEnv?: InjectedEnv;
}

declare const window: WindowExtended;
const injectedEnv = window.injectedEnv ?? {};

/**
 * Helper function to get environment variable values:
 * - Development: Uses import.meta.env (build-time) with optional defaultValue fallback
 * - Production: Uses injectedEnv (runtime injection)
 */
function getEnvVar<T extends keyof InjectedEnv>(key: T, defaultValue: string): string;
function getEnvVar<T extends keyof InjectedEnv>(key: T): string | undefined;
function getEnvVar<T extends keyof InjectedEnv>(
  key: T,
  defaultValue?: string,
): string | undefined {
  const value = import.meta.env.DEV
    ? (import.meta.env[key as keyof ImportMetaEnv] ?? defaultValue)
    : injectedEnv[key];
  return value;
}

export const apiConfig = {
  baseUrl: getEnvVar(ENV_KEYS.API_BASE_URL, CONFIG_DEFAULTS.API_BASE_URL),
};

export const muiConfig = {
  licenseKey: getEnvVar(ENV_KEYS.MUI_X_LICENSE_KEY, CONFIG_DEFAULTS.EMPTY_STRING),
};
