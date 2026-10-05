import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Fuel,
  Info,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { CargasUser } from '../../types/cargas';

interface WhatsAppInviteModalProps {
  user: CargasUser;
  isOpen: boolean;
  onClose: () => void;
  onTestInvite?: (token: string) => void;
}

export const WhatsAppInviteModal: React.FC<WhatsAppInviteModalProps> = ({
  user,
  isOpen,
  onClose,
  onTestInvite
}) => {
  const { sendWhatsAppInvite, stations } = useCargas();

  const [phone, setPhone] = useState(user.whatsapp_number || user.phone || '');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl: string;
    message: string;
    waLink: string;
    token: string;
  } | null>(null);

  if (!isOpen) return null;

  const matchedStation = stations.find(s => s.id === user.station_id);
  const stationText = matchedStation
    ? `${matchedStation.name} (${matchedStation.region} - ${matchedStation.governorate})`
    : 'الإدارة المركزية للأصول';
  const roleText = user.role === 'admin' ? 'مدير النظام (Admin)' : 'مدير محطة ومسؤول مطابقة الأصول';

  // Generate invite preview if not generated yet
  const effectiveResult = inviteResult || (() => {
    const token = user.invite_token || `INV-${user.id.replace('usr-', '').slice(0, 5).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const inviteUrl = `${window.location.origin}/?invite=${token}`;
    
    // Clean phone number for WhatsApp wa.me
    const digitsOnly = (phone || '').replace(/\D/g, '');
    let cleanWaPhone = digitsOnly;
    if (digitsOnly.startsWith('01')) {
      cleanWaPhone = '20' + digitsOnly.slice(1);
    } else if (digitsOnly.startsWith('1') && digitsOnly.length === 10) {
      cleanWaPhone = '20' + digitsOnly;
    } else if (!cleanWaPhone.startsWith('20') && cleanWaPhone.length > 0) {
      cleanWaPhone = '20' + cleanWaPhone;
    }

    const message = `السيد المهندس / ${user.name} المحترم،
تحية طيبة وبعد،،

يسر إدارة شركة كارجاس دعوتكم للانضمام لمنظومة إدارة وتكويد أصول كارجاس (CARGAS Asset Flow).

🏢 المحطة المسندة: ${stationText}
🛡️ الصلاحية: ${roleText}
📧 بريد Google المعتمد: ${user.email}

يرجى الضغط على الرابط التالي لتسجيل الدخول بحساب Google (Gmail) وتأكيد عهدة وأصول المحطة:
🔗 ${inviteUrl}

شركة الغاز الطبيعي للسيارات (كارجاس) - قطاع الأصول وتكنولوجيا المعلومات`;

    const waLink = cleanWaPhone ? `https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;

    return {
      inviteUrl,
      message,
      waLink,
      token
    };
  })();

  const handleSendViaWhatsApp = () => {
    // Commit invite to context state
    const res = sendWhatsAppInvite(user.id, phone);
    setInviteResult(res);

    // Open WhatsApp Web or mobile app in a new window/tab
    window.open(res.waLink, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(effectiveResult.message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveResult.inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">إرسال دعوة انضمام عبر واتساب (WhatsApp)</h3>
              <p className="text-[11px] text-emerald-200/80">تفعيل دخول المستخدم بحساب Google المعتمد</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* User & Station Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-slate-900">{user.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  user.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {user.role === 'admin' ? 'مدير نظام' : 'مدير محطة'}
                </span>
              </div>

              <p className="text-xs text-slate-600 flex items-center gap-1.5 font-mono mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>

              {user.station_name && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-600" />
                  <span>المحطة: <strong>{user.station_name}</strong></span>
                </p>
              )}
            </div>

            <div className="text-left shrink-0">
              <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                user.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : user.status === 'invited'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {user.status === 'active'
                  ? 'نشط بالمنظومة'
                  : user.status === 'invited'
                  ? 'تمت دعوته سابقاً'
                  : 'بانتظار الدعوة'}
              </span>
            </div>
          </div>

          {/* WhatsApp Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>رقم هاتف الواتساب (WhatsApp) *</span>
              <span className="text-[11px] text-slate-400 font-normal">مصر: 010... / 011... / 012...</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01012345671 أو +201012345671"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl text-xs font-mono border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                dir="ltr"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Invitation Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                معاينة نص رسالة الواتساب المجهزة
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'تم نسخ الرسالة!' : 'نسخ النص'}</span>
              </button>
            </div>

            <div className="bg-emerald-950 text-emerald-100 p-4 rounded-2xl text-xs font-sans leading-relaxed border border-emerald-800/80 whitespace-pre-line shadow-inner max-h-48 overflow-y-auto">
              {effectiveResult.message}
            </div>
          </div>

          {/* Quick Direct Link Display */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="truncate text-left flex-1 font-mono text-[11px] text-slate-600" dir="ltr">
              {effectiveResult.inviteUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
            
            {/* Primary: Open WhatsApp Web / App */}
            <button
              type="button"
              onClick={handleSendViaWhatsApp}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-colors"
              id="send-wa-invite-btn"
            >
              <Send className="w-4 h-4" />
              <span>إرسال عبر WhatsApp Web / App</span>
            </button>

            {/* Test Link Button */}
            {onTestInvite && (
              <button
                type="button"
                onClick={() => {
                  sendWhatsAppInvite(user.id, phone);
                  onTestInvite(effectiveResult.token);
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                title="تجربة فتح شاشة قبول الدعوة للمستخدم"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>تجربة قبول الدعوة</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              إغلاق
            </button>

          </div>

          <p className="text-[10px] text-center text-slate-400">
            عند فتح المستلم للرابط، سيتم توجيهه مباشرة لشاشة الترحيب وتسجيل الدخول بحساب Google المعتمد.
          </p>

        </div>

      </div>
    </div>
  );
};
