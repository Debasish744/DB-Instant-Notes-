
import React from 'react';
import { NoteSettings, PaperType, InkColor, TextAlign } from '../types';
import { HANDWRITING_FONTS, INK_COLORS, TEMPLATES } from '../constants';
import Tooltip from './Tooltip';
import FontUploader from './FontUploader';
import HandwritingTemplate from './HandwritingTemplate';

interface ControlPanelProps {
  settings: NoteSettings;
  onChange: (settings: Partial<NoteSettings>) => void;
  onApplyTemplate: (settings: Partial<NoteSettings>) => void;
  onAIRefine: () => void;
  onAISummarize: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isAIProcessing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  onChange, 
  onApplyTemplate,
  onAIRefine, 
  onAISummarize, 
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isAIProcessing 
}) => {
  const alignments: { value: TextAlign; icon: string; label: string }[] = [
    { value: 'left', label: 'Left', icon: 'M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z' },
    { value: 'center', label: 'Center', icon: 'M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z' },
    { value: 'right', label: 'Right', icon: 'M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z' },
    { value: 'justify', label: 'Justify', icon: 'M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z' },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 bg-white dark:bg-slate-900 h-full overflow-y-auto custom-scrollbar transition-colors">
      {/* Handwriting Templates Gallery */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Handwriting Templates
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => onApplyTemplate(template.settings)}
              className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all active:scale-95 group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{template.icon}</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{template.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* AI Intelligence Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          AI Intelligence
        </h3>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onAIRefine} 
            disabled={isAIProcessing}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAIProcessing ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : '✨ Humanize Text'}
          </button>
          <button 
            onClick={onAISummarize} 
            disabled={isAIProcessing}
            className="w-full py-4 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            📝 Summarize to Study Notes
          </button>
        </div>
      </section>

      {/* Font & Style */}
      <section className="space-y-5">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Font & Style
        </h3>
        
        <FontUploader 
          useCustom={settings.useCustomFont || false}
          onToggleCustom={(v) => onChange({ useCustomFont: v })}
          onFontGenerated={(url) => onChange({ customFontUrl: url, useCustomFont: true })}
        />

        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Handwriting Style</label>
          <select 
            value={settings.fontId}
            onChange={(e) => onChange({ fontId: e.target.value, useCustomFont: false })}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {HANDWRITING_FONTS.map(font => (
              <option key={font.id} value={font.id}>{font.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ink Color</label>
            <div className="flex gap-2">
              {Object.entries(INK_COLORS).map(([color, hex]) => (
                <button
                  key={color}
                  onClick={() => onChange({ inkColor: color as InkColor })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${settings.inkColor === color ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: hex }}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Text Align</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {alignments.map((align) => (
                <button
                  key={align.value}
                  onClick={() => onChange({ textAlign: align.value })}
                  className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition-all ${settings.textAlign === align.value ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d={align.icon}/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Page Configuration */}
      <section className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Page Configuration
        </h3>

        <div className="grid grid-cols-1 gap-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Paper Type</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(PaperType).map(type => (
              <button
                key={type}
                onClick={() => onChange({ paperType: type })}
                className={`p-2 rounded-xl border-2 text-[8px] font-bold text-center leading-tight transition-all ${settings.paperType === type ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Tooltip text={`Font Size: ${settings.fontSize}px`}>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Font Size</label>
                <span className="text-[10px] font-mono text-indigo-600">{settings.fontSize}px</span>
              </div>
              <input type="range" min="12" max="64" value={settings.fontSize} onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })} className="accent-indigo-600" />
            </div>
          </Tooltip>

          <Tooltip text={`Line Spacing: ${settings.lineSpacing}`}>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Line Spacing</label>
                <span className="text-[10px] font-mono text-indigo-600">{settings.lineSpacing}</span>
              </div>
              <input type="range" min="1" max="3" step="0.1" value={settings.lineSpacing} onChange={(e) => onChange({ lineSpacing: parseFloat(e.target.value) })} className="accent-indigo-600" />
            </div>
          </Tooltip>

          <Tooltip text={`Margin: ${settings.margin}px`}>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Vertical Margin</label>
                <span className="text-[10px] font-mono text-indigo-600">{settings.margin}px</span>
              </div>
              <input type="range" min="0" max="200" value={settings.margin} onChange={(e) => onChange({ margin: parseInt(e.target.value) })} className="accent-indigo-600" />
            </div>
          </Tooltip>

          <Tooltip text={`Text Tilt: ${settings.tilt}°`}>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Handwriting Tilt</label>
                <span className="text-[10px] font-mono text-indigo-600">{settings.tilt}°</span>
              </div>
              <input type="range" min="-5" max="5" step="0.1" value={settings.tilt} onChange={(e) => onChange({ tilt: parseFloat(e.target.value) })} className="accent-indigo-600" />
            </div>
          </Tooltip>
        </div>
      </section>

      <HandwritingTemplate />
    </div>
  );
};

export default ControlPanel;
