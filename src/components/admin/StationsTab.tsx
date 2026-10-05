import React, { useState } from 'react';
import { Edit2, Factory, Fuel, Plus, Trash2, X } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Station } from '../../types/cargas';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const StationsTab: React.FC = () => {
  const { stations, geoAreas, assets, addStation, updateStation, deleteStation } = useCargas();

  const [isAdding, setIsAdding] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [managerName, setManagerName] = useState('');

  const regions = geoAreas.filter(g => g.level === 'region');
  const governorates = geoAreas.filter(g => g.level === 'governorate');

  const handleOpenAdd = () => {
    setCode(`ST-${String(stations.length + 1).padStart(3, '0')}`);
    setName('');
    setRegion(regions[0]?.name || 'شرق');
    setGovernorate(governorates[0]?.name || 'القاهرة');
    setManagerName('');
    setEditingStation(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (st: Station) => {
    setEditingStation(st);
    setCode(st.code);
    setName(st.name);
    setRegion(st.region);
    setGovernorate(st.governorate);
    setManagerName(st.manager_name || '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingStation) {
      updateStation(editingStation.id, {
        code: code.trim(),
        name: name.trim(),
        region,
        governorate,
        manager_name: managerName.trim()
      });
    } else {
      addStation({
        code: code.trim(),
        name: name.trim(),
        region,
        governorate,
        manager_name: managerName.trim(),
        status: 'نشطة'
      });
    }

    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">محطات تموين الغاز الطبيعي</h2>
          <p className="text-xs text-slate-500">
            إدارة بيانات محطات كارجاس وتعيين مديري المحطات والمناطق
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة محطة جديدة</span>
        </button>
      </div>

      {/* Stations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">كود المحطة</th>
                <th className="py-3 px-4">اسم المحطة</th>
                <th className="py-3 px-4">المنطقة</th>
                <th className="py-3 px-4">المحافظة</th>
                <th className="py-3 px-4">مدير المحطة</th>
                <th className="py-3 px-4 text-center">عدد الأصول</th>
                <th className="py-3 px-4 text-center">الحالة</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stations.map(st => {
                const stAssets = assets.filter(a => a.station_id === st.id);
                const confirmedCount = stAssets.filter(a => a.confirmed).length;

                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{st.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-4 text-slate-600">منطقة {st.region}</td>
                    <td className="py-3 px-4 text-slate-600">{st.governorate}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{st.manager_name || 'غير محدد'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-slate-800">
                        {confirmedCount} / {stAssets.length}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {st.status || 'نشطة'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1 rounded text-slate-600 hover:bg-slate-100"
                          title="تعديل المحطة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStationToDelete(st)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                          title="حذف المحطة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingStation ? 'تعديل بيانات المحطة' : 'إضافة محطة جديدة'}
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كود المحطة *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border border-slate-300 focus:outline-none focus:border-emerald-600 text-left"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المحطة *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: محطة الدقي"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة *</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  >
                    {regions.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة *</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  >
                    {governorates.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم مدير المحطة</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="مثال: م. مصطفى عبد الرحمن"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs"
                >
                  {editingStation ? 'حفظ التعديلات' : 'إضافة المحطة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!stationToDelete}
        onClose={() => setStationToDelete(null)}
        onConfirm={() => {
          if (stationToDelete) {
            deleteStation(stationToDelete.id);
            setStationToDelete(null);
          }
        }}
        type="danger"
        title="تأكيد حذف المحطة"
        message={`هل أنت متأكد من رغبتك في حذف محطة "${stationToDelete?.name}" من المنظومة؟`}
        confirmLabel="تأكيد حذف المحطة"
        cancelLabel="تراجع"
        itemDetails={stationToDelete ? [
          { label: 'كود المحطة', value: stationToDelete.code },
          { label: 'اسم المحطة', value: stationToDelete.name },
          { label: 'المنطقة', value: stationToDelete.region },
          { label: 'الأصول المسجلة بالمحطة', value: `${assets.filter(a => a.station_id === stationToDelete.id).length} أصل` }
        ] : []}
      />

    </div>
  );
};
