'use client'
import React, { useState } from 'react';

export default function OdooAPITester() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

const testData = {
  lines: [
    {
      so_number: "S00100",
      product_name: "Pekerjaan Bouwplank",
      description: "Persiapan area kerja",
      qty: 100,
      uom: "m",
      price_unit: 150000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Galian Tanah Pondasi",
      description: "Kedalaman 1 meter",
      qty: 50,
      uom: "m2",
      price_unit: 200000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Urugan Tanah Kembali",
      description: "Area pondasi dan sekitarnya",
      qty: 70,
      uom: "m2",
      price_unit: 175000,
      discount: 2
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan Batu Kali",
      description: "Pondasi bawah bangunan",
      qty: 120,
      uom: "m2",
      price_unit: 220000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Bekisting Kayu Kolom",
      description: "Kayu multiplek 12mm",
      qty: 45,
      uom: "m2",
      price_unit: 95000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pengecoran Beton Bertulang",
      description: "Struktur kolom utama",
      qty: 30,
      uom: "m2",
      price_unit: 975000,
      discount: 1
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan Besi Tulangan",
      description: "Diameter 12mm",
      qty: 600,
      uom: "kg",
      price_unit: 14500,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pekerjaan Plesteran Dinding",
      description: "Dinding luar & dalam",
      qty: 250,
      uom: "m2",
      price_unit: 50000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pekerjaan Acian Dinding",
      description: "Finishing halus",
      qty: 200,
      uom: "m2",
      price_unit: 40000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pengecatan Dinding Interior",
      description: "Cat Dulux warna putih",
      qty: 300,
      uom: "m2",
      price_unit: 42000,
      discount: 3
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan Keramik Lantai",
      description: "60x60 granit",
      qty: 120,
      uom: "m2",
      price_unit: 125000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan Plafon Gypsum",
      description: "Rangka hollow 4x4",
      qty: 80,
      uom: "m2",
      price_unit: 90000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan List Plafon",
      description: "Gypsum finishing cat",
      qty: 50,
      uom: "m",
      price_unit: 35000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pekerjaan Kusen Pintu Kayu",
      description: "Kayu kamper oven",
      qty: 15,
      uom: "m2",
      price_unit: 750000,
      discount: 5
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan Pintu Panel",
      description: "Finishing melamin",
      qty: 15,
      uom: "m2",
      price_unit: 1200000,
      discount: 3
    },
    {
      so_number: "S00100",
      product_name: "Pemasangan Jendela Aluminium",
      description: "Kaca 5mm clear",
      qty: 20,
      uom: "m2",
      price_unit: 950000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Instalasi Listrik",
      description: "Pemasangan titik lampu & stopkontak",
      qty: 80,
      uom: "m",
      price_unit: 65000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Instalasi Air Bersih",
      description: "Pipa PVC AW 1 inch",
      qty: 60,
      uom: "m",
      price_unit: 25000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Instalasi Air Kotor",
      description: "Pipa PVC D100",
      qty: 40,
      uom: "m",
      price_unit: 35000,
      discount: 0
    },
    {
      so_number: "S00100",
      product_name: "Pembersihan Akhir Proyek",
      description: "General cleaning sebelum serah terima",
      qty: 1,
      uom: "ls",
      price_unit: 1500000,
      discount: 0
    }
  ]
};



  const handleTest = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch('/api/createSalesOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data);
      } else {
        setResponse(data);
      }
    } catch (err) {
      setError({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🧪 Odoo API Tester
          </h1>

          {/* Test Data Display */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Test Data:
            </h2>
            <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-sm">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? '⏳ Testing...' : '🚀 Test API'}
          </button>

          {/* Loading State */}
          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Calling Odoo API...</p>
            </div>
          )}

          {/* Success Response */}
          {response && !error && (
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Success!
                    </h3>
                    <p className="text-green-700">
                      Created {response.summary?.success_lines} lines in {response.summary?.total_so} SO(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total SO</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {response.summary?.total_so}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Success Lines</p>
                  <p className="text-2xl font-bold text-green-600">
                    {response.summary?.success_lines}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Failed Lines</p>
                  <p className="text-2xl font-bold text-red-600">
                    {response.summary?.failed_lines}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Lines</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {response.summary?.total_lines}
                  </p>
                </div>
              </div>

              {/* Results Details */}
              <div className="space-y-4">
                {response.results?.map((result, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        SO: {result.so_number}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.so_created 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {result.so_created ? '🆕 New' : '📝 Updated'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      SO ID: <span className="font-mono font-semibold">{result.so_id}</span>
                    </p>
                    
                    {/* Lines */}
                    <div className="space-y-2">
                      {result.lines?.map((line, lineIdx) => (
                        <div 
                          key={lineIdx} 
                          className={`p-3 rounded ${
                            line.success 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {line.success ? '✅' : '❌'} {line.product_name}
                              </p>
                              {line.success ? (
                                <div className="text-sm text-gray-600 mt-1">
                                  <p>Qty: {line.qty} {line.uom} × Rp {line.price?.toLocaleString()}</p>
                                  <p>Product ID: {line.product_id} 
                                    {line.product_created && <span className="ml-2 text-green-600 font-medium">(New)</span>}
                                  </p>
                                  <p>Order Line ID: {line.order_line_id}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-red-600 mt-1">
                                  Error: {line.error}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Response */}
              <details className="mt-6">
                <summary className="cursor-pointer text-gray-700 font-semibold mb-2">
                  📋 Full Response JSON
                </summary>
                <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-xs">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Error Response */}
          {error && (
            <div className="mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">❌</span>
                  <h3 className="text-lg font-semibold text-red-800">
                    Error
                  </h3>
                </div>
                <pre className="bg-red-100 p-3 rounded text-sm text-red-800 overflow-x-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Make sure your API endpoint is running at <code className="bg-blue-100 px-1 rounded">/api/odoo/create-so</code></li>
            <li>2. Set <code className="bg-blue-100 px-1 rounded">ODOO_API_KEY_PROD</code> in your .env file</li>
            <li>3. Click button to create SO with dummy data</li>
            <li>4. Check Odoo to verify the SO (S00099) was created</li>
          </ul>
        </div>
      </div>
    </div>
  );
}