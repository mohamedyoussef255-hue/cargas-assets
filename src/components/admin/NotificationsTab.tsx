import React from 'react';
import { Bell, Check, CheckCheck, Clock, Fuel, Info, Sparkles } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';

export const NotificationsTab: React.FC = () => {
  const { notifications, markNotificationRead } = useCargas();

  const handleMarkAllRead = () => {
    notifications.forEach(n => markNotificationRead(n.id));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">مركز التنبيهات والإشعارات</h2>
          <p className="text-xs text-slate-500">
            سجل العمليات وعمليات التأكيد وإضافة الأصول بالمحطات
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-emerald-700" />
          <span>تحديد الكل كمقروء</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <p className="py-12 text-center text-xs text-slate-400">لا توجد تنبيهات حالياً</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                !n.read ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : n.type === 'warning'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {n.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : n.type === 'warning' ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{n.title}</h3>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.date}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{n.message}</p>

                <div className="flex items-center gap-2 mt-2">
                  {n.station_name && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {n.station_name}
                    </span>
                  )}
                  {n.asset_code && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {n.asset_code}
                    </span>
                  )}
                  {!n.read && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      جديد
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
