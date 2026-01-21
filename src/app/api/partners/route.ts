
import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const { apiKey, url, database } = odooConfig;

    if (!apiKey) {
      return NextResponse.json({ error: 'ODOO_API_KEY is not configured' }, { status: 500 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            database,
            2,
            apiKey,
            'res.partner',
            'search_read',
            [[['active', '=', true], ['customer_rank', '>', 0]]], // Filter customers
            {
              fields: ['id', 'name'],
              limit: 100
            }
          ]
        },
        id: 1
      }),
      cache: 'force-cache'
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.data?.message || 'Odoo API error');

    return NextResponse.json({ success: true, partners: data.result });

  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}
