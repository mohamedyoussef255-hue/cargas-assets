import React from 'react';
import { MascotType, DoodleType } from '../types';

interface MascotProps {
  type: MascotType;
  color?: string;
  customUrl?: string;
  className?: string;
}

export const MascotIcon: React.FC<MascotProps> = ({
  type,
  color = '#0284c7',
  customUrl,
  className = 'w-12 h-12',
}) => {
  if (type === 'custom' && customUrl) {
    return (
      <img
        src={customUrl}
        alt="Custom Mascot"
        className={`${className} object-contain rounded-full`}
      />
    );
  }

  switch (type) {
    case 'stethoscope':
      // Cute Doctor Stethoscope matching Image 1
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stethoscope tubing loop */}
          <path
            d="M 22 28 C 15 45 15 70 36 82 C 55 92 78 86 85 68 C 90 56 86 42 76 34"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Top binaural tubes */}
          <path
            d="M 30 24 C 30 42 45 55 58 55 C 72 55 80 42 80 24"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Ear tips */}
          <circle cx="28" cy="22" r="6" fill={color} />
          <circle cx="82" cy="22" r="6" fill={color} />
          {/* Main smiling chest piece in center */}
          <circle cx="58" cy="46" r="24" fill="#ffffff" stroke={color} strokeWidth="6" />
          {/* Chest piece face */}
          <circle cx="50" cy="42" r="3.5" fill="#1e293b" />
          <circle cx="66" cy="42" r="3.5" fill="#1e293b" />
          <circle cx="51" cy="40.5" r="1" fill="#ffffff" />
          <circle cx="67" cy="40.5" r="1" fill="#ffffff" />
          <path d="M 52 50 Q 58 56 64 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Little heart on chest piece */}
          <path
            d="M 24 16 C 21 12 16 14 16 18 C 16 23 24 28 24 28 C 24 28 32 23 32 18 C 32 14 27 12 24 16 Z"
            fill="#ef4444"
          />
        </svg>
      );

    case 'police':
      // Cute Police / Helper Officer matching Image 2
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Police cap */}
          <ellipse cx="50" cy="30" rx="34" ry="18" fill="#1e3a8a" />
          <path d="M 22 34 Q 50 24 78 34" stroke="#facc15" strokeWidth="4" />
          <ellipse cx="50" cy="38" rx="28" ry="6" fill="#0f172a" />
          {/* Gold badge on cap */}
          <path d="M 50 16 L 56 22 L 54 30 L 46 30 L 44 22 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          {/* Face */}
          <path d="M 26 38 C 26 62 36 78 50 78 C 64 78 74 62 74 38 Z" fill="#fed7aa" />
          {/* Hair sides */}
          <path d="M 25 36 Q 22 50 28 56" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
          <path d="M 75 36 Q 78 50 72 56" stroke="#451a03" strokeWidth="6" strokeLinecap="round" />
          {/* Eyes & Smile */}
          <ellipse cx="40" cy="50" rx="3.5" ry="5" fill="#1e293b" />
          <ellipse cx="60" cy="50" rx="3.5" ry="5" fill="#1e293b" />
          <circle cx="41" cy="48" r="1.5" fill="#ffffff" />
          <circle cx="61" cy="48" r="1.5" fill="#ffffff" />
          <path d="M 44 60 Q 50 67 56 60" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="34" cy="58" r="3" fill="#f43f5e" opacity="0.6" />
          <circle cx="66" cy="58" r="3" fill="#f43f5e" opacity="0.6" />
          {/* Uniform collar */}
          <path d="M 32 76 L 50 88 L 68 76 L 76 96 L 24 96 Z" fill="#2563eb" />
          <path d="M 48 88 L 52 88 L 54 96 L 46 96 Z" fill="#facc15" />
        </svg>
      );

    case 'astronaut':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="46" r="34" fill="#f8fafc" stroke={color} strokeWidth="5" />
          <ellipse cx="50" cy="46" rx="22" ry="16" fill="#38bdf8" />
          <ellipse cx="44" cy="42" rx="6" ry="4" fill="#ffffff" opacity="0.7" />
          <circle cx="43" cy="47" r="2.5" fill="#1e293b" />
          <circle cx="57" cy="47" r="2.5" fill="#1e293b" />
          <path d="M 46 54 Q 50 58 54 54" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          <path d="M 28 80 C 28 72 40 68 50 68 C 60 68 72 72 72 80 L 76 94 L 24 94 Z" fill="#f1f5f9" stroke={color} strokeWidth="4" />
        </svg>
      );

    case 'bear':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="30" r="14" fill="#b45309" stroke={color} strokeWidth="3" />
          <circle cx="28" cy="30" r="8" fill="#fed7aa" />
          <circle cx="72" cy="30" r="14" fill="#b45309" stroke={color} strokeWidth="3" />
          <circle cx="72" cy="30" r="8" fill="#fed7aa" />
          <circle cx="50" cy="54" r="30" fill="#d97706" stroke={color} strokeWidth="4" />
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="#fef3c7" />
          <ellipse cx="50" cy="58" rx="6" ry="4" fill="#1e293b" />
          <path d="M 50 62 V 67 M 45 67 Q 50 71 55 67" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="48" r="3.5" fill="#1e293b" />
          <circle cx="60" cy="48" r="3.5" fill="#1e293b" />
        </svg>
      );

    case 'chef':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 32 36 C 24 36 20 26 28 18 C 34 10 46 14 50 20 C 54 12 66 10 72 18 C 80 26 76 36 68 36 Z" fill="#ffffff" stroke={color} strokeWidth="4" />
          <rect x="30" y="32" width="40" height="12" rx="3" fill="#ffffff" stroke={color} strokeWidth="3" />
          <circle cx="50" cy="60" r="22" fill="#fed7aa" stroke={color} strokeWidth="3" />
          <circle cx="43" cy="58" r="3" fill="#1e293b" />
          <circle cx="57" cy="58" r="3" fill="#1e293b" />
          <path d="M 45 66 Q 50 72 55 66" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'heart':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 50 82 C 20 60 10 42 16 26 C 22 10 38 12 50 26 C 62 12 78 10 84 26 C 90 42 80 60 50 82 Z"
            fill="#f43f5e"
            stroke={color}
            strokeWidth="4"
          />
          <circle cx="40" cy="38" r="3.5" fill="#ffffff" />
          <circle cx="60" cy="38" r="3.5" fill="#ffffff" />
          <path d="M 44 48 Q 50 54 56 48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'star':
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="50,10 62,35 90,38 68,58 75,86 50,71 25,86 32,58 10,38 38,35"
            fill="#facc15"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle cx="43" cy="46" r="3" fill="#1e293b" />
          <circle cx="57" cy="46" r="3" fill="#1e293b" />
          <path d="M 45 54 Q 50 59 55 54" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};

interface DoodleProps {
  type: DoodleType;
  color?: string;
  sparkles?: boolean;
  className?: string;
}

export const DoodleIcon: React.FC<DoodleProps> = ({
  type,
  color = '#0284c7',
  sparkles = true,
  className = 'w-12 h-12',
}) => {
  if (type === 'none') return null;

  switch (type) {
    case 'heart':
      // Cheerful smiling heart with ray sparkles as in Image 1
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
          {sparkles && (
            <>
              {/* Left ray sparkles */}
              <div
                className="absolute -left-2 top-2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div
                className="absolute -left-3 top-5 w-2 h-1 rounded-full rotate-45"
                style={{ backgroundColor: color }}
              />
              {/* Right ray sparkles */}
              <div
                className="absolute -right-2 top-2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div
                className="absolute -right-3 top-5 w-2 h-1 rounded-full -rotate-45"
                style={{ backgroundColor: color }}
              />
            </>
          )}
          <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
            <path
              d="M 32 52 C 14 38 6 26 10 16 C 14 6 24 8 32 17 C 40 8 50 6 54 16 C 58 26 50 38 32 52 Z"
              stroke={color}
              strokeWidth="3.5"
              fill="#ffffff"
            />
            {/* Cute face */}
            <ellipse cx="25" cy="25" rx="2" ry="2.5" fill={color} />
            <ellipse cx="39" cy="25" rx="2" ry="2.5" fill={color} />
            <path d="M 27 32 Q 32 37 37 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'envelope':
      // Cute envelope doodle with smiling face and hearts as in Image 2
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
          {sparkles && (
            <>
              {/* Little floating hearts & sparkles */}
              <svg className="absolute -top-2 -right-1 w-4 h-4" viewBox="0 0 24 24" fill={color}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <div
                className="absolute -left-2 top-3 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            </>
          )}
          <svg viewBox="0 0 64 52" className="w-full h-full" fill="none" style={{ transform: 'rotate(8deg)' }}>
            <rect x="4" y="8" width="56" height="38" rx="6" stroke={color} strokeWidth="3.5" fill="#ffffff" />
            <path d="M 5 10 L 32 28 L 59 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
            {/* Smile on envelope */}
            <circle cx="26" cy="30" r="2" fill={color} />
            <circle cx="38" cy="30" r="2" fill={color} />
            <path d="M 28 35 Q 32 38 36 35" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'star':
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <polygon
              points="25,5 31,18 45,19 34,29 38,43 25,35 12,43 16,29 5,19 19,18"
              stroke={color}
              strokeWidth="2.5"
              fill="#fef08a"
            />
            <circle cx="21" cy="23" r="1.5" fill="#1e293b" />
            <circle cx="29" cy="23" r="1.5" fill="#1e293b" />
            <path d="M 22 28 Q 25 31 28 28" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'flower':
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <circle cx="25" cy="15" r="7" fill="#fbcfe8" stroke={color} strokeWidth="2" />
            <circle cx="25" cy="35" r="7" fill="#fbcfe8" stroke={color} strokeWidth="2" />
            <circle cx="15" cy="25" r="7" fill="#fbcfe8" stroke={color} strokeWidth="2" />
            <circle cx="35" cy="25" r="7" fill="#fbcfe8" stroke={color} strokeWidth="2" />
            <circle cx="25" cy="25" r="7" fill="#fde047" stroke={color} strokeWidth="2.5" />
          </svg>
        </div>
      );

    case 'pencil':
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none" style={{ transform: 'rotate(-25deg)' }}>
            <rect x="20" y="8" width="10" height="28" rx="2" fill="#fde047" stroke={color} strokeWidth="2.5" />
            <polygon points="20,36 30,36 25,46" fill="#fed7aa" stroke={color} strokeWidth="2.5" />
            <polygon points="23,42 27,42 25,46" fill="#1e293b" />
            <rect x="20" y="4" width="10" height="6" rx="2" fill="#f472b6" stroke={color} strokeWidth="2" />
          </svg>
        </div>
      );

    case 'smile':
      return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <circle cx="25" cy="25" r="18" fill="#fef08a" stroke={color} strokeWidth="3" />
            <circle cx="19" cy="21" r="2.5" fill="#1e293b" />
            <circle cx="31" cy="21" r="2.5" fill="#1e293b" />
            <path d="M 18 28 Q 25 36 32 28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};
