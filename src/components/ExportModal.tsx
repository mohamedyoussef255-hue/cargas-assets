import React, { useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { Download, Printer, X, Check, Loader2, Sparkles, FileImage } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRef: React.RefObject<HTMLDivElement | null>;
  documentTitle: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  targetRef,
  documentTitle,
}) => {
  const [exporting, setExporting] = useState(false);
  const [resolution, setResolution] = useState<'standard' | 'high' | 'ultra'>('high');
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPixelRatio = () => {
    switch (resolution) {
      case 'standard':
        return 1.5;
      case 'ultra':
        return 3; // 300 DPI ultra print quality
      case 'high':
      default:
        return 2; // Crisp 200 DPI
    }
  };

  const handleDownloadImage = async () => {
    if (!targetRef.current) return;
    setExporting(true);
    setSuccessMessage(null);

    try {
      const node = targetRef.current;
      const pixelRatio = getPixelRatio();

      let dataUrl: string;
      if (format === 'jpeg') {
        dataUrl = await toJpeg(node, {
          quality: 0.96,
          pixelRatio,
          backgroundColor: '#ffffff',
        });
      } else {
        dataUrl = await toPng(node, {
          pixelRatio,
          backgroundColor: '#ffffff',
        });
      }

      const link = document.createElement('a');
      const sanitizedTitle = (documentTitle || 'coloring_page')
        .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')
        .toLowerCase();
      link.download = `${sanitizedTitle}_frame.${format}`;
      link.href = dataUrl;
      link.click();

      setSuccessMessage('تم تصدير ورقة التلوين بنجاح!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Failed to export coloring sheet image:', err);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      dir="rtl"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                تصدير وطباعة ورقة التلوين
              </h3>
              <p className="text-xs text-slate-500">
                جاهزة للطباعة أو النشر بدقة 300 DPI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Resolution Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              دقة وجودة الصورة (Resolution)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResolution('standard')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  resolution === 'standard'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>قياسية</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">150 DPI</div>
              </button>

              <button
                type="button"
                onClick={() => setResolution('high')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  resolution === 'high'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>عالية (موصى به)</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">200 DPI</div>
              </button>

              <button
                type="button"
                onClick={() => setResolution('ultra')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                  resolution === 'ultra'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-2 ring-cyan-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>فائقة للطباعة</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">300 DPI Ultra</div>
              </button>
            </div>
          </div>

          {/* Format Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">صيغة الملف (Format)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  format === 'png'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                PNG (أعلى وضوح للخطوط)
              </button>
              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                  format === 'jpeg'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 ring-1 ring-cyan-500'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                JPEG (حجم ملف أصغر)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-extrabold shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تجهيز الصورة بجودة عالية...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل الصورة (Download Image)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>طباعة مباشرة (Direct Print A4 / Letter)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
