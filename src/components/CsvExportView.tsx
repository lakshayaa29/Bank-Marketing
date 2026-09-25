import React, { useState } from 'react';
import { 
  ClipboardCopy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  ExternalLink, 
  FileText, 
  Info,
  CheckCheck
} from 'lucide-react';
import { Transaction } from '../types';
import { generateCsv, generateTsvForSheets, downloadFile } from '../utils/csv';

interface CsvExportViewProps {
  transactions: Transaction[];
  statementName?: string;
}

export const CsvExportView: React.FC<CsvExportViewProps> = ({ transactions, statementName }) => {
  const [copiedType, setCopiedType] = useState<'sheets' | 'csv' | null>(null);

  const rawCsv = generateCsv(transactions);
  const tsvForSheets = generateTsvForSheets(transactions);

  const handleCopyForSheets = async () => {
    try {
      await navigator.clipboard.writeText(tsvForSheets);
      setCopiedType('sheets');
      setTimeout(() => setCopiedType(null), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleCopyRawCsv = async () => {
    try {
      await navigator.clipboard.writeText(rawCsv);
      setCopiedType('csv');
      setTimeout(() => setCopiedType(null), 3000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownloadCsv = () => {
    const filename = `${statementName ? statementName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'bank_statement'}_transactions.csv`;
    downloadFile(rawCsv, filename, 'text/csv;charset=utf-8;');
  };

  const handleDownloadTsv = () => {
    const filename = `${statementName ? statementName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'bank_statement'}_transactions.tsv`;
    downloadFile(tsvForSheets, filename, 'text/tab-separated-values;charset=utf-8;');
  };

  return (
    <div className="space-y-4">
      {/* Action Header Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Clean CSV Output
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
              {transactions.length} rows ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Optimized for immediate copy-pasting into Google Sheets, Excel, or Numbers without formatting errors.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary: Copy for Google Sheets */}
          <button
            onClick={handleCopyForSheets}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition cursor-pointer ${
              copiedType === 'sheets'
                ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {copiedType === 'sheets' ? (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>Copied for Sheets! (Press Cmd+V)</span>
              </>
            ) : (
              <>
                <ClipboardCopy className="w-4 h-4" />
                <span>Copy for Google Sheets</span>
              </>
            )}
          </button>

          {/* Download CSV */}
          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download CSV</span>
          </button>

          {/* Copy Raw CSV */}
          <button
            onClick={handleCopyRawCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
          >
            {copiedType === 'csv' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied CSV</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Raw CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Google Sheets Quick Paste Tip */}
      <div className="rounded-lg bg-slate-900/40 border border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-slate-200">How to use with Google Sheets:</strong> Click "Copy for Google Sheets", open your sheet at{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              sheets.new <ExternalLink className="w-3 h-3" />
            </a>
            , select cell <strong>A1</strong>, and press <strong>Cmd+V</strong> (or <strong>Ctrl+V</strong>). Every column will populate automatically!
          </span>
        </div>
      </div>

      {/* Raw CSV Code Preview Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span>Date,Description,Amount,Category,Balance,notes</span>
          </div>
          <span>RFC-4180 CSV Standard</span>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed select-all selection:bg-emerald-500/30">
          <code>{rawCsv}</code>
        </pre>

        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>{rawCsv.split('\n').length} lines • {rawCsv.length} bytes</span>
          <button
            onClick={handleDownloadTsv}
            className="text-slate-400 hover:text-slate-200 underline underline-offset-2"
          >
            Download as Tab-Separated (.tsv)
          </button>
        </div>
      </div>
    </div>
  );
};
