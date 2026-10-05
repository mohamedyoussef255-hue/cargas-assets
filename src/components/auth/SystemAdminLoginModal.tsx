import React, { useState } from 'react';
import { KeyRound, Lock, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasLogo } from '../common/CargasLogo';

interface SystemAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SystemAdminLoginModal: React.FC<SystemAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { verifyAdminPin, switchRole, addNotification } = useCargas();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const isValid = verifyAdminPin(pin);
      if (isValid) {
        switchRole('admin');
        addNotification({
          title: 'تسجيل دخول مدير النظام',
          message: 'مرحباً محمد عبد الرحمن، تم فتح لوحة تحكم الإدارة وتعديل الصلاحيات بالكامل.',
          type: 'success',
          target_role: 'admin',
          date: 'الآن'
        });
        setPin('');
        setLoading(false);
        onSuccess();
        onClose();
      } else {
        setError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                بوابة الحماية المشفرة
              </span>
              <h2 className="text-lg font-black text-white">دخول مدير النظام</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            الوصول مقصور حصرياً على <strong>مدير النظام: محمد عبد الرحمن</strong> للتحكم في لوحة الإدارة والتعديلات والصلاحيات.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              <p className="font-bold">كلمة المرور الافتراضية للنظام: 0000</p>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                يمكن لمدير النظام تغيير كلمة المرور هذه في أي وقت لاحقاً من داخل لوحة التحكم.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كلمة المرور / رمز الدخول (PIN):
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                autoFocus
                placeholder="أدخل كلمة المرور (الافتراضية: 0000)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
            {error && (
              <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={loading || !pin.trim()}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق...' : 'تأكيد الدخول كمدير للنظام'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
