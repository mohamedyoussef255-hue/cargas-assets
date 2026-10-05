import React, { forwardRef } from 'react';
import { ColoringFrameConfig } from '../types';
import { PRESET_ILLUSTRATIONS } from '../data/illustrations';
import { MascotIcon, DoodleIcon } from './MascotIcons';
import { HandwritingTracer } from './HandwritingTracer';
import { Pencil } from 'lucide-react';

interface ColoringSheetViewProps {
  config: ColoringFrameConfig;
  scale?: number;
}

export const ColoringSheetView = forwardRef<HTMLDivElement, ColoringSheetViewProps>(
  ({ config, scale = 1 }, ref) => {
    const { page, header, mainContent, bottomSection, footer } = config;

    // Find active line-art illustration
    const activeIllustration = PRESET_ILLUSTRATIONS.find(
      (item) => item.id === mainContent.presetId
    ) || PRESET_ILLUSTRATIONS[0];

    // Find active colored reference
    const activeRefIllustration = PRESET_ILLUSTRATIONS.find(
      (item) => item.id === bottomSection.referencePresetId
    ) || activeIllustration;

    // Render badge shape
    const renderHeaderBadge = () => {
      const badge = header.badge;
      if (badge.type === 'cloud') {
        return (
          <div className="relative flex flex-col items-center justify-center min-w-[70px] px-3 py-1.5">
            {/* Cloud shape background SVG */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 80"
              preserveAspectRatio="none"
              fill={badge.bg}
              stroke={badge.borderColor}
              strokeWidth="4"
              strokeLinejoin="round"
            >
              <path d="M 22 55 C 10 55 4 45 6 34 C 8 22 20 18 28 20 C 34 8 50 6 62 14 C 70 8 84 10 88 22 C 96 26 98 38 94 48 C 98 56 90 68 78 66 C 70 74 35 75 22 55 Z" />
            </svg>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span
                className="font-extrabold text-xl leading-none"
                style={{ color: badge.textColor, fontFamily: `'${header.titleFont}', sans-serif` }}
              >
                {badge.text}
              </span>
              {badge.icon === 'heart' && (
                <svg className="w-3.5 h-3.5 mt-0.5" viewBox="0 0 24 24" fill={badge.iconColor}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
              {badge.icon === 'star' && (
                <svg className="w-3.5 h-3.5 mt-0.5" viewBox="0 0 24 24" fill={badge.iconColor}>
                  <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                </svg>
              )}
            </div>
          </div>
        );
      }

      if (badge.type === 'scallop') {
        return (
          <div className="relative flex flex-col items-center justify-center min-w-[75px] px-3 py-1.5">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 110 75"
              preserveAspectRatio="none"
              fill={badge.bg}
              stroke={badge.borderColor}
              strokeWidth="4"
              strokeLinejoin="round"
            >
              <path d="M 15 38 C 12 24 24 12 38 12 C 48 8 62 8 72 12 C 86 12 98 24 95 38 C 98 52 86 64 72 64 C 62 68 48 68 38 64 C 24 64 12 52 15 38 Z" />
            </svg>
            <div className="relative z-10 flex flex-col items-center justify-center">
              <span
                className="font-extrabold text-lg leading-none"
                style={{ color: badge.textColor, fontFamily: `'${header.titleFont}', sans-serif` }}
              >
                {badge.text}
              </span>
              {badge.icon === 'heart' && (
                <svg className="w-3.5 h-3.5 mt-0.5" viewBox="0 0 24 24" fill={badge.iconColor}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </div>
          </div>
        );
      }

      // Default Pill or Ribbon
      return (
        <div
          className="flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl"
          style={{
            backgroundColor: badge.bg,
            border: `3px solid ${badge.borderColor}`,
          }}
        >
          <span
            className="font-extrabold text-lg leading-none"
            style={{ color: badge.textColor, fontFamily: `'${header.titleFont}', sans-serif` }}
          >
            {badge.text}
          </span>
          {badge.icon === 'heart' && (
            <svg className="w-3.5 h-3.5 mt-0.5" viewBox="0 0 24 24" fill={badge.iconColor}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          {badge.icon === 'star' && (
            <svg className="w-3.5 h-3.5 mt-0.5" viewBox="0 0 24 24" fill={badge.iconColor}>
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          )}
        </div>
      );
    };

    return (
      <div
        className="relative origin-top transition-transform duration-150 ease-out"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Printable Worksheet Canvas (standard Letter 792 x 1056 px ratio) */}
        <div
          id="coloring-sheet-canvas"
          ref={ref}
          className="relative bg-white text-slate-900 shadow-2xl flex flex-col justify-between overflow-hidden select-none"
          style={{
            width: '792px',
            height: '1056px',
            minWidth: '792px',
            minHeight: '1056px',
            maxWidth: '792px',
            maxHeight: '1056px',
            backgroundColor: page.pageBgColor,
            padding: `${page.padding}px`,
            borderRadius: `${page.outerBorderRadius}px`,
            border: `${page.outerBorderWidth}px solid ${page.outerBorderColor}`,
            boxShadow: page.outerDoubleBorder
              ? `0 0 0 4px #ffffff, 0 0 0 7px ${page.outerBorderColor}, 0 20px 25px -5px rgba(0,0,0,0.1)`
              : '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* TOP HEADER SECTION */}
          {header.show && (
            <header
              id="sheet-header"
              className="relative w-full flex items-center justify-between px-4 py-2.5 mb-2.5 transition-all overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${header.bannerBg} 0%, ${header.bannerBgEnd} 100%)`,
                border: `${header.bannerBorderWidth}px solid ${header.bannerBorderColor}`,
                borderRadius: `${header.bannerRadius}px`,
              }}
            >
              {/* Subtle glossy banner top reflection */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-[18px] pointer-events-none" />

              {/* Left: Mascot & Stars */}
              <div className="relative z-10 flex items-center gap-2">
                <div className="flex-shrink-0">
                  <MascotIcon
                    type={header.mascot.type}
                    color={header.mascot.color}
                    customUrl={header.mascot.customUrl}
                    className="w-14 h-14 filter drop-shadow-sm"
                  />
                </div>

                {header.showStars && (
                  <div className="flex flex-col gap-1 items-center">
                    <svg className="w-4 h-4 animate-pulse" viewBox="0 0 24 24" fill={header.starsColor}>
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill={header.starsColor}>
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Center: Main Title & Subtitle */}
              <div className="relative z-10 flex flex-col items-center text-center px-2 flex-grow">
                <h1
                  id="sheet-main-title"
                  className="tracking-wide font-extrabold leading-tight transition-colors drop-shadow-sm"
                  style={{
                    fontFamily: `'${header.titleFont}', cursive, sans-serif`,
                    fontSize: `${header.titleSize}px`,
                    color: header.titleColor,
                    textShadow: header.titleOutline
                      ? `-1px -1px 0 ${header.titleOutlineColor}, 1px -1px 0 ${header.titleOutlineColor}, -1px 1px 0 ${header.titleOutlineColor}, 1px 1px 0 ${header.titleOutlineColor}`
                      : 'none',
                  }}
                >
                  {header.title}
                </h1>

                {header.subtitle && (
                  <p
                    id="sheet-subtitle"
                    className="font-bold tracking-normal leading-snug mt-0.5"
                    style={{
                      fontFamily: `'${header.subtitleFont}', sans-serif`,
                      fontSize: `${header.subtitleSize}px`,
                      color: header.subtitleColor,
                    }}
                  >
                    {header.subtitle}
                  </p>
                )}
              </div>

              {/* Right: Stars & Page Badge */}
              <div className="relative z-10 flex items-center gap-2">
                {header.showStars && (
                  <div className="flex flex-col gap-1 items-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={header.starsColor}>
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                    <svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill={header.starsColor}>
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  </div>
                )}
                {renderHeaderBadge()}
              </div>
            </header>
          )}

          {/* MAIN COLORING DRAWING AREA */}
          <main
            id="sheet-main-box"
            className="relative flex-grow flex items-center justify-center w-full overflow-hidden bg-white"
            style={{
              border: `${mainContent.borderWidth}px solid ${mainContent.borderColor}`,
              borderRadius: `${mainContent.borderRadius}px`,
              backgroundColor: mainContent.bgColor,
              minHeight: '520px',
            }}
          >
            {/* Optional Top-Left Badge: e.g. "✏️ Color the picture." */}
            {mainContent.showInstructionBadge && (
              <div
                className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm"
                style={{
                  backgroundColor: mainContent.instructionBg,
                  color: mainContent.instructionTextColor,
                  border: `2px solid ${mainContent.instructionBorderColor}`,
                }}
              >
                <Pencil className="w-4 h-4" />
                <span className="text-xs font-bold font-sans">
                  {mainContent.instructionText}
                </span>
              </div>
            )}

            {/* Main Illustration Content */}
            <div
              className="w-full h-full flex items-center justify-center p-2"
              style={{
                filter: `brightness(${mainContent.imageBrightness}%) contrast(${mainContent.imageContrast}%)`,
                transform: `scale(${mainContent.imageScale / 100})`,
              }}
            >
              {mainContent.imageSource === 'upload' && mainContent.uploadedImage ? (
                <img
                  src={mainContent.uploadedImage}
                  alt="Coloring Page Line Art"
                  className={`w-full h-full object-${mainContent.imageFit} select-none`}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: activeIllustration.lineArtSvg,
                  }}
                />
              )}
            </div>
          </main>

          {/* BOTTOM TRACING & REFERENCE SECTION */}
          {bottomSection.show && (
            <section
              id="sheet-bottom-section"
              className="relative w-full flex items-center gap-3 p-2.5 mt-2.5 bg-white transition-all overflow-hidden"
              style={{
                border: `${bottomSection.borderWidth}px solid ${bottomSection.borderColor}`,
                borderRadius: `${bottomSection.borderRadius}px`,
                backgroundColor: bottomSection.bgColor,
                height: '142px',
                minHeight: '142px',
                maxHeight: '142px',
              }}
            >
              {/* Left: Colored Reference Thumbnail Guide */}
              {bottomSection.showReferenceThumbnail && (
                <div
                  className="relative flex-shrink-0 w-[145px] h-full rounded-xl overflow-hidden border-2 bg-slate-50 flex items-center justify-center shadow-inner"
                  style={{ borderColor: bottomSection.borderColor }}
                >
                  {bottomSection.referenceImage ? (
                    <img
                      src={bottomSection.referenceImage}
                      alt="Colored guide reference"
                      className="w-full h-full object-cover select-none"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{
                        __html: activeRefIllustration.coloredSvg,
                      }}
                    />
                  )}
                </div>
              )}

              {/* Right: Tracing words and handwriting line */}
              <div className="relative flex-grow h-full flex flex-col justify-between py-0.5 overflow-hidden">
                {/* Section Header with Pencil icon */}
                <div className="flex items-center gap-1.5 px-1">
                  <div
                    className="p-1 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${bottomSection.lineTopColor}40` }}
                  >
                    <Pencil
                      className="w-3.5 h-3.5"
                      style={{ color: bottomSection.traceHeaderColor }}
                    />
                  </div>
                  <span
                    className="font-extrabold text-sm tracking-wide"
                    style={{
                      color: bottomSection.traceHeaderColor,
                      fontFamily: `'${config.header.titleFont}', sans-serif`,
                    }}
                  >
                    {bottomSection.traceHeaderText}
                  </span>
                </div>

                {/* Handwriting Paper & Dotted Tracing with right-hand doodle */}
                <div className="relative w-full flex items-center justify-between gap-2 overflow-hidden px-1">
                  <div className="flex-grow overflow-visible">
                    <HandwritingTracer
                      words={bottomSection.traceWords}
                      font={bottomSection.traceWordsFont}
                      color={bottomSection.traceWordsColor}
                      size={bottomSection.traceWordsSize}
                      dotStyle={bottomSection.traceDotStyle}
                      lineTopColor={bottomSection.lineTopColor}
                      lineMidColor={bottomSection.lineMidColor}
                      lineBottomColor={bottomSection.lineBottomColor}
                      lineDescenderColor={bottomSection.lineDescenderColor}
                      showDescenderLine={bottomSection.showDescenderLine}
                    />
                  </div>

                  {/* Cute doodle icon on the right side (smiling heart or envelope) */}
                  {bottomSection.doodleIcon !== 'none' && (
                    <div className="flex-shrink-0 pl-1 pr-2 flex items-center justify-center">
                      <DoodleIcon
                        type={bottomSection.doodleIcon}
                        color={bottomSection.doodleColor}
                        sparkles={bottomSection.doodleSparkles}
                        className="w-14 h-14 filter drop-shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* FOOTER BAR (Name: ... Date: ... Heart) */}
          {footer.show && (
            <footer
              id="sheet-footer"
              className="relative w-full flex items-center justify-between px-3 pt-2 mt-1 text-sm font-bold"
              style={{
                color: footer.textColor,
                borderTop: footer.borderTop ? `2px dashed ${footer.lineColor}` : 'none',
              }}
            >
              <div className="flex items-center gap-6 flex-grow">
                {/* Name field */}
                <div className="flex items-center gap-1.5 flex-grow max-w-sm">
                  <span className="font-extrabold whitespace-nowrap">{footer.nameLabel}</span>
                  <div
                    className="flex-grow border-b-2 border-dashed h-4"
                    style={{ borderColor: footer.lineColor }}
                  />
                </div>

                {/* Date field */}
                <div className="flex items-center gap-1.5 w-48">
                  <span className="font-extrabold whitespace-nowrap">{footer.dateLabel}</span>
                  <div
                    className="flex-grow border-b-2 border-dashed h-4"
                    style={{ borderColor: footer.lineColor }}
                  />
                </div>
              </div>

              {/* Right accent icon */}
              {footer.icon !== 'none' && (
                <div className="flex items-center pl-3">
                  {footer.icon === 'heart' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={footer.iconColor}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                  {footer.icon === 'star' && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={footer.iconColor}>
                      <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                    </svg>
                  )}
                </div>
              )}
            </footer>
          )}
        </div>
      </div>
    );
  }
);
ColoringSheetView.displayName = 'ColoringSheetView';
