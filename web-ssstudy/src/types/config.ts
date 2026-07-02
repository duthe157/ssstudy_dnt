export interface AppConfig {
  env: string;
  apiUrl: string;
  cdnUrl?: string;
  legacyApiUrl?: string;
  siteUrl?: string;
  examUrl?: string;
  baseUrl?: string;
  appTitle: string;
  debug: boolean;
  features: {
    authentication: boolean;
    darkMode: boolean;
    analytics: boolean;
  };
}
