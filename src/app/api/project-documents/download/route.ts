import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { apiKey, database, url } = odooConfig;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !apiKey) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const docId = parseInt(id);

    // 1. Get Attachment ID from Document
    const docRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    database, 2, apiKey,
                    'documents.document', 'read',
                    [[docId]],
                    { fields: ['attachment_id'] }
                ]
            },
            id: 1
        })
    });
    
    const docJson = await docRes.json();
    const docData = docJson.result?.[0];
    
    if (!docData || !docData.attachment_id) {
         return NextResponse.json({ error: 'Document not found or no attachment' }, { status: 404 });
    }

    const attachmentId = docData.attachment_id[0];

    // 2. Fetch Attachment Content (datas)
    // Field 'datas' contains base64 content
    const attachRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
                service: 'object',
                method: 'execute_kw',
                args: [
                    database, 2, apiKey,
                    'ir.attachment', 'read',
                    [[attachmentId]],
                    { fields: ['name', 'datas', 'mimetype'] }
                ]
            },
            id: 2
        })
    });

    const attachJson = await attachRes.json();
    const attachData = attachJson.result?.[0];

    if (!attachData || !attachData.datas) {
        return NextResponse.json({ error: 'Attachment content missing' }, { status: 404 });
    }

    // 3. Decode & Return
    const buffer = Buffer.from(attachData.datas, 'base64');
    
    return new NextResponse(buffer, {
        headers: {
            'Content-Type': attachData.mimetype || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${attachData.name}"`,
            'Content-Length': buffer.length.toString()
        }
    });

  } catch (error) {
    console.error('Download API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
