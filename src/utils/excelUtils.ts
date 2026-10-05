import * as XLSX from 'xlsx';
import { Asset, AuditLogEntry } from '../types/cargas';

export function exportAssetsToExcel(
  assets: Asset[],
  fileName = 'cargas_assets.xlsx',
  sheetName = 'أصول كارجاس'
) {
  if (!assets || assets.length === 0) {
    throw new Error('لا توجد أصول لتصديرها');
  }

  const rows = assets.map((a, index) => {
    const rowObj: Record<string, any> = {
      'م': index + 1,
      'كود الأصل': a.asset_code || '',
      'اسم الأصل / المعدة': a.asset_name || '',
      'الفئة الرئيسية': a.category || '',
      'المحطة': a.station_name || '',
      'كود المحطة': a.station_id || '',
      'مصدر الأصل المعتمد': a.source || 'دفاتر المالية (المصدر المعتمد)',
      'الدفاتر المالية': a.financial_book || 'دفتر أصول عامة',
      'مطابقة دفاتر المالية': a.financial_reconciliation || (a.confirmed ? 'مطابق ومعتمد بدفاتر المالية' : 'مقيد بالدفاتر وبانتظار المطابقة'),
      'نوع الحصر': a.inventory_type || 'حصر فعلي وميداني 2026',
      'المنطقة الجغرافية': a.region || '',
      'المحافظة': a.governorate || '',
      'الكمية الفعلية': a.quantity !== undefined ? a.quantity : 1,
      'الكمية بالدفاتر المالية': a.financial_qty !== undefined ? a.financial_qty : (a.quantity !== undefined ? a.quantity : 1),
      'الشركة المصنعة': a.manufacturer || '',
      'الموديل / النوع': a.model_type || '',
      'الرقم المسلسل (S/N)': a.serial_no || '',
      'الحالة الفنية': a.condition || 'جيدة',
      'بند حرج': a.criticality || 'لا',
      'السيستم / المنظومة': a.system || '',
      'وحدة المعدة': a.equipment_unit || '',
      'الوحدة الفرعية': a.subunit || '',
      'القدرة / المواصفات الفنية': a.power_specs || '',
      'السعة / الحجم': a.capacity_size || '',
      'الأبعاد': a.dimension || '',
      'الضغط (بار)': a.suction || '',
      'تاريخ التركيب والتشغيل': a.install_date || '',
      'مركز التكلفة': a.cost_center || '',
      'المصدر / المورد': a.source || '',
      'قابل للصيانة': a.component_maintainable || '',
      'الجزء / القطعة': a.part || '',
      'شكل الشاسيه': a.frame_shape || '',
      'المبنى': a.building_no || '',
      'الدور': a.floor_no || '',
      'المكتب / الغرفة': a.office_no || '',
      'عهدة المسؤول': a.assigned_to || '',
      'سيريال الشاشة': a.screen_sn || '',
      'قطاع الصناعة': a.industry || '',
      'تصنيف الأعمال': a.business_category || '',
      'الوصف القديم': a.old_description || '',
      'حالة المطابقة والتأكيد': a.confirmed ? 'تمت المطابقة' : 'بانتظار المطابقة',
      'تاريخ ووقت المطابقة': a.confirmed_at || '',
      'القائم بالمطابقة': a.confirmed_by || '',
      'أصل جديد بالجرد': a.is_new ? 'نعم' : 'لا',
      'كود QR': a.qr_code || '',
      'تاريخ التسجيل': a.created_at || '',
      'ملاحظات': a.notes || a.remarks || ''
    };

    // Include any custom fields dynamically if present
    if (a.custom_data && typeof a.custom_data === 'object') {
      Object.entries(a.custom_data).forEach(([key, val]) => {
        rowObj[`[إضافي] ${key}`] = val || '';
      });
    }

    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-calculate column widths based on header and content lengths
  if (rows.length > 0) {
    const colKeys = Object.keys(rows[0]);
    const colWidths = colKeys.map(key => {
      let maxContentLength = key.length;
      for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const valStr = String(rows[i][key] || '');
        if (valStr.length > maxContentLength) {
          maxContentLength = valStr.length;
        }
      }
      return { wch: Math.min(Math.max(maxContentLength + 4, 12), 45) };
    });
    worksheet['!cols'] = colWidths;
  }

  // Set Right-to-Left (RTL) worksheet view for optimal Arabic Excel display
  worksheet['!views'] = [{ rightToLeft: true }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

  // Trigger file download in browser
  XLSX.writeFile(workbook, fileName);
}

export function downloadAssetTemplate() {
  const templateRows = [
    {
      'كود الأصل': 'EQ00010',
      'إسم الأصل': 'ضاغط غاز تجريبي 250 بار',
      'الفئة': 'الالات والمعدات',
      'المحطة': 'محطة ألماظة',
      'نوع الحصر': 'حصر فعلي',
      'الدفاتر المالية': 'دفتر أصول عامة',
      'المنطقة': 'شرق',
      'المحافظة': 'القاهرة',
      'الكمية': 1,
      'المصنِع': 'Galileo',
      'موديل/نوع': 'MC-250',
      'رقم مسلسل': 'SN-99881',
      'الحالة': 'ممتازة',
      'بند حرج': 'نعم',
      'القدرة/المواصفات': '132 kW',
      'السعة/الحجم': '1200 Nm3/h',
      'الضغط (بار)': '250',
      'السيستم': 'ضغط الغاز CNG',
      'تاريخ التركيب': '2024-01-15',
      'ملاحظات': 'نموذج إدخال'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج إدخال أصول كارجاس');
  XLSX.writeFile(workbook, 'نموذج_إدخال_أصول_كارجاس.xlsx');
}

/**
 * Downloads the standardized "Asset Data Collection Form" (ورقة عمل حصر وجمع بيانات الأصول)
 * Aligned with Financial Books (دفاتر المالية كمرجع معتمد) and Inventories (حصر 2023، 2025، 2026).
 */
export function downloadAssetDataCollectionTemplate() {
  const collectionRows = [
    {
      'م': 1,
      'كود الأصل': 'EQ00001',
      'اسم الأصل / المعدة': 'ضاغط غاز طبيعي رئيسي 250 بار Microbox',
      'الفئة الرئيسية': 'الالات والمعدات',
      'المحطة': 'محطة ألماظة',
      'كود المحطة': 'ALM',
      'مصدر الأصل المعتمد': 'دفاتر المالية (المصدر المعتمد)',
      'الدفاتر المالية': 'دفتر الآلات والمعدات الميكانيكية',
      'حالة الضبط مع دفاتر المالية': 'مطابق ومعتمد بدفاتر المالية',
      'نوع الحصر': 'حصر فعلي وميداني 2026',
      'الكمية بالدفاتر المالية': 1,
      'الكمية بالحصر الفعلي': 1,
      'الشركة المصنعة': 'Galileo Technologies',
      'الموديل / النوع': 'Microbox MC-250',
      'الرقم المسلسل (S/N)': 'GLO-2021-99812',
      'الحالة الفنية': 'ممتازة',
      'بند حرج': 'نعم',
      'المنطقة الجغرافية': 'شرق',
      'المحافظة': 'القاهرة',
      'القدرة / المواصفات الفنية': '132 kW / 380V',
      'السعة / الحجم': '1200 Nm3/h',
      'الضغط (بار)': '250',
      'تاريخ التركيب والتشغيل': '2021-04-15',
      'مركز التكلفة': 'CC-ALM-101',
      'السيستم / المنظومة': 'منظومة ضغط وتموين الغاز CNG',
      'المبنى': 'عنبر الضواغط',
      'عهدة المسؤول': 'م. أحمد محمود التوني',
      'حالة التأكيد والمطابقة': 'تمت المطابقة',
      'القائم بالمطابقة': 'م. أحمد محمود التوني',
      'ملاحظات وتسوية الفروق': 'مطابق لدفاتر المالية وكشف حصر 2026'
    },
    {
      'م': 2,
      'كود الأصل': 'DSP00002',
      'اسم الأصل / المعدة': 'موزع شحن غاز طبيعي مضغوط مزدوج (CNG Dispenser)',
      'الفئة الرئيسية': 'طلمبات التموين والموزعات',
      'المحطة': 'محطة ألماظة',
      'كود المحطة': 'ALM',
      'مصدر الأصل المعتمد': 'حصر 2025',
      'الدفاتر المالية': 'دفتر أصول الآلات والموزعات',
      'حالة الضبط مع دفاتر المالية': 'مطابق ومعتمد بدفاتر المالية',
      'نوع الحصر': 'حصر فعلي وميداني 2026',
      'الكمية بالدفاتر المالية': 2,
      'الكمية بالحصر الفعلي': 2,
      'الشركة المصنعة': 'Aspro S.A.',
      'الموديل / النوع': 'HD-200 Dual Hose',
      'الرقم المسلسل (S/N)': 'ASP-2022-44101',
      'الحالة الفنية': 'ممتازة',
      'بند حرج': 'نعم',
      'المنطقة الجغرافية': 'شرق',
      'المحافظة': 'القاهرة',
      'القدرة / المواصفات الفنية': '70 kg/min High Flow',
      'السعة / الحجم': '2 مسدس NGV1',
      'الضغط (بار)': '200',
      'تاريخ التركيب والتشغيل': '2022-09-10',
      'مركز التكلفة': 'CC-ALM-101',
      'السيستم / المنظومة': 'منظومة التموين الميداني',
      'المبنى': 'المظلة الرئيسية',
      'عهدة المسؤول': 'مشرف الوردية',
      'حالة التأكيد والمطابقة': 'تمت المطابقة',
      'القائم بالمطابقة': 'م. أحمد محمود التوني',
      'ملاحظات وتسوية الفروق': 'تم إدراجه في حصر 2025 وضُبط مع دفتر الموزعات'
    },
    {
      'م': 3,
      'كود الأصل': 'FE00004',
      'اسم الأصل / المعدة': 'طفاية حريق رغوية فوم متطورة 50 لتر',
      'الفئة الرئيسية': 'معدات ووسائل إطفاء',
      'المحطة': 'محطة ألماظة',
      'كود المحطة': 'ALM',
      'مصدر الأصل المعتمد': 'دفاتر المالية (المصدر المعتمد)',
      'الدفاتر المالية': 'دفتر وسائل ومعدات الإطفاء والسلامة',
      'حالة الضبط مع دفاتر المالية': 'مطابق ومعتمد بدفاتر المالية',
      'نوع الحصر': 'حصر فعلي وميداني 2026',
      'الكمية بالدفاتر المالية': 2,
      'الكمية بالحصر الفعلي': 2,
      'الشركة المصنعة': 'Bavaria Egypt',
      'الموديل / النوع': 'Mobile Foam Unit 50L',
      'الرقم المسلسل (S/N)': 'BAV-FM-3301',
      'الحالة الفنية': 'ممتازة',
      'بند حرج': 'نعم',
      'المنطقة الجغرافية': 'شرق',
      'المحافظة': 'القاهرة',
      'القدرة / المواصفات الفنية': '50 لتر فوم AFFF',
      'السعة / الحجم': '50 Liters',
      'الضغط (بار)': '15',
      'تاريخ التركيب والتشغيل': '2023-01-10',
      'مركز التكلفة': 'CC-ALM-101',
      'السيستم / المنظومة': 'منظومة السلامة والصحة المهنية',
      'المبنى': 'منطقة التموين',
      'عهدة المسؤول': 'مسؤول السلامة والصحة المهنية',
      'حالة التأكيد والمطابقة': 'تمت المطابقة',
      'القائم بالمطابقة': 'م. أحمد محمود التوني',
      'ملاحظات وتسوية الفروق': 'مطابق لسجلات الدفاتر المالية وحصر 2023 و2026'
    },
    {
      'م': 4,
      'كود الأصل': 'GEN00007',
      'اسم الأصل / المعدة': 'مولد كهرباء طوارئ ديزل كاتم صوت 150 KVA',
      'الفئة الرئيسية': 'الات اخرى',
      'المحطة': 'محطة ألماظة',
      'كود المحطة': 'ALM',
      'مصدر الأصل المعتمد': 'حصر 2023',
      'الدفاتر المالية': 'دفتر الآلات والمعدات الميكانيكية',
      'حالة الضبط مع دفاتر المالية': 'مقيد بالدفاتر وبانتظار المطابقة',
      'نوع الحصر': 'حصر 2023',
      'الكمية بالدفاتر المالية': 1,
      'الكمية بالحصر الفعلي': 1,
      'الشركة المصنعة': 'Perkins / Stamford',
      'الموديل / النوع': '150 KVA Silent Gen',
      'الرقم المسلسل (S/N)': 'PRK-ST-88120',
      'الحالة الفنية': 'جيدة',
      'بند حرج': 'نعم',
      'المنطقة الجغرافية': 'شرق',
      'المحافظة': 'القاهرة',
      'القدرة / المواصفات الفنية': '150 KVA / 380V',
      'السعة / الحجم': 'Diesel Tank 300L',
      'الضغط (بار)': '-',
      'تاريخ التركيب والتشغيل': '2020-03-12',
      'مركز التكلفة': 'CC-ALM-101',
      'السيستم / المنظومة': 'منظومة القوى والكهرباء البديلة',
      'المبنى': 'غرفة المولدات',
      'عهدة المسؤول': 'مهندس الصيانة المسؤول',
      'حالة التأكيد والمطابقة': 'بانتظار المطابقة',
      'القائم بالمطابقة': '',
      'ملاحظات وتسوية الفروق': 'مقيد بدفاتر المالية وحصر 2023 ويحتاج تأكيد المطابقة الميدانية'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(collectionRows);
  worksheet['!views'] = [{ rightToLeft: true }];
  const colKeys = Object.keys(collectionRows[0]);
  worksheet['!cols'] = colKeys.map(k => ({ wch: Math.min(Math.max(k.length + 4, 14), 40) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'asset data collection form');
  XLSX.writeFile(workbook, 'ورقة_عمل_حصر_وجمع_بيانات_الأصول_Asset_Data_Collection_Form.xlsx');
}

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ') // Remove zero-width & non-breaking spaces
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic Tashkeel / diacritics
    .replace(/[ـ]/g, '') // Remove tatweel
    .replace(/[أإآء]/g, 'ا') // Normalize Alef with Hamza
    .replace(/[ؤئ]/g, 'ي') // Normalize Waw/Yeh with Hamza
    .replace(/ة/g, 'ه') // Normalize Teh Marbuta to Heh
    .replace(/ى/g, 'ي') // Normalize Alef Maqsura to Yeh
    .replace(/[\/\(\)\[\]\-_\:\,\.\#\*\+\؟\?]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ')
    .trim();
}

export async function parseExcelFile(file: File): Promise<{
  headers: string[];
  rows: Record<string, any>[];
  sheetName?: string;
  availableSheets?: string[];
}> {
  if (!file) {
    return Promise.reject(new Error('لم يتم تحديد أي ملف.'));
  }

  if (file.size === 0) {
    return Promise.reject(new Error('الملف المرفوع فارغ (0 بايت).'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength === 0) {
          throw new Error('محتوى الملف فارغ.');
        }

        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('ملف Excel لا يحتوي على أي صفحات عمل صالحة.');
        }

        // Search through all sheets. If a sheet named "asset data collection form" (or variations) exists, prioritize it exclusively!
        let bestSheetName = workbook.SheetNames[0];
        let maxPopulatedCells = 0;
        let bestJsonRows: any[] = [];

        // Check if an explicit "asset data collection form" sheet exists
        const collectionFormSheetName = workbook.SheetNames.find(name => {
          const norm = normalizeArabic(name.toLowerCase());
          return (
            norm.includes('asset data collection form') ||
            norm.includes('asset data collection') ||
            norm.includes('collection form') ||
            norm.includes('ورقه عمل حصر وجمع بيانات الاصول') ||
            norm.includes('ورقه عمل حصر الاصول') ||
            norm.includes('حصر الاصول')
          );
        });

        if (collectionFormSheetName && workbook.Sheets[collectionFormSheetName]) {
          const ws = workbook.Sheets[collectionFormSheetName];
          const sRows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (sRows && sRows.length > 0) {
            bestSheetName = collectionFormSheetName;
            bestJsonRows = sRows;
          }
        }

        // If no collection form sheet or empty, search all sheets for most populated
        if (bestJsonRows.length === 0) {
          for (const sName of workbook.SheetNames) {
            const ws = workbook.Sheets[sName];
            if (!ws) continue;
            const sRows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (!sRows || sRows.length === 0) continue;

            let populatedCount = 0;
            for (const r of sRows) {
              if (Array.isArray(r)) {
                populatedCount += r.filter(c => c !== undefined && c !== null && String(c).trim() !== '').length;
              }
            }

            if (populatedCount > maxPopulatedCells) {
              maxPopulatedCells = populatedCount;
              bestSheetName = sName;
              bestJsonRows = sRows;
            }
          }
        }

        if (bestJsonRows.length === 0) {
          resolve({ headers: [], rows: [], sheetName: bestSheetName, availableSheets: workbook.SheetNames });
          return;
        }

        // Keywords indicating a header row
        const headerKeywords = [
          'كود', 'اصل', 'معده', 'بيان', 'اسم', 'فئه', 'محط', 'كمي', 'مسلسل',
          'سيريال', 'مواصف', 'حال', 'ملاحظ', 'دفتر', 'سجل', 'مورد', 'مصنع', 'موديل',
          'مارك', 'قدر', 'سعه', 'ضغط', 'وحد', 'منظوم', 'سنه', 'تاريخ', 'عهده', 'مسؤول',
          'code', 'name', 'category', 'station', 'qty', 'quantity', 'serial', 'status', 'model', 'notes'
        ];

        let bestHeaderRowIndex = -1;
        let highestScore = -1;

        for (let r = 0; r < Math.min(bestJsonRows.length, 15); r++) {
          const row = bestJsonRows[r];
          if (!Array.isArray(row)) continue;

          const populatedCells = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '');
          const colCount = populatedCells.length;

          if (colCount < 2) continue;

          let keywordHits = 0;
          for (const cell of populatedCells) {
            const norm = normalizeArabic(String(cell));
            const hit = headerKeywords.some(kw => norm.includes(kw));
            if (hit) keywordHits++;
          }

          const score = (keywordHits * 20) + colCount;
          if (score > highestScore) {
            highestScore = score;
            bestHeaderRowIndex = r;
          }
        }

        if (bestHeaderRowIndex === -1) {
          let maxCols = 0;
          bestHeaderRowIndex = 0;
          for (let r = 0; r < Math.min(bestJsonRows.length, 10); r++) {
            const row = bestJsonRows[r];
            if (Array.isArray(row)) {
              const count = row.filter(c => c !== undefined && c !== null && String(c).trim() !== '').length;
              if (count > maxCols) {
                maxCols = count;
                bestHeaderRowIndex = r;
              }
            }
          }
        }

        const rawHeaders = bestJsonRows[bestHeaderRowIndex] as any[];
        if (!Array.isArray(rawHeaders) || rawHeaders.length === 0) {
          resolve({ headers: [], rows: [], sheetName: bestSheetName, availableSheets: workbook.SheetNames });
          return;
        }

        // Check if the next row is a sub-header row
        const nextRow = bestJsonRows[bestHeaderRowIndex + 1];
        let hasSubHeaderRow = false;
        if (Array.isArray(nextRow) && bestHeaderRowIndex + 1 < bestJsonRows.length) {
          let nextRowHits = 0;
          for (const cell of nextRow) {
            if (cell !== undefined && cell !== null) {
              const norm = normalizeArabic(String(cell));
              if (headerKeywords.some(kw => norm.includes(kw))) {
                nextRowHits++;
              }
            }
          }
          if (nextRowHits >= 2) {
            hasSubHeaderRow = true;
          }
        }

        // Find max column count
        let maxColLength = rawHeaders.length;
        for (let r = bestHeaderRowIndex; r < Math.min(bestJsonRows.length, bestHeaderRowIndex + 20); r++) {
          if (Array.isArray(bestJsonRows[r])) {
            maxColLength = Math.max(maxColLength, bestJsonRows[r].length);
          }
        }

        const headerMap: { name: string; colIdx: number }[] = [];
        const seenNames = new Set<string>();
        const headers: string[] = [];

        for (let colIdx = 0; colIdx < maxColLength; colIdx++) {
          let primaryName = String(rawHeaders[colIdx] ?? '').trim();
          let secondaryName = hasSubHeaderRow && Array.isArray(nextRow) ? String(nextRow[colIdx] ?? '').trim() : '';

          let combinedName = '';
          if (primaryName && secondaryName && primaryName !== secondaryName) {
            combinedName = `${primaryName} - ${secondaryName}`;
          } else if (secondaryName && !primaryName) {
            combinedName = secondaryName;
          } else if (primaryName) {
            combinedName = primaryName;
          } else {
            const prevRow = bestHeaderRowIndex > 0 ? bestJsonRows[bestHeaderRowIndex - 1] : null;
            const prevName = Array.isArray(prevRow) ? String(prevRow[colIdx] ?? '').trim() : '';
            combinedName = prevName || `عمود_${colIdx + 1}`;
          }

          combinedName = combinedName.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ').trim();

          let uniqueName = combinedName;
          let counter = 1;
          while (seenNames.has(uniqueName)) {
            counter++;
            uniqueName = `${combinedName}_${counter}`;
          }
          seenNames.add(uniqueName);
          headers.push(uniqueName);
          headerMap.push({ name: uniqueName, colIdx });
        }

        const startDataIndex = bestHeaderRowIndex + (hasSubHeaderRow ? 2 : 1);
        const dataRows = bestJsonRows.slice(startDataIndex);
        const rows = dataRows.map(rowArr => {
          if (!Array.isArray(rowArr)) return null;
          const rowObj: Record<string, any> = {};
          headerMap.forEach(({ name, colIdx }) => {
            const cellVal = rowArr[colIdx];
            rowObj[name] = cellVal !== undefined && cellVal !== null ? String(cellVal).trim() : '';
          });
          return rowObj;
        }).filter((row): row is Record<string, any> => row !== null && Object.values(row).some(v => v !== ''));

        resolve({ headers, rows, sheetName: bestSheetName, availableSheets: workbook.SheetNames });
      } catch (err: any) {
        console.error('Error parsing Excel file:', err);
        reject(new Error(err?.message || 'الملف المرفوع غير صالح أو تالف ولا يمكن قراءته كملف Excel'));
      }
    };

    reader.onerror = () => reject(new Error('تعذر قراءة الملف من المتصفح، يرجى المحاولة مرة أخرى.'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadStationAssetTemplate(
  station?: { id: string; name: string; region?: string; governorate?: string; code?: string } | null
) {
  const safeStation = station || {
    id: 'st-1',
    name: 'محطة ألماظة',
    region: 'شرق',
    governorate: 'القاهرة',
    code: 'ALM'
  };

  const templateRows = [
    {
      'كود الأصل': `${safeStation.code || 'ST'}-EQ001`,
      'اسم الأصل / المعدة': 'ضاغط غاز طبيعي مضغوط CNG',
      'الفئة الرئيسية': 'الالات والمعدات',
      'المحطة': safeStation.name,
      'المنطقة الجغرافية': safeStation.region || 'شرق',
      'المحافظة': safeStation.governorate || 'القاهرة',
      'الكمية': 1,
      'الشركة المصنعة': 'Galileo Technologies',
      'الموديل / النوع': 'Microbox 250',
      'الرقم المسلسل (S/N)': 'SN-GAL-2024-0981',
      'الحالة الفنية': 'ممتازة',
      'بند حرج': 'نعم',
      'نوع الحصر': 'حصر فعلي',
      'الدفاتر المالية': 'دفتر أصول عامة',
      'السيستم / المنظومة': 'منظومة ضغط وتموين الغاز',
      'وحدة المعدة': 'Compressor Skid A',
      'القدرة / المواصفات الفنية': '132 kW / 400V',
      'السعة / الحجم': '1200 Nm3/h',
      'الضغط (بار)': '250',
      'تاريخ التركيب والتشغيل': '2024-01-15',
      'المبنى': 'عنبر الضواغط',
      'الدور': 'أرضي',
      'المكتب / الغرفة': 'غرفة الضواغط 1',
      'عهدة المسؤول': 'مهندس الصيانة المسؤول',
      'ملاحظات': 'أصل تم إدخاله بواسطة نموذج الاستيراد'
    },
    {
      'كود الأصل': `${safeStation.code || 'ST'}-DSP02`,
      'اسم الأصل / المعدة': 'طلمبة تموين غاز CNG مزدوجة',
      'الفئة الرئيسية': 'طلمبات التموين والموزعات',
      'المحطة': safeStation.name,
      'المنطقة الجغرافية': safeStation.region || 'شرق',
      'المحافظة': safeStation.governorate || 'القاهرة',
      'الكمية': 1,
      'الشركة المصنعة': 'Aspro',
      'الموديل / النوع': 'HD-200 Dual',
      'الرقم المسلسل (S/N)': 'SN-ASP-55421',
      'الحالة الفنية': 'جيدة',
      'بند حرج': 'نعم',
      'نوع الحصر': 'حصر فعلي',
      'الدفاتر المالية': 'دفتر أصول عامة',
      'السيستم / المنظومة': 'منظومة التموين',
      'وحدة المعدة': 'Island 2',
      'القدرة / المواصفات الفنية': 'High Flow 70 kg/min',
      'السعة / الحجم': 'Dual Hose NGV1',
      'الضغط (بار)': '200',
      'تاريخ التركيب والتشغيل': '2023-08-20',
      'المبنى': 'المظلة الرئيسية',
      'الدور': 'أرضي',
      'المكتب / الغرفة': 'حارة 2',
      'عهدة المسؤول': 'مشرف الوردية',
      'ملاحظات': 'معايرة دورية صالحة'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  worksheet['!views'] = [{ rightToLeft: true }];
  
  const colKeys = Object.keys(templateRows[0]);
  worksheet['!cols'] = colKeys.map(k => ({ wch: Math.max(k.length + 4, 16) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج أصول المحطة');
  const cleanName = (safeStation.name || 'المحطة').replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(workbook, `نموذج_استيراد_أصول_${cleanName}.xlsx`);
}

// Comprehensive Arabic and English aliases for all standard asset fields
export const ASSET_FIELD_ALIASES: Record<string, string[]> = {
  old_asset_code: ['Old Asse_Code', 'Old Asset_Code', 'كود الأصل القديم', 'كود الاصل القديم', 'old_asset_code', 'Old_Asset_Code', 'Old Code', 'Old Asse Code'],
  old_quantity: ['Old Qty', 'الكمية القديمة', 'كمية قديمة', 'old_qty', 'Old Quantity', 'Old Qty.'],
  old_category: ['Old Asset_Category', 'فئة الأصل القديم', 'فئة الاصل القديم', 'old_category', 'Old Category', 'Old Asset Category'],
  old_description: ['Old Old_Descrip', 'Old Description', 'الوصف القديم', 'البيان القديم', 'التوصيف السابق', 'old_description', 'Old_Description', 'Old Descrip'],
  old_notes: ['Old Notes', 'ملاحظات قديمة', 'old_notes', 'Old_Notes'],
  asset_code: ['كود الأصل', 'كود الاصل', 'كود', 'الكود', 'كود المعدة', 'كود المعده', 'رمز الأصل', 'رقم الأصل', 'رقم الأصل / المعدة', 'Asse_Code', 'Asset Code', 'code', 'asset_code', 'AssetCode', 'Asset_No', 'Item Code'],
  asset_name: ['Asset_Name', 'اسم الأصل / المعدة', 'اسم الأصل', 'إسم الأصل', 'اسم الاصل', 'إسم الاصل', 'الأصل', 'الاصل', 'بيان الأصل', 'بيان الاصل', 'اسم المعدة', 'اسم المعده', 'بيان المعدة', 'بيان المعده', 'توصيف الأصل', 'توصيف المعدة', 'البيان', 'اسم الصنف', 'Asset Name', 'name', 'asset_name', 'AssetName', 'Description', 'Item Description', 'Asset Title'],
  category: ['Asset_Category', 'الفئة الرئيسية', 'الفئة الرئيسيه', 'الفئة', 'الفئه', 'فئة الأصل', 'فئة الاصل', 'تصنيف الأصل', 'تصنيف الاصل', 'نوع المعدة', 'نوع المعده', 'التصنيف', 'Category', 'category', 'Asset Class', 'Class', 'Asset Category'],
  station_name: ['Plant/Unit', 'المحطة', 'المحطه', 'اسم المحطة', 'إسم المحطة', 'اسم المحطه', 'إسم المحطه', 'الموقع', 'موقع', 'محطة', 'محطه', 'اسم الموقع', 'محطة التموين', 'Station', 'station', 'Station Name', 'StationName', 'Location', 'Site', 'Plant', 'Unit'],
  station_id: ['كود المحطة', 'كود المحطه', 'معرف المحطة', 'معرف المحطه', 'رقم المحطة', 'Station ID', 'station_id', 'Station Code', 'station_code'],
  region: ['Area', 'المنطقة الجغرافية', 'المنطقة الجغرافيه', 'المنطقة', 'المنطقه', 'الإقليم', 'الاقليم', 'قطاع', 'القطاع', 'المنطقة التابع لها', 'Region', 'region', 'area', 'Area Zone'],
  governorate: ['المحافظة', 'المحافظه', 'Governorate', 'governorate', 'City', 'المدينة', 'المدينه'],
  section: ['Section', 'القطاع', 'قطاع', 'section', 'القطاع الجغرافي'],
  quantity: ['الكمية', 'الكميه', 'العدد', 'الرصيد', 'كمية الحصر', 'Quantity', 'quantity', 'Qty', 'qty', 'Count', 'Balance'],
  inventory_type: ['نوع الحصر', 'نوع حصر', 'نوع الحصر بالمحطة', 'نوع الحصر بالمحطه', 'حالة الحصر', 'طبيعة الحصر', 'طبيعه الحصر', 'نوع الجرد', 'طريقة الحصر', 'Inventory Type', 'inventory_type', 'InventoryType'],
  financial_book: ['الدفاتر المالية', 'الدفاتر الماليه', 'الدفتر المالي', 'دفاتر مالية', 'دفاتر ماليه', 'الدفتر', 'سجل الأصول', 'سجل الاصول', 'دفتر', 'دفتر مالي', 'كود الدفتر', 'Financial Book', 'financial_book', 'FinancialBook', 'Book'],
  manufacturer: ['Model', 'الشركة المصنعة', 'الشركة المصنعه', 'الشركه المصنعه', 'المصنِع', 'المصنع', 'الشركة', 'الشركه', 'الماركة', 'الماركه', 'المصنعة', 'المصنعه', 'الصانع', 'جهة الصنع', 'ماركة المعدة', 'Manufacturer', 'manufacturer', 'Brand', 'brand', 'Make'],
  model_type: ['Type', 'الموديل / النوع', 'الموديل', 'موديل/نوع', 'موديل / نوع', 'الموديل والنوع', 'الطراز', 'النوع', 'الموديل او النوع', 'الموديل أو النوع', 'نوع الموديل', 'موديل', 'طراز المعدة', 'Model Type', 'model', 'model_type', 'ModelType'],
  model_no: ['Model No', 'Model_No', 'طراز / موديل', 'طراز', 'رقم الموديل', 'موديل رقم', 'model_no', 'ModelNo'],
  serial_no: ['Serial_No', 'الرقم المسلسل (S/N)', 'الرقم المسلسل', 'رقم مسلسل', 'السيريال', 'سيريال', 'رقم الشاسيه', 'مسلسل', 'سيريال نمبر', 'الرقم التسلسلي', 'سيريال الجهاز', 'Serial', 'serial', 'serial_no', 'Serial No', 'SerialNo', 'S/N', 'SN'],
  job_no: ['Job No', 'Job_No', 'رقم أمر الشغل', 'رقم التشغيل', 'أمر الشغل', 'job_no', 'JobNo'],
  condition: ['Condition', 'الحالة الفنية', 'الحالة الفنيه', 'الحالة', 'الحاله', 'حالة الأصل', 'حالة الاصل', 'الحالة التشغيلية', 'الحالة التشغيليه', 'حالة المعدة', 'الكفاءة', 'condition', 'Status'],
  criticality: ['Criticality', 'بند حرج', 'حرج', 'مهم', 'درجة الأهمية', 'أهمية المعدة', 'حرج/غير حرج', 'Critical', 'critical', 'criticality', 'IsCritical'],
  power_specs: ['Power/Specs', 'Power Specs', 'القدرة / المواصفات الفنية', 'القدرة/المواصفات', 'القدرة / المواصفات', 'القدرة/ المواصفات', 'المواصفات الفنية', 'المواصفات الفنيه', 'المواصفات', 'المواصفه', 'القدرة', 'القدره', 'المواصفة الفنية', 'بيانات القدرة', 'القدرة الكهربائية', 'القدرة التشغيلية', 'Power', 'power', 'power_specs', 'Specs', 'specs', 'Specifications'],
  capacity_size: ['Capacity/Size', 'Capacity Size', 'السعة / الحجم', 'السعة/الحجم', 'السعة / المقاس', 'السعة', 'السعه', 'الحجم', 'المقاس', 'سعة المعدة', 'حجم المعدة', 'Capacity', 'capacity', 'capacity_size', 'Size', 'size'],
  dimension: ['Dimention', 'Dimension', 'الأبعاد', 'الابعاد', 'الأبعاد الهندسية', 'المقاسات', 'أبعاد المعدة', 'الطول والعرض والارتفاع', 'dimension', 'dimensions', 'Dimensions'],
  suction: ['Suction', 'الضغط (بار)', 'الضغط', 'ضغط', 'ضغط السحب', 'ضغط الطرد', 'الضغط التشغيلي', 'بار', 'Bar', 'bar', 'suction', 'Pressure', 'pressure'],
  install_date: ['Install_Date', 'Install Date', 'تاريخ التركيب والتشغيل', 'تاريخ التركيب', 'تاريخ التشغيل', 'تاريخ الشراء', 'تاريخ التوريد', 'تاريخ دخول الخدمة', 'تاريخ التركيب/التشغيل', 'تاريخ البدء', 'سنة التركيب', 'سنة التشغيل', 'تاريخ الاستلام', 'install_date', 'InstallationDate', 'CommissioningDate'],
  system: ['System', 'السيستم / المنظومة', 'السيستم / المنظومه', 'السيستم', 'المنظومة', 'المنظومه', 'النظام', 'خط الإنتاج', 'خط الانتاج', 'منظومة التشغيل', 'system'],
  equipment_unit: ['L6 Equipment/Unit', 'Equipment/Unit', 'وحدة المعدة', 'وحدة المعده', 'الوحدة', 'الوحده', 'الوحدة الرئيسية', 'الوحده الرئيسيه', 'Unit', 'unit', 'equipment_unit', 'EquipmentUnit'],
  subunit: ['L7 Subunit', 'Subunit', 'الوحدة الفرعية', 'الوحده الفرعيه', 'وحدة فرعية', 'وحدة فرعيه', 'subunit', 'SubUnit'],
  cost_center: ['Cost_Center', 'Cost Center', 'مركز التكلفة', 'مركز التكلفه', 'مركز تكلفة', 'مركز تكلفه', 'كود مركز التكلفة', 'cost_center', 'CostCenter'],
  source: ['Old Source', 'Old_Source', 'مصدر الأصل المعتمد', 'مصدر الأصل', 'مصدر الاصل', 'المصدر المعتمد', 'مصدر الأصل / الحصر', 'المصدر / المورد', 'المصدر', 'المورد', 'جهة الحصر', 'مصدر البيانات', 'Asset Source', 'source', 'Source', 'Data Source'],
  financial_reconciliation: ['مطابقة دفاتر المالية', 'مطابقة الدفاتر المالية', 'حالة الضبط مع دفاتر المالية', 'ضبط دفاتر المالية', 'حالة المطابقة مع دفاتر المالية', 'مطابق للدفاتر المالية', 'حالة المطابقة والتسوية', 'Financial Reconciliation', 'financial_reconciliation', 'Reconciliation'],
  financial_qty: ['الكمية بالدفاتر المالية', 'كمية دفاتر المالية', 'الكمية الدفترية', 'كمية الدفاتر المالية', 'كمية الدفتر المالي', 'Financial Qty', 'financial_qty', 'Book Qty'],
  component_maintainable: ['Component/Maintainable Item', 'مكون قابل للصيانة', 'مكون قابل للصيانه', 'قابل للصيانة', 'قابل للصيانه', 'مكون صيانة', 'Maintainable', 'component_maintainable', 'Maintainable Item'],
  part: ['L9 Part', 'القطعة', 'القطعه', 'الجزء', 'القطعة / الجزء', 'رقم القطعة', 'Part', 'part'],
  frame_shape: ['Frame/Shape', 'Frame Shape', 'شكل الشاسيه', 'الشكل', 'شاسيه', 'شكل الهيكل', 'frame_shape', 'FrameShape'],
  building_no: ['Building_No', 'Building No', 'المبنى', 'المبني', 'إسم المبنى', 'اسم المبنى', 'اسم المبني', 'رقم المبنى', 'رقم المبني', 'المبنى / العنبر', 'العنبر', 'Building', 'building', 'building_no'],
  floor_no: ['Floor_No', 'Floor No', 'الدور', 'رقم الدور', 'الطابق', 'رقم الطابق', 'Floor', 'floor', 'floor_no'],
  office_no: ['Office_No', 'Office No', 'المكتب / الغرفة', 'المكتب / الغرفه', 'المكتب', 'الغرفة', 'الغرفه', 'رقم المكتب', 'رقم الغرفة', 'الحجرة', 'Office', 'office', 'office_no', 'Room'],
  assigned_to: ['Assigned to', 'Assigned_to', 'عهدة المسؤول', 'عهدة', 'عهده', 'المسؤول', 'المسئول', 'العهدة', 'العهده', 'المستلم', 'الموظف المسؤول', 'باسم', 'عهدة من', 'اسم المستلم', 'المسؤول المباشر', 'Assigned To', 'assigned_to', 'AssignedTo', 'Custodian'],
  screen_sn: ['Screen S/N', 'Screen SN', 'Screen_SN', 'سيريال الشاشة', 'سيريال الشاشه', 'مسلسل الشاشة', 'مسلسل الشاشه', 'سيريال شاشة', 'screen_sn', 'ScreenSN'],
  industry: ['L1 Industry ess', 'قطاع الصناعة', 'قطاع الصناعه', 'الصناعة', 'الصناعه', 'نوع الصناعة', 'القطاع الصناعي', 'Industry', 'industry'],
  business_category: ['L2 Category', 'تصنيف الأعمال', 'فئة الأعمال', 'فئة الاعمال', 'نوع النشاط', 'نشاط الأعمال', 'Business Category', 'business_category', 'BusinessCategory'],
  installation: ['L3 Installation', 'المحطة / التثبيت', 'التثبيت', 'installation'],
  photo_ref: ['Photo_Ref', 'Photo Ref', 'صورة الأصل', 'صورة', 'مرجع الصورة', 'photo_ref', 'Photo'],
  gps: ['GPS', 'إحداثيات GPS', 'الموقع الجغرافي', 'gps', 'Coordinates'],
  inspector: ['Inspector', 'الفاحص', 'القائم بالمطابقة', 'المراجع', 'inspector'],
  notes: ['Old Notes', 'ملاحظات', 'الملاحظات', 'ملاحظات عامة', 'ملاحظات هامة', 'Notes', 'notes'],
  remarks: ['Remarks', 'ملاحظات إضافية', 'ملاحظات اضافية', 'ملاحظات اضافيه', 'تعليقات', 'Additional Remarks', 'remarks'],
  confirmed: ['حالة المطابقة والتأكيد', 'حالة المطابقة', 'تم التأكيد', 'تم التاكيد', 'مؤكد', 'تم الجرد', 'المطابقة', 'المطابقه', 'حالة الجرد', 'Confirmed', 'confirmed', 'Audit Status'],
  confirmed_at: ['تاريخ ووقت المطابقة', 'تاريخ المطابقة', 'تاريخ التأكيد', 'تاريخ التاكيد', 'Confirmed At', 'confirmed_at'],
  confirmed_by: ['القائم بالمطابقة', 'تم التأكيد بواسطة', 'المعتمد', 'القائم بالجرد', 'المراجع', 'Confirmed By', 'confirmed_by']
};

// Exclusion patterns to prevent wrong matches on composite headers (e.g. 'كود المحطة' must not match 'asset_code')
const FIELD_NEGATIVE_MATCHES: Record<string, string[]> = {
  asset_code: ['محط', 'دفتر', 'سجل', 'مركز', 'حساب', 'station'],
  asset_name: ['محط', 'مدير', 'مسؤول', 'مسئول', 'مورد', 'مصنع', 'station', 'manager'],
  station_id: ['معد', 'اصل', 'صنف', 'asset', 'item'],
  station_name: ['معد', 'اصل', 'صنف', 'مدير', 'مسؤول', 'مسئول', 'asset', 'item'],
  category: ['حصر', 'تاريخ', 'دفتر'],
  model_type: ['حصر', 'محط']
};

/**
 * Robust extraction of a field value from an Excel row object
 * Uses direct key, aliases, normalized Arabic matching, and token-based word boundaries
 */
export function extractFieldValue(
  row: Record<string, any>,
  fieldKey: string,
  consumedKeys?: Set<string>
): string {
  if (!row) return '';
  const aliases = [fieldKey, ...(ASSET_FIELD_ALIASES[fieldKey] || [])];
  const negativeWords = FIELD_NEGATIVE_MATCHES[fieldKey] || [];
  
  // 1. Direct exact match
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null) {
      const val = String(row[alias]).trim();
      if (val !== '') {
        if (consumedKeys) consumedKeys.add(alias);
        return val;
      }
    }
  }

  // 2. Normalized exact match
  const rowKeys = Object.keys(row);
  const normalizedRowKeys = rowKeys.map(k => ({ original: k, norm: normalizeArabic(k) }));

  for (const alias of aliases) {
    const normAlias = normalizeArabic(alias);
    if (!normAlias) continue;
    
    // Look for exact normalized match
    const exactMatch = normalizedRowKeys.find(item => {
      if (consumedKeys && consumedKeys.has(item.original)) return false;
      return item.norm === normAlias;
    });

    if (exactMatch && row[exactMatch.original] !== undefined && row[exactMatch.original] !== null) {
      const val = String(row[exactMatch.original]).trim();
      if (val !== '') {
        if (consumedKeys) consumedKeys.add(exactMatch.original);
        return val;
      }
    }
  }

  // 3. Word token boundary match (e.g. 'اسم الأصل / المعدة' splitting into ['اسم الاصل', 'المعده'])
  for (const alias of aliases) {
    const normAlias = normalizeArabic(alias);
    if (!normAlias || normAlias.length < 3) continue;

    for (const item of normalizedRowKeys) {
      if (consumedKeys && consumedKeys.has(item.original)) continue;

      // Check negative exclusions
      if (negativeWords.some(nw => item.norm.includes(nw))) continue;

      // Check tokens
      const tokens = item.norm.split(/\s+/);
      const aliasTokens = normAlias.split(/\s+/);

      // If all tokens of alias are in row header tokens
      const allTokensPresent = aliasTokens.every(at => tokens.includes(at));
      if (allTokensPresent) {
        const val = String(row[item.original]).trim();
        if (val !== '') {
          if (consumedKeys) consumedKeys.add(item.original);
          return val;
        }
      }
    }
  }

  // 4. Substring match (with negative match safety)
  for (const alias of aliases) {
    const normAlias = normalizeArabic(alias);
    if (!normAlias || normAlias.length < 4) continue;

    for (const item of normalizedRowKeys) {
      if (consumedKeys && consumedKeys.has(item.original)) continue;

      // Check negative exclusions
      if (negativeWords.some(nw => item.norm.includes(nw))) continue;

      if (item.norm.includes(normAlias) || (normAlias.length >= 6 && normAlias.includes(item.norm))) {
        const val = String(row[item.original]).trim();
        if (val !== '') {
          if (consumedKeys) consumedKeys.add(item.original);
          return val;
        }
      }
    }
  }

  return '';
}

export function mapRowsToStationAssets(
  rows: Record<string, any>[],
  station?: { id: string; name: string; region?: string; governorate?: string; code?: string } | null,
  options: { defaultConfirmed?: boolean; confirmedBy?: string } = {}
): Omit<Asset, 'id' | 'created_at'>[] {
  const safeStation = station || {
    id: 'st-1',
    name: 'محطة ألماظة',
    region: 'شرق',
    governorate: 'القاهرة',
    code: 'ALM'
  };

  return rows.map((row, idx) => {
    // Keep track of keys used for standard fields
    const consumedKeys = new Set<string>();

    const getVal = (fieldKey: string): string => {
      return extractFieldValue(row, fieldKey, consumedKeys);
    };

    let assetCode = getVal('asset_code');
    if (!assetCode) {
      // Look for any key in row containing 'كود' or 'رمز'
      for (const [k, v] of Object.entries(row)) {
        const normK = normalizeArabic(k);
        if ((normK.includes('كود') || normK.includes('رمز') || normK.includes('باركود')) && !normK.includes('محط')) {
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            assetCode = String(v).trim();
            consumedKeys.add(k);
            break;
          }
        }
      }
    }
    if (!assetCode) {
      assetCode = `${safeStation.code || 'AST'}-${Date.now().toString().slice(-4)}${idx + 1}`;
    }

    let assetName = getVal('asset_name') || getVal('old_description');
    if (!assetName) {
      // Look for any key containing 'بيان' or 'اسم' or 'توصيف' or 'معد' or 'صنف'
      for (const [k, v] of Object.entries(row)) {
        const normK = normalizeArabic(k);
        if ((normK.includes('اسم') || normK.includes('بيان') || normK.includes('توصيف') || normK.includes('معد') || normK.includes('صنف')) && !normK.includes('محط') && !normK.includes('مسؤول') && !normK.includes('مدير')) {
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            assetName = String(v).trim();
            consumedKeys.add(k);
            break;
          }
        }
      }
    }
    if (!assetName) {
      assetName = `أصل مستورد #${idx + 1}`;
    }

    const category = getVal('category') || 'الالات والمعدات';
    const rawQuantity = getVal('quantity');
    const quantity = rawQuantity ? parseInt(rawQuantity, 10) || 1 : 1;

    const conditionRaw = getVal('condition');
    let condition: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'كهنة/تالفة' = 'جيدة';
    if (conditionRaw.includes('ممتاز')) condition = 'ممتازة';
    else if (conditionRaw.includes('صيان') || conditionRaw.includes('عطل')) condition = 'تحتاج صيانة';
    else if (conditionRaw.includes('تالف') || conditionRaw.includes('كهن')) condition = 'كهنة/تالفة';

    const criticalityRaw = getVal('criticality');
    const criticality: 'نعم' | 'لا' = (criticalityRaw === 'نعم' || criticalityRaw.toLowerCase() === 'yes' || criticalityRaw === '1') ? 'نعم' : 'لا';

    const isConfirmedInRow = getVal('confirmed');
    const confirmed = options.defaultConfirmed !== undefined 
      ? options.defaultConfirmed 
      : (isConfirmedInRow === 'نعم' || isConfirmedInRow.includes('تمت') || isConfirmedInRow.toLowerCase() === 'yes');

    // Extract all other standard fields
    const inventory_type = getVal('inventory_type') || 'حصر فعلي';
    const financial_book = getVal('financial_book') || 'دفتر أصول عامة';
    const manufacturer = getVal('manufacturer');
    const model_type = getVal('model_type');
    const serial_no = getVal('serial_no');
    const system = getVal('system');
    const equipment_unit = getVal('equipment_unit');
    const subunit = getVal('subunit');
    const power_specs = getVal('power_specs');
    const capacity_size = getVal('capacity_size');
    const dimension = getVal('dimension');
    const suction = getVal('suction');
    const install_date = getVal('install_date');
    const cost_center = getVal('cost_center');
    const source = getVal('source');
    const component_maintainable = getVal('component_maintainable');
    const part = getVal('part');
    const frame_shape = getVal('frame_shape');
    const building_no = getVal('building_no');
    const floor_no = getVal('floor_no');
    const office_no = getVal('office_no');
    const assigned_to = getVal('assigned_to');
    const screen_sn = getVal('screen_sn');
    const industry = getVal('industry');
    const business_category = getVal('business_category');
    const old_description = getVal('old_description');
    const notes = getVal('notes');
    const remarks = getVal('remarks');

    // Also look for station and geo if specified in row
    const rowStationName = getVal('station_name');
    const rowRegion = getVal('region');
    const rowGov = getVal('governorate');

    // Capture ALL row columns into custom_data to guarantee no data loss
    const custom_data: Record<string, string> = {};
    for (const [key, val] of Object.entries(row)) {
      if (key === 'م' || key === '#' || key.startsWith('__')) continue;
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        custom_data[key.trim()] = String(val).trim();
      }
    }

    return {
      asset_code: assetCode,
      asset_name: assetName,
      category,
      station_id: safeStation.id,
      station_name: rowStationName || safeStation.name,
      region: rowRegion || safeStation.region || 'شرق',
      governorate: rowGov || safeStation.governorate || 'القاهرة',
      inventory_type,
      financial_book,
      quantity,
      manufacturer,
      model_type,
      serial_no,
      condition,
      criticality,
      system,
      equipment_unit,
      subunit,
      power_specs,
      capacity_size,
      dimension,
      suction,
      install_date,
      cost_center,
      source,
      component_maintainable,
      part,
      frame_shape,
      building_no,
      floor_no,
      office_no,
      assigned_to,
      screen_sn,
      industry,
      business_category,
      old_description,
      notes,
      remarks,
      confirmed,
      confirmed_at: confirmed ? (getVal('confirmed_at') || new Date().toLocaleString('ar-EG')) : undefined,
      confirmed_by: confirmed ? (getVal('confirmed_by') || options.confirmedBy || 'مدير المحطة') : undefined,
      custom_data: Object.keys(custom_data).length > 0 ? custom_data : undefined,
      is_new: true
    };
  });
}

export function exportStationsToExcel(
  stations: any[],
  assets: any[],
  fileName = 'cargas_stations.xlsx'
) {
  const rows = stations.map((st, idx) => {
    const stAssets = assets.filter(a => a.station_id === st.id || a.station_name === st.name);
    const confirmedCount = stAssets.filter(a => a.confirmed).length;
    return {
      'م': idx + 1,
      'كود المحطة': st.code || '',
      'اسم المحطة': st.name || '',
      'المنطقة': st.region || '',
      'المحافظة': st.governorate || '',
      'مدير المحطة': st.manager_name || 'غير محدد',
      'إجمالي الأصول': stAssets.length,
      'الأصول المطابقة': confirmedCount,
      'نسبة المطابقة': stAssets.length > 0 ? `${Math.round((confirmedCount / stAssets.length) * 100)}%` : '0%',
      'حالة المحطة': st.status || 'نشطة'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!views'] = [{ rightToLeft: true }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'محطات كارجاس');
  XLSX.writeFile(workbook, fileName);
}

export function extractStationsFromRows(
  rows: Record<string, any>[],
  existingStations: any[] = []
): {
  code: string;
  name: string;
  region: string;
  governorate: string;
  assetCount: number;
  alreadyExists: boolean;
}[] {
  const existingNames = new Set(existingStations.map(s => normalizeArabic(s.name)));
  const stationMap = new Map<string, {
    originalName: string;
    code?: string;
    region?: string;
    governorate?: string;
    count: number;
  }>();

  for (const row of rows) {
    const stName = extractFieldValue(row, 'station_name');
    if (!stName || stName.trim() === '') continue;

    const norm = normalizeArabic(stName);
    const existing = stationMap.get(norm);
    const stCode = extractFieldValue(row, 'station_id') || extractFieldValue(row, 'station_code');
    const region = extractFieldValue(row, 'region');
    const gov = extractFieldValue(row, 'governorate');

    if (existing) {
      existing.count++;
      if (!existing.code && stCode) existing.code = stCode;
      if (!existing.region && region) existing.region = region;
      if (!existing.governorate && gov) existing.governorate = gov;
    } else {
      stationMap.set(norm, {
        originalName: stName.trim(),
        code: stCode,
        region,
        governorate: gov,
        count: 1
      });
    }
  }

  return Array.from(stationMap.entries()).map(([norm, data], idx) => {
    const alreadyExists = existingNames.has(norm);
    const code = data.code || `ST-${String(existingStations.length + idx + 1).padStart(3, '0')}`;
    return {
      code,
      name: data.originalName,
      region: data.region || 'شرق',
      governorate: data.governorate || 'القاهرة',
      assetCount: data.count,
      alreadyExists
    };
  });
}

/**
 * Discovers all column keys (standard or custom) that have non-empty data in the provided assets
 */
export function discoverPopulatedColumns(assets: (Asset | Omit<Asset, 'id' | 'created_at'>)[]): {
  populatedStandardKeys: Set<string>;
  discoveredCustomColumns: { key: string; label: string }[];
} {
  const populatedStandardKeys = new Set<string>();
  const customColumnsMap = new Map<string, string>();

  for (const asset of assets) {
    if (!asset) continue;

    // Check standard properties
    const standardFields: (keyof typeof ASSET_FIELD_ALIASES)[] = [
      'asset_code', 'asset_name', 'category', 'station_name', 'region', 'governorate',
      'quantity', 'inventory_type', 'financial_book', 'manufacturer', 'model_type',
      'serial_no', 'condition', 'criticality', 'power_specs', 'capacity_size',
      'dimension', 'suction', 'install_date', 'system', 'equipment_unit', 'subunit',
      'cost_center', 'source', 'component_maintainable', 'part', 'frame_shape',
      'building_no', 'floor_no', 'office_no', 'assigned_to', 'screen_sn', 'industry',
      'business_category', 'old_description', 'notes', 'remarks'
    ];

    for (const key of standardFields) {
      const val = (asset as any)[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        populatedStandardKeys.add(key);
      }
    }

    // Check custom_data
    if (asset.custom_data && typeof asset.custom_data === 'object') {
      for (const [cKey, cVal] of Object.entries(asset.custom_data)) {
        if (cVal !== undefined && cVal !== null && String(cVal).trim() !== '') {
          customColumnsMap.set(cKey, cKey);
        }
      }
    }
  }

  const discoveredCustomColumns = Array.from(customColumnsMap.entries()).map(([key, label]) => ({
    key,
    label
  }));

  return { populatedStandardKeys, discoveredCustomColumns };
}

export function exportAuditLogsToExcel(
  logs: AuditLogEntry[],
  fileName = 'cargas_audit_log.xlsx',
  sheetName = 'سجل العمليات'
) {
  if (!logs || logs.length === 0) {
    throw new Error('لا توجد سجلات عمليات لتصديرها');
  }

  const rows = logs.map((log, index) => {
    const changesSummary = log.changes && log.changes.length > 0
      ? log.changes.map(c => `${c.field_label}: [${c.old_value} ➔ ${c.new_value}]`).join(' | ')
      : '';

    return {
      'م': index + 1,
      'معرف السجل': log.id,
      'التاريخ والوقت': log.date_formatted,
      'اسم المستخدم': log.user_name,
      'دور وصلاحية المستخدم': log.user_role === 'admin' ? 'مدير النظام' : 'مدير محطة',
      'نوع التعديل': log.action_label,
      'كود الأصل': log.asset_code || '-',
      'اسم الأصل / المعدة': log.asset_name || '-',
      'المحطة': log.station_name || '-',
      'الفئة': log.category || '-',
      'ملخص العملية': log.description,
      'تفاصيل الحقول المعدلة': changesSummary,
      'ملاحظات إضافية': log.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set RTL and column widths
  worksheet['!views'] = [{ RTL: true }];
  worksheet['!cols'] = [
    { wch: 6 },  // م
    { wch: 14 }, // معرف السجل
    { wch: 22 }, // التاريخ والوقت
    { wch: 20 }, // اسم المستخدم
    { wch: 18 }, // دور المستخدم
    { wch: 20 }, // نوع التعديل
    { wch: 14 }, // كود الأصل
    { wch: 30 }, // اسم الأصل
    { wch: 18 }, // المحطة
    { wch: 18 }, // الفئة
    { wch: 45 }, // ملخص العملية
    { wch: 50 }, // تفاصيل الحقول المعدلة
    { wch: 30 }  // ملاحظات
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}

