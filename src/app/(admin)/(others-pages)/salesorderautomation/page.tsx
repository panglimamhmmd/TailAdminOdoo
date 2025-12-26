'use client';
import React, { useState, CSSProperties } from 'react';

// Interfaces
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

interface DataSummary {
  totalLines: number;
  totalQty: number;
  grossAmount: number;
  totalDiscountAmount: number;
  netAmount: number;
}

interface ValidationWarning {
  row: number;
  field: string;
  message: string;
  value: string;
}

// Field Types
type FieldType = 
  | 'ignore' 
  | 'product_name' 
  | 'qty' 
  | 'uom' 
  | 'price_unit' 
  | 'description' 
  | 'discount';

const FIELD_OPTIONS: { value: FieldType; label: string; required?: boolean }[] = [
  { value: 'ignore', label: '❌ Ignore Column' },
  { value: 'product_name', label: '🏷️ Item / Product Name', required: true },
  { value: 'qty', label: '🔢 Quantity', required: true },
  { value: 'uom', label: '📏 UoM (Unit)', required: true },
  { value: 'price_unit', label: '💰 Unit Price', required: true },
  { value: 'description', label: '📝 Description' },
  { value: 'discount', label: '🏷️ Discount %' },
];

// Column mapping dari user-friendly ke internal (untuk Auto-Detect)
const AUTO_DETECT_MAPPING: { [key: string]: FieldType } = {
  'item pekerjaan': 'product_name',
  'nama barang': 'product_name',
  'item': 'product_name',
  'produk': 'product_name',
  'product': 'product_name',
  'deskripsi': 'description',
  'description': 'description',
  'ket': 'description',
  'keterangan': 'description',
  'qty': 'qty',
  'jumlah': 'qty',
  'kuantitas': 'qty',
  'quantity': 'qty',
  'vol': 'qty',
  'volume': 'qty',
  'sat': 'uom',
  'satuan': 'uom',
  'uom': 'uom',
  'unit': 'uom',
  'harga': 'price_unit',
  'harga satuan': 'price_unit',
  'unit price': 'price_unit',
  'price': 'price_unit',
  'rate': 'price_unit',
  'disc': 'discount',
  'discount': 'discount',
  'diskon': 'discount',
  'potongan': 'discount',
};

// Daftar UOM yang valid
const VALID_UOMS = [
  'pcs', 'unit', 'box', 'kg', 'gram', 'liter', 'meter', 'm', 'm2', 'm3',
  'set', 'pack', 'roll', 'sheet', 'buah', 'batang', 'lembar', 'dus',
  'karton', 'lusin', 'gross', 'ton', 'cm', 'mm', 'km', 'ml', 'cc',
  'botol', 'kaleng', 'paket', 'bks', 'btl', 'rim', 'ls', 'oh'
];

export default function OdooExcelUploader() {
  const [step, setStep] = useState<'input' | 'mapping' | 'preview'>('input');
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, FieldType>>({});
  
  const [parsedData, setParsedData] = useState<FormattedData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showAllLines, setShowAllLines] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{rowIdx: number, field: string} | null>(null);
  const [soNumber, setSoNumber] = useState<string>('');
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

  const parsePrice = (value: string | number): { value: number; isAmbiguous: boolean } => {
    if (typeof value === 'number') return { value, isAmbiguous: false };
    if (!value) return { value: 0, isAmbiguous: false };

    const cleanValue = String(value)
      .replace(/(Rp\.?|IDR)/gi, '')
      .replace(/\s/g, '')
      .trim();

    let isAmbiguous = false;
    let parsed = 0;

    const indonesianFormat = /^[\d.]+,\d+$/;
    const usFormat = /^[\d,]+\.\d+$/;
    const ambiguousFormat = /^[\d]+\.[\d]{3}$/;

    if (indonesianFormat.test(cleanValue)) {
      parsed = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
    } else if (usFormat.test(cleanValue)) {
      parsed = parseFloat(cleanValue.replace(/,/g, ''));
    } else if (ambiguousFormat.test(cleanValue)) {
      isAmbiguous = true;
      parsed = parseFloat(cleanValue.replace(/\./g, ''));
    } else {
      const normalized = cleanValue.replace(/\./g, '').replace(',', '.');
      parsed = parseFloat(normalized);
    }

    return { 
      value: isNaN(parsed) ? 0 : parsed,
      isAmbiguous
    };
  };

  const computeSummary = (data: FormattedData | null): DataSummary => {
    if (!data) {
      return {
        totalLines: 0,
        totalQty: 0,
        grossAmount: 0,
        totalDiscountAmount: 0,
        netAmount: 0
      };
    }

    let totalQty = 0;
    let grossAmount = 0;
    let totalDiscountAmount = 0;

    data.lines.forEach((line) => {
      const lineGross = line.qty * line.price_unit;
      const lineDiscountAmount = lineGross * (line.discount / 100);
      totalQty += line.qty;
      grossAmount += lineGross;
      totalDiscountAmount += lineDiscountAmount;
    });

    const netAmount = grossAmount - totalDiscountAmount;

    return {
      totalLines: data.lines.length,
      totalQty,
      grossAmount,
      totalDiscountAmount,
      netAmount
    };
  };

  /* Removed normalizeHeader as it's replaced by dynamic mapping logic */

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    setPastedText(text);
    processInputStep(text);
  };

  const processInputStep = (text: string) => {
    setParseError(null);
    if (!soNumber.trim()) {
      setParseError('SO Number wajib diisi sebelum parsing data');
      return;
    }

    const rows = text.trim().split('\n').map(row => row.split('\t'));
    if (rows.length < 2) {
      setParseError('Data harus memiliki minimal header dan 1 baris data');
      return;
    }

    // Check for potential merged cells (empty headers)
    const headerCells = rows[0];
    const emptyHeaders = headerCells.filter((h, idx) => {
      if (idx === 0) return false;
      if (idx === headerCells.length - 1) return false;
      return !h.trim();
    });
      
    if (emptyHeaders.length > 0) {
      setParseError('⚠️ Terdeteksi kemungkinan merged cells. Pastikan tidak ada cell yang di-merge di Excel/Sheets sebelum copy.');
      return;
    }

    setRawRows(rows);

    // Initial Guess for Mapping
    const initialMapping: Record<number, FieldType> = {};
    headerCells.forEach((header, idx) => {
      const normalized = header.trim().toLowerCase();
      // Find matching key in AUTO_DETECT_MAPPING
      const matchKey = Object.keys(AUTO_DETECT_MAPPING).find(key => normalized.includes(key));
      if (matchKey) {
        initialMapping[idx] = AUTO_DETECT_MAPPING[matchKey];
      } else {
        initialMapping[idx] = 'ignore';
      }
    });

    setColumnMapping(initialMapping);
    setStep('mapping');
  };

  const processMappingStep = () => {
    // Validate that all required fields are mapped
    const currentValues = Object.values(columnMapping);
    const requiredFields = FIELD_OPTIONS.filter(f => f.required).map(f => f.value);
    const missingFields = requiredFields.filter(field => !currentValues.includes(field));

    if (missingFields.length > 0) {
      const missingLabels = missingFields.map(f => FIELD_OPTIONS.find(opt => opt.value === f)?.label).join(', ');
      setParseError(`Harap mapping kolom berikut: ${missingLabels}`);
      return;
    }

    // Parse Data using mapping
    const dataRows = rawRows.slice(1);
    const formattedLines: FormattedLine[] = [];
    const newWarnings: ValidationWarning[] = [];

    // Map field type to column index
    const fieldIndexMap: Record<string, number> = {};
    Object.entries(columnMapping).forEach(([colIdx, fieldType]) => {
      if (fieldType !== 'ignore') {
        fieldIndexMap[fieldType] = parseInt(colIdx);
      }
    });

    dataRows.forEach((row, rowIdx) => {
      // Skip empty rows
      if (row.every(cell => !cell.trim())) return;

      const rowNum = rowIdx + 2;

      // Helper to get value securely
      const getVal = (field: FieldType): string => {
        const idx = fieldIndexMap[field];
        return idx !== undefined && row[idx] ? String(row[idx]).trim() : '';
      };

      // 1. QTY
      const qtyStr = getVal('qty');
      const qtyResult = parsePrice(qtyStr);
      let qty = qtyResult.value;

      if (qtyResult.isAmbiguous) {
        newWarnings.push({
          row: rowNum,
          field: 'QTY',
          message: `Format ambigu "${qtyStr}" dibaca sebagai ${qty}`,
          value: qtyStr
        });
      }

      if (isNaN(qty) || qty === 0) {
        newWarnings.push({
          row: rowNum,
          field: 'QTY',
          message: `QTY tidak valid atau kosong: "${qtyStr}"`,
          value: qtyStr
        });
        // Dont return, allow editing in next step (or force 0)
        qty = 0; 
      }

      // 2. Price
      const priceStr = getVal('price_unit');
      const priceResult = parsePrice(priceStr);
      const price = priceResult.value;

      if (priceResult.isAmbiguous) {
        newWarnings.push({
          row: rowNum,
          field: 'Harga',
          message: `Format ambigu "${priceStr}" dibaca sebagai ${price.toLocaleString('id-ID')}`,
          value: priceStr
        });
      }

      // 3. UOM
      const uom = getVal('uom').toLowerCase();
      if (!uom) {
        newWarnings.push({
          row: rowNum,
          field: 'UOM',
          message: 'UOM kosong',
          value: ''
        });
      } else if (!VALID_UOMS.includes(uom)) {
        newWarnings.push({
          row: rowNum,
          field: 'UOM',
          message: `UOM "${uom}" tidak dikenal sistem.`,
          value: uom
        });
      }

      // 4. Product Name
      const productName = getVal('product_name');
      if (!productName) {
        newWarnings.push({
          row: rowNum,
          field: 'Item Pekerjaan',
          message: 'Item Pekerjaan kosong',
          value: ''
        });
      }

      // 5. Discount
      const discountStr = getVal('discount');
      const discount = discountStr ? parsePrice(discountStr).value : 0;
      
      // 6. Description
      const description = getVal('description');

      formattedLines.push({
        so_number: soNumber.trim(),
        product_name: productName,
        description: description,
        qty: qty,
        uom: uom,
        price_unit: price,
        discount: discount
      });
    });

    if (formattedLines.length === 0) {
      setParseError('Tidak ada data yang valid ditemukan.');
      return;
    }

    setWarnings(newWarnings);
    setParsedData({ lines: formattedLines });
    setParseError(null);
    setStep('preview');
  };

  const handleRestart = () => {
     setStep('input');
     resetForm();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!parsedData) return;

    if (!confirmed) {
      setParseError('Anda harus konfirmasi summary sebelum submit');
      return;
    }

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
        setConfirmed(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (): void => {
    setParsedData(null);
    setResponse(null);
    setError(null);
    setParseError(null);
    setShowAllLines(false);
    setPastedText('');
    setConfirmed(false);
    setEditingCell(null);
    setSoNumber('');
    setWarnings([]);
    setRawRows([]);
    setColumnMapping({});
  };

  const handleCellEdit = (rowIdx: number, field: keyof FormattedLine, value: string): void => {
    if (!parsedData) return;

    const updatedLines = [...parsedData.lines];
    const line = updatedLines[rowIdx];

    if (field === 'qty' || field === 'discount') {
      const numValue = parsePrice(value).value || 0;
      line[field] = numValue;
    } else if (field === 'price_unit') {
      line[field] = parsePrice(value).value;
    } else {
      line[field] = value;
    }

    setParsedData({ lines: updatedLines });
    setConfirmed(false);
  };

  const tableScrollStyle: CSSProperties = {
    maxHeight: showAllLines ? 'none' : '500px',
    overflowY: showAllLines ? 'visible' : 'auto'
  };

  const summary = computeSummary(parsedData);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              📊 Odoo Sales Order Creator
            </h1>
            {(step !== 'input' || response) && (
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 Reset / Start Over
              </button>
            )}
          </div>

          {step === 'input' && !response && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded transition-colors duration-300">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 Format Data (Header harus ada di baris pertama):
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p className="font-semibold mb-2">Kolom WAJIB:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Item Pekerjaan</code> - Nama Produk (bebas, boleh panjang)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">QTY</code> - Kuantitas (WAJIB ANGKA, harus terisi)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">SAT</code> - Satuan (harus dari list: pcs, unit, kg, m, m2, set, dll)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Harga</code> - Harga satuan (WAJIB ANGKA, harus terisi)</li>
                  </ul>
                  <p className="font-semibold mt-3 mb-2">Kolom OPSIONAL:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Description</code> - Deskripsi (default: kosong)</li>
                    <li><code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Discount</code> - Diskon % (default: 0)</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded border border-yellow-200">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ RULES PENTING:</p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                      <li><strong>TIDAK BOLEH ada merged cells</strong> - Unmerge semua cell sebelum copy</li>
                      <li><strong>Format angka:</strong> Decimal pakai koma (56,22), Ribuan pakai titik (1.000)</li>
                      <li><strong>Contoh format valid:</strong> 1.400,42 = seribu empat ratus koma empat dua</li>
                      <li><strong>Qty dan Harga wajib angka</strong> - Tidak boleh kosong atau teks</li>
                      <li><strong>UOM harus dikenal sistem</strong> - Cek list UOM yang valid</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6">
                <label htmlFor="so-number" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  📝 SO Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="so-number"
                  type="text"
                  value={soNumber}
                  onChange={(e) => setSoNumber(e.target.value)}
                  placeholder="Contoh: S00120"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Masukkan nomor SO yang akan digunakan untuk semua line items
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    💡 <strong>Cara pakai:</strong> Isi SO Number di atas, lalu copy data dari Excel/Google Sheets (termasuk header), 
                    kemudian paste (Ctrl+V / Cmd+V) di kotak bawah ini
                  </p>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="PASTE DATA DARI EXCEL/SHEETS DI SINI...

Pastikan sudah:
✓ Isi SO Number di atas
✓ Tidak ada merged cells
✓ Format angka sudah benar (ribuan: 1.000, decimal: 0,50)
✓ Copy dengan header (baris pertama)"
                  className="w-full h-48 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                />
                {pastedText && (
                  <button
                    onClick={() => processInputStep(pastedText)}
                    disabled={!soNumber.trim()}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      !soNumber.trim()
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {!soNumber.trim() ? '⚠️ Isi SO Number Dulu' : 'Next: Map Columns ➡️'}
                  </button>
                )}
              </div>

              {warnings.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">⚠️</span>
                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                      Warnings ({warnings.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {warnings.map((warning, idx) => (
                      <div key={idx} className="text-sm bg-white dark:bg-orange-900 p-3 rounded border border-orange-300">
                        <p className="font-semibold text-orange-900 dark:text-orange-100">
                          Baris {warning.row}, Kolom {warning.field}:
                        </p>
                        <p className="text-orange-800 dark:text-orange-200">{warning.message}</p>
                        {warning.value && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-mono">
                            Nilai: {warning.value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
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

          {/* STEP 2: MAPPING */}
          {step === 'mapping' && (
             <div className="space-y-6">
                <div className="bg-indigo-50 dark:bg-indigo-950 border-l-4 border-indigo-500 p-4 rounded">
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    🔗 Step 2: Map Columns
                  </h3>
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Sesuaikan kolom dari data yang di-paste dengan field di sistem.
                    Pastikan semua field wajib (bertanda *) terpilih.
                  </p>
                </div>

                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {rawRows[0]?.map((header, idx) => (
                          <th key={idx} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 min-w-[150px]">
                            <div className="mb-2 text-xs uppercase tracking-wider">{header || `Column ${idx + 1}`}</div>
                            <select
                              value={columnMapping[idx] || 'ignore'}
                              onChange={(e) => setColumnMapping(prev => ({ ...prev, [idx]: e.target.value as FieldType }))}
                              className={`w-full p-2 rounded border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                                columnMapping[idx] && columnMapping[idx] !== 'ignore' 
                                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100 font-semibold' 
                                  : 'bg-white border-gray-300 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {FIELD_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label} {opt.required ? '*' : ''}
                                </option>
                              ))}
                            </select>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {/* Show first 5 rows as preview */}
                      {rawRows.slice(1, 6).map((row, rIdx) => (
                         <tr key={rIdx}>
                           {row.map((cell, cIdx) => (
                             <td key={cIdx} className={`px-4 py-2 text-gray-800 dark:text-gray-300 ${
                               columnMapping[cIdx] !== 'ignore' ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                             }`}>
                               {cell}
                             </td>
                           ))}
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parseError && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {parseError}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                   <button 
                     onClick={() => setStep('input')}
                     className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                   >
                     ⬅️ Back
                   </button>
                   <button 
                     onClick={processMappingStep}
                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg transition-transform active:scale-95"
                   >
                     Preview Data ➡️
                   </button>
                </div>
             </div>
          )}

          {step === 'preview' && !response && parsedData && (
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 border p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Lines</p>
                  <p className="text-2xl font-bold dark:text-gray-100">{Math.round(summary.totalLines)}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Qty</p>
                  <p className="text-2xl font-bold dark:text-gray-100">{summary.totalQty.toFixed(4)}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gross Amount</p>
                  <p className="text-2xl font-bold dark:text-gray-100">Rp {summary.grossAmount.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Net Amount</p>
                  <p className="text-2xl font-bold dark:text-gray-100">Rp {summary.netAmount.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
                <button
                   onClick={() => setStep('mapping')}
                   className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  🔙 Re-Map Columns
                </button>

                <div className="flex items-center gap-3">
                  <input
                    id="confirm-checkbox"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="confirm-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Saya sudah cek summary dan data. Lanjut submit.
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-3 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Tip:</strong> Klik pada cell di tabel untuk mengedit nilai. Tekan Enter untuk save, Escape untuk cancel. SO Number: <span className="font-bold">{soNumber}</span>
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto" style={tableScrollStyle}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-950 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Pekerjaan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UoM</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
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
                            
                            <td 
                              className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => setEditingCell({ rowIdx: idx, field: 'product_name' })}
                            >
                              {editingCell?.rowIdx === idx && editingCell?.field === 'product_name' ? (
                                <input
                                  type="text"
                                  defaultValue={line.product_name}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(idx, 'product_name', e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(idx, 'product_name', e.currentTarget.value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-800"
                                />
                              ) : (
                                line.product_name
                              )}
                            </td>

                            <td 
                              className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => setEditingCell({ rowIdx: idx, field: 'description' })}
                            >
                              {editingCell?.rowIdx === idx && editingCell?.field === 'description' ? (
                                <input
                                  type="text"
                                  defaultValue={line.description}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(idx, 'description', e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(idx, 'description', e.currentTarget.value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-800"
                                />
                              ) : (
                                line.description || '-'
                              )}
                            </td>

                            <td 
                              className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => setEditingCell({ rowIdx: idx, field: 'qty' })}
                            >
                              {editingCell?.rowIdx === idx && editingCell?.field === 'qty' ? (
                                <input
                                  type="text"
                                  defaultValue={line.qty}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(idx, 'qty', e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(idx, 'qty', e.currentTarget.value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-800 text-right"
                                />
                              ) : (
                                line.qty
                              )}
                            </td>

                            <td 
                              className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => setEditingCell({ rowIdx: idx, field: 'uom' })}
                            >
                              {editingCell?.rowIdx === idx && editingCell?.field === 'uom' ? (
                                <input
                                  type="text"
                                  defaultValue={line.uom}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(idx, 'uom', e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(idx, 'uom', e.currentTarget.value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-800"
                                />
                              ) : (
                                line.uom
                              )}
                            </td>

                            <td 
                              className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => setEditingCell({ rowIdx: idx, field: 'price_unit' })}
                            >
                              {editingCell?.rowIdx === idx && editingCell?.field === 'price_unit' ? (
                                <input
                                  type="text"
                                  defaultValue={line.price_unit}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(idx, 'price_unit', e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(idx, 'price_unit', e.currentTarget.value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-800 text-right"
                                />
                              ) : (
                                `Rp ${line.price_unit.toLocaleString('id-ID')}`
                              )}
                            </td>

                            <td 
                              className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-right cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                              onClick={() => setEditingCell({ rowIdx: idx, field: 'discount' })}
                            >
                              {editingCell?.rowIdx === idx && editingCell?.field === 'discount' ? (
                                <input
                                  type="text"
                                  defaultValue={line.discount}
                                  autoFocus
                                  onBlur={(e) => {
                                    handleCellEdit(idx, 'discount', e.target.value);
                                    setEditingCell(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCellEdit(idx, 'discount', e.currentTarget.value);
                                      setEditingCell(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingCell(null);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none bg-white dark:bg-gray-800 text-right"
                                />
                              ) : (
                                `${line.discount}%`
                              )}
                            </td>

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
                disabled={loading || !confirmed}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                  loading || !confirmed
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