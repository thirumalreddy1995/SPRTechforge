import { Transaction, AccountType, User } from './types';

// G-06: single source of truth for master-capability checks. Replaces hardcoded
// `user.username === 'thirumalreddy@sprtechforge.com'` comparisons across the codebase.
// Server-side enforcement of the same rule lands with G-02 Firestore rules.
export const isMasterUser = (u?: User | null): boolean => !!u?.isMaster;

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const downloadJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// RFC-4180-safe CSV export: every cell is quoted with inner quotes doubled,
// so names with commas, feedback with newlines, etc. can't break columns.
// Columns are the union of keys across all rows (in first-seen order), and a
// UTF-8 BOM makes Excel open it with correct encoding.
export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers: string[] = [];
  data.forEach(row => Object.keys(row).forEach(k => { if (!headers.includes(k)) headers.push(k); }));
  const cell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [
    headers.map(cell).join(','),
    ...data.map(row => headers.map(h => cell((row as any)[h])).join(',')),
  ];
  const blob = new Blob([String.fromCharCode(0xfeff) + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Stamped filename for exports: "interviews-2026-08-04.csv". */
export const csvFilename = (base: string): string =>
  `${base}-${new Date().toISOString().slice(0, 10)}.csv`;

/**
 * Generates a multi-sheet Excel file using XML Spreadsheet 2003 format.
 */
export const downloadMultiSheetExcel = (sheets: { name: string; data: any[] }[], filename: string) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="sHeader">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1e3a8a" ss:Pattern="Solid"/>
  </Style>
 </Styles>`;

  sheets.forEach(sheet => {
    xml += `<Worksheet ss:Name="${sheet.name}">`;
    xml += `<Table>`;
    
    if (sheet.data.length > 0) {
      const keys = Object.keys(sheet.data[0]);
      
      // Header Row
      xml += `<Row>`;
      keys.forEach(key => {
        xml += `<Cell ss:StyleID="sHeader"><Data ss:Type="String">${key}</Data></Cell>`;
      });
      xml += `</Row>`;

      // Data Rows
      sheet.data.forEach(row => {
        xml += `<Row>`;
        keys.forEach(key => {
          const val = row[key];
          const isNum = typeof val === 'number';
          xml += `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${val !== null && val !== undefined ? val : ''}</Data></Cell>`;
        });
        xml += `</Row>`;
      });
    } else {
      xml += `<Row><Cell><Data ss:Type="String">No data available</Data></Cell></Row>`;
    }

    xml += `</Table></Worksheet>`;
  });

  xml += `</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Core Business Logic extracted for Testing
export const calculateEntityBalance = (
  id: string, 
  type: 'Account' | 'Candidate' | 'Staff', 
  transactions: Transaction[], 
  openingBalance: number = 0,
  accountType?: AccountType
): number => {
  let balance = 0;

  // Asset/Liability logic for opening balance
  if (type === 'Account') {
    if (accountType === AccountType.Creditor || accountType === AccountType.Salary) {
      // Liabilities start negative in our books (money we owe)
      balance -= openingBalance;
    } else {
      // Assets and Income start positive
      balance += openingBalance;
    }
  } 

  transactions.forEach(t => {
    const isTo = t.toEntityId === id && t.toEntityType === type;
    const isFrom = t.fromEntityId === id && t.fromEntityType === type;

    if (isTo) {
      // For Income/Equity, money flowing TO the ledger is usually a refund/reduction, so it decreases balance
      if (accountType === AccountType.Income || accountType === AccountType.Equity) {
        balance -= t.amount;
      } else {
        // For Assets/Liabilities, money flowing TO the entity increases its ledger position
        balance += t.amount;
      }
    }

    if (isFrom) {
      // For Income/Equity, money flowing FROM the ledger to Bank/Cash is revenue generation, so it increases balance
      if (accountType === AccountType.Income || accountType === AccountType.Equity) {
        balance += t.amount;
      } else {
        // For Assets/Liabilities, money flowing FROM the entity decreases its ledger position
        balance -= t.amount;
      }
    }
  });

  return balance;
};