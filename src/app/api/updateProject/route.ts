
import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { apiKey, url, database } = odooConfig;
    const body = await request.json();
    const { projectId, name, deadline, picIds, date_start, partner_id } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'ODOO_API_KEY is not configured' }, { status: 500 });
    }
    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (deadline) updates.date = deadline;
    if (date_start) updates.date_start = date_start;
    if (partner_id) updates.partner_id = parseInt(partner_id);
    // Handle Many2many for PICs (user_ids in Odoo)
    // Odoo command: [6, 0, [ids]] to replace list
    if (picIds && Array.isArray(picIds)) {
        updates.x_studio_person_in_charge_pic = [[6, 0, picIds]];
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
            [[projectId], updates]
          ]
        },
        id: 1
      }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.data?.message || 'Odoo API error');

    if (data.result === true) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Failed to update project');
    }

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update project' },
      { status: 500 }
    );
  }
}
