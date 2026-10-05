import React, { useState } from 'react';
import {
  Building2,
  CheckCheck,
  Fuel,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Send,
  Sparkles,
  User
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { ChatMessage } from '../../types/cargas';

export const AdminChatsTab: React.FC = () => {
  const { stations, chatMessages, sendChatMessage, markChatAsRead, currentUser } = useCargas();
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || 'st-1');
  const [searchStation, setSearchStation] = useState('');
  const [replyText, setReplyText] = useState('');

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];

  // Group messages by station
  const stationMessages = chatMessages.filter(m => m.station_id === selectedStationId);

  // Calculate unread count per station for admin
  const getUnreadForStation = (stId: string) => {
    return chatMessages.filter(m => m.station_id === stId && !m.read_by_admin && m.sender_role === 'station_manager').length;
  };

  // Filter stations by search
  const filteredStations = stations.filter(st =>
    st.name.toLowerCase().includes(searchStation.toLowerCase()) ||
    (st.manager_name && st.manager_name.toLowerCase().includes(searchStation.toLowerCase()))
  );

  const handleSelectStation = (stId: string) => {
    setSelectedStationId(stId);
    markChatAsRead(stId, true);
  };

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    sendChatMessage(replyText.trim(), { stationId: selectedStationId });
    setReplyText('');
    markChatAsRead(selectedStationId, true);
  };

  const handleQuickReply = (text: string) => {
    sendChatMessage(text, { stationId: selectedStationId });
    markChatAsRead(selectedStationId, true);
  };

  const QUICK_REPLIES = [
    'تم استلام رسالتكم وجاري المراجعة والاعتماد المالي.',
    'تم اعتماد ومطابقة بيانات الأصل بنجاح في السجلات المركزية.',
    'يرجى التأكد من الرقم المسلسل (S/N) وطباعة كود QR المحدث.',
    'شكراً لتعاونكم، جاري التنسيق مع إدارة السلامة والصيانة.'
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      
      {/* Tab Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-700 text-white shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                شات ومحادثات محطات كارجاس مع الإدارة العامة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                قناة تواصل مباشرة وموثقة بين مديري المحطات والمشرفين الميدانيين مع المدير العام للنظام
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
            {chatMessages.length} رسالة مسجلة بالمنظومة
          </span>
        </div>
      </div>

      {/* Main Chat Layout: Station List on Right, Active Conversation on Left (RTL) */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[550px] max-h-[700px]">
        
        {/* Right Pane: Stations List (4 cols) */}
        <div className="md:col-span-4 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
          
          {/* Station Search */}
          <div className="p-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={searchStation}
                onChange={(e) => setSearchStation(e.target.value)}
                placeholder="بحث عن محطة أو مدير..."
                className="w-full pl-3 pr-8 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
          </div>

          {/* Station List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredStations.map(st => {
              const isSelected = st.id === selectedStationId;
              const unread = getUnreadForStation(st.id);
              const lastMsg = [...chatMessages].reverse().find(m => m.station_id === st.id);

              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStation(st.id)}
                  className={`w-full text-right p-3.5 flex items-start justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-r-4 border-r-emerald-700 dark:border-r-emerald-500'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {st.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {st.manager_name || 'مسؤول المحطة'} • {st.region}
                      </p>
                      {lastMsg && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1">
                          {lastMsg.sender_role === 'admin' ? 'الإدارة: ' : ''}{lastMsg.text}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    {lastMsg && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lastMsg.time_formatted}
                      </span>
                    )}
                    {unread > 0 && (
                      <span className="mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left Pane: Active Station Conversation (8 cols) */}
        <div className="md:col-span-8 flex flex-col bg-white dark:bg-slate-900">
          
          {/* Conversation Header */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeStation?.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
                    {activeStation?.region} • {activeStation?.governorate}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  المدير المسؤول: {activeStation?.manager_name || 'غير محدد'} • هاتف: {activeStation?.phone || 'غير مسجل'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                قناة نشطة وموثقة
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-slate-900/30">
            {stationMessages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  لا توجد رسائل سابقة مع محطة {activeStation?.name}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  يمكنك بدء المحادثة مع مدير المحطة أو إرسال تعليمات بخصوص الجرد ومطابقة الأصول.
                </p>
              </div>
            ) : (
              stationMessages.map(msg => {
                const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'system_manager';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAdmin
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      {isAdmin ? 'مدير' : <User className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[78%] rounded-2xl p-3 shadow-2xs ${
                      isAdmin
                        ? 'bg-emerald-700 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
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
                          <span>كود الأصل المشار إليه:</span>
                          <span>{msg.asset_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Replies Bar */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-slate-400 font-bold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              ردود سريعة:
            </span>
            {QUICK_REPLIES.map((text, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(text)}
                className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-2xs"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Reply Input Form */}
          <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`اكتب رداً أو توجيهاً لـ محطة ${activeStation?.name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>إرسال</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
