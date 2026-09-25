export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive (+) for deposits, negative (-) for expenses
  category: string;
  balance: number | null;
  notes: string;
  pageNumber?: number | null;
}

export interface StatementSummary {
  bankName: string;
  accountNumberMasked: string;
  statementPeriod: string;
  currency: string;
  startingBalance: number | null;
  endingBalance: number | null;
  transactions: Transaction[];
  skippedRowsCount: number;
  summaryNotes: string;
}

export interface SampleStatement {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  fileName: string;
  description: string;
  bankName: string;
  accountNumberMasked: string;
  statementPeriod: string;
  currency: string;
  startingBalance: number | null;
  endingBalance: number | null;
  skippedRowsCount: number;
  summaryNotes: string;
  transactions: Transaction[];
}

export type ViewMode = 'table' | 'analytics' | 'csv' | 'document';

export type CategoryOption = 
  | 'Groceries'
  | 'Dining'
  | 'Transport'
  | 'Salary'
  | 'Bills'
  | 'Shopping'
  | 'Utilities'
  | 'Healthcare'
  | 'Transfer'
  | 'Fees'
  | 'Entertainment'
  | 'Investments'
  | 'Taxes'
  | 'Other';
