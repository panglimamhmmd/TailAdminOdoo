
import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { apiKey, url, database } = odooConfig;
    const body = await request.json();
    const { soId, productName, description, qty, price } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'ODOO_API_KEY is not configured' }, { status: 500 });
    }
    if (!soId) {
      return NextResponse.json({ error: 'Missing Sales Order ID' }, { status: 400 });
    }
    if (!productName) {
       return NextResponse.json({ error: 'Missing Product Name' }, { status: 400 });
    }



    // Helper to execute KW
    const execute = async (model: string, method: string, args: unknown[]) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: 'object',
                    method: 'execute_kw',
                    args: [database, 2, apiKey, model, method, args]
                },
                id: 1
            })
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.data?.message || json.error.message);
        return json.result;
    };

    // 1. Find or Create Product
    // We need a product of type 'service' that creates a task.
    // Let's assume we just search for existing first.
    let productId;
    const products = await execute('product.product', 'search_read', [[['name', '=', productName]], ['id']]);
    
    if (products && products.length > 0) {
        productId = products[0].id;
    } else {
        // Create new Service Product
        // Ensuring it creates a task in the project is tricky without configuration.
        // Standard Odoo: Service Tracking = 'task_in_project'
        // For now, let's just create a simple service product.
        productId = await execute('product.product', 'create', [{
            name: productName,
            type: 'service', // Service product
            detailed_type: 'service', // New Odoo versions use detailed_type
            service_policy: 'ordered_timesheet', // or ordered_prepaid
            service_tracking: 'task_in_project', // Critical: Create Task in Project
            list_price: parseFloat(price) || 0,
        }]);
    }

    // 2. Add Line to SO
    const newLine = {
        product_id: productId,
        name: description || productName, // Description
        product_uom_qty: parseFloat(qty) || 1,
        price_unit: parseFloat(price) || 0,
    };

    const result = await execute('sale.order', 'write', [
        [soId],
        {
            order_line: [[0, 0, newLine]]
        }
    ]);

    return NextResponse.json({ success: true, result });

  } catch (error) {
    console.error('Error creating SO line:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create SO line' },
      { status: 500 }
    );
  }
}
