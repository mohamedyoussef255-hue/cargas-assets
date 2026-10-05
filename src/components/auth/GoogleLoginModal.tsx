import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasLogo } from '../common/CargasLogo';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  suggestedEmail?: string;
  suggestedName?: string;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  suggestedEmail = '',
  suggestedName = ''
}) => {
  const {
    currentUser,
    isLoggedIn,
    loginWithGoogle,
    logout,
    users,
    stations,
    selectedStationId
  } = useCargas();

  const [customEmail, setCustomEmail] = useState(suggestedEmail || '');
  const [customName, setCustomName] = useState(suggestedName || '');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (suggestedEmail) {
      setCustomEmail(suggestedEmail);
      setUseCustomInput(true);
    }
    if (suggestedName) {
      setCustomName(suggestedName);
    }
  }, [suggestedEmail, suggestedName]);

  if (!isOpen) return null;

  // Available pre-registered Google accounts for quick access
  const registeredAccounts = users.map(u => ({
    name: u.name,
    email: u.email,
    role: u.role,
    station_name: u.station_name || (stations.find(s => s.id === u.station_id)?.name),
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=047857,0f766e`
  }));

  const handleQuickLogin = (acc: { name: string; email: string; avatar?: string }) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      loginWithGoogle({
        name: acc.name,
        email: acc.email,
        avatar: acc.avatar
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    if (!customEmail.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const email = customEmail.trim();
      const derivedName = customName.trim() || email.split('@')[0];
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(derivedName)}&backgroundColor=047857,0f766e`;

      loginWithGoogle({
        name: derivedName,
        email,
        avatar
      });

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-50 to-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center p-1.5">
              {/* Google G Logo SVG */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">تسجيل الدخول بحساب Google</h3>
              <p className="text-[11px] text-slate-500">منظومة تكويد ومطابقة أصول كارجاس</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Active User Status if already logged in */}
          {isLoggedIn && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full border border-emerald-300 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                      نشط حالياً
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">{currentUser.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                }}
                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-100 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Intro description */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              يتم التحقق من هوية مديري المحطات والإدارة العامة عبر حسابات Google (Gmail). اختر حسابك المصرح به أو أدخل بريدك المسجل في الدعوة.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Option A: Quick select authorized Google accounts */}
          {!useCustomInput ? (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-700 mb-1">
                الحسابات المصرح لها بالدخول (Google / Gmail):
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                {registeredAccounts.map((acc) => {
                  const isCurrent = currentUser.email.toLowerCase() === acc.email.toLowerCase();
                  return (
                    <button
                      key={acc.email}
                      onClick={() => handleQuickLogin(acc)}
                      disabled={loading}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-right group ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                              {acc.name}
                            </span>
                            {acc.role === 'admin' ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                مدير النظام
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                                {acc.station_name || 'مدير محطة'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                            {acc.email}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        دخول
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Toggle to custom Gmail entry */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseCustomInput(true)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                >
                  أو الدخول ببريد Google آخر...
                </button>
              </div>
            </div>
          ) : (
            /* Option B: Enter custom Google / Gmail */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  إدخال بريد Google (Gmail) المعتمد
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomInput(false)}
                  className="text-[11px] text-slate-500 hover:text-emerald-700 font-semibold"
                >
                  العودة للحسابات السريعة
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">البريد الإلكتروني (Gmail) *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">الاسم الكامل (اختياري)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="م. أحمد محمود"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {/* Google G Icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 bg-white rounded-full p-0.5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'جاري التحقق...' : 'متابعة وتسجيل الدخول بحساب Google'}</span>
              </button>
            </form>
          )}

          {/* Footer notice */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400">
              شركة الغاز الطبيعي للسيارات (كارجاس) • التحقق الآمن عبر Google Identity
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
