import React, { useState, useEffect } from 'react';
import { 
  Table, 
  FileSpreadsheet, 
  Eye, 
  Sparkles, 
  Download, 
  ClipboardCopy, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BarChart3
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { SummaryCards } from './components/SummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { CsvExportView } from './components/CsvExportView';
import { DocumentPreview } from './components/DocumentPreview';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CodeModal } from './components/CodeModal';
import { FormatRulesModal } from './components/FormatRulesModal';
import { StatementSummary, Transaction, SampleStatement, ViewMode } from './types';

// Default initial state using realistic bank statement
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: '2024-10-02',
    description: 'ACME CORP DIRECT DEP PAYROLL PPD ID: 94821',
    amount: 3450.00,
    category: 'Salary',
    balance: 7660.50,
    notes: 'Direct Deposit #94821',
    pageNumber: 1
  },
  {
    id: 'tx-2',
    date: '2024-10-03',
    description: 'AVALON APARTMENTS ONLINE PMT 10042',
    amount: -1850.00,
    category: 'Bills',
    balance: 5810.50,
    notes: 'Monthly Rent ref #10042',
    pageNumber: 1
  },
  {
    id: 'tx-3',
    date: '2024-10-05',
    description: 'TRADER JOE\'S #542 SAN FRANCISCO CA',
    amount: -86.42,
    category: 'Groceries',
    balance: 5724.08,
    notes: 'Card ending 4892',
    pageNumber: 1
  },
  {
    id: 'tx-4',
    date: '2024-10-07',
    description: 'CHEVRON 0093814 SAN JOSE CA',
    amount: -54.30,
    category: 'Transport',
    balance: 5669.78,
    notes: 'Fuel purchase',
    pageNumber: 1
  },
  {
    id: 'tx-5',
    date: '2024-10-10',
    description: 'BLUE BOTTLE COFFEE SAN FRANCISCO CA',
    amount: -14.25,
    category: 'Dining',
    balance: 5655.53,
    notes: 'POS Debit',
    pageNumber: 1
  },
  {
    id: 'tx-6',
    date: '2024-10-12',
    description: 'PACIFIC GAS & ELECTRIC ELEC/GAS BILL WEB PMT',
    amount: -112.40,
    category: 'Utilities',
    balance: 5543.13,
    notes: 'Monthly utility bill',
    pageNumber: 1
  },
  {
    id: 'tx-7',
    date: '2024-10-16',
    description: 'ACME CORP DIRECT DEP PAYROLL PPD ID: 94822',
    amount: 3450.00,
    category: 'Salary',
    balance: 8993.13,
    notes: 'Mid-month payroll',
    pageNumber: 2
  },
  {
    id: 'tx-8',
    date: '2024-10-18',
    description: 'WHOLE FOODS MARKET #10332 SAN FRANCISCO CA',
    amount: -142.18,
    category: 'Groceries',
    balance: 8850.95,
    notes: 'Market purchases',
    pageNumber: 2
  },
  {
    id: 'tx-9',
    date: '2024-10-21',
    description: 'UBER TRIP 0924 G.CO/HELPPAY SAN FRANCISCO',
    amount: -28.40,
    category: 'Transport',
    balance: 8822.55,
    notes: 'Rideshare commute',
    pageNumber: 2
  },
  {
    id: 'tx-10',
    date: '2024-10-25',
    description: 'SPOTIFY USA MONTHLY SUBSCRIPTION',
    amount: -11.99,
    category: 'Entertainment',
    balance: 8810.56,
    notes: 'Monthly premium',
    pageNumber: 2
  },
  {
    id: 'tx-11',
    date: '2024-10-28',
    description: 'AMAZON.COM*2M30J921 AMZN.COM/BILL WA',
    amount: -75.21,
    category: 'Shopping',
    balance: 8735.35,
    notes: 'Household order',
    pageNumber: 2
  },
  {
    id: 'tx-12',
    date: '2024-10-30',
    description: 'TRANSFER TO HIGH YIELD SAVINGS ACC #9011',
    amount: -2550.00,
    category: 'Transfer',
    balance: 6185.35,
    notes: 'Savings deposit',
    pageNumber: 2
  }
];

const INITIAL_SUMMARY: StatementSummary = {
  bankName: 'JPMorgan Chase Bank, N.A.',
  accountNumberMasked: '...4892',
  statementPeriod: '2024-10-01 to 2024-10-31',
  currency: 'USD',
  startingBalance: 4210.50,
  endingBalance: 6185.35,
  transactions: INITIAL_TRANSACTIONS,
  skippedRowsCount: 14,
  summaryNotes: 'Extracted 12 transactions across 2 pages. Filtered out header tables and fee disclosures.'
};

export default function App() {
  const [summary, setSummary] = useState<StatementSummary>(INITIAL_SUMMARY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [activeView, setActiveView] = useState<ViewMode>('table');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // File Preview state
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>('Chase_Checking_Oct2024.pdf');

  // Samples loaded from backend
  const [samples, setSamples] = useState<SampleStatement[]>([]);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isFormatRulesModalOpen, setIsFormatRulesModalOpen] = useState(false);

  // Fetch samples on mount
  useEffect(() => {
    fetch('/api/sample-statements')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples && Array.isArray(data.samples)) {
          setSamples(data.samples);
        }
      })
      .catch((err) => console.warn('Could not load samples:', err));
  }, []);

  // Handle uploaded file
  const handleFileSelected = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setFileName(file.name);
    setFileMimeType(file.type);

    // Create object URL for client preview
    const objectUrl = URL.createObjectURL(file);
    setFileBlobUrl(objectUrl);

    // Read base64
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        setProcessingStep('Sending document to Gemini 2.0 / 2.5 Flash Vision...');
        
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: file.type || 'application/pdf',
            fileName: file.name
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to extract bank statement.');
        }

        const resData: StatementSummary = data.result;
        setSummary(resData);
        setTransactions(resData.transactions || []);
        setActiveView('table');
      } catch (err: any) {
        console.error('Extraction failed:', err);
        setError(err.message || 'Error occurred during statement OCR extraction.');
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
      }
    };

    reader.onerror = () => {
      setError('Failed to read the uploaded file.');
      setIsProcessing(false);
    };
  };

  // Handle sample selection
  const handleSampleSelected = (sampleId: string) => {
    setError(null);
    const chosen = samples.find((s) => s.id === sampleId);
    if (!chosen) return;

    setFileBlobUrl(null); // clears blob so DocumentPreview displays rich mock template
    setFileName(chosen.fileName);
    setFileMimeType(chosen.type === 'pdf' ? 'application/pdf' : 'image/png');

    setSummary({
      bankName: chosen.bankName,
      accountNumberMasked: chosen.accountNumberMasked,
      statementPeriod: chosen.statementPeriod,
      currency: chosen.currency,
      startingBalance: chosen.startingBalance,
      endingBalance: chosen.endingBalance,
      transactions: chosen.transactions,
      skippedRowsCount: chosen.skippedRowsCount,
      summaryNotes: chosen.summaryNotes
    });
    setTransactions(chosen.transactions);
    setActiveView('table');
  };

  // Transaction mutations
  const handleUpdateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx))
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-custom-${Date.now()}`
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenHelpModal={() => setIsFormatRulesModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Upload & Drop Zone */}
        <UploadZone
          onFileSelected={handleFileSelected}
          onSampleSelected={handleSampleSelected}
          samples={samples}
          isProcessing={isProcessing}
          processingStep={processingStep}
          error={error}
          currentFileName={fileName || undefined}
        />

        {/* Statement Financial KPI Strip */}
        <SummaryCards
          summary={summary}
          transactions={transactions}
        />

        {/* View Switcher Tabs & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeView === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Interactive Table ({transactions.length})</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeView === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Spending Breakdown & Balance Chart</span>
            </button>

            <button
              onClick={() => setActiveView('csv')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeView === 'csv'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Clean CSV / Google Sheets</span>
            </button>

            <button
              onClick={() => setActiveView('document')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeView === 'document'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Original Statement Preview</span>
            </button>
          </div>

          {/* Quick Info Badge */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Target format: <code className="text-emerald-400 text-[11px] font-mono">Date|Description|Amount|Category|Balance|notes</code>
            </span>
          </div>
        </div>

        {/* Tab Views */}
        {activeView === 'table' && (
          <TransactionTable
            transactions={transactions}
            currency={summary.currency || 'USD'}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddTransaction={handleAddTransaction}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsCharts
            transactions={transactions}
            currency={summary.currency || 'USD'}
            startingBalance={summary.startingBalance}
          />
        )}

        {activeView === 'csv' && (
          <CsvExportView
            transactions={transactions}
            statementName={fileName || summary.bankName}
          />
        )}

        {activeView === 'document' && (
          <DocumentPreview
            fileBlobUrl={fileBlobUrl}
            fileMimeType={fileMimeType}
            fileName={fileName}
            summary={summary}
            transactions={transactions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <span>StatementOCR • Bank Statement to Clean CSV Engine</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              API & Automation Code
            </button>
            <span>•</span>
            <button
              onClick={() => setIsFormatRulesModalOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Format Specifications
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      <FormatRulesModal
        isOpen={isFormatRulesModalOpen}
        onClose={() => setIsFormatRulesModalOpen(false)}
      />
    </div>
  );
}
