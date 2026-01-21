import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { apiKey, url, database } = odooConfig;
    const body = await request.json();
    const { projectId, stageId } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'ODOO_API_KEY is not configured' }, { status: 500 });
    }
    if (!projectId || !stageId) {
      return NextResponse.json({ error: 'Missing projectId or stageId' }, { status: 400 });
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
            'project.project',
            'write',
            [[projectId], { stage_id: stageId }]
          ]
        },
        id: 1
      }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.data?.message || 'Odoo API error');

    // Odoo 'write' returns true on success
    if (data.result === true) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Failed to update stage');
    }

  } catch (error) {
    console.error('Error updating project stage:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update stage' },
      { status: 500 }
    );
  }
}
