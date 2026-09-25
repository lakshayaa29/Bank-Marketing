import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Transaction } from '../types';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currency?: string;
  startingBalance?: number | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#10b981', // emerald-500
  Dining: '#f59e0b', // amber-500
  Transport: '#06b6d4', // cyan-500
  Salary: '#22c55e', // green-500
  Bills: '#f43f5e', // rose-500
  Shopping: '#a855f7', // purple-500
  Utilities: '#3b82f6', // blue-500
  Healthcare: '#14b8a6', // teal-500
  Transfer: '#6366f1', // indigo-500
  Fees: '#ef4444', // red-500
  Entertainment: '#d946ef', // fuchsia-500
  Investments: '#34d399', // emerald-400
  Taxes: '#f97316', // orange-500
  Other: '#64748b' // slate-500
};

const FALLBACK_COLORS = [
  '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', 
  '#a855f7', '#3b82f6', '#14b8a6', '#6366f1', 
  '#d946ef', '#ef4444', '#f97316', '#64748b'
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  currency = 'USD',
  startingBalance = null
}) => {
  const [breakdownType, setBreakdownType] = useState<'donut' | 'bar'>('donut');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // 1. Spending Breakdown Data (Expenses: amount < 0)
  const { categoryData, totalExpenseAmount, topExpenseCategory } = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.amount < 0);
    const total = expenseTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryMap: Record<string, { value: number; count: number }> = {};
    for (const tx of expenseTxs) {
      const cat = tx.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { value: 0, count: 0 };
      }
      categoryMap[cat].value += Math.abs(tx.amount);
      categoryMap[cat].count += 1;
    }

    const data = Object.entries(categoryMap)
      .map(([name, stats], index) => ({
        name,
        value: Number(stats.value.toFixed(2)),
        count: stats.count,
        percentage: total > 0 ? (stats.value / total) * 100 : 0,
        color: CATEGORY_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    return {
      categoryData: data,
      totalExpenseAmount: total,
      topExpenseCategory: data.length > 0 ? data[0] : null
    };
  }, [transactions]);

  // 2. Chronological Balance Over Time
  const balanceTimelineData = useMemo(() => {
    // Sort transactions chronologically (oldest to newest)
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    let currentBalance = startingBalance !== null ? startingBalance : 0;
    const hasInitialBalance = startingBalance !== null;

    const points: Array<{
      date: string;
      shortDate: string;
      balance: number;
      amount: number;
      description: string;
      category: string;
    }> = [];

    // Add starting point if available
    if (sorted.length > 0 && hasInitialBalance) {
      points.push({
        date: sorted[0].date,
        shortDate: 'Start',
        balance: Number(currentBalance.toFixed(2)),
        amount: 0,
        description: 'Starting Balance',
        category: 'Balance'
      });
    }

    for (const tx of sorted) {
      if (tx.balance !== null && tx.balance !== undefined && !isNaN(tx.balance)) {
        currentBalance = tx.balance;
      } else {
        currentBalance += tx.amount;
      }

      // Format short date e.g. "Oct 02"
      let shortDate = tx.date;
      if (tx.date.includes('-')) {
        const parts = tx.date.split('-');
        if (parts.length === 3) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const m = parseInt(parts[1], 10) - 1;
          shortDate = `${monthNames[m] || parts[1]} ${parts[2]}`;
        }
      }

      points.push({
        date: tx.date,
        shortDate,
        balance: Number(currentBalance.toFixed(2)),
        amount: tx.amount,
        description: tx.description,
        category: tx.category
      });
    }

    return points;
  }, [transactions, startingBalance]);

  // 3. Highlight Stats
  const highestExpenseTx = useMemo(() => {
    const expenses = transactions.filter((t) => t.amount < 0);
    if (expenses.length === 0) return null;
    return expenses.reduce((prev, curr) => (curr.amount < prev.amount ? curr : prev), expenses[0]);
  }, [transactions]);

  const highestDepositTx = useMemo(() => {
    const deposits = transactions.filter((t) => t.amount > 0);
    if (deposits.length === 0) return null;
    return deposits.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev), deposits[0]);
  }, [transactions]);

  // Custom Tooltip for Spending Donut/Bar
  const SpendingTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-semibold text-white">{data.name}</span>
          </div>
          <div className="mt-2 space-y-1 text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Total Spent:</span>
              <span className="font-bold text-rose-400">-{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Share of Budget:</span>
              <span className="font-semibold text-slate-200">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Transactions:</span>
              <span className="text-slate-200">{data.count} purchases</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Balance Line Chart
  const BalanceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isDeposit = data.amount > 0;
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-xl text-xs backdrop-blur-md min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-semibold text-slate-200">{data.date}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.category}</span>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Running Balance</p>
              <p className="text-base font-bold text-emerald-400 font-mono">
                {formatCurrency(data.balance)}
              </p>
            </div>
            {data.description && data.description !== 'Starting Balance' && (
              <div className="pt-1.5 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-300 font-medium truncate max-w-[220px]">
                  {data.description}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      isDeposit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isDeposit ? '+' : ''}
                    {formatCurrency(data.amount)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Insights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Top Spending Category */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Top Spending Category</p>
            <h4 className="text-base font-bold text-white mt-1">
              {topExpenseCategory ? topExpenseCategory.name : 'N/A'}
            </h4>
            <p className="text-xs text-rose-400 font-medium mt-0.5">
              {topExpenseCategory
                ? `${formatCurrency(topExpenseCategory.value)} (${topExpenseCategory.percentage.toFixed(0)}%)`
                : '-'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Largest Single Expense */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
          <div className="max-w-[75%]">
            <p className="text-[11px] text-slate-400 font-medium">Largest Single Expense</p>
            <h4 className="text-sm font-bold text-slate-100 truncate mt-1" title={highestExpenseTx?.description}>
              {highestExpenseTx ? highestExpenseTx.description : 'N/A'}
            </h4>
            <p className="text-xs text-rose-400 font-medium mt-0.5">
              {highestExpenseTx ? formatCurrency(highestExpenseTx.amount) : '-'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Largest Deposit */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
          <div className="max-w-[75%]">
            <p className="text-[11px] text-slate-400 font-medium">Largest Deposit</p>
            <h4 className="text-sm font-bold text-slate-100 truncate mt-1" title={highestDepositTx?.description}>
              {highestDepositTx ? highestDepositTx.description : 'N/A'}
            </h4>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {highestDepositTx ? `+${formatCurrency(highestDepositTx.amount)}` : '-'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Spending Breakdown & Balance Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1: Monthly Spending Breakdown by Category */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-400" />
                  Monthly Spending Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Expense distribution by auto-detected category
                </p>
              </div>

              {/* Toggle Chart Type */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setBreakdownType('donut')}
                  className={`px-2 py-1 rounded-md transition ${
                    breakdownType === 'donut'
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Donut Chart"
                >
                  <PieIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBreakdownType('bar')}
                  className={`px-2 py-1 rounded-md transition ${
                    breakdownType === 'bar'
                      ? 'bg-slate-800 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {categoryData.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No expense transactions found to display breakdown.
              </div>
            ) : breakdownType === 'donut' ? (
              <div className="relative h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<SpendingTooltip />} />
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                    Total Spent
                  </span>
                  <span className="text-lg font-black text-white font-mono mt-0.5">
                    {formatCurrency(totalExpenseAmount)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {categoryData.length} categories
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.slice(0, 6)} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={75} />
                    <RechartsTooltip content={<SpendingTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Ranked Category Legend List */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs group">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-300 font-medium group-hover:text-white transition">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({item.count})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-slate-200 font-semibold">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-[10px] text-slate-400 w-10 text-right font-mono">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Line Chart of Balance Over Time */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Account Balance Over Time
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Running balance trajectory tracked across transactions
                </p>
              </div>

              {/* Balance range info */}
              {balanceTimelineData.length > 0 && (
                <div className="flex items-center space-x-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Start</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {formatCurrency(balanceTimelineData[0].balance)}
                    </span>
                  </div>
                  <span className="text-slate-600">→</span>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Current</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(balanceTimelineData[balanceTimelineData.length - 1].balance)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Line Chart */}
            <div className="h-80 w-full">
              {balanceTimelineData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No chronological transaction data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceTimelineData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <defs>
                      <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => {
                        if (Math.abs(val) >= 1000) {
                          return `$${(val / 1000).toFixed(1)}k`;
                        }
                        return `$${val}`;
                      }}
                      domain={['auto', 'auto']}
                    />
                    <RechartsTooltip content={<BalanceTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#balanceGradient)"
                      activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Footer Timeline Guide */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Hover over points to inspect the specific transaction and amount impact
            </span>
            <span className="font-mono text-slate-400">
              {balanceTimelineData.length} timeline points
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
