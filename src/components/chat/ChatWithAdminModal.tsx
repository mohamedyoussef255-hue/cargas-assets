import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCheck,
  Fuel,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset, Station } from '../../types/cargas';

interface ChatWithAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: Station;
  stationAssets?: Asset[];
  initialAssetCode?: string;
}

export const ChatWithAdminModal: React.FC<ChatWithAdminModalProps> = ({
  isOpen,
  onClose,
  station,
  stationAssets = [],
  initialAssetCode
}) => {
  const { chatMessages, sendChatMessage, markChatAsRead, currentUser } = useCargas();
  const [inputText, setInputText] = useState('');
  const [selectedAssetCode, setSelectedAssetCode] = useState(initialAssetCode || '');
  const [showAssetSelector, setShowAssetSelector] = useState(Boolean(initialAssetCode));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for this station
  const stationMessages = chatMessages.filter(m => m.station_id === station.id);

  // Mark as read by user when opened
  useEffect(() => {
    if (isOpen) {
      markChatAsRead(station.id, false);
    }
  }, [isOpen, station.id, chatMessages.length]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, stationMessages.length]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText.trim(), {
      stationId: station.id,
      assetCode: selectedAssetCode || undefined
    });

    setInputText('');
    setSelectedAssetCode('');
    setShowAssetSelector(false);
  };

  const handleQuickQuestion = (text: string, assetCode?: string) => {
    sendChatMessage(text, {
      stationId: station.id,
      assetCode: assetCode || selectedAssetCode || undefined
    });
  };

  const QUICK_QUESTIONS = [
    'تم الانتهاء من مطابقة كافة أصول المحطة الميدانية بنجاح.',
    'يرجى التكرم بمراجعة وتعديل بيانات الأصل المحدد.',
    'نحتاج إعادة طباعة ملصق كود QR لبعض المعدات المتأثرة بالعوامل الجوية.',
    'تم رصد معدة جديدة بالمحطة وغير مسجلة بالدفاتر، يرجى توجيه الإضافة.'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl flex flex-col h-[620px] max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 transition-colors"
        id="station-admin-chat-modal"
      >
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  شات مباشر مع مدير النظام (محمد عبد الرحمن)
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/50">
                  متصل الآن
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>محطة: {station.name}</span>
                <span>•</span>
                <span>المستخدم: {currentUser.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="إغلاق الشات"
            id="close-chat-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-900/40">
          {/* Welcome Alert */}
          <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">قناة الشات والمتابعة الرسمية لمحطة {station.name}</span>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                يمكنك إرسال أي استفسار أو بلاغ عن نقص أصل أو طلب اعتماد وتعديل مواصفات فنية مباشرة لمدير النظام.
              </p>
            </div>
          </div>

          {stationMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                لا توجد رسائل سابقة في سجل محادثات المحطة
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                اكتب رسالتك بالأسفل أو اختر أحد النماذج السريعة للتواصل الفوري.
              </p>
            </div>
          ) : (
            stationMessages.map(msg => {
              const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'system_manager';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isAdmin
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}>
                    {isAdmin ? 'مدير' : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-2xs ${
                    isAdmin
                      ? 'bg-emerald-700 text-white rounded-tl-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tr-xs'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={`text-[11px] font-bold ${isAdmin ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {msg.sender_name}
                      </span>
                      <span className={`text-[10px] font-mono ${isAdmin ? 'text-emerald-200/80' : 'text-slate-400'}`}>
                        {msg.time_formatted}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {msg.asset_code && (
                      <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        isAdmin
                          ? 'bg-emerald-800 text-emerald-200'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        <span>كود الأصل:</span>
                        <span>{msg.asset_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Buttons */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            نماذج سريعة:
          </span>
          {QUICK_QUESTIONS.map((text, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(text)}
              className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-200 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Optional Linked Asset Selector */}
        {showAssetSelector && (
          <div className="px-4 py-2 bg-emerald-50/60 dark:bg-emerald-950/40 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 shrink-0">
              ربط استفسار بأصل محدد:
            </span>
            <select
              value={selectedAssetCode}
              onChange={(e) => setSelectedAssetCode(e.target.value)}
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="">-- اختر الأصل المراد الإشارة إليه (اختياري) --</option>
              {stationAssets.map(a => (
                <option key={a.id} value={a.asset_code}>
                  [{a.asset_code}] {a.asset_name} ({a.category})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setSelectedAssetCode('');
                setShowAssetSelector(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              إلغاء
            </button>
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setShowAssetSelector(!showAssetSelector)}
            className={`p-2 rounded-xl border transition-colors ${
              showAssetSelector || selectedAssetCode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="الإشارة إلى أصل معين في المحادثة"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالتك أو استفسارك لمدير النظام..."
            className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
            id="send-chat-msg-btn"
          >
            <Send className="w-4 h-4" />
            <span>إرسال</span>
          </button>
        </form>

      </div>
    </div>
  );
};
