import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support large PDF & high-res image base64 payloads up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ExtractedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  balance: number | null;
  notes: string;
  pageNumber?: number | null;
}

export interface StatementExtractionResult {
  bankName: string;
  accountNumberMasked: string;
  statementPeriod: string;
  currency: string;
  startingBalance: number | null;
  endingBalance: number | null;
  transactions: ExtractedTransaction[];
  skippedRowsCount: number;
  summaryNotes: string;
}

// Sample pre-loaded statements for immediate testing
const SAMPLE_STATEMENTS = [
  {
    id: 'chase-checking',
    name: 'Chase Total Checking Statement (Multi-page PDF Demo)',
    type: 'pdf',
    fileName: 'chase_checking_oct2024.pdf',
    description: 'Personal checking account statement with payroll deposit, rent, utilities, and daily expenses.',
    bankName: 'JPMorgan Chase Bank, N.A.',
    accountNumberMasked: '...4892',
    statementPeriod: '2024-10-01 to 2024-10-31',
    currency: 'USD',
    startingBalance: 4210.50,
    endingBalance: 6185.35,
    skippedRowsCount: 14,
    summaryNotes: 'Extracted 12 transactions across 2 pages. Filtered out fee disclosure notice and statement header tables.',
    transactions: [
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
        notes: 'Gas station fuel purchase',
        pageNumber: 1
      },
      {
        id: 'tx-5',
        date: '2024-10-10',
        description: 'BLUE BOTTLE COFFEE SAN FRANCISCO CA',
        amount: -14.25,
        category: 'Dining',
        balance: 5655.53,
        notes: 'Debit POS',
        pageNumber: 1
      },
      {
        id: 'tx-6',
        date: '2024-10-12',
        description: 'PACIFIC GAS & ELECTRIC ELEC/GAS BILL WEB PMT',
        amount: -112.40,
        category: 'Utilities',
        balance: 5543.13,
        notes: 'Utility bill auto-pay',
        pageNumber: 1
      },
      {
        id: 'tx-7',
        date: '2024-10-16',
        description: 'ACME CORP DIRECT DEP PAYROLL PPD ID: 94822',
        amount: 3450.00,
        category: 'Salary',
        balance: 8993.13,
        notes: 'Mid-month payroll deposit',
        pageNumber: 2
      },
      {
        id: 'tx-8',
        date: '2024-10-18',
        description: 'WHOLE FOODS MARKET #10332 SAN FRANCISCO CA',
        amount: -142.18,
        category: 'Groceries',
        balance: 8850.95,
        notes: 'Weekly groceries',
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
        notes: 'Recurring subscription',
        pageNumber: 2
      },
      {
        id: 'tx-11',
        date: '2024-10-28',
        description: 'AMAZON.COM*2M30J921 AMZN.COM/BILL WA',
        amount: -75.21,
        category: 'Shopping',
        balance: 8735.35,
        notes: 'Online order',
        pageNumber: 2
      },
      {
        id: 'tx-12',
        date: '2024-10-30',
        description: 'TRANSFER TO HIGH YIELD SAVINGS ACC #9011',
        amount: -2550.00,
        category: 'Transfer',
        balance: 6185.35,
        notes: 'Internal transfer',
        pageNumber: 2
      }
    ]
  },
  {
    id: 'mercury-business',
    name: 'Mercury Business Checking (SaaS / Tech Startup)',
    type: 'pdf',
    fileName: 'mercury_business_statement_nov2024.pdf',
    description: 'Corporate bank statement with customer Stripe payouts, AWS hosting, GitHub subscriptions, and contractor payments.',
    bankName: 'Mercury (Choice Financial Group)',
    accountNumberMasked: '...9021',
    statementPeriod: '2024-11-01 to 2024-11-30',
    currency: 'USD',
    startingBalance: 38240.00,
    endingBalance: 49764.50,
    skippedRowsCount: 9,
    summaryNotes: 'Extracted corporate inflow/outflow with accurate negative amounts for cloud SaaS expenses.',
    transactions: [
      {
        id: 'm-1',
        date: '2024-11-04',
        description: 'STRIPE PAYOUTS TRANSFER ID: po_1Q829302194',
        amount: 18450.00,
        category: 'Salary',
        balance: 56690.00,
        notes: 'SaaS subscription revenue payout',
        pageNumber: 1
      },
      {
        id: 'm-2',
        date: '2024-11-06',
        description: 'AMAZON WEB SERVICES AWS.AMAZON.CO WA',
        amount: -1240.50,
        category: 'Bills',
        balance: 55449.50,
        notes: 'Cloud hosting infrastructure',
        pageNumber: 1
      },
      {
        id: 'm-3',
        date: '2024-11-10',
        description: 'GITHUB INC SAN FRANCISCO CA',
        amount: -210.00,
        category: 'Bills',
        balance: 55239.50,
        notes: 'Developer Team licenses',
        pageNumber: 1
      },
      {
        id: 'm-4',
        date: '2024-11-15',
        description: 'GUSTO PAYROLL SERVICES TAX & WAGE DEBIT',
        amount: -4850.00,
        category: 'Bills',
        balance: 50389.50,
        notes: 'Bi-monthly payroll disbursement',
        pageNumber: 1
      },
      {
        id: 'm-5',
        date: '2024-11-20',
        description: 'GOOGLE WORKSPACE / CLOUD APPS BILL',
        amount: -125.00,
        category: 'Bills',
        balance: 50264.50,
        notes: 'Corporate email & drive seats',
        pageNumber: 1
      },
      {
        id: 'm-6',
        date: '2024-11-25',
        description: 'STRIPE PAYOUTS TRANSFER ID: po_1Q899120485',
        amount: 6200.00,
        category: 'Salary',
        balance: 56464.50,
        notes: 'Enterprise contract payout',
        pageNumber: 1
      },
      {
        id: 'm-7',
        date: '2024-11-28',
        description: 'CONTRACTOR WIRE INTL DEV TEAM REF #8821',
        amount: -6700.00,
        category: 'Bills',
        balance: 49764.50,
        notes: 'Software engineering contract fee',
        pageNumber: 1
      }
    ]
  },
  {
    id: 'citi-credit-card',
    name: 'Citi Double Cash Card (Credit Statement Image/PDF)',
    type: 'image',
    fileName: 'citi_card_statement_scan.png',
    description: 'Credit card monthly billing statement with retail purchases, airline tickets, and cashback credit.',
    bankName: 'Citibank, N.A.',
    accountNumberMasked: '...3319',
    statementPeriod: '2024-09-12 to 2024-10-11',
    currency: 'USD',
    startingBalance: -1450.20,
    endingBalance: -890.45,
    skippedRowsCount: 18,
    summaryNotes: 'Negative amounts correctly assigned to card purchases; positive amount assigned to automatic payment credit.',
    transactions: [
      {
        id: 'c-1',
        date: '2024-09-14',
        description: 'AUTOMATIC PAYMENT - THANK YOU ACH DEBIT',
        amount: 1450.20,
        category: 'Transfer',
        balance: 0.00,
        notes: 'Autopay full balance clearance',
        pageNumber: 1
      },
      {
        id: 'c-2',
        date: '2024-09-18',
        description: 'DELTA AIR LINES ATLANTA GA',
        amount: -420.80,
        category: 'Transport',
        balance: -420.80,
        notes: 'Roundtrip flight ticket',
        pageNumber: 1
      },
      {
        id: 'c-3',
        date: '2024-09-22',
        description: 'HILTON HOTELS NEW YORK NY',
        amount: -289.40,
        category: 'Dining',
        balance: -710.20,
        notes: 'Hotel lodging and dining',
        pageNumber: 1
      },
      {
        id: 'c-4',
        date: '2024-09-26',
        description: 'TARGET STORE T-1204 REDWOOD CITY CA',
        amount: -74.15,
        category: 'Shopping',
        balance: -784.35,
        notes: 'Household supplies',
        pageNumber: 1
      },
      {
        id: 'c-5',
        date: '2024-10-02',
        description: 'APPLE.COM/BILL 800-692-7753 CA',
        amount: -19.99,
        category: 'Bills',
        balance: -804.34,
        notes: 'iCloud & Apple One subscription',
        pageNumber: 1
      },
      {
        id: 'c-6',
        date: '2024-10-05',
        description: 'CASH REWARDS REDEMPTION STATEMENT CREDIT',
        amount: 25.00,
        category: 'Salary',
        balance: -779.34,
        notes: '2% cashback redemption',
        pageNumber: 1
      },
      {
        id: 'c-7',
        date: '2024-10-09',
        description: 'SWEETGREEN 042 SAN FRANCISCO CA',
        amount: -16.85,
        category: 'Dining',
        balance: -796.19,
        notes: 'Lunch salad POS',
        pageNumber: 1
      },
      {
        id: 'c-8',
        date: '2024-10-10',
        description: 'DOORDASH*CHIPOTLE SAN FRANCISCO CA',
        amount: -34.26,
        category: 'Dining',
        balance: -830.45,
        notes: 'Food delivery',
        pageNumber: 1
      },
      {
        id: 'c-9',
        date: '2024-10-11',
        description: 'ANNUAL MEMBERSHIP FEE',
        amount: -60.00,
        category: 'Fees',
        balance: -890.45,
        notes: 'Annual card account fee',
        pageNumber: 1
      }
    ]
  }
];

// Return sample statements
app.get('/api/sample-statements', (_req, res) => {
  res.json({ samples: SAMPLE_STATEMENTS });
});

// Primary extraction endpoint using Gemini Multimodal Vision OCR
app.post('/api/extract', async (req, res) => {
  try {
    const { fileBase64, mimeType, fileName } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({
        error: 'Missing fileBase64 or mimeType in request body.',
      });
    }

    // Clean base64 string if it contains data URI header
    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');

    const systemInstruction = `You are a high-precision Bank Statement OCR and Transaction Extraction Engine.
Your task is to analyze bank statements (which may be multi-page PDFs or single/multi-page images) and extract every legitimate financial transaction with extreme accuracy.

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
   - If the statement is a multi-page PDF, process EVERY page thoroughly from first page to last page. Do not truncate after page 1. Keep chronological order.

4. ACCURACY:
   - Never hallucinate transactions.
   - Check negative signs carefully. If the bank puts amounts in separate "Withdrawals" / "Deposits" columns, apply negative signs to the withdrawals column.`;

    const promptText = `Extract all individual transactions from this bank statement document (${fileName || 'statement'}).
Extract into the required JSON schema with Date (YYYY-MM-DD), Description, Amount (+ for deposits, - for expenses), Category, Balance, Notes, and document metadata. Skip all summary rows, headers, and non-transaction rows.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        bankName: {
          type: Type.STRING,
          description: 'Name of the issuing bank or financial institution (e.g. Chase, Bank of America, Mercury, Wells Fargo, etc.)'
        },
        accountNumberMasked: {
          type: Type.STRING,
          description: 'Masked account or card number (e.g. ...4892)'
        },
        statementPeriod: {
          type: Type.STRING,
          description: 'Statement period date range (e.g. 2024-10-01 to 2024-10-31)'
        },
        currency: {
          type: Type.STRING,
          description: 'Currency code, e.g. USD, EUR, GBP, CAD'
        },
        startingBalance: {
          type: Type.NUMBER,
          description: 'Starting / Beginning balance before transactions, if present'
        },
        endingBalance: {
          type: Type.NUMBER,
          description: 'Ending balance after statement cycle, if present'
        },
        transactions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: {
                type: Type.STRING,
                description: 'Transaction date strictly in YYYY-MM-DD'
              },
              description: {
                type: Type.STRING,
                description: 'Full merchant, payee, or transaction description'
              },
              amount: {
                type: Type.NUMBER,
                description: 'Signed transaction amount (+ for deposit/credit, - for expense/debit)'
              },
              category: {
                type: Type.STRING,
                description: 'Auto-detected category (e.g. Groceries, Dining, Transport, Salary, Bills, Shopping, Utilities, Healthcare, Transfer, Fees, Entertainment, Other)'
              },
              balance: {
                type: Type.NUMBER,
                description: 'Running balance after transaction if available, else null'
              },
              notes: {
                type: Type.STRING,
                description: 'Reference number, check number, location, or notes'
              },
              pageNumber: {
                type: Type.INTEGER,
                description: 'Page number where this transaction was found'
              }
            },
            required: ['date', 'description', 'amount', 'category']
          }
        },
        skippedRowsCount: {
          type: Type.INTEGER,
          description: 'Estimated count of non-transaction header/summary/footer rows skipped'
        },
        summaryNotes: {
          type: Type.STRING,
          description: 'Brief extraction summary including total pages scanned and rows extracted'
        }
      },
      required: ['bankName', 'currency', 'transactions']
    };

    // Candidate models to use (prefer gemini-2.5-flash or gemini-3.8-flash for vision OCR)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let lastError: any = null;
    let extractionResult: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: cleanBase64
                  }
                },
                {
                  text: promptText
                }
              ]
            }
          ],
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.1
          }
        });

        if (response.text) {
          extractionResult = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or not found, trying fallback:`, err?.message || err);
        lastError = err;
      }
    }

    if (!extractionResult) {
      throw lastError || new Error('No valid response received from Gemini OCR model.');
    }

    // Attach unique IDs to transactions if not present
    if (Array.isArray(extractionResult.transactions)) {
      extractionResult.transactions = extractionResult.transactions.map((tx: any, idx: number) => ({
        id: tx.id || `tx-${Date.now()}-${idx}`,
        date: tx.date || '',
        description: tx.description || 'Unknown Transaction',
        amount: typeof tx.amount === 'number' ? tx.amount : 0,
        category: tx.category || 'Other',
        balance: typeof tx.balance === 'number' ? tx.balance : null,
        notes: tx.notes || '',
        pageNumber: tx.pageNumber || 1
      }));
    } else {
      extractionResult.transactions = [];
    }

    return res.json({
      success: true,
      result: extractionResult
    });

  } catch (error: any) {
    console.error('OCR Extraction error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract transactions from statement.',
      details: error?.toString()
    });
  }
});

// Code Snippets endpoint so users can inspect clear programmatic instructions
app.get('/api/extraction-instructions', (_req, res) => {
  const codeGuide = {
    model: 'gemini-2.5-flash / gemini-3.8-flash',
    supportedInputTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
    csvColumns: ['Date', 'Description', 'Amount', 'Category', 'Balance', 'notes'],
    pythonSnippet: `from google import genai
from google.genai import types
import json
import csv

# 1. Initialize Gemini Client
client = genai.Client()

# 2. Read Bank Statement (PDF or Image)
with open("bank_statement.pdf", "rb") as f:
    pdf_bytes = f.read()

# 3. Call Gemini 2.0/2.5 Flash Vision OCR
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
        "Extract all individual bank transactions into structured JSON. Format Date as YYYY-MM-DD. Set deposits as positive (+) and expenses as negative (-). Auto-detect category."
    ],
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        system_instruction="Extract bank statement transactions. Skip headers, summaries, and totals. Convert dates to YYYY-MM-DD. Sign amounts (+ for deposit, - for expense)."
    )
)

data = json.loads(response.text)

# 4. Save to Clean CSV for Google Sheets
with open("transactions.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["Date", "Description", "Amount", "Category", "Balance", "notes"])
    for tx in data.get("transactions", []):
        writer.writerow([
            tx.get("date"),
            tx.get("description"),
            f"{tx.get('amount'):.2f}",
            tx.get("category"),
            f"{tx.get('balance'):.2f}" if tx.get("balance") is not None else "",
            tx.get("notes", "")
        ])

print(f"Extracted {len(data.get('transactions', []))} transactions into transactions.csv!")`,
    nodeSnippet: `import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pdfBuffer = fs.readFileSync("bank_statement.pdf");
const base64Data = pdfBuffer.toString("base64");

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data
      }
    },
    { text: "Extract bank statement transactions with YYYY-MM-DD dates, signed amounts (+/-), category, and balance." }
  ],
  config: {
    responseMimeType: "application/json"
  }
});

const result = JSON.parse(response.text);
// Map to CSV: Date,Description,Amount,Category,Balance,notes
const csvHeader = "Date,Description,Amount,Category,Balance,notes\\n";
const csvRows = result.transactions.map(t => 
  \`"\${t.date}","\${t.description.replace(/"/g, '""')}",\${t.amount},"\${t.category}",\${t.balance ?? ''},"\${(t.notes || '').replace(/"/g, '""')}"\`
).join("\\n");

fs.writeFileSync("output.csv", csvHeader + csvRows);
console.log("CSV generated successfully!");`,
    curlSnippet: `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -d '{
    "contents": [{
      "parts": [
        {
          "inlineData": {
            "mimeType": "application/pdf",
            "data": "<BASE64_PDF_DATA>"
          }
        },
        {
          "text": "Extract all transactions into JSON with Date (YYYY-MM-DD), Description, Amount (+/-), Category, Balance, Notes."
        }
      ]
    }],
    "generationConfig": {
      "responseMimeType": "application/json"
    }
  }'`
  };

  res.json(codeGuide);
});

// Dev vs Production Vite mounting
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
