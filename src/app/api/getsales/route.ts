import { NextResponse } from 'next/server';

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
    const apiKey = process.env.ODOO_API_KEY_PROD;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // ======================
    // Ambil 3 Sales Order dengan semua field
    // ======================
    const getSalesOrderBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'erbe',
          2,
          apiKey,
          'sale.order',
          'search_read',
          [
            [] // tanpa filter, ambil semua
          ],
          {
            fields: [
              'id',
              'name',
              'partner_id',
              'date_order',
              'amount_total',
              'amount_untaxed',
              'amount_tax',
              'state',
              'user_id',
              'create_date'
            ],
            limit: 30,
            order: 'create_date desc'
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch('https://erbe-trial5.odoo.com/jsonrpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getSalesOrderBody),
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

    const salesOrders = data.result || [];

    return NextResponse.json({
      success: true,
      total: salesOrders.length,
      sales_orders: salesOrders
    });

  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders from Odoo' },
      { status: 500 }
    );
  }
}