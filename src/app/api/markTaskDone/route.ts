import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();
    const { apiKey, url, database } = odooConfig;

    if (!taskId) {
       return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    // 1. Find "Done" Stage ID
    // Assumption: We look for a stage named 'Done' or 'Completed'
    // Optimization: Hardcode if known, but searching is safer.
    const searchStageBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'project.task.type',
          'search_read',
          [
             [['name', 'in', ['Done', 'Completed', 'Finished']]]
          ],
          {
            fields: ['id', 'name'],
            limit: 1
          }
        ]
      },
      id: 1
    };
    
    const stageRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchStageBody)
    });
    
    const stageData = await stageRes.json();
    const doneStage = stageData.result?.[0];

    if (!doneStage) {
        return NextResponse.json({ error: 'Stage "Done" not found in Odoo' }, { status: 404 });
    }

    // 2. Update Task
    const updateBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'project.task',
          'write',
          [
            [taskId],
            { 
                stage_id: doneStage.id,
                x_studio_persentase: 100 // Optional: Set 100% too
            }
          ]
        ]
      },
      id: 2
    };
    
    const updateRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
    });
    
    // Check response
    const updateDataRes = await updateRes.json();
    if (updateDataRes.error) {
        throw new Error(updateDataRes.error.data.message);
    }
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking task done:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
