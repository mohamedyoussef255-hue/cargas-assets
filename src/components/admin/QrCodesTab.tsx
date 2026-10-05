import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckSquare,
  Copy,
  Download,
  Filter,
  Printer,
  QrCode,
  Search,
  Square,
  Zap
} from 'lucide-react';
import { useCargas } from '../../context/CargasContext';
import { Asset } from '../../types/cargas';
import { generateQrDataUrl } from '../../utils/qrGenerator';

export const QrCodesTab: React.FC = () => {
  const { assets, stations, categories, generateMissingQrs } = useCargas();

  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [isLoadingQrs, setIsLoadingQrs] = useState(false);

  // Memoized Filter
  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assets.filter(a => {
      if (stationFilter && a.station_id !== stationFilter) return false;
      if (categoryFilter && a.category !== categoryFilter) return false;
      if (q) {
        return (
          String(a.asset_name || '').toLowerCase().includes(q) ||
          String(a.asset_code || '').toLowerCase().includes(q) ||
          String(a.serial_no || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [assets, stationFilter, categoryFilter, searchQuery]);

  // Pre-generate QR URLs for filtered assets in cache safely
  useEffect(() => {
    let isMounted = true;
    const slice50 = filteredAssets.slice(0, 50);
    const missing = slice50.filter(a => !qrCache[a.id]);

    if (missing.length === 0) {
      setIsLoadingQrs(false);
      return;
    }

    setIsLoadingQrs(true);

    const generateBatch = async () => {
      const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
      const newEntries: Record<string, string> = {};

      for (const asset of missing) {
        if (!isMounted) break;
        const scanUrl = asset.qr_code || (origin ? `${origin}/scan/${asset.asset_code}` : asset.asset_code);
        newEntries[asset.id] = await generateQrDataUrl(scanUrl, 200);
      }

      if (isMounted) {
        setQrCache(prev => ({ ...prev, ...newEntries }));
        setIsLoadingQrs(false);
      }
    };

    generateBatch();

    return () => {
      isMounted = false;
    };
  }, [filteredAssets]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const handleToggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handlePrintSelected = () => {
    const selectedAssets = filteredAssets.filter(a => selectedIds.has(a.id));
    if (selectedAssets.length === 0) {
      alert('يرجى تحديد أصل واحد على الأقل للطباعة.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stickersHtml = selectedAssets.map(asset => {
      const qrData = qrCache[asset.id] || '';
      return `
        <div class="sticker-card">
          <div class="header">
            <div>
              <div class="logo">كارجاس CARGAS</div>
              <div class="sub">نظام إدارة الأصول</div>
            </div>
            <div class="station-badge">${asset.station_name}</div>
          </div>
          <div class="qr-box">
            <img src="${qrData}" alt="${asset.asset_code}" />
          </div>
          <div class="code">${asset.asset_code}</div>
          <div class="name">${asset.asset_name}</div>
          <div class="meta">
            <div><strong>الفئة:</strong> ${asset.category}</div>
            ${asset.serial_no ? `<div><strong>م/س:</strong> ${asset.serial_no}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة ملصقات كود QR - شركة كارجاس</title>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            body {
              font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8mm;
            }
            .sticker-card {
              border: 2px solid #166534;
              border-radius: 8px;
              padding: 10px;
              text-align: center;
              page-break-inside: avoid;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
              margin-bottom: 6px;
            }
            .logo {
              font-weight: 800;
              font-size: 14px;
              color: #166534;
            }
            .sub {
              font-size: 9px;
              color: #64748b;
            }
            .station-badge {
              font-size: 11px;
              font-weight: bold;
              color: #166534;
              background: #dcfce7;
              padding: 2px 6px;
              border-radius: 4px;
            }
            .qr-box img {
              width: 110px;
              height: 110px;
              margin: 4px 0;
            }
            .code {
              font-family: monospace;
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 1px;
            }
            .name {
              font-size: 12px;
              font-weight: bold;
              color: #1e293b;
              margin: 2px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .meta {
              display: flex;
              justify-content: space-around;
              font-size: 10px;
              color: #475569;
              border-top: 1px dashed #cbd5e1;
              padding-top: 5px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${stickersHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Left: Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-700" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>تحديد الكل ({filteredAssets.length})</span>
          </button>

          <button
            onClick={handlePrintSelected}
            disabled={selectedIds.size === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              selectedIds.size > 0
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>طباعة ملصقات ({selectedIds.size})</span>
          </button>
        </div>

        {/* Right: Search */}
        <div className="relative sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالكود أو الاسم..."
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-emerald-600 bg-slate-50/50"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>

      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">المحطة:</span>
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 font-medium bg-white"
          >
            <option value="">جميع المحطات</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">الفئة:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-300 font-medium bg-white"
          >
            <option value="">جميع الفئات</option>
            {categories.map(c => (
              <option key={c.key} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sticker Grid Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map(asset => {
          const isSelected = selectedIds.has(asset.id);
          const qrSrc = qrCache[asset.id];

          return (
            <div
              key={asset.id}
              onClick={() => handleToggleOne(asset.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative bg-white ${
                isSelected
                  ? 'border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Checkbox indicator */}
              <div className="absolute top-3 left-3 z-10">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
                )}
              </div>

              {/* Card Content */}
              <div className="text-center">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="text-[11px] font-bold text-emerald-800">كارجاس</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {asset.station_name}
                  </span>
                </div>

                {/* QR Code thumbnail */}
                <div className="flex justify-center my-2">
                  {qrSrc ? (
                    <img
                      src={qrSrc}
                      alt={asset.asset_code}
                      className="w-28 h-28 p-1 bg-white border border-slate-200 rounded-xl"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                      جاري التوليد...
                    </div>
                  )}
                </div>

                {/* Code & Name */}
                <p className="font-mono font-extrabold text-sm text-slate-900">{asset.asset_code}</p>
                <p className="font-bold text-xs text-slate-700 line-clamp-1 mt-0.5">{asset.asset_name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{asset.category}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
