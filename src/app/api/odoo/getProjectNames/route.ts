import { NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ======================
// Types
// ======================

interface OdooProject {
  id: number;
  name: string;
  tag_ids: number[];
  x_progress_project: number;
  date_start: string | false;
  date: string | false;
}

interface OdooResponse {
  result?: OdooProject[];
  error?: {
    data?: {
      message: string;
    };
  };
}

// interface ProjectName {
//   name: string;
// }

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

    const requestBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          'erbe',
          2,
          apiKey,
          'project.project',
          'search_read',
          [
            [['stage_id', '!=', 4], ['name', '!=', 'Internal']]
          ],
          {
            fields: [ 'name', 'tag_ids' , 'id' , 'stage_id'],
            limit: 999,
            order: 'create_date asc'
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch('https://erbe.odoo.com/jsonrpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OdooResponse = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    const dataProject = data.result || [];
    
    return NextResponse.json({
      success: true,
      projects: dataProject
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from Odoo' },
      { status: 500 }
    );
  }
}