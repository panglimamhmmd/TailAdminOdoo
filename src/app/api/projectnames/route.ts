import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

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

interface ProjectName {
  name: string;
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

    const requestBody = {
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
          'search_read',
          [
            [['stage_id', '!=', 4], ['name', '!=', 'Internal']]
          ],
          {
            fields: ['id', 'name', 'tag_ids', 'x_progress_project', 'date_start', 'date'],
            limit: 50,
            order: 'create_date asc'
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch(url, {
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

    // ======================
    // Extract Main Project Names
    // ======================
    const projectNames = dataProject.reduce<Set<string>>((acc, item) => {
      const parts = item.name?.split(' - ') ?? [];
      const mainName = (parts[1]?.replace(' (copy)', '').trim()) || item.name || 'Untitled';
      acc.add(mainName);
      return acc;
    }, new Set());

    const result: ProjectName[] = Array.from(projectNames).map((name) => ({
      name
    }));
    
    return NextResponse.json({
      success: true,
      projects: result
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects from Odoo' },
      { status: 500 }
    );
  }
}