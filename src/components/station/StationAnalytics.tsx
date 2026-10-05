import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Factory,
  Fuel,
  Layers,
  PieChart,
  ShieldCheck,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';

export const StationAnalytics: React.FC = () => {
  const { assets, stations, selectedStationId, categories } = useCargas();

  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const stationAssets = assets.filter(a => a.station_id === currentStation.id);

  const total = stationAssets.length;
  const confirmed = stationAssets.filter(a => a.confirmed).length;
  const pending = total - confirmed;
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  // Condition counts
  const conditions = {
    excellent: stationAssets.filter(a => a.condition === 'ممتازة').length,
    good: stationAssets.filter(a => a.condition === 'جيدة').length,
    maintenance: stationAssets.filter(a => a.condition === 'تحتاج صيانة').length,
    damaged: stationAssets.filter(a => a.condition === 'كهنة/تالفة').length
  };

  // Critical assets
  const criticalCount = stationAssets.filter(a => a.criticality === 'نعم').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-800 text-white shadow-2xs">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">تحليلات وإحصاءات المحطة</h1>
          </div>
          <p className="text-xs text-slate-500">
            {currentStation.name} • كود ({currentStation.code}) • منطقة {currentStation.region}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">مدير المحطة المسند:</span>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {currentStation.manager_name || 'مدير المحطة'}
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">إجمالي الأصول</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1">مدرجة بسجل المحطة</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">مطابقة ومعتمدة</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-extrabold text-green-600 font-mono">{confirmed}</p>
          <p className="text-[11px] text-green-600 font-medium mt-1">مؤكدة من الجرد الميداني</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">بانتظار التأكيد</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 font-mono">{pending}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">تحت المراجعة</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">بنود تشغيلية حرجة</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600 font-mono">{criticalCount}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">تؤثر مباشرة على الضخ</p>
        </div>

      </div>

      {/* Progress Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">نسبة إنجاز مطابقة الأصول بالمحطة</h3>
            <p className="text-xs text-slate-500">معدل اعتماد ومطابقة المسلسلات</p>
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{rate}%</span>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>

      {/* 2 Grids: Condition Breakdown & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Operational Condition */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-700" />
            <span>الحالة التشغيلية للأصول بالمحطة</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">حالة ممتازة</span>
                <span className="font-mono font-bold text-emerald-700">{conditions.excellent}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${total > 0 ? (conditions.excellent / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">حالة جيدة</span>
                <span className="font-mono font-bold text-blue-700">{conditions.good}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${total > 0 ? (conditions.good / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">تحتاج صيانة</span>
                <span className="font-mono font-bold text-amber-700">{conditions.maintenance}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${total > 0 ? (conditions.maintenance / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">كهنة / تالفة</span>
                <span className="font-mono font-bold text-rose-700">{conditions.damaged}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${total > 0 ? (conditions.damaged / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>توزيع الأصول حسب الفئة</span>
          </h3>

          <div className="space-y-3">
            {categories.map(cat => {
              const catAssets = stationAssets.filter(a => a.category === cat.name);
              const catCount = catAssets.length;
              if (catCount === 0) return null;
              const catConfirmed = catAssets.filter(a => a.confirmed).length;
              const catPercent = total > 0 ? Math.round((catCount / total) * 100) : 0;

              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="text-slate-500 font-mono">
                      {catConfirmed} / {catCount} أصل ({catPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
