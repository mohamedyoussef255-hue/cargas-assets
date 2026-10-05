import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Fuel,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasLogo } from '../common/CargasLogo';

interface InviteAcceptViewProps {
  inviteToken: string;
  onNavigate: (route: string) => void;
  onClearInvite: () => void;
}

export const InviteAcceptView: React.FC<InviteAcceptViewProps> = ({
  inviteToken,
  onNavigate,
  onClearInvite
}) => {
  const { getInviteInfo, acceptInvite, stations } = useCargas();

  const inviteData = getInviteInfo(inviteToken);
  const [googleEmail, setGoogleEmail] = useState(inviteData?.user.email || '');
  const [googleName, setGoogleName] = useState(inviteData?.user.name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!inviteData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 text-right">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Info className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">رابط الدعوة غير صالح أو منتهي</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            لم نتمكن من العثور على دعوة مطابقة للرمز ({inviteToken}). يرجى التأكد من الرابط أو التواصل مع مدير النظام في شركة كارجاس لإرسال دعوة جديدة عبر واتساب.
          </p>
          <button
            onClick={() => {
              onClearInvite();
              onNavigate('/');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  const { user, station } = inviteData;

  const handleAcceptGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setError('يرجى التأكد من البريد الإلكتروني');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const email = googleEmail.trim();
      const name = googleName.trim() || user.name;
      const avatar = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=047857,0f766e`;

      const res = acceptInvite(inviteToken, {
        name,
        email,
        avatar
      });

      setLoading(false);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClearInvite();
          if (user.role === 'admin') {
            onNavigate('/admin');
          } else {
            onNavigate('/station');
          }
        }, 1200);
      } else {
        setError(res.error || 'حدث خطأ أثناء قبول الدعوة');
      }
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-right">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
        
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        {/* Logo and Tag */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <CargasLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-300/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>دعوة انضمام رسمية معتمدة</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            منظومة إدارة وتكويد أصول كارجاس
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            شركة الغاز الطبيعي للسيارات • قطاع الشؤون الفنية والأصول
          </p>
        </div>

        {/* Success Card */}
        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">تم تفعيل الحساب وتسجيل الدخول بنجاح!</h3>
            <p className="text-xs text-emerald-800">
              جارٍ تحويلك مباشرة لشاشة المحطة والأصول المسندة إليك...
            </p>
          </div>
        ) : (
          <>
            {/* Greeting & Station Assignment Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {user.role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <Fuel className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold">مرحباً بك سيادة المهندس</p>
                  <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
                  <p className="text-xs text-emerald-700 font-semibold">
                    {user.role === 'admin' ? 'مدير النظام' : 'مدير محطة ومسؤول مطابقة الأصول'}
                  </p>
                </div>
              </div>

              {/* Station details */}
              {station && (
                <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">المحطة:</span>
                    <span className="font-bold text-slate-800">{station.name}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-semibold">المنطقة والمحافظة:</span>
                    <span className="font-bold text-slate-800">{station.region} - {station.governorate}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 mb-6 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                لتفعيل حسابك والوصول لأصول المحطة وجردها، يرجى المتابعة وتسجيل الدخول بحساب Google (Gmail) المعتمد.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-4">
                {error}
              </div>
            )}

            {/* Google Sign-in Form */}
            <form onSubmit={handleAcceptGoogle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني المعتمد (Google / Gmail) *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم المسجل في المنظومة
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Big Google Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border-2 border-slate-300 hover:border-emerald-600 shadow-md transition-all group disabled:opacity-50"
                id="accept-invite-google-btn"
              >
                {/* Official Google G Logo */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
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
                <span>{loading ? 'جاري التحقق والتفعيل...' : 'تسجيل الدخول والتفعيل بحساب Google'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClearInvite();
                    onNavigate('/');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                >
                  العودة للرئيسية دون تفعيل
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
