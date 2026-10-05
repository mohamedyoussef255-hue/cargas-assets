import React from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Factory,
  History,
  Layers,
  MapPin,
  Sparkles,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';

export const OverviewTab: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { assets, stations, categories, auditLogs } = useCargas();

  const totalAssets = assets.length;
  const confirmedCount = assets.filter(a => a.confirmed).length;
  const pendingCount = totalAssets - confirmedCount;
  const newAssetsCount = assets.filter(a => a.is_new).length;
  const completionRate = totalAssets > 0 ? Math.round((confirmedCount / totalAssets) * 100) : 0;

  // Category counts
  const categoryStats: Record<string, { total: number; confirmed: number }> = {};
  categories.forEach(c => {
    categoryStats[c.name] = { total: 0, confirmed: 0 };
  });

  assets.forEach(a => {
    const cat = a.category || 'غير مصنف';
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, confirmed: 0 };
    }
    categoryStats[cat].total++;
    if (a.confirmed) categoryStats[cat].confirmed++;
  });

  // Station counts
  const stationStats = stations.map(st => {
    const stAssets = assets.filter(a => a.station_id === st.id);
    const stConfirmed = stAssets.filter(a => a.confirmed).length;
    const rate = stAssets.length > 0 ? Math.round((stConfirmed / stAssets.length) * 100) : 0;
    return {
      id: st.id,
      name: st.name,
      code: st.code,
      region: st.region,
      total: stAssets.length,
      confirmed: stConfirmed,
      rate
    };
  });

  return (
    <div className="space-y-6">
      
      {/* 4 KPI Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">إجمالي الأصول</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalAssets}</p>
          <p className="text-[11px] text-slate-400 mt-1">عبر كافة المحطات والمناطق</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">تم التأكيد والمطابقة</span>
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-green-700 tracking-tight">{confirmedCount}</p>
          <p className="text-[11px] text-green-600 font-medium mt-1">مطابقة ومعتمدة رسمياً</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">بانتظار التأكيد</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 tracking-tight">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">بحاجة لمراجعة مدير المحطة</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">أصول مضافة حديثاً</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-700 tracking-tight">{newAssetsCount}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">خلال دورة الجرد الحالية</p>
        </div>

      </div>

      {/* Progress Bar of Completion */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">نسبة إنجاز مطابقة وتأكيد أصول الشركة</h3>
            <p className="text-xs text-slate-500">المطابقة الميدانية لأرقام المسلسلات والمواصفات</p>
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">
            {completionRate}%
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout: Categories & Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Categories Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>الأصول حسب الفئة</span>
            </h3>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              إدارة الفئات
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([name, stat]) => {
              const catRate = stat.total > 0 ? Math.round((stat.confirmed / stat.total) * 100) : 0;
              return (
                <div key={name} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        {stat.confirmed} / {stat.total} أصل
                      </span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {catRate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${catRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stations Audit Status Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Factory className="w-4 h-4 text-emerald-700" />
              <span>حالة المطابقة بالمحطات</span>
            </h3>
            <button
              onClick={() => onNavigateTab('stations')}
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              عرض كل المحطات
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                  <th className="pb-2">المحطة</th>
                  <th className="pb-2">المنطقة</th>
                  <th className="pb-2">الأصول</th>
                  <th className="pb-2">المؤكد</th>
                  <th className="pb-2">الإنجاز</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stationStats.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-slate-800">{st.name}</td>
                    <td className="py-2.5 text-slate-500">{st.region}</td>
                    <td className="py-2.5 font-mono text-slate-700">{st.total}</td>
                    <td className="py-2.5 font-mono text-green-600 font-bold">{st.confirmed}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        st.rate >= 80 ? 'bg-green-100 text-green-800' : st.rate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {st.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Latest Added Assets */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">أحدث الأصول المسجلة بالنظام</h3>
          <button
            onClick={() => onNavigateTab('assets')}
            className="text-xs text-emerald-700 hover:underline font-semibold"
          >
            الانتقال لجدول الأصول
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {assets.slice(0, 3).map(a => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {a.asset_code}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  a.confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {a.confirmed ? 'تم التأكيد' : 'بانتظار التأكيد'}
                </span>
              </div>
              <p className="font-bold text-xs text-slate-800 line-clamp-1 mb-1">{a.asset_name}</p>
              <p className="text-[11px] text-slate-500">{a.station_name} • {a.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Logs Overview */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">سجل العمليات والرقابة الأخير (Audit Log)</h3>
              <p className="text-[11px] text-slate-400">آخر العمليات والتعديلات المنفذة على أصول محطات كارجاس</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('audit_log')}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
          >
            عرض السجل الكامل ({auditLogs.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {auditLogs.slice(0, 4).map(log => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {log.user_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {log.action_label}
                  </span>
                  {log.asset_code && (
                    <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {log.asset_code}
                    </span>
                  )}
                  {log.station_name && (
                    <span className="text-[10px] text-slate-500">
                      ({log.station_name})
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-[11px]">{log.description}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {log.date_formatted}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
