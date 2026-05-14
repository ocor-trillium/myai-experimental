/**
 * Typed, validated reader for public env vars (`VITE_*`).
 *
 * Rules:
 *  - Only variables prefixed with `VITE_` are inlined into the client bundle.
 *  - NEVER read or inject secrets here: anything shipped to the browser
 *    must be considered public.
 *  - For sensitive configuration, handle it in a backend instead.
 */

type AppEnv = 'development' | 'staging' | 'production';

type AppConfig = {
  appEnv: AppEnv;
  appVersion: string;
  apiBaseUrl: string;
};

function readString(key: string, fallback: string): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const raw = env[key];
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  return fallback;
}

function readAppEnv(): AppEnv {
  const value = readString('VITE_APP_ENV', import.meta.env.MODE);
  if (value === 'development' || value === 'staging' || value === 'production') {
    return value;
  }
  return 'development';
}

export const config: AppConfig = {
  appEnv: readAppEnv(),
  appVersion: readString('VITE_APP_VERSION', '0.1.0'),
  apiBaseUrl: readString('VITE_API_BASE_URL', '/api'),
};
