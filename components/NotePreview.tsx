
import React, { useEffect } from 'react';
import { NoteSettings, PaperType } from '../types';
import { HANDWRITING_FONTS, INK_COLORS, PAPER_STYLES } from '../constants';

interface NotePreviewProps {
  settings: NoteSettings;
  onLoadingChange?: (isLoading: boolean) => void;
}

const NotePreview: React.FC<NotePreviewProps> = ({ settings }) => {
  const selectedFont = HANDWRITING_FONTS.find(f => f.id === settings.fontId);
  const baseFontFamily = selectedFont ? selectedFont.family : 'cursive';
  
  // Custom Font Loading Logic
  useEffect(() => {
    if (settings.useCustomFont && settings.customFontUrl) {
      const font = new FontFace('DB-Custom-Handwriting', `url(${settings.customFontUrl})`);
      font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
      }).catch(err => console.error("Dynamic Font Load Error:", err));
    }
  }, [settings.customFontUrl, settings.useCustomFont]);

  const fontFamily = (settings.useCustomFont && settings.customFontUrl) 
    ? '"DB-Custom-Handwriting", cursive' 
    : baseFontFamily;

  const paperBaseClass = PAPER_STYLES[settings.paperType];
  const inkColor = settings.paperType === PaperType.BLUEPRINT ? '#ffffff' : INK_COLORS[settings.inkColor];

  // Logic for the vertical red line typical in notebooks
  const showMarginLine = settings.paperType === PaperType.RULED || settings.paperType === PaperType.YELLOW_LEGAL;
  
  // Padding logic: If we have a margin line, the text starts after it.
  const contentPaddingLeft = showMarginLine ? settings.margin + 24 : 0;

  return (
    <div className="flex justify-center w-full min-h-full p-4 md:p-12 lg:p-16 select-none bg-slate-100/50 dark:bg-slate-900/10">
      {/* The Paper Sheet */}
      <div 
        id="note-preview"
        className={`w-full max-w-[850px] transition-all duration-500 ease-in-out relative flex flex-col ${paperBaseClass}`}
        style={{ 
          minHeight: '1100px', // Standard A4 Aspect Ratio feel
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 1px 0 rgba(0,0,0,0.1)',
          paddingTop: `${settings.paddingY}px`,
          paddingBottom: `${settings.paddingY}px`,
          paddingLeft: `${settings.paddingX}px`,
          paddingRight: `${settings.paddingX}px`,
        }}
      >
        {/* Realistic Vertical Margin Line */}
        {showMarginLine && (
          <div 
            className="absolute top-0 bottom-0 z-0 border-r-2 border-red-200/60 pointer-events-none" 
            style={{ left: `${settings.margin}px` }}
          />
        )}

        {/* Text Layer */}
        <div 
          className="relative z-10 w-full h-full whitespace-pre-wrap break-words leading-relaxed selection:bg-indigo-100 selection:text-indigo-900"
          style={{
            fontFamily,
            fontSize: `${settings.fontSize}px`,
            color: inkColor,
            lineHeight: settings.lineSpacing,
            letterSpacing: `${settings.letterSpacing}px`,
            textAlign: settings.textAlign,
            paddingLeft: `${contentPaddingLeft}px`,
            transform: `rotate(${settings.tilt}deg)`,
            transformOrigin: 'top left',
            textShadow: settings.paperType === PaperType.BLUEPRINT 
              ? '1px 1px 2px rgba(0,0,0,0.5)' 
              : '0.2px 0.2px 0.5px rgba(0,0,0,0.1)',
            transition: 'font-size 0.2s, line-height 0.2s, color 0.3s, text-align 0.3s',
            fontVariantLigatures: 'none'
          }}
        >
          {settings.text || "Welcome to DB Instant Notes.\n\nType your content in the input field to see it transformed into high-quality handwriting. You can adjust the font style, ink color, paper type, and even fine-tune the layout using the controls on the left.\n\nTry using the 'Humanize' tool to give your text a more conversational and natural flow!"}
        </div>

        {/* Subtle Paper Grain Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-20"></div>
      </div>
    </div>
  );
};

export default NotePreview;
