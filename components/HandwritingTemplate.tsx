import React, { useState } from 'react';

const HandwritingTemplate: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="mt-4 p-4 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl transition-all">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Calibration Guide
        </h3>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="text-[10px] font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 uppercase"
        >
          {isVisible ? 'Hide' : 'Show Guide'}
        </button>
      </div>
      
      {isVisible && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
            For professional-grade synthesis, write the characters below on plain white paper using a dark pen. Snap a clear photo and upload it.
          </p>
          <div className="bg-white/80 dark:bg-slate-800 p-3 rounded-xl border border-amber-100 dark:border-slate-700 shadow-sm">
            <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap leading-tight">
{`ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
!?@#$%&*( )_+-=[];:'",.<>`}
            </pre>
          </div>
          <button 
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={() => window.print()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/>
            </svg>
            Print Sample Sheet
          </button>
        </div>
      )}
    </div>
  );
};

export default HandwritingTemplate;