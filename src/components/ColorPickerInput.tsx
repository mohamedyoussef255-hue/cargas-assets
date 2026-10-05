import React from 'react';

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  id?: string;
}

const DEFAULT_SWATCHES = [
  '#00b4d8', // Cyan (Image 1)
  '#0284c7', // Sky Blue
  '#a855f7', // Purple (Image 2)
  '#7e22ce', // Deep Purple
  '#f43f5e', // Rose Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#065f46', // Deep Green
  '#1e293b', // Slate / Print Black
  '#ffffff', // White
];

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({
  label,
  value,
  onChange,
  presetColors = DEFAULT_SWATCHES,
  id,
}) => {
  return (
    <div className="flex flex-col gap-1.5" id={id}>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{label}</span>
        <span className="font-mono text-[11px] text-slate-500 uppercase">{value}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Color input box */}
        <div className="relative flex-shrink-0 w-9 h-9 rounded-lg border border-slate-300 overflow-hidden shadow-xs cursor-pointer hover:border-slate-400 transition-colors">
          <input
            type="color"
            value={value.startsWith('#') ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full rounded-lg"
            style={{ backgroundColor: value }}
          />
        </div>

        {/* Quick swatches */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none flex-grow">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`w-6 h-6 rounded-md border flex-shrink-0 transition-transform hover:scale-110 active:scale-95 ${
                value.toLowerCase() === color.toLowerCase()
                  ? 'ring-2 ring-blue-500 ring-offset-1 border-slate-400'
                  : 'border-slate-200'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
