import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, Printer, X } from 'lucide-react';
import { Asset } from '../../types/cargas';
import { generateQrDataUrl } from '../../utils/qrGenerator';
import { CargasLogo } from '../common/CargasLogo';

interface QrModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ asset, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (asset) {
      const scanLink = asset.qr_code || `${window.location.origin}/scan/${asset.asset_code}`;
      generateQrDataUrl(scanLink, 360).then(setQrUrl);
    }
  }, [asset]);

  if (!asset) return null;

  const scanLink = asset.qr_code || `${window.location.origin}/scan/${asset.asset_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR_${asset.asset_code}.png`;
    a.click();
  };

  const handlePrintSticker = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <title>طباعة ملصق كود الأصل - ${asset.asset_code}</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body {
              font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
              margin: 0;
              padding: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .sticker {
              width: 80mm;
              border: 2px solid #166534;
              border-radius: 8px;
              padding: 10px;
              text-align: center;
              box-sizing: border-box;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 8px;
            }
            .logo-text {
              font-weight: 800;
              font-size: 16px;
              color: #166534;
            }
            .sub-text {
              font-size: 10px;
              color: #64748b;
            }
            .qr-container {
              margin: 6px 0;
            }
            .qr-container img {
              width: 130px;
              height: 130px;
            }
            .code {
              font-family: monospace;
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 1px;
            }
            .asset-name {
              font-size: 13px;
              font-weight: 700;
              color: #1e293b;
              margin: 4px 0;
            }
            .info-grid {
              font-size: 10px;
              color: #475569;
              display: flex;
              justify-content: space-around;
              margin-top: 6px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="sticker">
            <div class="header">
              <div style="text-align: right;">
                <div class="logo-text">كارجاس CARGAS</div>
                <div class="sub-text">إدارة وتكويد الأصول</div>
              </div>
              <div style="font-size: 11px; font-weight: bold; color: #166534;">
                ${asset.station_name}
              </div>
            </div>

            <div class="qr-container">
              <img src="${qrUrl}" alt="${asset.asset_code}" />
            </div>

            <div class="code">${asset.asset_code}</div>
            <div class="asset-name">${asset.asset_name}</div>

            <div class="info-grid">
              <div><strong>الفئة:</strong> ${asset.category}</div>
              ${asset.serial_no ? `<div><strong>م/س:</strong> ${asset.serial_no}</div>` : ''}
              <div><strong>المنطقة:</strong> ${asset.region}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <CargasLogo size="sm" showSubtitle={false} />
            <span className="text-sm font-bold text-slate-800">بطاقة ملصق كود الأصل</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Sticker Card Preview */}
        <div className="p-6">
          <div
            id="qr-sticker-preview"
            className="border-2 border-emerald-700/80 rounded-2xl p-5 bg-gradient-to-b from-white to-emerald-50/20 text-center shadow-md relative"
          >
            {/* Cargas Sticker Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
              <div className="text-right">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-800 text-sm">
                  <span>كارجاس</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">CARGAS</span>
                </div>
                <p className="text-[10px] text-slate-500">نظام تكويد الأصول</p>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {asset.station_name}
                </span>
                <p className="text-[10px] text-slate-400">{asset.region}</p>
              </div>
            </div>

            {/* QR Code image */}
            <div className="my-3 flex justify-center">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={asset.asset_code}
                  className="w-44 h-44 rounded-xl border border-slate-200 p-2 bg-white shadow-2xs"
                />
              ) : (
                <div className="w-44 h-44 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                  جاري توليد الكود...
                </div>
              )}
            </div>

            {/* Code and Name */}
            <div className="font-mono text-xl font-extrabold text-slate-900 tracking-wider mb-1">
              {asset.asset_code}
            </div>
            <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-3">
              {asset.asset_name}
            </p>

            {/* Metadata Footer */}
            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-dashed border-slate-300 text-[11px] text-slate-600">
              <div className="text-right">
                <span className="text-slate-400">الفئة: </span>
                <span className="font-semibold text-slate-800">{asset.category}</span>
              </div>
              <div className="text-left">
                <span className="text-slate-400">المسلسل: </span>
                <span className="font-mono font-semibold text-slate-800">{asset.serial_no || '—'}</span>
              </div>
            </div>
          </div>

          {/* Quick Copy Link */}
          <div className="mt-4 flex items-center gap-2 p-2 bg-slate-100 rounded-xl text-xs text-slate-600">
            <span className="truncate flex-1 font-mono text-[11px]" dir="ltr">{scanLink}</span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold hover:bg-slate-50 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleDownloadQr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل PNG</span>
          </button>
          <button
            onClick={handlePrintSticker}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة الملصق</span>
          </button>
        </div>

      </div>
    </div>
  );
};
