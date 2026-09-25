import { Transaction } from '../types';

/**
 * Format string cell for CSV (handles quotes, commas, newlines)
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Format string cell for TSV (for direct Google Sheets copy-paste)
 */
function escapeTsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // In TSV, replace tabs with space and newlines with space for single-cell compatibility
  return str.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

/**
 * Generates standard RFC 4180 CSV with columns:
 * Date,Description,Amount,Category,Balance,notes
 */
export function generateCsv(transactions: Transaction[]): string {
  const header = ['Date', 'Description', 'Amount', 'Category', 'Balance', 'notes'];
  const rows = transactions.map(tx => [
    escapeCsvCell(tx.date),
    escapeCsvCell(tx.description),
    escapeCsvCell(tx.amount.toFixed(2)),
    escapeCsvCell(tx.category),
    escapeCsvCell(tx.balance !== null ? tx.balance.toFixed(2) : ''),
    escapeCsvCell(tx.notes)
  ].join(','));

  return [header.join(','), ...rows].join('\n');
}

/**
 * Generates Tab-Separated Values (TSV)
 * When copied to the clipboard, Google Sheets natively parses TSV into separate cells!
 */
export function generateTsvForSheets(transactions: Transaction[]): string {
  const header = ['Date', 'Description', 'Amount', 'Category', 'Balance', 'notes'];
  const rows = transactions.map(tx => [
    escapeTsvCell(tx.date),
    escapeTsvCell(tx.description),
    escapeTsvCell(tx.amount.toFixed(2)),
    escapeTsvCell(tx.category),
    escapeTsvCell(tx.balance !== null ? tx.balance.toFixed(2) : ''),
    escapeTsvCell(tx.notes)
  ].join('\t'));

  return [header.join('\t'), ...rows].join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
