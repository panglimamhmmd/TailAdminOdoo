import { NextResponse } from "next/server";
import { odooConfig } from "@/utils/odooConfig";

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { taskId, vals } = await request.json();

    if (!taskId || !vals) {
      return NextResponse.json(
        { error: "Missing taskId or vals" },
        { status: 400 }
      );
    }

    const { apiKey, url, database } = odooConfig;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ODOO_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Call Odoo 'write' method
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            database,
            2,
            apiKey,
            "project.task",
            "write",
            [[Number(taskId)], vals]
          ]
        },
        id: 1
      })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.data.message || "Odoo API error");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { 
        error: "Failed to update task",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}