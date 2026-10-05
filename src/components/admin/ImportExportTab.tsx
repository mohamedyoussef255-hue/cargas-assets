import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Download,
  Factory,
  FileSpreadsheet,
  FileUp,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { downloadAssetDataCollectionTemplate, downloadAssetTemplate, exportAssetsToExcel, parseExcelFile, ASSET_FIELD_ALIASES, extractFieldValue, normalizeArabic } from '../../utils/excelUtils';

export const ImportExportTab: React.FC = () => {
  const { assets, stations, bulkImportAssets, addStation, currentUser } = useCargas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [targetStationMode, setTargetStationMode] = useState<'all_stations' | 'fixed_station'>('all_stations');
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || '');

  // Strict check: Only Admin (System Manager: Mohamed Abdelrahman) can import Excel
  const canImport = currentUser.role === 'admin' || currentUser.role === 'system_manager';

  if (!canImport) {
    return (
      <div className="p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          صلاحية استيراد Excel مقتصرة حصرياً على مدير النظام: محمد عبد الرحمن
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          وفقاً لسياسات المنظومة، فإن مدير النظام (محمد عبد الرحمن) هو المخول بالتحكم في استيراد ملفات وجداول Excel لكافة المحطات. 
          بصفتك مستخدم محطة، يتاح لك تصدير تقارير Excel للمحطة، ويمكنك التواصل الفوري مع مدير النظام عبر الشات المباشر.
        </p>
      </div>
    );
  }

  // Helper to extract station name from a row using various possible headers
  const getStationNameFromRow = (row: any): string => {
    const possibleKeys = [
      'المحطة',
      'اسم المحطة',
      'اسم محطة',
      'محطة',
      'الموقع',
      'اسم الموقع',
      'Station',
      'Station Name',
      'station_name',
      'station',
      'كود المحطة',
      'Station Code'
    ];
    for (const k of possibleKeys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
    }
    return '';
  };

  // Analyze parsed rows to detect unique stations present in the file
  const detectedStationsSummary = useMemo(() => {
    if (parsedRows.length === 0) return [];
    const map = new Map<string, number>();
    for (const row of parsedRows) {
      const stName = getStationNameFromRow(row) || 'محطة غير محددة بالملف';
      map.set(stName, (map.get(stName) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [parsedRows]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setSuccessMessage('');
    setErrorMessage('');
    setFileName(file.name);

    try {
      const { headers, rows } = await parseExcelFile(file);
      if (!rows || rows.length === 0) {
        setErrorMessage('الملف لا يحتوي على صفوف بيانات صالحة. يرجى التأكد من أن ورقة العمل تحتوي على بيانات بعد صف العناوين.');
        setParsedHeaders([]);
        setParsedRows([]);
      } else {
        setParsedHeaders(headers);
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error('Error parsing Excel file:', err);
      setErrorMessage(err?.message || 'حدث خطأ أثناء قراءة ملف Excel، يرجى التأكد من صحة تنسيق الملف.');
      setParsedHeaders([]);
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        const defaultStation = stations[0] || {
          id: 'st-1',
          name: 'محطة ألماظة',
          code: 'ALM',
          region: 'شرق',
          governorate: 'القاهرة'
        };

        // Cache existing or newly created stations
        const activeStationsPool = [...stations];

        const importedAssets = parsedRows.map((row, idx) => {
          let matchedStation = defaultStation;
          const consumedKeys = new Set<string>();

          const getVal = (fieldKey: string): string => {
            return extractFieldValue(row, fieldKey, consumedKeys);
          };

          if (targetStationMode === 'fixed_station') {
            matchedStation = stations.find(s => s.id === selectedStationId) || defaultStation;
          } else {
            // "all_stations" mode: automatically match by name or code, and create if new!
            const rawStName = getVal('station_name') || getStationNameFromRow(row);
            if (rawStName) {
              const cleanRaw = rawStName.replace(/^محطة\s+/, '').trim().toLowerCase();
              const existing = activeStationsPool.find(s =>
                s.name.trim().toLowerCase() === rawStName.toLowerCase() ||
                s.name.replace(/^محطة\s+/, '').trim().toLowerCase() === cleanRaw ||
                (s.code && s.code.trim().toLowerCase() === rawStName.toLowerCase())
              );

              if (existing) {
                matchedStation = existing;
              } else {
                // Auto-create station so all stations in the file are imported cleanly!
                const formattedName = rawStName.startsWith('محطة') ? rawStName : `محطة ${rawStName}`;
                const genCode = `ST-${(activeStationsPool.length + 1).toString().padStart(2, '0')}`;
                const newSt = addStation({
                  name: formattedName,
                  code: genCode,
                  region: getVal('region') || 'المركز الرئيسي',
                  governorate: getVal('governorate') || 'القاهرة',
                  status: 'active',
                  manager_name: getVal('مدير المحطة') || 'مسؤول المحطة'
                });
                activeStationsPool.push(newSt);
                matchedStation = newSt;
              }
            } else {
              matchedStation = defaultStation;
            }
          }

          let assetCode = getVal('asset_code');
          if (!assetCode) {
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
            assetCode = `${matchedStation.code || 'AS'}${Date.now().toString().slice(-4)}-${idx + 1}`;
          }

          let assetName = getVal('asset_name') || getVal('old_description');
          if (!assetName) {
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
          const region = matchedStation.region || getVal('region') || 'شرق';
          const governorate = matchedStation.governorate || getVal('governorate') || 'القاهرة';

          const rawQty = getVal('quantity');
          const quantity = rawQty ? (parseInt(rawQty, 10) || 1) : 1;

          const inventoryType = getVal('inventory_type') || 'حصر فعلي';
          const financialBook = getVal('financial_book') || 'دفتر أصول عامة';
          const manufacturer = getVal('manufacturer');
          const modelType = getVal('model_type');
          const serialNo = getVal('serial_no');

          const conditionRaw = getVal('condition');
          let condition: 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | 'كهنة/تالفة' = 'جيدة';
          if (conditionRaw.includes('ممتاز')) condition = 'ممتازة';
          else if (conditionRaw.includes('صيان') || conditionRaw.includes('عطل')) condition = 'تحتاج صيانة';
          else if (conditionRaw.includes('تالف') || conditionRaw.includes('كهن')) condition = 'كهنة/تالفة';

          const criticalityRaw = getVal('criticality');
          const criticality: 'نعم' | 'لا' = (criticalityRaw === 'نعم' || criticalityRaw.toLowerCase() === 'yes' || criticalityRaw === '1') ? 'نعم' : 'لا';

          const powerSpecs = getVal('power_specs');
          const capacitySize = getVal('capacity_size');
          const dimension = getVal('dimension');
          const suction = getVal('suction');
          const system = getVal('system');
          const equipmentUnit = getVal('equipment_unit');
          const subunit = getVal('subunit');
          const costCenter = getVal('cost_center');
          const source = getVal('source');
          const componentMaintainable = getVal('component_maintainable');
          const part = getVal('part');
          const frameShape = getVal('frame_shape');
          const screenSn = getVal('screen_sn');
          const buildingNo = getVal('building_no');
          const floorNo = getVal('floor_no');
          const officeNo = getVal('office_no');
          const assignedTo = getVal('assigned_to');
          const installDate = getVal('install_date');
          const industry = getVal('industry');
          const businessCategory = getVal('business_category');
          const oldDescription = getVal('old_description');
          const remarks = getVal('remarks');
          const notes = getVal('notes');

          const isConfirmedInRow = getVal('confirmed');
          const confirmed = isConfirmedInRow === 'نعم' || isConfirmedInRow.includes('تمت') || isConfirmedInRow.toLowerCase() === 'yes';
          const confirmedAt = getVal('confirmed_at') || (confirmed ? new Date().toISOString().split('T')[0] : undefined);
          const confirmedBy = getVal('confirmed_by') || (confirmed ? (currentUser?.name || 'مدير النظام') : undefined);

          // Capture ALL row columns into customData to prevent any data loss
          const customData: Record<string, string> = {};
          Object.keys(row).forEach(k => {
            if (k === 'م' || k === '#' || k.startsWith('__')) return;
            const val = row[k];
            if (val !== undefined && val !== null && String(val).trim() !== '') {
              customData[k.trim()] = String(val).trim();
            }
          });

          return {
            asset_code: assetCode,
            asset_name: assetName,
            category,
            station_id: matchedStation.id,
            station_name: matchedStation.name,
            region,
            governorate,
            quantity,
            inventory_type: inventoryType,
            financial_book: financialBook,
            manufacturer,
            model_type: modelType,
            serial_no: serialNo,
            condition,
            criticality,
            power_specs: powerSpecs,
            capacity_size: capacitySize,
            dimension,
            suction,
            system,
            equipment_unit: equipmentUnit,
            subunit,
            cost_center: costCenter,
            source: source || 'دفاتر المالية (المصدر المعتمد)',
            financial_reconciliation: getVal('financial_reconciliation') || (confirmed ? 'مطابق ومعتمد بدفاتر المالية' : 'مقيد بالدفاتر وبانتظار المطابقة'),
            financial_qty: getVal('financial_qty') ? (parseInt(getVal('financial_qty'), 10) || quantity) : quantity,
            component_maintainable: componentMaintainable,
            part,
            frame_shape: frameShape,
            screen_sn: screenSn,
            building_no: buildingNo,
            floor_no: floorNo,
            office_no: officeNo,
            assigned_to: assignedTo,
            install_date: installDate,
            industry,
            business_category: businessCategory,
            old_description: oldDescription,
            remarks,
            notes,
            confirmed,
            confirmed_at: confirmedAt,
            confirmed_by: confirmedBy,
            is_new: true,
            custom_data: Object.keys(customData).length > 0 ? customData : undefined
          };
        });

        const count = bulkImportAssets(importedAssets);
        const uniqueStationsCount = new Set(importedAssets.map(a => a.station_name)).size;

        setSuccessMessage(`تم بنجاح استيراد ${count} أصلاً وتوزيعها على ${uniqueStationsCount} محطة في المنظومة دفعة واحدة مع توليد أكواد QR الفورية!`);
        setParsedRows([]);
        setParsedHeaders([]);
        setFileName('');
      } catch (err: any) {
        console.error('Error in handleConfirmImport:', err);
        setErrorMessage(err?.message || 'حدث خطأ أثناء استيراد الأصول وحفظها.');
      } finally {
        setIsSubmitting(false);
      }
    }, 60);
  };

  return (
    <div className="space-y-6">
      
      {/* 2 Main Action Cards: Export & Bulk Import for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 shadow-2xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">تصدير قاعدة بيانات الأصول</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              تصدير كافة أصول كارجاس ({assets.length} أصل) إلى ملف Excel بصيغة xlsx متضمنة بيانات كافة المحطات وتصنيفات الحصر الفعلي والدفاتر المالية.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => exportAssetsToExcel(assets, 'أصول_كارجاس_الكاملة_كافة_المحطات.xlsx')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
              id="admin-export-all-assets-btn"
            >
              <Download className="w-4 h-4" />
              <span>تصدير كل الأصول إلى Excel ({assets.length} أصل)</span>
            </button>

            <button
              onClick={downloadAssetDataCollectionTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 transition-colors border border-emerald-300 dark:border-emerald-700 shadow-2xs cursor-pointer"
              id="admin-download-collection-form-btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تحميل ورقة عمل حصر وجمع بيانات الأصول (Asset Data Collection Form)</span>
            </button>

            <button
              onClick={downloadAssetTemplate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              id="admin-download-template-btn"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>تحميل نموذج إدخال فارغ (Template لكافة المحطات)</span>
            </button>
          </div>
        </div>

        {/* Bulk Import Card (Exclusive to Admin / General Manager) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              صلاحية الإدارة العامة
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            استيراد ملفات Excel (كافة المحطات دفعة واحدة)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            خاصية استيراد الجداول مخصصة حصرياً لمدير النظام: محمد عبد الرحمن. يسمح البرنامج باستيراد ملف Excel رئيسي يضم جميع المحطات دفعة واحدة مع توزيع تلقائي وتوليد فوري لأكواد QR.
          </p>

          {/* Asset Data Collection Form Standard Note */}
          <div className="mb-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>توافق تام مع ورقة عمل حصر وجمع بيانات الأصول (Asset Data Collection Form):</strong>
              <span className="block mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                يتعرف النظام تلقائياً على ورقة العمل المجمعة لكافة أصول الشركة من <strong>دفاتر المالية، وحصر 2023، وحصر 2025، وحصر 2026</strong>. وتعتبر دفاتر المالية هي المصدر المعتمد للأصول وضبط الكميات والمطابقة الميدانية.
              </span>
            </div>
          </div>

          {/* Station assignment mode selector */}
          <div className="mb-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                طريقة استيراد وتوجيه الأصول:
              </label>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                {targetStationMode === 'all_stations' ? '✓ استيراد شامل لكافة المحطات' : 'محطة مفردة'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <label className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                targetStationMode === 'all_stations'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-semibold'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}>
                <input
                  type="radio"
                  name="st_mode"
                  checked={targetStationMode === 'all_stations'}
                  onChange={() => setTargetStationMode('all_stations')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>استيراد جميع المحطات دفعة واحدة (تلقائياً من عمود المحطة بالملف)</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-700 text-white font-bold">موصى به</span>
                  </div>
                  <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                    يقوم النظام بقراءة أسماء المحطات وتوزيع كل أصل لمحطته تلقائياً، وإنشاء أي محطة جديدة بالملف فورياً.
                  </p>
                </div>
              </label>

              <label className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                targetStationMode === 'fixed_station'
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-semibold'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}>
                <input
                  type="radio"
                  name="st_mode"
                  checked={targetStationMode === 'fixed_station'}
                  onChange={() => setTargetStationMode('fixed_station')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span>إسناد كافة الأصول الواردة بالملف لمحطة محددة فقط</span>
                  {targetStationMode === 'fixed_station' && (
                    <select
                      value={selectedStationId}
                      onChange={(e) => setSelectedStationId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white mt-1.5 font-normal"
                    >
                      {stations.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.region} - {st.governorate})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isProcessing
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/50 cursor-wait'
                : dragActive
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 bg-slate-50/60 dark:bg-slate-800/40'
            }`}
            id="admin-excel-dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileInput}
              disabled={isProcessing}
              className="hidden"
            />
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="w-9 h-9 border-3 border-emerald-300 dark:border-emerald-700 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">جاري قراءة وتحليل ملف Excel وفحص المحطات...</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">يرجى الانتظار بينما يتم تجهيز الأصول وتوزيعها</p>
              </div>
            ) : (
              <>
                <FileUp className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">اسحب وأفلت ملف Excel هنا</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  أو انقر لاختيار الملف من جهازك (.xlsx, .xls, .csv)
                </p>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs font-medium animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Parsed Rows Preview with Multi-Station Detection */}
      {parsedRows.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-200 relative overflow-hidden">
          {/* Active Submitting Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
              <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-700 dark:border-t-emerald-400 rounded-full animate-spin mb-3 shadow-sm" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                جاري استيراد الأصول وتوزيعها على المحطات وتوليد أكواد QR...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                يرجى الانتظار، جاري حفظ البيانات وتحديث دفاتر الحصر وسجل العمليات.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>معاينة البيانات المستوردة من: {fileName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  {parsedRows.length} أصل جاهز
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {targetStationMode === 'all_stations'
                  ? `تم رصد ${detectedStationsSummary.length} محطة مختلفة داخل الملف وسيتم استيرادها جميعاً دفعة واحدة.`
                  : `سيتم إسناد كافة الـ ${parsedRows.length} أصل إلى المحطة المحددة.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setParsedRows([]);
                  setParsedHeaders([]);
                }}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs disabled:opacity-60"
                id="confirm-excel-import-btn"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? 'جاري الحفظ وتوليد الأكواد...'
                    : `تأكيد استيراد كافة المحطات (${parsedRows.length}) أصل`}
                </span>
              </button>
            </div>
          </div>

          {/* Multi-Station Breakdown Pills */}
          {targetStationMode === 'all_stations' && detectedStationsSummary.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  المحطات المكتشفة بالملف والمشمولة بالاستيراد الجماعي ({detectedStationsSummary.length} محطة):
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedStationsSummary.map(st => (
                  <span
                    key={st.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    <span className="font-bold">{st.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                      {st.count} أصل
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl max-h-72">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap text-emerald-800 dark:text-emerald-300">
                    المحطة المستهدفة
                  </th>
                  {parsedHeaders.map(h => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parsedRows.slice(0, 10).map((row, i) => {
                  const detectedSt = targetStationMode === 'fixed_station'
                    ? (stations.find(s => s.id === selectedStationId)?.name || 'المحطة المحددة')
                    : (getStationNameFromRow(row) || 'تلقائي');

                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="py-2 px-3 whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                          {detectedSt}
                        </span>
                      </td>
                      {parsedHeaders.map(h => (
                        <td key={h} className="py-2 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {row[h] !== undefined && row[h] !== null ? String(row[h]) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 10 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              يتم عرض أول 10 سجلات للمعاينة فقط. الاستيراد الفعلي يشمل كافة الـ ({parsedRows.length}) أصلاً.
            </p>
          )}
        </div>
      )}

    </div>
  );
};
