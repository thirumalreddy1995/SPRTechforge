import { Transaction, AccountType } from './types';

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

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => `"${val}"`).join(',')
  ).join('\n');
  const csvContent = `${headers}\n${rows}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

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
      // Liabilities start negative in our books
      balance -= openingBalance;
    } else {
      // Assets (Bank, Cash, Debtors) start positive
      balance += openingBalance;
    }
  } 

  transactions.forEach(t => {
    // If entity is the DESTINATION (Received money)
    if (t.toEntityId === id && t.toEntityType === type) {
      balance += t.amount; 
    }
    // If entity is the SOURCE (Paid money)
    if (t.fromEntityId === id && t.fromEntityType === type) {
      balance -= t.amount;
    }
  });

  return balance;
};