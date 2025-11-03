import { NextResponse } from 'next/server';

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
    const apiKey = process.env.ODOO_API_KEY_PROD;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ODOO_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // ======================
    // Ambil 10 Product Templates dengan semua field
    // ======================
    // const getProductTemplateBody = {
    //   jsonrpc: '2.0',
    //   method: 'call',
    //   params: {
    //     service: 'object',
    //     method: 'execute_kw',
    //     args: [
    //       'erbe',
    //       2,
    //       apiKey,
    //       'product.template',
    //       'search_read',
    //       [
    //         [['name', '=', 'Pasangan Hebel']]
    //       ],
    //       {
    //         fields: [
    //           'id',
    //           'name',
    //           'default_code',
    //           'type',
    //           'categ_id',
    //           'list_price',
    //           'standard_price',
    //           'sale_ok',
    //           'purchase_ok',
    //           'uom_id',
    //           'uom_po_id',
    //           'description',
    //           'description_sale',
    //           'service_tracking',
    //           'service_type',
    //           'project_id',
    //           'project_template_id',
    //           'create_date',
    //           'write_date',
    //           'tax_id'
    //         ],
    //         limit: 10,
    //         order: 'create_date desc'
    //       }
    //     ]
    //   },
    //   id: Math.floor(Math.random() * 1000)
    // };

    const getUOMBody = {
  jsonrpc: '2.0',
  method: 'call',
  params: {
    service: 'object',
    method: 'execute_kw',
    args: [
      'erbe',
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

    const response = await fetch('https://erbe-trial5.odoo.com/jsonrpc', {
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