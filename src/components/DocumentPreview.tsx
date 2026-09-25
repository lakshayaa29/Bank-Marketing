import React, { useState } from 'react';
import { FileText, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Eye, Building2, Calendar, CreditCard } from 'lucide-react';
import { StatementSummary, Transaction } from '../types';

interface DocumentPreviewProps {
  fileBlobUrl: string | null;
  fileMimeType: string | null;
  fileName: string | null;
  summary: StatementSummary;
  transactions: Transaction[];
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileBlobUrl,
  fileMimeType,
  fileName,
  summary,
  transactions,
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const isPdf = fileMimeType === 'application/pdf' || (fileName && fileName.endsWith('.pdf'));

  return (
    <div className="space-y-4">
      {/* Top bar with controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-100">{fileName || 'Bank Statement Document'}</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
            {isPdf ? 'PDF Document' : 'Document Image'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-slate-300 text-[11px] min-w-[42px] text-center">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden min-h-[500px] flex items-center justify-center p-4">
        {fileBlobUrl ? (
          isPdf ? (
            <div className="w-full h-[650px] rounded-lg overflow-hidden border border-slate-800">
              <iframe
                src={`${fileBlobUrl}#toolbar=0&navpanes=0`}
                title="Bank Statement PDF"
                className="w-full h-full bg-slate-900"
              />
            </div>
          ) : (
            <div className="overflow-auto max-h-[650px] w-full flex items-center justify-center">
              <img
                src={fileBlobUrl}
                alt="Bank Statement Document Scan"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="rounded-lg shadow-2xl transition-transform duration-150 max-w-full"
              />
            </div>
          )
        ) : (
          /* Render interactive high-fidelity Statement Mockup for Demo statement */
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-3xl bg-white text-slate-900 rounded-lg p-8 shadow-2xl transition-transform duration-150 font-sans"
          >
            {/* Bank Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                  {summary.bankName || 'JPMorgan Chase Bank, N.A.'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">P.O. Box 659754, San Antonio, TX 78265-9754</p>
                <div className="mt-3 flex items-center space-x-3 text-xs">
                  <span className="font-semibold text-slate-800">
                    Account: <span className="font-mono">{summary.accountNumberMasked || '...4892'}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">
                    Period: <strong>{summary.statementPeriod || '2024-10-01 to 2024-10-31'}</strong>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Account Statement
                </span>
                <p className="text-xs text-slate-500 mt-1">Page 1 of 2</p>
                <div className="mt-2 text-xs font-semibold bg-slate-100 px-3 py-1 rounded border border-slate-200">
                  Checking Account
                </div>
              </div>
            </div>

            {/* Account Summary Strip (Sample of non-transaction rows skipped) */}
            <div className="mt-5 p-4 rounded bg-slate-50 border border-slate-200 grid grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Beginning Balance</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  ${summary.startingBalance !== null ? summary.startingBalance.toFixed(2) : '4,210.50'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Deposits & Credits</p>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">
                  +${transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Withdrawals & Debits</p>
                <p className="text-sm font-bold text-rose-700 mt-0.5">
                  -${transactions.filter(t => t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Ending Balance</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  ${summary.endingBalance !== null ? summary.endingBalance.toFixed(2) : '6,185.35'}
                </p>
              </div>
            </div>

            {/* Notice header stating this was skipped */}
            <div className="mt-2 text-[10px] text-slate-400 italic">
              [Note: The summary boxes above and headers are automatically detected and skipped by Gemini OCR]
            </div>

            {/* Transaction Table Mockup */}
            <div className="mt-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-300 pb-1">
                Transaction Detail
              </h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 font-bold text-[10px] uppercase">
                    <th className="py-1.5 px-2">Date</th>
                    <th className="py-1.5 px-2">Description</th>
                    <th className="py-1.5 px-2 text-right">Amount</th>
                    <th className="py-1.5 px-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono text-slate-700">{tx.date}</td>
                      <td className="py-1.5 px-2 text-slate-900 font-medium">{tx.description}</td>
                      <td className={`py-1.5 px-2 text-right font-mono font-semibold ${
                        tx.amount > 0 ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                        {tx.balance !== null ? tx.balance.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transactions.length > 10 && (
                <div className="mt-3 text-center text-[10px] text-slate-500 py-1 bg-slate-50 rounded border border-slate-200">
                  ... {transactions.length - 10} more transactions on Page 2 (Extracted seamlessly)
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
              <span>Member FDIC • Equal Housing Lender</span>
              <span>Doc Ref: CH-908124-OCT24</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
