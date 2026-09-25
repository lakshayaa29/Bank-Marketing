import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  Check, 
  X, 
  Edit2, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { Transaction, CategoryOption } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  currency: string;
  onUpdateTransaction: (id: string, updated: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES: CategoryOption[] = [
  'Groceries',
  'Dining',
  'Transport',
  'Salary',
  'Bills',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Transfer',
  'Fees',
  'Entertainment',
  'Investments',
  'Taxes',
  'Other'
];

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Dining: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Transport: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Salary: 'bg-green-500/10 text-green-300 border-green-500/30',
  Bills: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  Shopping: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Utilities: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Healthcare: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  Transfer: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  Fees: 'bg-red-500/10 text-red-400 border-red-500/30',
  Entertainment: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
  Investments: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  Taxes: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  Other: 'bg-slate-800 text-slate-400 border-slate-700'
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currency,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  
  // Inline editing row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  // New transaction modal/form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTxForm, setNewTxForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: -50.00,
    category: 'Groceries',
    balance: null as number | null,
    notes: '',
    pageNumber: 1
  });

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        const matchesSearch = 
          tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.date.includes(searchQuery);

        const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;

        const matchesType = 
          typeFilter === 'ALL' ||
          (typeFilter === 'INCOME' && tx.amount > 0) ||
          (typeFilter === 'EXPENSE' && tx.amount < 0);

        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = a.date.localeCompare(b.date);
        } else if (sortField === 'amount') {
          comparison = a.amount - b.amount;
        } else if (sortField === 'description') {
          comparison = a.description.localeCompare(b.description);
        }
        return sortAsc ? comparison : -comparison;
      });
  }, [transactions, searchQuery, selectedCategory, typeFilter, sortField, sortAsc]);

  const handleStartEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditForm({ ...tx });
  };

  const handleSaveEdit = (id: string) => {
    onUpdateTransaction(id, editForm);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxForm.description.trim()) {
      alert('Please enter a description');
      return;
    }
    onAddTransaction(newTxForm);
    setIsAddingNew(false);
    setNewTxForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: -50.00,
      category: 'Groceries',
      balance: null,
      notes: '',
      pageNumber: 1
    });
  };

  const toggleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filters, Search, Add row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, notes, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition ${
                typeFilter === 'ALL'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setTypeFilter('INCOME')}
              className={`px-2.5 py-1 rounded-md transition ${
                typeFilter === 'INCOME'
                  ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Deposits (+)
            </button>
            <button
              onClick={() => setTypeFilter('EXPENSE')}
              className={`px-2.5 py-1 rounded-md transition ${
                typeFilter === 'EXPENSE'
                  ? 'bg-rose-500/20 text-rose-300 font-medium'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Expenses (-)
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Row Button */}
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white transition shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Modal / Inset for adding new row */}
      {isAddingNew && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-4 space-y-3 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Manual Transaction
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Date (YYYY-MM-DD)</label>
              <input
                type="date"
                required
                value={newTxForm.date}
                onChange={(e) => setNewTxForm({ ...newTxForm, date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] text-slate-400 block mb-1">Description</label>
              <input
                type="text"
                required
                placeholder="Merchant / Payee"
                value={newTxForm.description}
                onChange={(e) => setNewTxForm({ ...newTxForm, description: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Amount (+ / -)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={newTxForm.amount}
                onChange={(e) => setNewTxForm({ ...newTxForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Category</label>
              <select
                value={newTxForm.category}
                onChange={(e) => setNewTxForm({ ...newTxForm, category: e.target.value })}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Balance</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={newTxForm.balance ?? ''}
                onChange={(e) =>
                  setNewTxForm({
                    ...newTxForm,
                    balance: e.target.value !== '' ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <input
              type="text"
              placeholder="Notes or reference info..."
              value={newTxForm.notes}
              onChange={(e) => setNewTxForm({ ...newTxForm, notes: e.target.value })}
              className="flex-1 max-w-md px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 mr-3"
            />
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Save Row
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Date (YYYY-MM-DD)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('description')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-200 transition min-w-[220px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Description</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-200 transition w-32"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 w-32">Category</th>
                <th className="py-3 px-3 text-right w-28">Balance</th>
                <th className="py-3 px-3 min-w-[140px]">Notes</th>
                <th className="py-3 px-3 text-center w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Layers className="w-8 h-8 text-slate-600" />
                      <p className="text-sm font-medium text-slate-400">No transactions match your filter</p>
                      <p className="text-xs text-slate-600">Try clearing your search query or category filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, index) => {
                  const isEditing = editingId === tx.id;
                  const isDeposit = tx.amount > 0;

                  if (isEditing) {
                    return (
                      <tr key={tx.id} className="bg-emerald-950/20 border-y border-emerald-500/30">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[10px]">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.amount ?? 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-right text-slate-100 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <select
                            value={editForm.category || 'Other'}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="null"
                            value={editForm.balance ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                balance: e.target.value !== '' ? parseFloat(e.target.value) : null,
                              })
                            }
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-right text-slate-100 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-100"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleSaveEdit(tx.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save Changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-900/60 transition group cursor-default"
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                        {tx.date}
                        {tx.pageNumber && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-slate-800/80 text-slate-500 font-sans">
                            p.{tx.pageNumber}
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-3 font-medium text-slate-100">
                        {tx.description}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-mono font-semibold whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded ${
                            isDeposit
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-rose-400 shrink-0" />
                          )}
                          <span>
                            {isDeposit ? '+' : ''}
                            {tx.amount.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other
                          }`}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                        {tx.balance !== null ? tx.balance.toFixed(2) : '-'}
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate" title={tx.notes}>
                        {tx.notes || <span className="text-slate-600 italic">None</span>}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1 opacity-70 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleStartEdit(tx)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                            title="Edit Row"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>
              Showing <strong className="text-slate-200">{filteredTransactions.length}</strong> of{' '}
              <strong className="text-slate-200">{transactions.length}</strong> transactions
            </span>
            <span className="text-slate-600">•</span>
            <span>Click any pencil icon to edit transaction details inline</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500">
            <span>Column standard: Date | Description | Amount | Category | Balance | notes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
