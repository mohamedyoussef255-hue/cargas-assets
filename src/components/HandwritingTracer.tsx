import React from 'react';
import { FontOption, TraceDotStyle } from '../types';

interface HandwritingTracerProps {
  words: string;
  font: FontOption;
  color: string;
  size: number;
  dotStyle: TraceDotStyle;
  lineTopColor: string;
  lineMidColor: string;
  lineBottomColor: string;
  lineDescenderColor: string;
  showDescenderLine: boolean;
}

export const HandwritingTracer: React.FC<HandwritingTracerProps> = ({
  words,
  font,
  color,
  size,
  dotStyle,
  lineTopColor,
  lineMidColor,
  lineBottomColor,
  lineDescenderColor,
  showDescenderLine,
}) => {
  // Check if text is Arabic
  const isArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(words);

  // Derive dasharray based on dotStyle
  const getStrokeDashArray = () => {
    switch (dotStyle) {
      case 'dotted':
        return '2 4';
      case 'dashed':
        return '5 4';
      case 'outline':
      case 'solid':
      default:
        return 'none';
    }
  };

  const getStrokeWidth = () => {
    switch (dotStyle) {
      case 'dotted':
        return '2.2';
      case 'dashed':
        return '2';
      case 'outline':
        return '1.8';
      case 'solid':
      default:
        return '0';
    }
  };

  const getFill = () => {
    switch (dotStyle) {
      case 'solid':
        return color;
      case 'outline':
      case 'dotted':
      case 'dashed':
      default:
        return 'none';
    }
  };

  return (
    <div className="relative w-full h-[72px] flex items-center select-none overflow-visible">
      {/* Primary Handwriting Guidelines SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 500 72"
      >
        {/* Top Headline */}
        <line
          x1="0"
          y1="10"
          x2="500"
          y2="10"
          stroke={lineTopColor}
          strokeWidth="1.6"
          strokeDasharray="4 4"
        />

        {/* Middle Dashed Line */}
        <line
          x1="0"
          y1="34"
          x2="500"
          y2="34"
          stroke={lineMidColor}
          strokeWidth="1.8"
          strokeDasharray="5 5"
        />

        {/* Bottom Baseline */}
        <line
          x1="0"
          y1="58"
          x2="500"
          y2="58"
          stroke={lineBottomColor}
          strokeWidth="2.2"
        />

        {/* Optional Descender Line */}
        {showDescenderLine && (
          <line
            x1="0"
            y1="70"
            x2="500"
            y2="70"
            stroke={lineDescenderColor}
            strokeWidth="1.2"
            strokeDasharray="2 3"
          />
        )}
      </svg>

      {/* Traceable Text positioned right on the baseline */}
      <div
        className="relative z-10 w-full flex items-baseline px-2"
        style={{
          direction: isArabic ? 'rtl' : 'ltr',
          fontFamily: `'${font}', cursive, sans-serif`,
        }}
      >
        {dotStyle === 'solid' ? (
          <span
            style={{
              color,
              fontSize: `${size}px`,
              lineHeight: 1,
              letterSpacing: isArabic ? 'normal' : '0.12em',
              fontWeight: 600,
            }}
          >
            {words}
          </span>
        ) : (
          /* High-precision SVG text tracing for dots and outlines */
          <svg
            className="w-full h-[62px] overflow-visible"
            viewBox="0 0 600 62"
            preserveAspectRatio={isArabic ? 'xMaxYMid meet' : 'xMinYMid meet'}
          >
            <text
              x={isArabic ? '590' : '10'}
              y="48"
              textAnchor={isArabic ? 'end' : 'start'}
              fill={getFill()}
              stroke={color}
              strokeWidth={getStrokeWidth()}
              strokeDasharray={getStrokeDashArray()}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                fontFamily: `'${font}', sans-serif`,
                fontSize: `${size}px`,
                letterSpacing: isArabic ? 'normal' : '0.14em',
                fontWeight: 600,
              }}
            >
              {words}
            </text>
          </svg>
        )}
      </div>
    </div>
  );
};
