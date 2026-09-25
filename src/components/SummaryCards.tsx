import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2, AlertTriangle, Filter, Building2, Calendar } from 'lucide-react';
import { StatementSummary, Transaction } from '../types';

interface SummaryCardsProps {
  summary: StatementSummary;
  transactions: Transaction[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, transactions }) => {
  const totalDeposits = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const netFlow = totalDeposits - totalExpenses;

  const depositCount = transactions.filter((t) => t.amount > 0).length;
  const expenseCount = transactions.filter((t) => t.amount < 0).length;

  // Balance reconciliation check
  let isReconciled = false;
  let reconciliationDiff: number | null = null;
  if (summary.startingBalance !== null && summary.endingBalance !== null) {
    const calculatedEnding = summary.startingBalance + (totalDeposits - totalExpenses);
    const diff = Math.abs(calculatedEnding - summary.endingBalance);
    if (diff < 0.05) {
      isReconciled = true;
    } else {
      reconciliationDiff = calculatedEnding - summary.endingBalance;
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary.currency || 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-3">
      {/* Institution & Period Header Strip */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-200 text-sm">{summary.bankName || 'Bank Statement'}</span>
              {summary.accountNumberMasked && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px]">
                  Acc: {summary.accountNumberMasked}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              Period: <span className="text-slate-300 font-medium">{summary.statementPeriod || 'Statement Cycle'}</span>
            </p>
          </div>
        </div>

        {/* Skipped lines badge & reconciliation status */}
        <div className="flex items-center space-x-2">
          {summary.skippedRowsCount > 0 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
              <Filter className="w-3 h-3 text-amber-400" />
              <span>
                <strong className="text-amber-300">{summary.skippedRowsCount}</strong> non-transaction rows skipped
              </span>
            </div>
          )}

          {summary.startingBalance !== null && summary.endingBalance !== null && (
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                isReconciled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}
              title={
                isReconciled
                  ? 'Starting Balance + Net Cashflow = Ending Balance'
                  : `Calculated ending differs by ${formatCurrency(reconciliationDiff || 0)}`
              }
            >
              {isReconciled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Balance Reconciled</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Variance: {formatCurrency(Math.abs(reconciliationDiff || 0))}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Deposits */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Deposits (+)</span>
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-emerald-400 tracking-tight">
              +{formatCurrency(totalDeposits)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {depositCount} credit transactions
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Expenses (-)</span>
            <div className="p-1 rounded-md bg-rose-500/10 text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-rose-400 tracking-tight">
              -{formatCurrency(totalExpenses)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {expenseCount} debit transactions
            </p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Statement Flow</span>
            <div className={`p-1 rounded-md ${netFlow >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-lg font-bold tracking-tight ${netFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {transactions.length} total rows extracted
            </p>
          </div>
        </div>

        {/* Balances */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Statement Balances</span>
            <span className="text-[10px] text-slate-500 font-mono">Start → End</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Starting</p>
              <p className="text-xs font-semibold text-slate-300">
                {summary.startingBalance !== null ? formatCurrency(summary.startingBalance) : 'N/A'}
              </p>
            </div>
            <span className="text-slate-600">→</span>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Ending</p>
              <p className="text-sm font-bold text-slate-100">
                {summary.endingBalance !== null ? formatCurrency(summary.endingBalance) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
