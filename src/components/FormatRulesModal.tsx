import React from 'react';
import { X, CheckCircle2, ShieldAlert, Sparkles, FileSpreadsheet } from 'lucide-react';

interface FormatRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatRulesModal: React.FC<FormatRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Statement Extraction Standard & Rules
              </h2>
              <p className="text-xs text-slate-400">
                Specifications followed by StatementOCR & Gemini Vision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[75vh]">
          {/* Target Columns */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Required CSV Column Schema
            </h4>
            <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-emerald-300">
              Date | Description | Amount | Category | Balance | notes
            </div>
            <p className="text-slate-400 mt-1.5 text-[11px]">
              Strictly exported in this order with RFC-4180 escaping so commas and quotes in merchant descriptions never break columns.
            </p>
          </div>

          {/* Date Normalization */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              2. Strict Date Format: YYYY-MM-DD
            </h4>
            <p className="text-slate-400 text-[11px]">
              Regardless of bank format (e.g. <code className="text-slate-200">10/24/2024</code>, <code className="text-slate-200">24-Oct-2024</code>, or <code className="text-slate-200">October 24</code>), dates are normalized to ISO-8601 <code className="text-emerald-300 font-semibold">2024-10-24</code>.
            </p>
          </div>

          {/* Amount Conventions */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. Signed (+ / -) Amounts
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-emerald-400">Positive (+)</strong> for deposits, payroll, merchant refunds, incoming wire transfers.
              </li>
              <li>
                <strong className="text-rose-400">Negative (-)</strong> for expenses, debit purchases, check payments, bills, bank fees.
              </li>
            </ul>
          </div>

          {/* Category Auto-Detection */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              4. Intelligent Categorization
            </h4>
            <p className="text-slate-400 text-[11px]">
              Automatically classifies transactions into: Groceries, Dining, Transport, Salary, Bills, Shopping, Utilities, Healthcare, Transfer, Fees, Entertainment, Investments, Taxes, or Other.
            </p>
          </div>

          {/* Header & Total Skipping */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              5. Automatic Filtration of Non-Transaction Rows
            </h4>
            <p className="text-slate-400 text-[11px]">
              Table header lines, introductory bank addresses, starting balance rows, ending balance summaries, overdraft disclosures, promotional text, and fee schedules are systematically skipped.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
