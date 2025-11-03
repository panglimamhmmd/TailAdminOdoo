import { NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ======================
// Types
// ======================

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
const UOM_MAP: Record<string, number> = {
  'Units': 1,
  'units': 1,
  'm': 5,
  'meter': 5,
  'm2': 9,
  'm²': 9,
  'meter persegi': 9,
  'kg': 12,
  'kilogram': 12,
  'ls': 27,
  'lump sum': 27,
  'Unit': 95,
  'unit': 95
};

const DEFAULT_UOM = 95;

// ======================
// Helper Functions
// ======================

async function callOdooAPI<T>(
  apiKey: string,
  model: string,
  method: string,
  args: unknown[]
): Promise<T> {
  const requestBody = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: ['erbe', 2, apiKey, model, method, ...args]
    },
    id: Math.floor(Math.random() * 1000)
  };

  const response = await fetch('https://erbe-trial5.odoo.com/jsonrpc', {
    method: 'GET',
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
  const result = await callOdooAPI<number[]>(apiKey, 'sale.order', 'search', [
    [[['name', '=', soNumber]]],
    { limit: 1 }
  ]);

  return result && result.length > 0 ? result[0] : null;
}

async function createSalesOrder(apiKey: string, soNumber: string): Promise<number> {
  const soData = {
    name: soNumber,
    partner_id: 1, // Dummy customer
    state: 'draft'
  };

  return await callOdooAPI<number>(apiKey, 'sale.order', 'create', [[soData]]);
}

async function searchProduct(apiKey: string, productName: string): Promise<number | null> {
  const result = await callOdooAPI<number[]>(apiKey, 'product.template', 'search', [
    [[['name', '=', productName]]],
    { limit: 1 }
  ]);

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
    uom_po_id: 27
  };

  return await callOdooAPI<number>(apiKey, 'product.template', 'create', [[productData]]);
}

async function getProductVariantId(apiKey: string, templateId: number): Promise<number> {
  const result = await callOdooAPI<ProductVariantRead[]>(apiKey, 'product.template', 'read', [
    [[templateId]],
    { fields: ['product_variant_ids'] }
  ]);

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

  return await callOdooAPI<number>(apiKey, 'sale.order.line', 'create', [[lineData]]);
}

function getUomId(uomName?: string): number {
  if (!uomName) return DEFAULT_UOM;

  const normalized = uomName.trim();
  return UOM_MAP[normalized] || DEFAULT_UOM;
}

// ======================
// Route Handler
// ======================

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ODOO_API_KEY_PROD;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY_PROD is not configured' },
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
          soId = await createSalesOrder(apiKey, soNumber);
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