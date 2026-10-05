import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Info,
  Trash2,
  X
} from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  itemDetails?: { label: string; value: React.ReactNode }[];
  changes?: { field_label: string; old_value: any; new_value: any }[];
  confirmButtonDisabled?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  itemDetails,
  changes,
  confirmButtonDisabled = false
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      headerBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50 text-rose-900 dark:text-rose-200',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
      tag: 'إجراء خطير لا يمكن التراجع عنه'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      headerBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 text-amber-950 dark:text-amber-200',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
      tag: 'تعديلات جوهرية على بيانات الأصل'
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      headerBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50 text-blue-950 dark:text-blue-200',
      btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20',
      tag: 'ملاحظة تشغيلية'
    },
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20',
      tag: 'اعتماد ومطابقة'
    }
  }[type];

  const Icon = typeConfig.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      id="confirm-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        id="confirm-dialog-container"
      >
        {/* Header Bar */}
        <div className={`p-5 flex items-start gap-3.5 border-b ${typeConfig.headerBg}`}>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${typeConfig.iconBg} shadow-2xs`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 text-right">
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 mb-1">
              {typeConfig.tag}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details / Changes Section */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3.5">
          
          {/* Key/Value Item Details */}
          {itemDetails && itemDetails.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-700/80 divide-y divide-slate-200/50 dark:divide-slate-700/60 text-xs">
              {itemDetails.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{item.label}:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold text-left">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Changes Comparison */}
          {changes && changes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>التعديلات المطلوب تطبيقها ({changes.length} حقول):</span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  مقارنة القيمة السابقة بالجديدة
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {changes.map((chg, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                      {chg.field_label}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 font-mono">
                        <span className="block text-[9px] text-rose-500 dark:text-rose-400 font-sans font-bold">الحالية:</span>
                        <span className="truncate block" title={String(chg.old_value)}>
                          {chg.old_value || '— (فارغ)'}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-200 font-bold font-mono">
                        <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">الجديدة:</span>
                        <span className="truncate block" title={String(chg.new_value)}>
                          {chg.new_value || '— (فارغ)'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail Guarantee Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>سيتم تسجيل هذه العملية تلقائياً في سجل الرقابة وتوثيق اسم المستخدم والتاريخ.</span>
          </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            id="confirm-dialog-cancel-btn"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmButtonDisabled}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${typeConfig.btnBg} ${
              confirmButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            id="confirm-dialog-confirm-btn"
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};
