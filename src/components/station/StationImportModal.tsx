import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Fuel,
  Info,
  Layers,
  Sparkles,
  UploadCloud,
  X
} from 'lucide-react';
import { Station } from '../../types/cargas';
import { useCargas } from '../../context/CargasContext';
import {
  downloadStationAssetTemplate,
  mapRowsToStationAssets,
  parseExcelFile
} from '../../utils/excelUtils';

interface StationImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
  onImportSuccess?: (count: number) => void;
}

export const StationImportModal: React.FC<StationImportModalProps> = ({
  isOpen,
  onClose,
  station,
  onImportSuccess
}) => {
  const { bulkImportAssets, currentUser } = useCargas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeStation = station || {
    id: 'st-1',
    name: 'محطة ألماظة',
    code: 'ALM',
    region: 'شرق',
    governorate: 'القاهرة'
  };

  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importStatus, setImportStatus] = useState<'pending' | 'confirmed'>('pending');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    try {
      const { headers, rows } = await parseExcelFile(file);
      if (rows.length === 0) {
        setErrorMsg('الملف لا يحتوي على أي صفوف بيانات صالحة. يرجى التأكد من محتوى ورقة العمل.');
        setParsedRows([]);
        setParsedHeaders([]);
      } else {
        setParsedHeaders(headers);
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'حدث خطأ أثناء قراءة ملف Excel، يرجى التأكد من صحة الملف.');
      setParsedRows([]);
      setParsedHeaders([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    // Allow UI to render the loading state before synchronous heavy state update
    setTimeout(() => {
      try {
        const assetsToImport = mapRowsToStationAssets(parsedRows, safeStation, {
          defaultConfirmed: importStatus === 'confirmed',
          confirmedBy: currentUser?.name || 'مدير المحطة'
        });

        const count = bulkImportAssets(assetsToImport);
        
        try {
          if (onImportSuccess) {
            onImportSuccess(count);
          }
        } catch (callbackErr) {
          console.warn('Error in onImportSuccess callback:', callbackErr);
        }

        handleReset();
        onClose();
      } catch (err: any) {
        console.error('Error importing station assets:', err);
        setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ الأصول المستوردة.');
      } finally {
        setIsSubmitting(false);
      }
    }, 60);
  };

  const handleReset = () => {
    setParsedRows([]);
    setParsedHeaders([]);
    setFileName('');
    setFileSize('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    downloadStationAssetTemplate(safeStation);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      id="station-import-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right relative">
        
        {/* Full Modal Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
            <div className="w-14 h-14 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-700 dark:border-t-emerald-400 rounded-full animate-spin mb-4 shadow-md" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              جاري معالجة وحفظ الأصول المستوردة...
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              يتم تسجيل البيانات وتوليد أكواد QR ومطابقتها لمحطة {safeStation.name}. يرجى الانتظار لحظات...
            </p>
          </div>
        )}

        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700/50 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <FileUp className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">استيراد أصول من ملف Excel</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-emerald-200">
                  xlsx / xls
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                تسجيل دفعة أصول ومعدات كبيرة مباشرة إلى {safeStation.name} وتوليد أكواد QR لها تلقائياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Station Target Banner */}
        <div className="px-6 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold">المحطة المستهدفة:</span>
            <span className="font-bold text-emerald-950">{safeStation.name} ({safeStation.code})</span>
            <span className="text-emerald-700 font-normal">• {safeStation.region} / {safeStation.governorate}</span>
          </div>

          <button
            onClick={handleDownloadTemplate}
            id="btn-download-station-template"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/80 border border-emerald-300 shadow-2xs transition-colors"
            title="تحميل نموذج Excel مجهز بمعلومات هذه المحطة"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>تحميل نموذج Excel للمحطة</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-2.5 text-rose-800 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload Zone (If no rows parsed yet) */}
          {parsedRows.length === 0 ? (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isProcessing
                    ? 'border-emerald-500 bg-emerald-50/50 cursor-wait'
                    : dragActive
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/70 bg-white'
                }`}
                id="station-drop-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileInputChange}
                  disabled={isProcessing}
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-3 space-y-3">
                    <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900 mb-1">
                        جاري قراءة وتحليل ملف Excel...
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        يتم الآن فحص العناوين وهيكلة بيانات الأصول لربطها بمحطة {safeStation.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-xs">
                      <UploadCloud className="w-8 h-8" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-1">
                        اضغط لاختيار ملف Excel أو اسحبه وأفلته هنا
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        يدعم ملفات Excel بصيغة xlsx و xls. يتم التعرف التلقائي على الأعمدة باللغتين العربية والإنجليزية.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono">.xlsx</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono">.xls</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono">.csv</span>
                    </div>
                  </>
                )}
              </div>

              {/* Instructions box */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>إرشادات تجهيز ملف Excel:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed pr-1">
                  <li>يمكنك تحميل <strong>نموذج Excel المخصص للمحطة</strong> من الزر بالأعلى واستخدامه مباشرة.</li>
                  <li>الأعمدة الأساسية تشمل: <code>كود الأصل</code>، <code>اسم الأصل / المعدة</code>، <code>الفئة الرئيسية</code>، <code>الشركة المصنعة</code>، <code>الرقم المسلسل</code>، <code>الحالة الفنية</code>.</li>
                  <li>في حال خلو حقل <code>كود الأصل</code>، سيقوم النظام تلقائياً بتوليد كود فريد بناءً على كود المحطة.</li>
                  <li>سيتم إنشاء كود QR فوري لكل أصل مستورد لطباعته وتثبيته على المعدات أثناء الجرد.</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Parsed File Preview & Confirmation */
            <div className="space-y-4">
              
              {/* File Info Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{fileName}</p>
                    <p className="text-[11px] text-emerald-800">
                      تم اكتشاف <strong className="font-mono font-bold text-emerald-950">{parsedRows.length}</strong> أصل جاهز للاستيراد • الحجم: {fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                  >
                    تغيير الملف
                  </button>
                </div>
              </div>

              {/* Import Settings */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <p className="font-bold text-slate-900 text-xs">خيارات استيراد البيانات:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-400 transition-all">
                    <input
                      type="radio"
                      name="importStatus"
                      checked={importStatus === 'pending'}
                      onChange={() => setImportStatus('pending')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">بانتظار التأكيد والمطابقة (موصى به)</p>
                      <p className="text-[10px] text-slate-500">يتطلب من مدير المحطة مراجعة الأصول ومطابقتها ميدانياً</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-400 transition-all">
                    <input
                      type="radio"
                      name="importStatus"
                      checked={importStatus === 'confirmed'}
                      onChange={() => setImportStatus('confirmed')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px]">معتمد ومطابق مسبقاً</p>
                      <p className="text-[10px] text-slate-500">تسجيل الأصول كأنها طوبقت وموثقة في التو واللحظة</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Table Preview (First 5 Rows) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-xs">معاينة أول 5 أصول من الملف:</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    عرض 5 من إجمالي {parsedRows.length}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-right text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center">#</th>
                          <th className="py-2.5 px-3">كود الأصل</th>
                          <th className="py-2.5 px-3">اسم الأصل / المعدة</th>
                          <th className="py-2.5 px-3">الفئة</th>
                          <th className="py-2.5 px-3">المصنع / الموديل</th>
                          <th className="py-2.5 px-3">الرقم المسلسل</th>
                          <th className="py-2.5 px-3">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedRows.slice(0, 5).map((row, idx) => {
                          const code = row['كود الأصل'] || row['كود'] || `${safeStation.code || 'EQ'}-${idx + 1}`;
                          const name = row['اسم الأصل / المعدة'] || row['اسم الأصل'] || row['إسم الأصل'] || row['الأصل'] || 'أصل مستورد';
                          const cat = row['الفئة الرئيسية'] || row['الفئة'] || 'الالات والمعدات';
                          const mfg = row['الشركة المصنعة'] || row['المصنِع'] || row['الموديل / النوع'] || '-';
                          const sn = row['الرقم المسلسل (S/N)'] || row['رقم مسلسل'] || row['السيريال'] || '-';
                          const cond = row['الحالة الفنية'] || row['الحالة'] || 'جيدة';

                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-mono font-bold text-emerald-800">{code}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{name}</td>
                              <td className="py-2 px-3 text-slate-600">{cat}</td>
                              <td className="py-2 px-3 text-slate-600">{mfg}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{sn}</td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">
                                  {cond}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>

          {parsedRows.length > 0 && (
            <button
              onClick={handleExecuteImport}
              disabled={isSubmitting}
              id="station-confirm-import-btn"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {isSubmitting
                  ? 'جاري الاستيراد والتوليد...'
                  : `تأكيد استيراد (${parsedRows.length}) أصل إلى ${safeStation.name}`}
              </span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
