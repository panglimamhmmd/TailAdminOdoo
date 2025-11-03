'use client'
import React, { useState } from 'react';
import * as XLSX from 'xlsx';


// Tambahkan interface di atas component
interface ExcelRow {
  so_number: string | number;
  product_name: string;
  description: string;
  qty: string | number;
  uom: string;
  price_unit: string | number;
  discount: string | number;
}

interface FormattedLine {
  so_number: string;
  product_name: string;
  description: string;
  qty: number;
  uom: string;
  price_unit: number;
  discount: number;
}

interface FormattedData {
  lines: FormattedLine[];
}

export default function OdooExcelUploader() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [parseError, setParseError] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParseError(null);
    setParsedData(null);
    setResponse(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        // Ambil sheet pertama
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert ke JSON
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' }) as ExcelRow[];
        
        if (data.length === 0) {
          setParseError('File kosong atau tidak ada data');
          return;
        }

        // Validasi kolom yang diperlukan
        const requiredColumns = ['so_number', 'product_name', 'description', 'qty', 'uom', 'price_unit', 'discount'];
        const firstRow = data[0];
        const availableColumns = Object.keys(firstRow);
        
        const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
        
        if (missingColumns.length > 0) {
          setParseError(`Kolom tidak lengkap. Missing: ${missingColumns.join(', ')}`);
          return;
        }

        // Transform data ke format yang sesuai
          const formattedData: FormattedData = {
        lines: data.map((row: ExcelRow) => ({
          so_number: String(row.so_number || '').trim(),
          product_name: String(row.product_name || '').trim(),
          description: String(row.description || '').trim(),
          qty: parseFloat(String(row.qty)) || 0,
          uom: String(row.uom || '').trim(),
          price_unit: parseFloat(String(row.price_unit)) || 0,
          discount: parseFloat(String(row.discount)) || 0
        }))
      };

        setParsedData(formattedData);
      } catch (err) {
        setParseError(`Error parsing file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };


  const handleSubmit = async () => {
    if (!parsedData) return;

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch('/api/createSalesOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
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

  const resetForm = () => {
    setFile(null);
    setParsedData(null);
    setResponse(null);
    setError(null);
    setParseError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800">
              📊 Odoo Sales Order Creator
            </h1>
            {(parsedData || response) && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 Reset
              </button>
            )}
          </div>

          {/* Upload Section */}
          {!parsedData && !response && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Format File Excel/Sheets:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>File harus memiliki kolom berikut (urutan bebas):</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><code className="bg-blue-100 px-2 py-1 rounded">so_number</code> - Nomor Sales Order</li>
                    <li><code className="bg-blue-100 px-2 py-1 rounded">product_name</code> - Nama Produk</li>
                    <li><code className="bg-blue-100 px-2 py-1 rounded">description</code> - Deskripsi</li>
                    <li><code className="bg-blue-100 px-2 py-1 rounded">qty</code> - Kuantitas (angka)</li>
                    <li><code className="bg-blue-100 px-2 py-1 rounded">uom</code> - Satuan (m, m2, kg, ls, dll)</li>
                    <li><code className="bg-blue-100 px-2 py-1 rounded">price_unit</code> - Harga satuan (angka)</li>
                    <li><code className="bg-blue-100 px-2 py-1 rounded">discount</code> - Diskon % (angka 0-100)</li>
                  </ul>
                </div>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    Click to upload Excel/Sheets file
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports .xlsx, .xls, .csv files
                  </p>
                  {file && (
                    <p className="mt-4 text-sm text-blue-600 font-medium">
                      Selected: {file.name}
                    </p>
                  )}
                </label>
              </div>

              {/* Parse Error */}
              {parseError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">❌</span>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">Parse Error</h3>
                      <p className="text-red-700">{parseError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Parsed Data */}
          {parsedData && !response && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">File Parsed Successfully!</h3>
                    <p className="text-green-700">
                      Found {parsedData.lines.length} line(s) ready to submit
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UoM</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Disc %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.lines.slice(0, 10).map((line, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{line.so_number}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{line.product_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{line.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.qty}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{line.uom}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {line.price_unit.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.discount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.lines.length > 10 && (
                  <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center">
                    ... and {parsedData.lines.length - 10} more lines
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? '⏳ Creating Sales Orders...' : '🚀 Create Sales Orders in Odoo'}
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 text-lg">Calling Odoo API...</p>
            </div>
          )}

          {/* Success Response */}
          {response && !error && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">✅</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-green-800">
                      Success!
                    </h3>
                    <p className="text-green-700 text-lg">
                      Created {response.summary?.success_lines} lines in {response.summary?.total_so} SO(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Total SO</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {response.summary?.total_so}
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Success Lines</p>
                  <p className="text-3xl font-bold text-green-600">
                    {response.summary?.success_lines}
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Failed Lines</p>
                  <p className="text-3xl font-bold text-red-600">
                    {response.summary?.failed_lines}
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Total Lines</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {response.summary?.total_lines}
                  </p>
                </div>
              </div>

              {/* Results Details */}
              <div className="space-y-4">
                {response.results?.map((result, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        SO: {result.so_number}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        result.so_created 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {result.so_created ? '🆕 New' : '📝 Updated'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      SO ID: <span className="font-mono font-semibold text-lg">{result.so_id}</span>
                    </p>
                    
                    {/* Lines */}
                    <div className="space-y-3">
                      {result.lines?.map((line, lineIdx) => (
                        <div 
                          key={lineIdx} 
                          className={`p-4 rounded-lg ${
                            line.success 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 text-lg">
                                {line.success ? '✅' : '❌'} {line.product_name}
                              </p>
                              {line.success ? (
                                <div className="text-sm text-gray-600 mt-2 space-y-1">
                                  <p>Qty: {line.qty} {line.uom} × Rp {line.price?.toLocaleString('id-ID')}</p>
                                  <p>Product ID: {line.product_id} 
                                    {line.product_created && <span className="ml-2 text-green-600 font-medium">(New Product)</span>}
                                  </p>
                                  <p>Order Line ID: {line.order_line_id}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-red-600 mt-2">
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
                <summary className="cursor-pointer text-gray-700 font-semibold mb-3 text-lg hover:text-blue-600">
                  📋 Full Response JSON
                </summary>
                <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto text-xs">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Error Response */}
          {error && (
            <div className="mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">❌</span>
                  <h3 className="text-2xl font-semibold text-red-800">
                    Error
                  </h3>
                </div>
                <pre className="bg-red-100 p-4 rounded text-sm text-red-800 overflow-x-auto">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}