import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { apiKey, database, url } = odooConfig;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const projectName = searchParams.get('projectName');

    if (!apiKey) {
      return NextResponse.json({ error: 'Config invalid' }, { status: 500 });
    }

    if (!projectId && !projectName) {
      return NextResponse.json({ error: 'Project ID or Name required' }, { status: 400 });
    }

    const targetProjectId = projectId ? parseInt(projectId) : null;

    // If we only have name, we need to find ID first (optional helper, but efficient to just pass ID from frontend)
    // For now, let's assume Frontend passes ID. 
    // If not, we can add a search here.

    // Fetch Documents
    const body = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'documents.document',
          'search_read',
          [
            // Domain: Links to Project
            // Note: Adjust domain if they use 'folder_id' or other logic. 
            // Standard Odoo documents often link via res_model/res_id or folder_id.
            // User confirmed "documents app", often uses folder buckets.
            // BUT files attached to project usually have res_model='project.project' AND res_id=ID.
            [['res_model', '=', 'project.project'], ['res_id', '=', targetProjectId]] 
          ],
          {
            fields: ['id', 'name', 'url', 'type', 'attachment_id', 'mimetype', 'create_date', 'owner_id', 'file_size'],
            limit: 100,
          }
        ]
      },
      id: 1
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const data = await res.json();
    
    if (data.error) {
       console.error("Odoo Error:", data.error);
       return NextResponse.json({ error: data.error.data?.message || data.error.message }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        documents: data.result || [] 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
