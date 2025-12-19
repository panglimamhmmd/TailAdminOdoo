import { NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';


// !uom mapping prod
const UOM_MAP_PROD: Record<string, number> = {
  'Units': 1,
  'units': 1,
  'Unit': 95,
  'unit': 95,
  'Titik': 29,
  'titik': 29,
  'Lembar': 34,
  'lembar': 34,
  'Pcs': 35,
  'pcs': 35,
  'Bungkus': 36,
  'bungkus': 36,
  'Dus': 38,
  'dus': 38,
  'Batang': 39,
  'batang': 39,
  'Pak': 42,
  'pak': 42,
  'Roll': 43,
  'roll': 43,
  'Rit': 44,
  'rit': 44,
  'Set': 45,
  'set': 45,
  'Pasang': 46,
  'pasang': 46,
  'Kaleng': 47,
  'kaleng': 47,
  'Botol': 48,
  'botol': 48,
  'Ikat': 49,
  'ikat': 49,
  'Orang': 50,
  'orang': 50,
  'Lusin': 52,
  'lusin': 52,
  'Box': 54,
  'box': 54,
  'Engkel': 31,
  'engkel': 31,
  'Pick Up': 68,
  'pick up': 68,
  'Weeks': 77,
  'weeks': 77,
  'Months': 78,
  'months': 78,
  'Hari': 106,
  'hari': 106,
  'Lot': 96,
  'lot': 96,
  'DO': 110,
  'do': 110,
  'Watt': 92,
  'watt': 92,
  'An Tgg': 91,
  'an tgg': 91,
  'Jerigen': 117,
  'jerigen': 117,
  'Sak': 32,
  'sak': 32,
  'm': 5,
  'meter': 5,
  'm1': 28,
  'm¹': 28,
  'm2': 9,
  'm²': 9,
  'meter persegi': 9,
  'm3': 11,
  'm³': 11,
  'meter kubik': 11,
  'mm': 6,
  'cm': 8,
  'km': 7,
  'in': 17,
  'inch': 17,
  'ft': 18,
  'feet': 18,
  'yd': 19,
  'yard': 19,
  'mi': 20,
  'mile': 20,
  'ft²': 21,
  'ft2': 21,
  'in³': 25,
  'in3': 25,
  'ft³': 26,
  'ft3': 26,
  'm³ (unit)': 97,
  'g': 13,
  'gram': 13,
  'kg': 12,
  'kilogram': 12,
  't': 14,
  'ton': 14,
  'lb': 15,
  'pound': 15,
  'oz': 16,
  'ons': 55,
  'l': 10,
  'L': 10,
  'liter': 10,
  'Liter': 105,
  'gal (US)': 24,
  'Galon': 37,
  'galon': 37,
  'qt (US)': 23,
  'fl oz (US)': 22,
  'Truk': 30,
  'truk': 30,
  'Engkel (Vol)': 31,
  'Pail': 33,
  'pail': 33,
  'ls': 27,
  'lump sum': 27,
  'm (Commercial)': 122,
  'Botol (Length)': 123
};


// !uom mapping demo
const UOM_MAP_DEMO: Record<string, number> = {
  // Unit (category_id: 1)
  "Unit": 1,
  "unit": 1,
  "Lembar": 28,
  "lembar": 28,
  "Pcs": 29,
  "pcs": 29,
  "Sak": 31,
  "sak": 31,
  "Box": 32,
  "box": 32,
  "Batang": 35,
  "batang": 35,
  "Roll": 38,
  "roll": 38,
  "Botol": 41,
  "botol": 41,
  "Kaleng": 42,
  "kaleng": 42,
  "Galon": 43,
  "galon": 43,
  "Pail": 44,
  "pail": 44,
  "Dus": 45,
  "dus": 45,
  "Pak": 46,
  "pak": 46,
  "Bungkus": 52,
  "bungkus": 52,
  "Set": 53,
  "set": 53,
  "Pasang": 54,
  "pasang": 54,
  "Lusin": 55,
  "lusin": 55,
  "Ikat": 59,
  "ikat": 59,
  "Orang": 60,
  "orang": 60,
  "ls": 68,
  "LS": 68,

  // Length / Distance (category_id: 4)
  "mm": 6,
  "cm": 8,
  "m": 5,
  "meter": 39,
  "m¹": 67,
  "in": 17,
  "ft": 18,
  "yd": 19,
  "km": 7,
  "mi": 20,

  // Surface (category_id: 5)
  "m²": 9,
  "m2": 9,
  "ft²": 21,

  // Weight (category_id: 2)
  "Kg": 12,
  "kg": 12,
  "g": 13,
  "oz": 16,
  "lb": 15,
  "t": 14,

  // Volume (category_id: 6)
  "L": 10,
  "Liter": 51,
  "liter": 51,
  "m³": 11,
  "M3": 63,
  "in³": 25,
  "ft³": 26,
  "qt (US)": 23,
  "fl oz (US)": 22,
  "gal (US)": 24,
  "Truk": 47,
  "truk": 47,
  "Rit": 48,
  "rit": 48,
  "Engkel": 49,
  "engkel": 49,
  "Colt": 50,
  "colt": 50,
  "Carry": 56,
  "carry": 56,
  "Kijang": 57,
  "kijang": 57,
  "DO": 61,
  "do": 61,
  "Mobil": 64,
  "mobil": 64,
  "Ons": 65,
  "ons": 65,

  // Working Time (category_id: 3)
  "Hours": 4,
  "hours": 4,
  "Days": 3,
  "days": 3,

  // Unsorted / Imported Units (category_id: 7)
  "m_unsorted": 69
};

// ======================
// Types
// ======================

const testing = true; // false for production
const config = testing
  ? {
      apiKey: process.env.ODOO_API_KEY_DEMO,
      url: 'https://erbe-trial7.odoo.com/jsonrpc',
      database: 'erbe-trial7',
      UOM: UOM_MAP_DEMO
    }
  : {
      apiKey: process.env.ODOO_API_KEY_PROD,
      url: 'https://erbe.odoo.com/jsonrpc',
      database: 'erbe',
      UOM: UOM_MAP_PROD
    };

if (!config.apiKey) {
  throw new Error(`Missing Odoo API Key for ${testing ? 'DEMO' : 'PROD'}`);
}

const { apiKey, url, database, UOM } = config;



interface SheetRow {
  so_number: string;
  product_name: string;
  description?: string;
  qty: number;
  uom?: string;
  price_unit: number;
  discount?: number;
}

interface CreateSORequest {
  lines: SheetRow[];
}

interface OdooResponse<T> {
  result?: T;
  error?: {
    data?: {
      message: string;
    };
  };
}

interface ProductVariantRead {
  product_variant_ids: number[];
}

interface LineResult {
  success: boolean;
  product_name: string;
  product_id?: number;
  product_created?: boolean;
  order_line_id?: number;
  qty?: number;
  uom?: string;
  price?: number;
  error?: string;
}

interface SOResult {
  so_number: string;
  so_id: number;
  so_created: boolean;
  total_lines: number;
  success_lines: number;
  failed_lines: number;
  lines: LineResult[];
}

interface ErrorResult {
  so_number: string;
  error: string;
}

// ======================
// UOM Mapping
// ======================



// !uom mapping prod completed



const DEFAULT_UOM = 1;

// ======================
// Helper Functions
// ======================

async function callOdooAPI<T>(
  apiKey: string,
  model: string,
  method: string,
  domain: unknown[] = [],
  options: Record<string, unknown> = {}
): Promise<T> {
  const requestBody = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        database,
        2,
        apiKey,
        model,
        method,
        domain,
        options
      ]
    },
    id: Math.floor(Math.random() * 1000)
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: OdooResponse<T> = await response.json();

  if (data.error) {
    throw new Error(data.error.data?.message || 'Odoo API error');
  }

  if (data.result === undefined) {
    throw new Error('No result from Odoo API');
  }

  return data.result;
}

async function searchSalesOrder(apiKey: string, soNumber: string): Promise<number | null> {
  const result = await callOdooAPI<number[]>(
    apiKey,
    'sale.order',
    'search',
    [[['name', '=', soNumber]]],
    { limit: 1 }
  );

  return result && result.length > 0 ? result[0] : null;
}

async function createSalesOrder(apiKey: string, soNumber: string): Promise<number> {
  const soData = {
    name: soNumber,
    partner_id: 1,
    state: 'draft'
  };

  const result = await callOdooAPI<number | number[]>(
    apiKey,
    'sale.order',
    'create',
    [[soData]],
    {}
  );

  // Handle both single ID and array of IDs
  return Array.isArray(result) ? result[0] : result;
}

async function searchProduct(apiKey: string, productName: string): Promise<number | null> {
  const result = await callOdooAPI<number[]>(
    apiKey,
    'product.template',
    'search',
    [[['name', '=', productName]]],
    { limit: 1 }
  );

  return result && result.length > 0 ? result[0] : null;
}

async function createProduct(apiKey: string, productName: string): Promise<number> {
  const productData = {
    name: productName,
    type: 'service',
    service_tracking: 'task_in_project',
    project_template_id: 1,
    list_price: 0,
    standard_price: 0,
    sale_ok: true,
    purchase_ok: false,
    uom_id: 27,
    uom_po_id: 27,
    taxes_id: []
    // tax_id: [[6, 0, []]]
  };

  const result = await callOdooAPI<number | number[]>(
    apiKey,
    'product.template',
    'create',
    [[productData]],
    {}
  );

  // Handle both single ID and array of IDs
  return Array.isArray(result) ? result[0] : result;
}

async function getProductVariantId(apiKey: string, templateId: number): Promise<number> {
  const result = await callOdooAPI<ProductVariantRead[]>(
    apiKey,
    'product.template',
    'read',
    [[templateId]],
    { fields: ['product_variant_ids'] }
  );

  if (result && result.length > 0 && result[0].product_variant_ids.length > 0) {
    return result[0].product_variant_ids[0];
  }

  throw new Error(`No variant found for template ${templateId}`);
}

async function createOrderLine(
  apiKey: string,
  orderId: number,
  productId: number,
  qty: number,
  uomId: number,
  priceUnit: number,
  description?: string,
  discount?: number
): Promise<number> {
  const lineData: Record<string, unknown> = {
    order_id: orderId,
    product_id: productId,
    product_uom_qty: qty,
    product_uom: uomId,
    price_unit: priceUnit
  };

  if (description && description !== '-') {
    lineData.name = description;
  }

  if (discount !== undefined && discount > 0) {
    lineData.discount = discount;
  }

  const result = await callOdooAPI<number | number[]>(
    apiKey,
    'sale.order.line',
    'create',
    [[lineData]],
    {}
  );

  // Handle both single ID and array of IDs
  return Array.isArray(result) ? result[0] : result;
}

function getUomId(uomName?: string): number {
  if (!uomName) return DEFAULT_UOM;

  const normalized = uomName.trim();
  return UOM[normalized] || DEFAULT_UOM;
}

// ======================
// Route Handler
// ======================

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY_DEMO is not configured' },
        { status: 500 }
      );
    }

    const body: CreateSORequest = await request.json();

    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json(
        { error: 'lines array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Group lines by SO Number
    const groupedBySO: Record<string, SheetRow[]> = {};
    for (const line of body.lines) {
      if (!groupedBySO[line.so_number]) {
        groupedBySO[line.so_number] = [];
      }
      groupedBySO[line.so_number].push(line);
    }

    const results: SOResult[] = [];
    const errors: ErrorResult[] = [];

    // Process each SO
    for (const [soNumber, lines] of Object.entries(groupedBySO)) {
      try {
        // Step 1: Search or Create Sales Order
        let soId = await searchSalesOrder(apiKey, soNumber);
        let soCreated = false;

        if (!soId) {
          console.log(`SO ${soNumber} not found, creating new...`);
          const createdId = await createSalesOrder(apiKey, soNumber);
          soId = Array.isArray(createdId) ? createdId[0] : createdId;
          soCreated = true;
          console.log(`SO created with ID: ${soId}`);
        }

        const lineResults: LineResult[] = [];

        // Step 2: Process each line
        for (const line of lines) {
          try {
            // Search or Create Product
            let productTemplateId = await searchProduct(apiKey, line.product_name);
            let productCreated = false;

            if (!productTemplateId) {
              console.log(`Product "${line.product_name}" not found, creating new...`);
              productTemplateId = await createProduct(apiKey, line.product_name);
              productCreated = true;
              console.log(`Product template created with ID: ${productTemplateId}`);
            }

            // Get product variant ID (product.product)
            const productId = await getProductVariantId(apiKey, productTemplateId);

            // Get UOM ID
            const uomId = getUomId(line.uom);

            // Create Order Line
            const orderLineId = await createOrderLine(
              apiKey,
              soId,
              productId,
              line.qty,
              uomId,
              line.price_unit,
              line.description,
              line.discount
            );

            lineResults.push({
              success: true,
              product_name: line.product_name,
              product_id: productId,
              product_created: productCreated,
              order_line_id: orderLineId,
              qty: line.qty,
              uom: line.uom || 'Unit',
              price: line.price_unit
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            lineResults.push({
              success: false,
              product_name: line.product_name,
              error: errorMessage
            });
          }
        }

        results.push({
          so_number: soNumber,
          so_id: soId,
          so_created: soCreated,
          total_lines: lines.length,
          success_lines: lineResults.filter(r => r.success).length,
          failed_lines: lineResults.filter(r => !r.success).length,
          lines: lineResults
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          so_number: soNumber,
          error: errorMessage
        });
      }
    }

    const totalSuccess = results.reduce((sum, r) => sum + r.success_lines, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed_lines, 0);

    return NextResponse.json({
      success: errors.length === 0 && totalFailed === 0,
      summary: {
        total_so: Object.keys(groupedBySO).length,
        total_lines: body.lines.length,
        success_lines: totalSuccess,
        failed_lines: totalFailed
      },
      results,
      errors
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}