import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode2, Sparkles, BookOpen, Layers } from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl' | 'prompt'>('python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonCode = `import os
import json
import csv
from google import genai
from google.genai import types

# 1. Initialize Gemini Client with your API key
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# 2. Read bank statement (PDF or Image)
file_path = "bank_statement.pdf" # Can be multi-page PDF or PNG/JPG
with open(file_path, "rb") as f:
    file_bytes = f.read()

# 3. Call Gemini 2.0 / 2.5 Flash Vision OCR
system_prompt = """You are a high-precision Bank Statement OCR engine.
Extract all actual transactions into structured JSON.
Rules:
1. "date": Strictly "YYYY-MM-DD"
2. "amount": Positive (+) for deposits/credits, Negative (-) for expenses/debits
3. "category": Auto-detect (Groceries, Dining, Transport, Salary, Bills, Shopping, Utilities, Healthcare, Transfer, Fees, etc.)
4. "balance": Running balance if present, else null
5. "notes": Reference #, check #, location, or extra info
6. SKIP all header rows, summaries, disclosures, starting/ending balance lines."""

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Part.from_bytes(data=file_bytes, mime_type="application/pdf"),
        "Extract all transactions from this bank statement into clean JSON. Skip headers and totals."
    ],
    config=types.GenerateContentConfig(
        system_instruction=system_prompt,
        response_mime_type="application/json",
        temperature=0.1
    )
)

data = json.loads(response.text)
transactions = data.get("transactions", [])

# 4. Save to Clean CSV ready for Google Sheets
csv_filename = "extracted_statement.csv"
with open(csv_filename, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # Target columns: Date | Description | Amount | Category | Balance | notes
    writer.writerow(["Date", "Description", "Amount", "Category", "Balance", "notes"])
    for tx in transactions:
        writer.writerow([
            tx.get("date"),
            tx.get("description"),
            f"{tx.get('amount'):.2f}",
            tx.get("category"),
            f"{tx.get('balance'):.2f}" if tx.get("balance") is not None else "",
            tx.get("notes", "")
        ])

print(f"Successfully exported {len(transactions)} rows into {csv_filename}!")
`;

  const nodeCode = `import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";

// Initialize Gemini Client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

// Read file as Base64 (supports Multi-page PDF, PNG, JPG)
const pdfBuffer = fs.readFileSync("bank_statement.pdf");
const base64Data = pdfBuffer.toString("base64");

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
    {
      text: "Extract all financial transactions from this statement. Format dates YYYY-MM-DD. Positive amounts for deposits, negative for expenses. Skip headers, summary balances, and totals.",
    },
  ],
  config: {
    systemInstruction: "You are a professional bank statement parser. Extract Date (YYYY-MM-DD), Description, Amount (+/-), Category, Balance, Notes. Ignore header rows, totals, and promotional banners.",
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        transactions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              balance: { type: Type.NUMBER },
              notes: { type: Type.STRING },
            },
            required: ["date", "description", "amount", "category"],
          },
        },
      },
      required: ["transactions"],
    },
  },
});

const result = JSON.parse(response.text);

// Generate CSV: Date,Description,Amount,Category,Balance,notes
const header = "Date,Description,Amount,Category,Balance,notes\\n";
const csvRows = result.transactions.map((tx: any) => [
  \`"\${tx.date}"\`,
  \`"\${tx.description.replace(/"/g, '""')}"\`,
  tx.amount.toFixed(2),
  \`"\${tx.category}"\`,
  tx.balance !== null && tx.balance !== undefined ? tx.balance.toFixed(2) : "",
  \`"\${(tx.notes || "").replace(/"/g, '""')}"\`
].join(",")).join("\\n");

fs.writeFileSync("output.csv", header + csvRows);
console.log("Extraction complete! Saved to output.csv");
`;

  const curlCode = `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [
      {
        "parts": [
          {
            "inlineData": {
              "mimeType": "application/pdf",
              "data": "'$(base64 -w 0 bank_statement.pdf)'"
            }
          },
          {
            "text": "Extract all transactions into JSON with Date (YYYY-MM-DD), Description, Amount (+ for deposit, - for expense), Category, Balance, Notes. Skip headers and totals."
          }
        ]
      }
    ],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  }'`;

  const promptText = `SYSTEM INSTRUCTION:
You are a high-precision Bank Statement OCR and Transaction Extraction Engine.
Your task is to analyze bank statements (multi-page PDFs or single/multi-page images) and extract every legitimate financial transaction with extreme accuracy.

STRICT EXTRACTION RULES:
1. OUTPUT COLUMNS & FORMAT:
   - "date": MUST be formatted as strictly "YYYY-MM-DD". Infer the year from statement period or header (e.g. "Oct 15" on a 2024 statement becomes "2024-10-15").
   - "description": Clean transaction text (payee, merchant, wire reference, check number, or transfer details). Strip out irrelevant repeated bank disclaimer codes if they clutter the payee name.
   - "amount": NUMBER ONLY.
     * POSITIVE (+) for deposits, credits, payroll, incoming transfers, refunds, interest paid to account.
     * NEGATIVE (-) for withdrawals, debits, card purchases, fees, checks written, outgoing bill payments.
     * Example: a purchase of $45.20 MUST be -45.20. A deposit of $1,200.00 MUST be 1200.00.
   - "category": Auto-detect one of:
     * Groceries, Dining, Transport, Salary, Bills, Shopping, Utilities, Healthcare, Transfer, Fees, Entertainment, Investments, Taxes, Other.
   - "balance": The running balance after the transaction as shown on that row, as a number. If not present in the table, set null.
   - "notes": Any reference number, check #, terminal ID, foreign currency rate, or extra info. If none, leave empty string "".
   - "pageNumber": The document page where this transaction appears (1, 2, 3...).

2. ROWS TO SKIP:
   - ALWAYS SKIP: Header rows (e.g. "Date | Description | Amount | Balance"), previous statement balance, ending summary balance, "Total deposits: $...", "Total withdrawals: $...", overdraft notices, advertisement banners, interest rate disclosure tables, fee schedules.
   - ONLY include actual chronological transaction line items!

3. MULTI-PAGE HANDLING:
   - If the statement is a multi-page PDF, process EVERY page thoroughly from first page to last page. Do not truncate after page 1. Keep chronological order.`;

  const getCode = () => {
    switch (activeTab) {
      case 'python':
        return pythonCode;
      case 'node':
        return nodeCode;
      case 'curl':
        return curlCode;
      case 'prompt':
        return promptText;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Extraction Code & Implementation Guide
              </h2>
              <p className="text-xs text-slate-400">
                Automate bank statement extraction using Gemini 2.0 / 2.5 Flash Vision OCR
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

        {/* Tab selection & Copy action */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50">
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'python'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python (google-genai)
            </button>
            <button
              onClick={() => setActiveTab('node')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'node'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Node.js / TypeScript
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'curl'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              cURL (REST API)
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'prompt'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System Prompt & Schema
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950">
          <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto select-all selection:bg-emerald-500/30">
            <code>{getCode()}</code>
          </pre>
        </div>

        {/* Informational Footer Strip */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Direct PDF ingestion: Gemini natively processes multi-page PDFs without external OCR pre-processing.
            </span>
          </div>
          <span className="text-slate-500 font-mono">Output standard: Date,Description,Amount,Category,Balance,notes</span>
        </div>
      </div>
    </div>
  );
};
