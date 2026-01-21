import { NextResponse } from 'next/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Helper to call Odoo
async function callOdoo(method: string, args: unknown[], kwargs: Record<string, unknown> = {}) {
  const url = 'https://erbe.odoo.com/jsonrpc';
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        'erbe',
        2,
        process.env.ODOO_API_KEY_PROD,
        'account.analytic.line',
        method,
        args,
        kwargs
      ],
    },
    id: Math.floor(Math.random() * 1000000),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  if (!res.ok) throw new Error(`Odoo Fetch Error: ${res.statusText}`);
  
  const json = await res.json();
  if (json.error) throw new Error(json.error.data.message || json.error.message);
  
  return json.result;
}

// GET: Fetch timesheets for a task
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });

    const fields = ['date', 'employee_id', 'name', 'unit_amount'];
    const domain = [['task_id', '=', parseInt(taskId)]];
    
    // Sort by date desc, then created desc
    const result = await callOdoo('search_read', [domain], { 
      fields: fields, 
      order: 'date desc, id desc',
      limit: 50 
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

// POST: Create a new timesheet
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, date, description, employeeId } = body;

    if (!taskId || !date || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const values: Record<string, unknown> = {
      task_id: parseInt(taskId),
      date: date,
      name: description,
      unit_amount: 0.0, // Hidden time spent
    };

    if (employeeId) {
        values.employee_id = parseInt(employeeId);
    }

    const newId = await callOdoo('create', [[values]], {});

    return NextResponse.json({ success: true, id: newId });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

// DELETE: Remove a timesheet
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await callOdoo('unlink', [[parseInt(id)]], {});

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
