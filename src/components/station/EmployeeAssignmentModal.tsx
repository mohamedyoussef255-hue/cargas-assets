import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
  Send,
  User,
  Users,
  X
} from 'lucide-react';
import { Station } from '../../types/cargas';
import { useCargas } from '../../context/CargasContext';

interface EmployeeAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
  pendingCount: number;
  totalCount: number;
  onPreviewEmployeeView?: (url: string) => void;
}

export const EmployeeAssignmentModal: React.FC<EmployeeAssignmentModalProps> = ({
  isOpen,
  onClose,
  station,
  pendingCount,
  totalCount,
  onPreviewEmployeeView
}) => {
  const { addNotification } = useCargas();
  const [employeeName, setEmployeeName] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the assignment URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const empParam = employeeName.trim() ? `&emp=${encodeURIComponent(employeeName.trim())}` : '';
  const assignmentUrl = `${origin}/?task=match&station=${encodeURIComponent(station.id)}${empParam}`;

  const messageText = `السلام عليكم ورحمة الله،
${employeeName.trim() ? `الأخ الزميل: ${employeeName.trim()}\n` : ''}تكليف عمل رسمي بمطابقة وحصر أصول: ${station.name} لشركة كارجاس.
يرجى فتح الرابط المباشر أدناه لتأكيد مطابقة الأصول الميدانية:
${assignmentUrl}

شاكرين حسن تعاونكم،
إدارة محطة ${station.name} - شركة كارجاس`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(assignmentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleSendWhatsApp = () => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = `20${cleanPhone.slice(1)}`;
    } else if (!cleanPhone.startsWith('20') && cleanPhone.length === 10) {
      cleanPhone = `20${cleanPhone}`;
    }

    const waLink = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

    addNotification({
      title: 'إرسال تكليف مطابقة الأصول',
      message: `تم إنشاء وإرسال رابط تكليف مطابقة الأصول لموظف محطة ${station.name} عبر WhatsApp.`,
      type: 'success',
      station_name: station.name,
      date: 'الآن'
    });

    window.open(waLink, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-200 uppercase">
                صلاحية مدير المحطة
              </span>
              <h3 className="text-lg font-black text-white">
                تكليف موظف بمطابقة الأصول عبر WhatsApp
              </h3>
            </div>
          </div>

          <p className="text-xs text-emerald-100">
            أرسل رابطاً مخصصاً للموظف التابع لمحطتك لتظهر له بيانات الجدول وتأكيد مطابقة الأصول فقط، وتُسجّل فورياً في المنظومة.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Station Status Summary */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{station.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">كود المحطة: {station.code}</p>
            </div>
            <div className="text-left">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                {pendingCount} أصل بانتظار المطابقة
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">من إجمالي {totalCount} أصل</p>
            </div>
          </div>

          {/* Employee Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                اسم الموظف المكلف:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="مثال: م. محمود حسن"
                  className="w-full pl-3 pr-8 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم WhatsApp للموظف:
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full pl-3 pr-8 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Generated Link Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              رابط التكليف المباشر لصفحة الموظف:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={assignmentUrl}
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700 select-all"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Notice of what employee sees */}
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>خصوصية وسهولة صفحة الموظف:</span>
            </p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              تظهر للموظف فقط بيانات جدول الأصول مع أزرار التأكيد على مطابقتها. وبمجرد ضغط الموظف على "تأكيد المطابقة"، تُسجّل فوراً لمدير المحطة ومدير النظام والمنظومة بالكامل.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال التكليف عبر WhatsApp</span>
            </button>

            {onPreviewEmployeeView && (
              <button
                type="button"
                onClick={() => {
                  onPreviewEmployeeView(assignmentUrl);
                  onClose();
                }}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>معاينة صفحة الموظف</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
