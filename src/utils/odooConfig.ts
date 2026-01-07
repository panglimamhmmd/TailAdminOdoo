import { UOM_MAP_PROD, UOM_MAP_DEMO } from './uom_constants';

const isDev = process.env.APP_ENV === 'development';

export const odooConfig = isDev
  ? {
      apiKey: process.env.ODOO_API_KEY_DEMO,
      url: 'https://erbe-trial7.odoo.com/jsonrpc',
      database: 'erbe-trial7',
      UOM: UOM_MAP_DEMO,
      label: 'DEMO'
    }
  : {
      apiKey: process.env.ODOO_API_KEY_PROD,
      url: 'https://erbe.odoo.com/jsonrpc',
      database: 'erbe',
      UOM: UOM_MAP_PROD,
      label: 'PROD'
    };

if (!odooConfig.apiKey) {
  // Only throw if in active use to avoid build errors if env vars missing during build
  // But for runtime safety:
  console.warn(`[OdooConfig] Missing API Key for ${odooConfig.label} environment`);
}
