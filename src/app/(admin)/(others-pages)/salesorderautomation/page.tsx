'use client';
import React, { useState, CSSProperties } from 'react';
import * as XLSX from 'xlsx';

// Interfaces
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

interface ResponseLine {
  success: boolean;
  product_name: string;
  qty?: number;
  uom?: string;
  price?: number;
  product_id?: number;
  product_created?: boolean;
  order_line_id?: number;
  error?: string;
}

interface ResponseResult {
  so_number: string;
  so_id: number;
  so_created: boolean;
  lines: ResponseLine[];
}

interface ApiResponse {
  summary: {
    total_so: number;
    success_lines: number;
    failed_lines: number;
    total_lines: number;
  };
  results: ResponseResult[];
}

interface ApiError {
  error: string;
  details?: string;
}

export default function OdooExcelUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<FormattedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showAllLines, setShowAllLines] = useState<boolean>(false);
  const [pasteMode, setPasteMode] = useState<boolean>(true);
  const [pastedText, setPastedText] = useState<string>('');

  const parsePrice = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    const cleanValue = String(value)
      .replace(/(Rp\.?|IDR)/gi, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .trim();

    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const parsePastedData = (text: string): void => {
    setParseError(null);
    setParsedData(null);
    setResponse(null);
    setError(null);

    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setParseError('Data harus memiliki minimal header dan 1 baris data');
        return;
      }

      const headerLine = lines[0];
      const headers = headerLine.split('\t').map(h => h.trim().toLowerCase());

      const requiredColumns = ['so_number', 'product_name', 'description', 'qty', 'uom', 'price_unit', 'discount'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        setParseError(`Kolom tidak lengkap. Missing: ${missingColumns.join(', ')}`);
        return;
      }

      const columnIndices = {
        so_number: headers.indexOf('so_number'),
        product_name: headers.indexOf('product_name'),
        description: headers.indexOf('description'),
        qty: headers.indexOf('qty'),
        uom: headers.indexOf('uom'),
        price_unit: headers.indexOf('price_unit'),
        discount: headers.indexOf('discount')
      };

      const dataLines = lines.slice(1).filter(line => line.trim());
      
      const formattedLines: FormattedLine[] = dataLines.map((line) => {
        const cells = line.split('\t');
        
        return {
          so_number: String(cells[columnIndices.so_number] || '').trim(),
          product_name: String(cells[columnIndices.product_name] || '').trim(),
          description: String(cells[columnIndices.description] || '').trim(),
          qty: parseFloat(String(cells[columnIndices.qty] || '0')) || 0,
          uom: String(cells[columnIndices.uom] || '').trim(),
          price_unit: parsePrice(cells[columnIndices.price_unit] || '0'),
          discount: parseFloat(String(cells[columnIndices.discount] || '0')) || 0
        };
      });

      if (formattedLines.length === 0) {
        setParseError('Tidak ada data yang valid ditemukan');
        return;
      }

      setParsedData({ lines: formattedLines });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setParseError(`Error parsing pasted data: ${errorMessage}`);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setPastedText(text);
    parsePastedData(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParseError(null);
    setParsedData(null);
    setResponse(null);
    setError(null);
    setShowAllLines(false);
    setPastedText('');

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>): void => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' }) as ExcelRow[];
        
        if (data.length === 0) {
          setParseError('File kosong atau tidak ada data');
          return;
        }

        const requiredColumns = ['so_number', 'product_name', 'description', 'qty', 'uom', 'price_unit', 'discount'];
        const firstRow = data[0];
        const availableColumns = Object.keys(firstRow);
        
        const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
        
        if (missingColumns.length > 0) {
          setParseError(`Kolom tidak lengkap. Missing: ${missingColumns.join(', ')}`);
          return;
        }

        const formattedData: FormattedData = {
          lines: data.map((row: ExcelRow) => ({
            so_number: String(row.so_number || '').trim(),
            product_name: String(row.product_name || '').trim(),
            description: String(row.description || '').trim(),
            qty: parseFloat(String(row.qty)) || 0,
            uom: String(row.uom || '').trim(),
            price_unit: parsePrice(row.price_unit),
            discount: parseFloat(String(row.discount)) || 0
          }))
        };

        setParsedData(formattedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setParseError(`Error parsing file: ${errorMessage}`);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleSubmit = async (): Promise<void> => {
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

      const data: ApiResponse | ApiError = await res.json();
      
      if (!res.ok) {
        setError(data as ApiError);
      } else {
        setResponse(data as ApiResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setFile(null);
    setParsedData(null);
    setResponse(null);
    setError(null);
    setParseError(null);
    setShowAllLines(false);
    setPastedText('');
  };

  const tableScrollStyle: CSSProperties = {
    maxHeight: showAllLines ? 'none' : '500px',
    overflowY: showAllLines ? 'visible' : 'auto'
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
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

          {!parsedData && !response && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded transition-colors duration-300">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 Format Data:
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>Data harus memiliki kolom berikut (urutan bebas):</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">so_number</code> - Nomor Sales Order</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">product_name</code> - Nama Produk</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">description</code> - Deskripsi</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">qty</code> - Kuantitas (angka)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">uom</code> - Satuan (m, m2, kg, ls, dll)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">price_unit</code> - Harga satuan (angka atau format Rp)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">discount</code> - Diskon % (angka 0-100)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPasteMode(true)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    pasteMode 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  📋 Paste from Excel/Sheets
                </button>
                <button
                  onClick={() => setPasteMode(false)}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    !pasteMode 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                  }`}
                >
                  📁 Upload File
                </button>
              </div>

              {pasteMode ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      💡 <strong>Cara pakai:</strong> Copy data dari Excel/Google Sheets (termasuk header), 
                      lalu paste (Ctrl+V / Cmd+V) di kotak bawah ini
                    </p>
                  </div>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Paste data dari Excel/Sheets di sini... (Ctrl+V / Cmd+V)

Contoh format:
so_number	product_name	description	qty	uom	price_unit	discount
S00120	Meja Kotak 1	-	1	Unit	IDR 5.244.000	0"
                    className="w-full h-64 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                  />
                  {pastedText && (
                    <button
                      onClick={() => parsePastedData(pastedText)}
                      className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      🔍 Parse Data
                    </button>
                  )}
                </div>
              ) : (
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
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
              )}

              {parseError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">❌</span>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Parse Error</h3>
                      <p className="text-red-700 dark:text-red-300">{parseError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {parsedData && !response && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Data Parsed Successfully!</h3>
                    <p className="text-green-700 dark:text-green-300">
                      Found {parsedData.lines.length} line(s) ready to submit
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto" style={tableScrollStyle}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-950 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UoM</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Disc %</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                      {(showAllLines ? parsedData.lines : parsedData.lines.slice(0, 10)).map((line, idx) => {
                        const subtotal = line.qty * line.price_unit * (1 - line.discount / 100);
                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">{line.so_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{line.product_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{line.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">{line.qty}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{line.uom}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">
                              Rp {line.price_unit.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right">{line.discount}%</td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right font-semibold">
                              Rp {subtotal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {parsedData.lines.length > 10 && (
                  <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowAllLines(!showAllLines)}
                      className="w-full py-2 px-4 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 text-blue-700 dark:text-blue-300 font-medium rounded-lg transition-colors"
                    >
                      {showAllLines ? (
                        <>👆 Show Less (Collapse)</>
                      ) : (
                        <>👇 Show All {parsedData.lines.length} Lines</>
                      )}
                    </button>
                  </div>
                )}
              </div>

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

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Calling Odoo API...</p>
            </div>
          )}

          {response && !error && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">✅</span>
                  <div>
                    <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200">Success!</h3>
                    <p className="text-green-700 dark:text-green-300 text-lg">
                      Created {response.summary.success_lines} lines in {response.summary.total_so} SO(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total SO</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{response.summary.total_so}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Lines</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{response.summary.success_lines}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failed Lines</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{response.summary.failed_lines}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Lines</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{response.summary.total_lines}</p>
                </div>
              </div>

              <div className="space-y-4">
                {response.results.map((result: ResponseResult, idx: number) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">SO: {result.so_number}</h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        result.so_created ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      }`}>
                        {result.so_created ? '🆕 New' : '📝 Updated'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      SO ID: <span className="font-mono font-semibold text-lg">{result.so_id}</span>
                    </p>
                    
                    <div className="space-y-3">
                      {result.lines.map((line: ResponseLine, lineIdx: number) => (
                        <div 
                          key={lineIdx} 
                          className={`p-4 rounded-lg ${
                            line.success ? 'bg-green-50 dark:bg-green-950 border border-green-200' : 'bg-red-50 dark:bg-red-950 border border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                                {line.success ? '✅' : '❌'} {line.product_name}
                              </p>
                              {line.success ? (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                                  <p>Qty: {line.qty} {line.uom} × Rp {line.price?.toLocaleString('id-ID')}</p>
                                  <p>Product ID: {line.product_id} 
                                    {line.product_created && <span className="ml-2 text-green-600 dark:text-green-400 font-medium">(New Product)</span>}
                                  </p>
                                  <p>Order Line ID: {line.order_line_id}</p>
                                </div>
                              ) : (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-2">Error: {line.error}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <details className="mt-6">
                <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-semibold mb-3 text-lg hover:text-blue-600">
                  📋 Full Response JSON
                </summary>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs text-gray-800 dark:text-gray-200">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {error && (
            <div className="mt-6">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-4">❌</span>
                  <h3 className="text-2xl font-semibold text-red-800 dark:text-red-200">Error</h3>
                </div>
                <pre className="bg-red-100 dark:bg-red-900 p-4 rounded text-sm text-red-800 dark:text-red-200 overflow-x-auto">
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