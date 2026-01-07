import { NextResponse } from 'next/server';
import { odooConfig } from '@/utils/odooConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// ======================
// Types
// ======================

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

    // ... (commented out code preserved implicitly or removed if not needed, focusing on active code)
    
    const getUOMBody = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [
          database,
          2,
          apiKey,
          'uom.uom',
          'search_read',
          [
            // [['name', 'in', ['ls', 'm2', 'm', 'Unit', 'kg', 'Units']]]
            []
          ],
          {
            fields: ['id', 'name', 'category_id'],
            
          }
        ]
      },
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(getUOMBody),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OdooResponse<[]> = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.data?.message || 'Odoo API error' },
        { status: 400 }
      );
    }

    const products = data.result || [];

    return NextResponse.json({
      success: true,
      total: products.length,
      products: products
    });

  } catch (error) {
    console.error('Error fetching product templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product templates from Odoo' },
      { status: 500 }
    );
  }
}