import React from 'react';
import { Download, Printer, ZoomIn, ZoomOut, Maximize2, Sparkles, BookOpen } from 'lucide-react';

interface HeaderNavProps {
  currentPresetId: string;
  onSelectPreset: (id: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onOpenExport: () => void;
  onQuickPrint: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPresetId,
  onSelectPreset,
  zoom,
  onZoomChange,
  onOpenExport,
  onQuickPrint,
}) => {
  return (
    <header
      id="main-app-navbar"
      className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-xs z-30 select-none"
      dir="rtl"
    >
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-extrabold text-slate-900 leading-none">
              صانع إطارات كتب التلوين
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
              Frame Studio
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
            تخصيص كامل للألوان، العناوين، الخطوط، سطور التتبع، والإطارات
          </p>
        </div>
      </div>

      {/* Center: Quick Presets matching user request */}
      <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => onSelectPreset('listen-to-my-heart')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            currentPresetId === 'listen-to-my-heart'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>💙 الطبيب (Listen to My Heart)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset('community-helpers')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            currentPresetId === 'community-helpers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>💜 ساعي البريد (Community Helpers)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPreset('arabic-kindergarten')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            currentPresetId === 'arabic-kindergarten'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>🌱 روضة الأطفال (عربي)</span>
        </button>
      </div>

      {/* Right Controls: Zoom + Print & Export */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-slate-700">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.45, zoom - 0.1))}
            className="p-1.5 hover:bg-white rounded-lg transition-colors"
            title="تصغير المعاينة"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-mono px-2 min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.25, zoom + 0.1))}
            className="p-1.5 hover:bg-white rounded-lg transition-colors"
            title="تكبير المعاينة"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(0.78)}
            className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-slate-800"
            title="ملاءمة الشاشة"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Print Button */}
        <button
          type="button"
          onClick={onQuickPrint}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
          title="طباعة مباشرة"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">طباعة</span>
        </button>

        {/* Export / Download Button */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-cyan-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>تصدير الصورة</span>
        </button>
      </div>
    </header>
  );
};
