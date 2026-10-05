import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Layers,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';

interface DemoDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToUsers?: () => void;
}

export const DemoDataModal: React.FC<DemoDataModalProps> = ({
  isOpen,
  onClose,
  onGoToUsers
}) => {
  const {
    assets,
    stations,
    users,
    clearDemoAssets,
    resetToDefaultData
  } = useCargas();

  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWipeAssets = () => {
    clearDemoAssets();
    setConfirmClear(false);
    setClearedSuccess(true);
    setTimeout(() => {
      setClearedSuccess(false);
    }, 4000);
  };

  const handleResetData = () => {
    resetToDefaultData();
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-white">إدارة والتحكم في البيانات التجريبية</h3>
              <p className="text-[11px] text-slate-300">صلاحية حصرية لمدير النظام (Admin) لتجهيز النظام للتشغيل الفعلي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">الأصول المسجلة</span>
            <span className="text-xl font-extrabold text-emerald-800 font-mono">{assets.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {assets.length === 0 ? 'الجداول نظيفة فارغة' : `${assets.length} أصل في النظام`}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">المحطات المسجلة</span>
            <span className="text-xl font-extrabold text-slate-800 font-mono">{stations.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">محطة كارجاس</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-semibold block">المستخدمون</span>
            <span className="text-xl font-extrabold text-blue-800 font-mono">{users.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">حسابات Gmail</span>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Success Alerts */}
          {clearedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم مسح وتفريغ كافة الأصول التجريبية بنجاح! الجداول أصبحت فارغة وجاهزة لإدخال بيانات أصول كارجاس الفعلية.</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
              <span>تمت استعادة كافة البيانات النموذجية التجريبية (12 أصل) بنجاح.</span>
            </div>
          )}

          {/* Card 1: Wipe Demo Assets */}
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50/60 transition-colors">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-rose-950">مسح الأصول التجريبية (تفريغ جداول المستخدمين)</h4>
                <p className="text-[11px] text-rose-800/90 mt-1 leading-relaxed">
                  يقوم هذا الخيار بمسح الأصول التجريبية الـ 12 المسجلة نموذجياً، بحيث تظهر جداول صفحة المستخدم نظيفة وخالية من أي بيانات تجريبية، ومستعدة لبدء الجرد الحقيقي أو رفع ملف Excel الأصول الفعلي.
                </p>

                {confirmClear ? (
                  <div className="mt-3 p-3 rounded-xl bg-rose-100/80 border border-rose-300 space-y-2">
                    <p className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>تأكيد: هل أنت متأكد من مسح جميع الأصول وتفريغ الجداول؟</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleWipeAssets}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white transition-colors shadow-2xs"
                        id="btn-confirm-wipe-assets"
                      >
                        نعم، فرغ الجداول وامسح الأصول
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <button
                      onClick={() => setConfirmClear(true)}
                      disabled={assets.length === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                        assets.length === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      }`}
                      id="btn-open-wipe-confirm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>مسح الأصول التجريبية ({assets.length} أصل مسجل)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Restore Default Demo Data */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-slate-200 text-slate-700 shrink-0 mt-0.5">
                <RotateCcw className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900">استعادة البيانات النموذجية الافتراضية</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  في حال رغبتك في تجربة النظام أو عرض العينات التجريبية مجدداً، يمكنك استرجاع الأصول النموذجية الـ 12 والمحطات الافتراضية بنقرة واحدة.
                </p>

                <div className="mt-3">
                  <button
                    onClick={handleResetData}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors shadow-2xs"
                    id="btn-restore-default-demo"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-700" />
                    <span>استعادة حزمة البيانات التجريبية الافتراضية</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Direct User Management Control */}
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/60 transition-colors">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                <Users className="w-5 h-5" />
              </span>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-emerald-950">التحكم في صفحة وصلاحيات المستخدمين</h4>
                <p className="text-[11px] text-emerald-800/90 mt-1 leading-relaxed">
                  التحكم في مديري المحطات، إضافة وتعديل حسابات Google (Gmail)، وإرسال روابط الدعوة المباشرة عبر تطبيق WhatsApp بنقرة واحدة.
                </p>

                <div className="mt-3">
                  <button
                    onClick={() => {
                      onClose();
                      if (onGoToUsers) onGoToUsers();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-2xs"
                    id="btn-goto-users-control"
                  >
                    <Users className="w-4 h-4" />
                    <span>الانتقال لإدارة وتخصيص المستخدمين</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
