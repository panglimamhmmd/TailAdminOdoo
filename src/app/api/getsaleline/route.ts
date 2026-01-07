import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ======================
// Types
// ======================

interface OdooResponse<T> {
  result?: T;
  error?: {
    data?: {
      message: string;
    };
  };
}

// ======================
// Route Handler
// ======================

export async function GET() {
  try {
    const { apiKey, url, database } = odooConfig;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // ======================
    // Ambil Sales Order Lines
    // ======================
    const getSalesOrderLineBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'sale.order.line',
          'search_read',
          [
            [] // tanpa filter, ambil semua
          ],
          {
            fields: [
              'id',
              'order_id',
              'name',
              'product_id',
              'product_uom_qty',
              'qty_delivered',
              'qty_invoiced',
              'price_unit',
              'price_subtotal',
              'price_total',
              'discount',
              'tax_id',
              'state',
            ],
            limit: 10,
            order: 'create_date desc'
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getSalesOrderLineBody),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OdooResponse<[]> = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    const orderLines = data.result || [];

    return NextResponse.json({
      success: true,
      total: orderLines.length,
      order_lines: orderLines
    });

  } catch (error) {
    console.error('Error fetching sales order lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales order lines from Odoo' },
      { status: 500 }
    );
  }
}