import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { apiKey, database, url } = odooConfig;

    if (!apiKey) {
      return NextResponse.json({ error: 'ODOO_API_KEY is not configured' }, { status: 500 });
    }

    const fields = ['id', 'name', 'job_title', 'work_email', 'image_128', 'mobile_phone', 'department_id'];
    
    // Filter for specific departments matches: Design, Construction, Interior
    const domain = [['department_id.name', 'in', ['Design', 'Construction', 'Interior']]];

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
            'hr.employee',
            'search_read',
            [domain],
            {
              fields: fields,
              order: 'department_id asc, name asc', // Sort by Dept first
              limit: 100
            }
          ]
        },
        id: 1,
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`Odoo API Error: ${response.statusText}`);
    }

    const json = await response.json();
    
    if (json.error) {
        throw new Error(json.error.data?.message || json.error.message);
    }

    return NextResponse.json({ success: true, data: json.result });

  } catch (error: unknown) {
    console.error("Employee API Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
