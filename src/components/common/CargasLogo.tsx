import React, { useState } from 'react';

interface CargasLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  light?: boolean;
  iconOnly?: boolean;
}

export const CargasLogo: React.FC<CargasLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  light = false,
  iconOnly = false
}) => {
  const [imgSrc, setImgSrc] = useState('/NGV.jpg');

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Cargas NGV Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl flex items-center justify-center p-0.5 bg-white border border-slate-200/90 dark:border-slate-700/80 shadow-xs shrink-0 overflow-hidden`}
        title="شركة كارجاس للغاز الطبيعي للسيارات (CARGAS NGV)"
      >
        <img
          src={imgSrc}
          alt="شعار شركة كارجاس NGV"
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== '/cargas_logo.svg') {
              setImgSrc('/cargas_logo.svg');
            }
          }}
          className="w-full h-full object-contain"
        />
      </div>

      {!iconOnly && (
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className={`font-bold tracking-tight ${textSizes[size]} ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              شركة كارجاس
            </span>
            <span className="text-[10px] font-black italic px-1.5 py-0.5 rounded bg-emerald-700 text-yellow-300 border border-emerald-600 shadow-2xs">
              NGV
            </span>
          </div>
          {showSubtitle && (
            <p className={`text-[11px] ${light ? 'text-emerald-200' : 'text-slate-500 dark:text-slate-400'}`}>
              نظام إدارة وتكويد الأصول
            </p>
          )}
        </div>
      )}
    </div>
  );
};

