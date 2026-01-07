import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ======================
// Types
// ======================

interface OdooTask {
  id: number;
  name: string;
  project_id: [number, string];
  stage_id: [number, string];
  user_ids: number[];
  date_deadline: string | false;
}

interface OdooProject {
  id: number;
  name: string;
}

interface OdooResponse<T> {
  result?: T;
  error?: {
    data?: {
      message: string;
    };
  };
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

    // ======================
    // Step 1: Cari Project Source (S00023)
    // ======================
    const searchSourceProjectBody = {
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
            [['name', '=', 'S00023']]
          ],
          {
            fields: ['id', 'name'],
            limit: 1
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const sourceProjectResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchSourceProjectBody),
      cache: 'no-store'
    });

    if (!sourceProjectResponse.ok) {
      throw new Error(`HTTP error! status: ${sourceProjectResponse.status}`);
    }

    const sourceProjectData: OdooResponse<OdooProject[]> = await sourceProjectResponse.json();

    if (sourceProjectData.error) {
      return NextResponse.json(
        { error: sourceProjectData.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    const sourceProjects = sourceProjectData.result || [];

    if (sourceProjects.length === 0) {
      return NextResponse.json(
        { error: 'Project S00023 tidak ditemukan' },
        { status: 404 }
      );
    }

    const sourceProjectId = sourceProjects[0].id;

    // ======================
    // Step 2: Cari Project Destination (S00023 - Prapanca Padel Court Room)
    // ======================
    const searchDestProjectBody = {
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
            [['name', '=', 'S00023 - Prapanca Padel Court Room']]
          ],
          {
            fields: ['id', 'name'],
            limit: 1
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const destProjectResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchDestProjectBody),
      cache: 'no-store'
    });

    if (!destProjectResponse.ok) {
      throw new Error(`HTTP error! status: ${destProjectResponse.status}`);
    }

    const destProjectData: OdooResponse<OdooProject[]> = await destProjectResponse.json();

    if (destProjectData.error) {
      return NextResponse.json(
        { error: destProjectData.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    const destProjects = destProjectData.result || [];

    if (destProjects.length === 0) {
      return NextResponse.json(
        { error: 'Project S00023 - Prapanca Padel Court Room tidak ditemukan' },
        { status: 404 }
      );
    }

    const destProjectId = destProjects[0].id;

    // ======================
    // Step 3: Ambil semua tasks dari project source
    // ======================
    const getTasksBody = {
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
          'search_read',
          [
            [['project_id', '=', sourceProjectId]]
          ],
          {
            fields: ['id', 'name', 'project_id', 'stage_id', 'user_ids', 'date_deadline'],
            order: 'create_date desc'
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const tasksResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getTasksBody),
      cache: 'no-store'
    });

    if (!tasksResponse.ok) {
      throw new Error(`HTTP error! status: ${tasksResponse.status}`);
    }

    const tasksData: OdooResponse<OdooTask[]> = await tasksResponse.json();

    if (tasksData.error) {
      return NextResponse.json(
        { error: tasksData.error.data?.message || 'Failed to fetch tasks' },
        { status: 400 }
      );
    }

    const tasks = tasksData.result || [];

    if (tasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada tasks yang perlu dipindahkan',
        tasks_moved: 0
      });
    }

    // ======================
    // Step 4: Update project_id untuk semua tasks
    // ======================
    const taskIds = tasks.map(task => task.id);

    const updateTasksBody = {
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
            taskIds,
            {
              project_id: destProjectId
            }
          ]
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const updateResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateTasksBody),
      cache: 'no-store'
    });

    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    const updateData: OdooResponse<boolean> = await updateResponse.json();

    if (updateData.error) {
      return NextResponse.json(
        { error: updateData.error.data?.message || 'Failed to update tasks' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tasks berhasil dipindahkan',
      source_project: {
        id: sourceProjectId,
        name: sourceProjects[0].name
      },
      destination_project: {
        id: destProjectId,
        name: destProjects[0].name
      },
      tasks_moved: tasks.length,
      task_ids: taskIds,
      tasks: tasks
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}