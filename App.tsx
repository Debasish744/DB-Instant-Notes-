
import React, { useState, useCallback, useEffect } from 'react';
import { NoteSettings, PaperType, InkColor, NotePage } from './types';
import { refineTextWithAI, summarizeTextWithAI } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import NotePreview from './components/NotePreview';
import * as htmlToImage from 'html-to-image';
import { useDebounce } from 'use-debounce';

const App: React.FC = () => {
  const defaultSettings: NoteSettings = {
    text: '',
    fontId: 'caveat',
    fontSize: 22,
    inkColor: InkColor.BLUE,
    paperType: PaperType.RULED,
    lineSpacing: 1.8,
    letterSpacing: 0,
    margin: 60,
    tilt: 0.5,
    textAlign: 'left',
    paddingX: 40,
    paddingY: 60,
    useCustomFont: false,
    customFontUrl: ''
  };

  const [darkMode, setDarkMode] = useState(false);
  const [pages, setPages] = useState<NotePage[]>([
    { id: 'initial', text: '', settings: { ...defaultSettings } }
  ]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [history, setHistory] = useState<NotePage[][]>([[{ id: 'initial', text: '', settings: { ...defaultSettings } }]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const currentPage = pages[currentPageIdx] || pages[0];

  // Performance: Debounce settings for the heavy NotePreview component
  const [debouncedSettings] = useDebounce(currentPage.settings, 400);

  // Persistence: Load
  useEffect(() => {
    const saved = localStorage.getItem('db-instant-notes-document');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
        }
      } catch (e) {
        console.error("Failed to parse saved document", e);
      }
    }
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Sync loading state for the preview
  useEffect(() => {
    const isDifferent = JSON.stringify(currentPage.settings) !== JSON.stringify(debouncedSettings);
    setIsPreviewLoading(isDifferent);
  }, [currentPage.settings, debouncedSettings]);

  // Persistence: Save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('db-instant-notes-document', JSON.stringify(pages));
    }, 1000);
    return () => clearTimeout(timer);
  }, [pages]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const recordHistory = (newPages: NotePage[]) => {
    setHistory(prev => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      nextHistory.push(newPages);
      if (nextHistory.length > 50) nextHistory.shift();
      return nextHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  };

  const handlePageUpdate = (updates: Partial<NoteSettings> | { text: string }, isMajor = false) => {
    const newPages = [...pages];
    const targetIdx = currentPageIdx < newPages.length ? currentPageIdx : 0;
    const targetPage = { ...newPages[targetIdx] };
    
    if ('text' in updates) {
      targetPage.text = updates.text!;
      targetPage.settings = { ...targetPage.settings, text: updates.text! };
    } else {
      targetPage.settings = { ...targetPage.settings, ...updates };
      if (updates.text === undefined) {
        targetPage.settings.text = targetPage.text;
      }
    }

    newPages[targetIdx] = targetPage;
    setPages(newPages);

    if (isMajor) {
      recordHistory(newPages);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      try {
        const text = await file.text();
        handlePageUpdate({ text }, true);
      } catch (err) {
        alert("Failed to read file.");
      }
    } else if (file.type === 'application/pdf') {
      alert('PDF support coming soon!');
    } else {
      alert('Only .txt files are supported currently.');
    }
    event.target.value = '';
  };

  const addNewPage = () => {
    const newPage: NotePage = {
      id: Date.now().toString(),
      text: '',
      settings: { ...currentPage.settings, text: '' }
    };
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageIdx(newPages.length - 1);
    recordHistory(newPages);
  };

  const deleteCurrentPage = () => {
    if (pages.length <= 1) {
      handlePageUpdate({ text: '' }, true);
      return;
    }
    const newPages = pages.filter((_, i) => i !== currentPageIdx);
    setPages(newPages);
    setCurrentPageIdx(Math.max(0, currentPageIdx - 1));
    recordHistory(newPages);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setPages(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setPages(history[nextIdx]);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) handlePageUpdate({ text }, true);
    } catch (err) {
      alert("Clipboard access denied.");
    }
  };

  const handleAIRefine = async () => {
    if (!currentPage.text) return;
    setIsAIProcessing(true);
    const refined = await refineTextWithAI(currentPage.text);
    handlePageUpdate({ text: refined }, true);
    setIsAIProcessing(false);
  };

  const handleAISummarize = async () => {
    if (!currentPage.text) return;
    setIsAIProcessing(true);
    const summary = await summarizeTextWithAI(currentPage.text);
    handlePageUpdate({ text: summary }, true);
    setIsAIProcessing(false);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const exportAsPNG = async () => {
    const element = document.getElementById('note-preview');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 1.0 });
      const link = document.createElement('a');
      link.download = `db-note-p${currentPageIdx + 1}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("PNG Export failed.");
    }
  };

  const exportAsJPG = async () => {
    const element = document.getElementById('note-preview');
    if (!element) return;
    try {
      const dataUrl = await htmlToImage.toJpeg(element, { quality: 0.95, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `db-note-p${currentPageIdx + 1}-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      alert("JPG Export failed.");
    }
  };

  // Keyboard Shortcuts Implementation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownloadPDF();
      }
      if (isMod && e.key.toLowerCase() === 'v') {
        handlePaste();
      }
      if (isMod && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, handlePaste, handleUndo, handleRedo, handleDownloadPDF]);

  const wordCount = currentPage.text.trim() === "" ? 0 : currentPage.text.trim().split(/\s+/).length;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} flex flex-col font-sans lg:overflow-hidden ui-fade-in transition-colors duration-300`}>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">DB</div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">Instant Notes</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Multi-Page Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
              </svg>
            )}
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button onClick={handleUndo} disabled={historyIndex === 0} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg disabled:opacity-30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966a.25.25 0 0 0 .41-.192z"/>
              </svg>
            </button>
            <button onClick={handleRedo} disabled={historyIndex === history.length - 1} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg disabled:opacity-30 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192L10.77 2.308a.25.25 0 0 1 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"/>
              </svg>
            </button>
          </div>

          <select 
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'pdf') handleDownloadPDF();
              if (val === 'png') exportAsPNG();
              if (val === 'jpg') exportAsJPG();
              e.target.value = "default"; // Reset after selection
            }}
            className="px-4 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg active:scale-95 cursor-pointer appearance-none border-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="default">Export Options</option>
            <option value="pdf">Export PDF</option>
            <option value="png">Export PNG</option>
            <option value="jpg">Export JPG</option>
          </select>
        </div>
      </header>

      {/* Quick Action Floating Buttons */}
      <div className="hidden lg:flex fixed right-6 top-24 flex-col gap-3 z-40">
        <button 
          onClick={handleAIRefine}
          className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-lg group relative"
          title="AI Refine"
        >
          ✨
          <span className="absolute right-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">AI Refine</span>
        </button>
        <button 
          onClick={addNewPage}
          className="w-12 h-12 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-lg group relative"
          title="New Page"
        >
          📄
          <span className="absolute right-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">New Page</span>
        </button>
        <button 
          onClick={() => handlePageUpdate({ text: '' }, true)}
          className="w-12 h-12 bg-rose-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-lg group relative"
          title="Clear Text"
        >
          🗑️
          <span className="absolute right-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Clear Page</span>
        </button>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row min-h-0 lg:h-[calc(100vh-65px)]">
        <aside className="w-full lg:w-[420px] border-r border-slate-200 dark:border-slate-800 flex flex-col h-auto lg:h-full bg-white dark:bg-slate-900 z-10">
          <div className="flex flex-col flex-1 lg:overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Document Editor</label>
                <div className="flex items-center gap-2">
                   <button onClick={addNewPage} className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Add Page">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                   </button>
                   <button onClick={deleteCurrentPage} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Delete Page">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                   </button>
                </div>
              </div>
              
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4">
                <button onClick={() => setCurrentPageIdx(Math.max(0, currentPageIdx - 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all text-slate-600 dark:text-slate-400" disabled={currentPageIdx === 0}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                </button>
                <div className="flex-1 text-center text-xs font-bold text-slate-600 dark:text-slate-400">Page {currentPageIdx + 1} of {pages.length}</div>
                <button onClick={() => setCurrentPageIdx(Math.min(pages.length - 1, currentPageIdx + 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all text-slate-600 dark:text-slate-400" disabled={currentPageIdx === pages.length - 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{currentPage.text.length} chars • {wordCount} words</span>
                <div className="flex items-center gap-3">
                  <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 uppercase">Upload</label>
                  <button onClick={handlePaste} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase">Paste</button>
                </div>
              </div>
              <textarea
                className="w-full h-48 lg:h-56 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 dark:text-slate-200 font-medium text-sm leading-relaxed"
                placeholder="Start writing..."
                value={currentPage.text}
                onChange={(e) => handlePageUpdate({ text: e.target.value })}
                onBlur={() => recordHistory(pages)}
              />
            </div>
            
            <div className="flex-1 lg:overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar">
              <ControlPanel 
                settings={currentPage.settings} 
                onChange={(u) => handlePageUpdate(u)}
                onApplyTemplate={(u) => handlePageUpdate(u, true)}
                onAIRefine={handleAIRefine}
                onAISummarize={handleAISummarize}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                isAIProcessing={isAIProcessing}
              />
            </div>
          </div>
        </aside>

        <section className="flex-1 lg:overflow-y-auto bg-slate-100/30 dark:bg-slate-950/50 flex flex-col items-center custom-scrollbar relative p-4 sm:p-8">
          {(isAIProcessing || isPreviewLoading) && (
            <div className="absolute inset-0 z-40 bg-slate-100/40 dark:bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-900 dark:text-indigo-300 font-bold">
                  {isAIProcessing ? 'AI is processing...' : 'Updating preview...'}
                </p>
              </div>
            </div>
          )}
          <div className="print:block print:w-full">
            <NotePreview settings={debouncedSettings} />
          </div>
          <div className="hidden print:block space-y-0">
            {pages.map((p, i) => i !== currentPageIdx && (
              <div key={p.id} className="page-break-before">
                <NotePreview settings={p.settings} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button onClick={addNewPage} className="w-14 h-14 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
        </button>
        <button onClick={handleDownloadPDF} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
