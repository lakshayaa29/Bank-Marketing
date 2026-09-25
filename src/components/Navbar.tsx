import React from 'react';
import { FileSpreadsheet, Code2, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenCodeModal: () => void;
  onOpenHelpModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCodeModal, onOpenHelpModal }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">StatementOCR</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Bank Statement to Clean CSV for Google Sheets
            </p>
          </div>
        </div>

        {/* Model Badge & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Model:</span>
            <span className="font-semibold text-emerald-400">Gemini 2.0 / 2.5 Flash</span>
          </div>

          <button
            onClick={onOpenHelpModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition"
            title="CSV Format Requirements"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Format Rules</span>
          </button>

          <button
            onClick={onOpenCodeModal}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>Extraction Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
