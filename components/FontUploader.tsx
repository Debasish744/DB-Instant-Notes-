
import React, { useState } from 'react';

interface FontUploaderProps {
  onFontGenerated: (fontUrl: string) => void;
  onToggleCustom: (useCustom: boolean) => void;
  useCustom: boolean;
}

const FontUploader: React.FC<FontUploaderProps> = ({ onFontGenerated, onToggleCustom, useCustom }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // In a real production app, we would send the image to a backend like HandtextAI
    // For this client-side demo, if it's a font file (ttf/otf/woff), we use it directly.
    // If it's an image, we simulate a processing delay and then ask the user to use a pre-made font.
    
    if (file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      const url = URL.createObjectURL(file);
      // Simulate "Installation" delay
      setTimeout(() => {
        onFontGenerated(url);
        setIsProcessing(false);
      }, 800);
    } else {
      // Simulate Image-to-Font AI processing
      setTimeout(() => {
        alert("Image-to-Font processing is currently in beta. For the best result, please upload a .ttf or .otf handwriting font file (e.g., from Calligraphr).");
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
          Personal Handwriting
        </label>
        <button 
          onClick={() => onToggleCustom(!useCustom)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${useCustom ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
        >
          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${useCustom ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
          Upload .TTF / .OTF or Handwriting Image
        </p>
        <div className="relative group">
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2,image/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
            id="custom-font-upload"
          />
          <label 
            htmlFor="custom-font-upload" 
            className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-indigo-600">Syncing Font...</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-indigo-600">Click to Upload Style</span>
            )}
          </label>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
          Tip: Use Calligraphr.com to create a font file from your own handwriting for perfect results.
        </p>
      </div>
    </div>
  );
};

export default FontUploader;
