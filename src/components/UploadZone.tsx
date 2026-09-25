import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { SampleStatement } from '../types';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  onSampleSelected: (sampleId: string) => void;
  samples: SampleStatement[];
  isProcessing: boolean;
  processingStep: string;
  error: string | null;
  currentFileName?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onSampleSelected,
  samples,
  isProcessing,
  processingStep,
  error,
  currentFileName,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcess(file);
    }
  };

  const validateAndProcess = (file: File) => {
    const validMimes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ];
    if (!validMimes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp)$/i)) {
      alert('Please upload a valid PDF or image file (PNG, JPG, WEBP).');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 transition-all duration-200 text-center cursor-pointer ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.005]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center">
              </div>
              <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white tracking-wide">
                Extracting Statement Transactions...
              </h3>
              <p className="text-xs text-emerald-400 font-medium">
                {processingStep || 'Gemini Vision OCR analyzing pages & table lines...'}
              </p>
              <p className="text-[11px] text-slate-500">
                Multi-page PDF parsing • Filtering headers & summary balances
              </p>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-slate-100">
                Drop your bank statement here, or <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-slate-400">
                Supports <span className="font-semibold text-slate-300">Multi-page PDFs</span> and clear images (<span className="text-slate-300">PNG, JPG, WEBP</span>)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                YYYY-MM-DD Dates
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Signed (+/-) Amounts
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Auto Categorization
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Skip Headers & Totals
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-rose-200">Extraction Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Sample Statements Quick Pick */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Don't have a file on hand? Try a demo bank statement:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Instant 1-click test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {samples.map((sample) => (
            <button
              key={sample.id}
              onClick={(e) => {
                e.stopPropagation();
                onSampleSelected(sample.id);
              }}
              disabled={isProcessing}
              className="group text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800/90 hover:border-emerald-500/40 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition">
                    {sample.bankName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {sample.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {sample.name}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{sample.transactions.length} rows</span>
                <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                  Load <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
