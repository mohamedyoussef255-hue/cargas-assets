import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  FileSpreadsheet,
  Fuel,
  Info,
  KeyRound,
  LayoutDashboard,
  MessageCircle,
  QrCode,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasLogo } from '../common/CargasLogo';
import { WhatsAppInviteModal } from '../admin/WhatsAppInviteModal';
import { CargasUser, Station } from '../../types/cargas';

interface LandingPageProps {
  onNavigate: (route: string) => void;
  onScanCode: (code: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onScanCode
}) => {
  const { assets, stations, categories, users, switchRole, selectedStationId, setSelectedStationId } = useCargas();
  const [searchCode, setSearchCode] = useState('');
  const [stationTokenInput, setStationTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [whatsappInviteUser, setWhatsappInviteUser] = useState<CargasUser | null>(null);

  const totalAssets = assets.length;
  const confirmedAssets = assets.filter(a => a.confirmed).length;
  const confirmationRate = totalAssets > 0 ? Math.round((confirmedAssets / totalAssets) * 100) : 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      onScanCode(searchCode.trim());
    }
  };

  // Handle station manager pasting their WhatsApp link or code
  const handleOpenStationByToken = (e: React.FormEvent) => {
    e.preventDefault();
    const input = stationTokenInput.trim();
    if (!input) {
      setTokenError('يرجى لصق الرابط أو إدخال رمز المحطة المستلم عبر الواتساب');
      return;
    }

    setTokenError('');

    // Check if input is a full URL with ?station= or ?invite=
    try {
      if (input.includes('?')) {
        const queryStr = input.split('?')[1] || '';
        const params = new URLSearchParams(queryStr);
        const stationQ = params.get('station');
        const inviteQ = params.get('invite');

        if (inviteQ) {
          onNavigate(`/?invite=${encodeURIComponent(inviteQ)}`);
          return;
        }

        if (stationQ) {
          const matched = stations.find(
            s => s.id.toLowerCase() === stationQ.toLowerCase() ||
                 s.code.toLowerCase() === stationQ.toLowerCase() ||
                 s.name.toLowerCase().includes(stationQ.toLowerCase())
          );
          if (matched) {
            setSelectedStationId(matched.id);
            switchRole('station_manager', matched.id);
            onNavigate('/station');
            return;
          }
        }
      }
    } catch {
      // Fall through to normal matching
    }

    // Direct token or code matching
    const qLower = input.toLowerCase();

    // Check if it matches an invite token directly
    if (qLower.startsWith('inv-')) {
      onNavigate(`/?invite=${encodeURIComponent(input)}`);
      return;
    }

    // Match by station ID, code, or name
    const matchedStation = stations.find(
      s => s.id.toLowerCase() === qLower ||
           s.code.toLowerCase() === qLower ||
           s.name.toLowerCase().includes(qLower)
    );

    if (matchedStation) {
      setSelectedStationId(matchedStation.id);
      switchRole('station_manager', matchedStation.id);
      onNavigate('/station');
    } else {
      setTokenError('لم يتم العثور على محطة مطابقة لهذا الرمز. يرجى التأكد من الرابط المرسل إليك عبر الواتساب من مدير النظام.');
    }
  };

  // Quick helper to open WhatsApp invite modal from landing page for admin
  const handleOpenWhatsAppModalForStation = (station: Station) => {
    const manager = users.find(u => u.station_id === station.id) || {
      id: `usr-${station.id}`,
      name: station.manager_name || `مدير محطة ${station.name}`,
      email: `manager.${station.code.toLowerCase()}@cargas.com.eg`,
      phone: station.phone || '01012345678',
      whatsapp_number: station.phone || '01012345678',
      role: 'station_manager' as const,
      station_id: station.id,
      station_name: station.name,
      region: station.region,
      status: 'active' as const,
      auth_provider: 'google' as const
    };
    setWhatsappInviteUser(manager);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto w-full text-center pt-2 sm:pt-6">
        
        {/* Pulsing Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold mb-5 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span>منظومة إدارة وتكويد أصول كارجاس المتكاملة</span>
        </div>

        {/* Big Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
          إدارة وتتبع أصول <span className="text-emerald-700 dark:text-emerald-400">شركة كارجاس</span>
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-3xl mx-auto leading-relaxed mb-8">
          المنظومة المركزية لجرد، تتبع، وتأكيد وجود أصول محطات الغاز الطبيعي. يتم الدخول المباشر لمدير النظام مع إمكانية إرسال روابط الدخول لمديري المحطات عبر الواتساب لتأكيد ومطابقة الأصول ميدانياً.
        </p>

        {/* Primary Role Architecture Notice */}
        <div className="max-w-3xl mx-auto mb-8 p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl text-right flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">سياسة الدخول وصلاحيات المنظومة:</span> شاشة الدخول الرئيسية تسمح لمدير النظام حصرياً بالدخول المباشر على (لوحة تحكم الإدارة العامة، وعرض المحطات). أما مديرو المحطات، فيتم منحهم صلاحية الدخول عبر رابط خاص يُرسله مدير النظام عبر الواتساب لفتح البرنامج مباشرة على المحطة التي تخصهم والتأكيد على وجود الأصول.
          </div>
        </div>

        {/* 2 Main Entry Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-right mb-10">
          
          {/* 1. Admin Entry Card: Grants Access to BOTH */}
          <div
            id="landing-admin-card"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-6 sm:p-7 text-white shadow-xl shadow-emerald-900/20 border border-emerald-700/60 transition-all duration-300"
          >
            {/* Ambient glowing circles */}
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    صلاحية الدخول على الاثنين
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black mb-2 text-white">
                  دخول مدير النظام (الإدارة العامة)
                </h3>
                <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed mb-6">
                  يمتلك مدير النظام الصلاحية الكاملة للتحكم في المنظومة والدخول المباشر على خياري الإدارة المركزية وعرض كافة المحطات.
                </p>

                {/* 2 Clear Options for Admin */}
                <div className="space-y-2.5 mb-6">
                  
                  {/* Option 1: Admin Dashboard */}
                  <button
                    onClick={() => {
                      switchRole('admin');
                      onNavigate('/admin');
                    }}
                    id="admin-enter-dashboard-btn"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all group-hover:border-amber-400/60"
                  >
                    <div className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-amber-400" />
                      <span>1. لوحة تحكم الإدارة العامة للأصول</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-amber-300" />
                  </button>

                  {/* Option 2: Station View */}
                  <button
                    onClick={() => {
                      switchRole('admin');
                      onNavigate('/station');
                    }}
                    id="admin-enter-stations-btn"
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-emerald-100 hover:text-white text-xs sm:text-sm font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4 text-amber-400" />
                      <span>2. تصفح المحطات وجرد ومطابقة الأصول</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-amber-300" />
                  </button>

                </div>
              </div>

              {/* Instant WhatsApp Invite Action by Admin */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                <span className="text-[11px] text-emerald-200">إرسال رابط لمحطة:</span>
                <button
                  onClick={() => handleOpenWhatsAppModalForStation(stations[0])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/60 hover:bg-emerald-600 text-white text-[11px] font-bold border border-emerald-400/40 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-300" />
                  <span>توليد وإرسال رابط عبر WhatsApp</span>
                </button>
              </div>

            </div>
          </div>

          {/* 2. Station Manager Entry Card: Via WhatsApp Link */}
          <div
            id="landing-station-card"
            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-200/70 dark:shadow-black/50 border-2 border-emerald-600/30 dark:border-emerald-500/30 transition-all duration-300"
          >
            {/* Ambient accent background */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-100/50 dark:bg-emerald-950/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-amber-50 dark:bg-amber-950/20 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Fuel className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700">
                    دخول مديري المحطات عبر الواتساب
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black mb-2 text-slate-900 dark:text-white">
                  دخول مدير المحطة وتأكيد الأصول
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                  يمنح مدير النظام مديري المحطات رابطاً مخصصاً عبر الواتساب لفتح التطبيق مباشرة على المحطة المسندة للتأكيد الميداني على وجود الأصول ومطابقتها.
                </p>

                {/* Paste WhatsApp Link / Code Input Box */}
                <form onSubmit={handleOpenStationByToken} className="space-y-2 mb-4">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    وصلك رابط أو كود محطة من مدير النظام؟ أدخله هنا:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stationTokenInput}
                      onChange={(e) => {
                        setStationTokenInput(e.target.value);
                        if (tokenError) setTokenError('');
                      }}
                      placeholder="الصق الرابط أو الكود (مثال: ST-01 أو ألماظة)"
                      className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      id="station-token-submit-btn"
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
                    >
                      <span>فتح المحطة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {tokenError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {tokenError}
                    </p>
                  )}
                </form>

              </div>

              {/* Quick Sample Station Link for Immediate Testing */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">تجربة مباشرة لمحطة:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedStationId('st-1');
                      switchRole('station_manager', 'st-1');
                      onNavigate('/station');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    محطة ألماظة (ST-01)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStationId('st-2');
                      switchRole('station_manager', 'st-2');
                      onNavigate('/station');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    محطة المعادي (ST-02)
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Quick QR & Code Search Box */}
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-10">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2.5 flex items-center justify-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>استعلام ومسح أصل بواسطة الكود أو الرابط</span>
          </p>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="مثال: EQ00001 أو CE00001 أو HIK-ATX"
              className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-right font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-colors shrink-0 shadow-xs"
            >
              عرض الأصل
            </button>
          </form>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalAssets}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">إجمالي الأصول المكوّدة</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-900/60 shadow-2xs text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{confirmedAssets}</p>
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">تمت مطابقتها وتأكيدها</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/60 shadow-2xs text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">{confirmationRate}%</p>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">نسبة الإنجاز العامة</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stations.length}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">محطات الغاز الطبيعي</p>
          </div>
        </div>

      </div>

      {/* WhatsApp Invite Modal for Admin */}
      {whatsappInviteUser && (
        <WhatsAppInviteModal
          user={whatsappInviteUser}
          isOpen={!!whatsappInviteUser}
          onClose={() => setWhatsappInviteUser(null)}
          onTestInvite={(token) => {
            setWhatsappInviteUser(null);
            onNavigate(`/?invite=${encodeURIComponent(token)}`);
          }}
        />
      )}

      {/* Footer Text */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-4 border-t border-slate-200/60 dark:border-slate-800 mt-4">
        <p>يتم تحديد صلاحيات المستخدم وإسناده للمحطة والمنطقة من قبل مدير النظام • شركة كارجاس للغاز الطبيعي للسيارات</p>
      </div>

    </div>
  );
};
