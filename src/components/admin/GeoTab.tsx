import React, { useState } from 'react';
import { Edit2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useCargas } from '../../context/CargasContext';

export const GeoTab: React.FC = () => {
  const { geoAreas, stations, assets, addGeoArea, updateGeoArea, deleteGeoArea } = useCargas();

  const [isAdding, setIsAdding] = useState(false);
  const [level, setLevel] = useState<'region' | 'governorate'>('region');
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const regions = geoAreas.filter(g => g.level === 'region');
  const governorates = geoAreas.filter(g => g.level === 'governorate');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addGeoArea(level, name.trim());
    setIsAdding(false);
    setName('');
  };

  const handleUpdate = (id: string) => {
    if (!editingName.trim()) return;
    updateGeoArea(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">المناطق الجغرافية والمحافظات</h2>
          <p className="text-xs text-slate-500">
            توزيع محطات وأصول كارجاس جغرافياً (المناطق والمحافظات)
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منطقة / محافظة</span>
        </button>
      </div>

      {/* 2 Grids: Regions & Governorates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Regions Box */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>المناطق التشغيلية ({regions.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {regions.map(r => {
              const stationCount = stations.filter(s => s.region === r.name).length;
              const assetCount = assets.filter(a => a.region === r.name).length;

              return (
                <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  {editingId === r.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 text-xs border rounded bg-white flex-1"
                      />
                      <button
                        onClick={() => handleUpdate(r.id)}
                        className="px-2.5 py-1 text-xs bg-emerald-700 text-white rounded font-bold"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs text-slate-500"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-bold text-xs text-slate-800">منطقة {r.name}</span>
                        <p className="text-[10px] text-slate-400">
                          {stationCount} محطة • {assetCount} أصل
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setEditingName(r.name);
                          }}
                          className="p-1 rounded text-slate-500 hover:bg-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف منطقة "${r.name}"؟`)) {
                              deleteGeoArea(r.id);
                            }
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Governorates Box */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>المحافظات ({governorates.length})</span>
            </h3>
          </div>

          <div className="space-y-2">
            {governorates.map(g => {
              const stationCount = stations.filter(s => s.governorate === g.name).length;
              return (
                <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  {editingId === g.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 text-xs border rounded bg-white flex-1"
                      />
                      <button
                        onClick={() => handleUpdate(g.id)}
                        className="px-2.5 py-1 text-xs bg-emerald-700 text-white rounded font-bold"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 text-xs text-slate-500"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="font-bold text-xs text-slate-800">محافظة {g.name}</span>
                        <p className="text-[10px] text-slate-400">{stationCount} محطة</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(g.id);
                            setEditingName(g.name);
                          }}
                          className="p-1 rounded text-slate-500 hover:bg-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من حذف محافظة "${g.name}"؟`)) {
                              deleteGeoArea(g.id);
                            }
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">إضافة منطقة أو محافظة</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">النوع</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLevel('region')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      level === 'region' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    منطقة
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevel('governorate')}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      level === 'governorate' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    محافظة
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={level === 'region' ? 'مثال: القناة وسيناء' : 'مثال: الإسماعيلية'}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800"
                >
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
