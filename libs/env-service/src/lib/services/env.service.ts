export class EnvService {
  // The values that are defined here are the default values that can
  // be overridden by env.js

  name: string;
  companyName: string;
  production: boolean;
  serviceWorker: boolean;
  logger: boolean;
  showVersion: boolean;
  GTM: string;
  baseUrl: string;
  electronicBaseUrl: string;
  kurbanBaseUrl: string;
  hemenBaseUrl: string;
  FB_APP_ID: string;
  FB_VERSION: string;
  sentryDsn: string;
  VERSION = '1.0.0';
  SW_VERSION = '1.0.0';
  BUGSNAG_API_KEY: string;
  masterpassClientId: string;
  masterpassEndpoint: string;
  masterpassUserMode: string;
  productReminderSupported: boolean;
  hasDefaultDistrict: boolean;
  mock: boolean;
  // globals
  version: string;
  isFoundationEnabled: boolean;
  isElectronicEnabled: boolean;
  isKurbanEnabled: boolean;
  isHemenEnabled: boolean;
  supportsAnonymousCheckout: boolean;
}
