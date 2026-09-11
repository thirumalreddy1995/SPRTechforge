import React, { useRef, useState } from 'react';
import { Button, Card, Select } from '../../components/Components';
import { useApp } from '../../context/AppContext';
import { useSeminar } from '../context/SeminarContext';
import { SheetImportReport, SheetMapping, SeminarField } from '../types';
import { FIELD_LABELS, SEMINAR_FIELDS, buildSheetMapping, sheetSkipReason } from '../lib/headerMatch';
import { buildCandidatesFromSheets } from '../lib/importer';

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

type Step = 'upload' | 'preview' | 'report';

export const SeminarImport: React.FC = () => {
  const { showToast } = useApp();
  const { candidates, upsertCandidates } = useSeminar();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<SheetMapping[]>([]);
  const [reports, setReports] = useState<SheetImportReport[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const downloadTemplate = async () => {
    try {
      const xlsx: any = await import('xlsx');
      const wb = xlsx.utils.book_new();

      // Data sheet: matches the standard candidate-list format. Every column
      // is auto-detected on import (S.No is ignored). The sheet name becomes
      // the candidates' degreeGroup on import.
      const headers = [
        'S.No', 'Full Name', 'Email', 'Phone', 'Gender', 'State', 'City',
        'Qualification / Degree', 'Course / Stream', 'Institution',
        'Year of Passing', 'Total Experience (Years)',
      ];
      const dataSheet = xlsx.utils.aoa_to_sheet([headers]);
      dataSheet['!cols'] = [
        { wch: 6 }, { wch: 28 }, { wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 16 }, { wch: 16 },
        { wch: 24 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 22 },
      ];
      // AutoFilter dropdowns on the header row, like the original file.
      dataSheet['!autofilter'] = { ref: `A1:${xlsx.utils.encode_col(headers.length - 1)}1` };
      xlsx.utils.book_append_sheet(wb, dataSheet, 'Candidates');

      // Instructions sheet: has no name/contact columns, so the importer
      // auto-skips it — safe to leave in the file when importing.
      const instructions = xlsx.utils.aoa_to_sheet([
        ['How to use this template'],
        [''],
        ['1. Fill the "Candidates" sheet. Full Name plus Email or Phone is required per row; all other columns (S.No, Gender, State, City, Qualification, Course, Institution, Year of Passing, Experience) are optional.'],
        ['2. Phone: 10-digit numbers are fine (9849123456) — +91 is added automatically. 91XXXXXXXXXX and +91XXXXXXXXXX also work.'],
        ['3. The sheet name ("Candidates") is saved as each person\'s degree group. Rename it (e.g. "B.Tech-BE") or add more sheets — one per degree group.'],
        ['4. Duplicates are matched by email (then phone), so importing the same file twice never creates duplicates.'],
        ['5. Save and upload the file on Seminar → Import Candidates. This Instructions sheet is skipped automatically.'],
      ]);
      instructions['!cols'] = [{ wch: 130 }];
      xlsx.utils.book_append_sheet(wb, instructions, 'Instructions');

      xlsx.writeFile(wb, 'seminar-candidates-template.xlsx');
    } catch (e: any) {
      showToast(`Could not generate template: ${e.message || e}`, 'error');
    }
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      showToast('File exceeds the 20 MB limit', 'error');
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls') && !lower.endsWith('.csv')) {
      showToast('Unsupported file type. Use .xlsx, .xls or .csv', 'error');
      return;
    }
    setIsParsing(true);
    try {
      // xlsx is dynamic-imported so it only loads when actually importing
      // (same convention as pages/training/InterviewQuestions.tsx).
      const xlsx: any = await import('xlsx');
      const data = await file.arrayBuffer();
      const wb = xlsx.read(data, { type: 'array' });
      const parsed: SheetMapping[] = wb.SheetNames.map((name: string) => {
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false, defval: '' }) as any[][];
        return buildSheetMapping(name, rows);
      });
      if (parsed.every(s => s.rows.length === 0)) {
        showToast('No data rows found in this file', 'error');
        return;
      }
      setFileName(file.name);
      setSheets(parsed);
      setStep('preview');
    } catch (e: any) {
      showToast(`Could not parse file: ${e.message || e}`, 'error');
    } finally {
      setIsParsing(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remap = (sheetIdx: number, field: SeminarField, col: number) => {
    setSheets(prev =>
      prev.map((s, i) => {
        if (i !== sheetIdx) return s;
        const mapping = { ...s.mapping, [field]: col };
        // Enforce one field per column: unset any other field on the same column.
        SEMINAR_FIELDS.forEach(f => {
          if (f !== field && col !== -1 && mapping[f] === col) mapping[f] = -1;
        });
        const skipReason = sheetSkipReason(mapping);
        // Newly-valid sheets auto-include; newly-invalid ones auto-exclude;
        // otherwise respect the user's checkbox.
        const included = skipReason ? false : (s.skipReason ? true : s.included);
        return { ...s, mapping, skipReason, included };
      }),
    );
  };

  const toggleSheet = (sheetIdx: number, included: boolean) => {
    setSheets(prev => prev.map((s, i) => (i === sheetIdx ? { ...s, included: included && !s.skipReason } : s)));
  };

  const runImport = async () => {
    setIsImporting(true);
    try {
      const { upserts, reports: r } = buildCandidatesFromSheets(sheets, candidates);
      if (upserts.length > 0) await upsertCandidates(upserts);
      setReports(r);
      setStep('report');
      showToast(`Import complete: ${r.reduce((n, x) => n + x.imported, 0)} new, ${r.reduce((n, x) => n + x.merged, 0)} updated`, 'success');
    } catch (e: any) {
      showToast(`Import failed: ${e.message || e}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setSheets([]);
    setReports([]);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Seminar &middot; Import Candidates</h1>
          <p className="text-gray-600">Upload an Excel/CSV contact list. Columns are auto-detected; you confirm the mapping before anything is written.</p>
        </div>
        <Button variant="secondary" onClick={downloadTemplate}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download Template
        </Button>
      </div>

      {step === 'upload' && (
        <Card>
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          >
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="font-bold text-gray-700 mb-1">Drop your file here, or</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={isParsing}>
              {isParsing ? 'Parsing…' : 'Choose File'}
            </Button>
            <p className="text-xs text-gray-500 mt-3">.xlsx / .xls / .csv &middot; max 20 MB &middot; all sheets are scanned; summary sheets are skipped automatically</p>
            <p className="text-xs text-gray-500 mt-1">
              New list? <button onClick={downloadTemplate} className="text-blue-600 font-bold underline">Download the Excel template</button>, fill it in, and upload the same file here.
            </p>
          </div>
        </Card>
      )}

      {step === 'preview' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{fileName}</span>
              {' — '}{sheets.filter(s => s.included).length} of {sheets.length} sheet(s) selected,{' '}
              {sheets.filter(s => s.included).reduce((n, s) => n + s.rows.length, 0)} rows to import
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={reset}>Cancel</Button>
              <Button variant="success" onClick={runImport} disabled={isImporting || sheets.every(s => !s.included)}>
                {isImporting ? 'Importing…' : 'Confirm & Import'}
              </Button>
            </div>
          </div>

          {sheets.map((sheet, si) => (
            <Card key={sheet.sheetName} className={sheet.included ? '' : 'opacity-70'}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sheet.included}
                    disabled={!!sheet.skipReason}
                    onChange={e => toggleSheet(si, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <h3 className="font-bold text-gray-900">{sheet.sheetName}</h3>
                  <span className="text-xs text-gray-500">{sheet.rows.length} rows</span>
                  {sheet.skipReason && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                      Skipped: {sheet.skipReason} — remap below to include
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {SEMINAR_FIELDS.map(field => (
                  <Select
                    key={field}
                    label={FIELD_LABELS[field]}
                    value={String(sheet.mapping[field])}
                    onChange={e => remap(si, field, parseInt(e.target.value, 10))}
                  >
                    <option value="-1">— not mapped —</option>
                    {sheet.headers.map((h, idx) => (
                      <option key={idx} value={String(idx)}>{h || `(column ${idx + 1})`}</option>
                    ))}
                  </Select>
                ))}
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {sheet.headers.map((h, idx) => {
                        const mappedAs = SEMINAR_FIELDS.find(f => sheet.mapping[f] === idx);
                        return (
                          <th key={idx} className="px-3 py-2 text-left font-bold text-gray-700 whitespace-nowrap">
                            {h || `(col ${idx + 1})`}
                            {mappedAs && <span className="block text-[10px] text-blue-600 font-bold uppercase">&rarr; {FIELD_LABELS[mappedAs]}</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.rows.slice(0, 10).map((row, ri) => (
                      <tr key={ri} className="border-t border-gray-100">
                        {sheet.headers.map((_, ci) => (
                          <td key={ci} className="px-3 py-1.5 text-gray-600 whitespace-nowrap max-w-[200px] truncate">{String(row[ci] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sheet.rows.length > 10 && <p className="text-xs text-gray-400 mt-2">Showing first 10 of {sheet.rows.length} rows</p>}
            </Card>
          ))}
        </>
      )}

      {step === 'report' && (
        <>
          <Card title="Import Report">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Sheet', 'Imported (new)', 'Updated (merged)', 'Duplicates in file', 'Invalid email', 'Invalid phone', 'Skipped rows'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-bold text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.sheetName} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-bold text-gray-900">{r.sheetName}</td>
                      <td className="px-4 py-2 text-emerald-700 font-bold">{r.imported}</td>
                      <td className="px-4 py-2 text-blue-700">{r.merged}</td>
                      <td className="px-4 py-2 text-gray-600">{r.duplicatesInFile}</td>
                      <td className="px-4 py-2 text-red-600">{r.invalidEmail}</td>
                      <td className="px-4 py-2 text-red-600">{r.invalidPhone}</td>
                      <td className="px-4 py-2 text-gray-600">{r.skippedRows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Rows with an invalid email are still imported when they have a valid phone (and vice versa).
              Re-uploading the same file later merges on email/phone — it never duplicates.
            </p>
          </Card>
          <div className="flex gap-2">
            <Button onClick={reset}>Import Another File</Button>
          </div>
        </>
      )}
    </div>
  );
};
