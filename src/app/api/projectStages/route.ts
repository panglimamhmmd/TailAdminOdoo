import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
            'project.project.stage',
            'search_read',
            [[]], // Fetch all stages
            {
              fields: ['id', 'name', 'sequence'],
              order: 'sequence asc'
            }
          ]
        },
        id: 1
      }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.data?.message || 'Odoo API error');

    return NextResponse.json({
      success: true,
      stages: data.result || []
    });

  } catch (error) {
    console.error('Error fetching project stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project stages' },
      { status: 500 }
    );
  }
}
