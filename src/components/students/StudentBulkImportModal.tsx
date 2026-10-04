import React, { useState, useRef } from 'react';
import { useExam } from '../../context/ExamContext';
import { Student, SubjectType, SemesterNumber } from '../../types';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  Trash2,
  Info,
  Sparkles,
} from 'lucide-react';

interface StudentBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStudentRow {
  rollNumber: string;
  name: string;
  fatherName: string;
  department: SubjectType;
  currentSemester: SemesterNumber;
  session: string;
  registrationNumber: string;
  gender: 'Female' | 'Male';
  phone: string;
  email: string;
  cnic: string;
  overallCgpa: number;
  isValid: boolean;
  validationError?: string;
}

export const StudentBulkImportModal: React.FC<StudentBulkImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { bulkAddStudents, students, subjects, showToast } = useExam();

  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Existing student roll numbers set
  const existingRolls = new Set(students.map(s => s.rollNumber.trim().toUpperCase()));

  // Normalize Department
  const matchDepartment = (val: string): SubjectType => {
    const clean = (val || '').toLowerCase().trim();
    if (clean.includes('eng')) return 'English';
    if (clean.includes('soc')) return 'Sociology';
    if (clean.includes('isl')) return 'Islamic Studies';
    if (clean.includes('zoo')) return 'Zoology';
    // Match any exact subject
    const matched = subjects.find(s => s.toLowerCase() === clean);
    return matched || subjects[0] || 'English';
  };

  // Robust line splitter handling quotes
  const parseCsvLine = (line: string, delimiter: string = ','): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, '').trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, '').trim());
    return result;
  };

  // Parse Raw CSV or TSV (e.g. from Excel copy paste)
  const parseRawContent = (content: string) => {
    if (!content.trim()) {
      setParsedRows([]);
      return;
    }

    setIsParsing(true);
    try {
      const lines = content
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length < 2) {
        setParsedRows([]);
        setIsParsing(false);
        return;
      }

      // Detect delimiter from header line (tab vs comma vs semicolon)
      const headerLine = lines[0];
      let delimiter = ',';
      if (headerLine.includes('\t')) delimiter = '\t';
      else if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';

      const rawHeaders = parseCsvLine(headerLine, delimiter).map(h =>
        h.toLowerCase().replace(/[^a-z0-9]/g, '')
      );

      // Map column indexes
      const getColIndex = (candidates: string[]) => {
        return rawHeaders.findIndex(h => candidates.some(c => h.includes(c)));
      };

      const rollIdx = getColIndex(['roll', 'pk', 'id']);
      const nameIdx = getColIndex(['studentname', 'candidatename', 'name', 'fullname']);
      const fatherIdx = getColIndex(['father', 'guardian']);
      const deptIdx = getColIndex(['department', 'dept', 'subject', 'program', 'discipline']);
      const semIdx = getColIndex(['semester', 'sem']);
      const sessionIdx = getColIndex(['session', 'batch', 'academicsession']);
      const regIdx = getColIndex(['reg', 'registration']);
      const genderIdx = getColIndex(['gender', 'sex']);
      const phoneIdx = getColIndex(['phone', 'contact', 'mobile', 'cell']);
      const emailIdx = getColIndex(['email', 'mail']);
      const cnicIdx = getColIndex(['cnic', 'nic', 'nationalid']);
      const cgpaIdx = getColIndex(['cgpa', 'gpa', 'marks']);

      const seenInBatch = new Set<string>();
      const rows: ParsedStudentRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i], delimiter);
        if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

        const roll = (cols[rollIdx >= 0 ? rollIdx : 0] || '').trim().toUpperCase();
        const name = (cols[nameIdx >= 0 ? nameIdx : 1] || '').trim();
        const fatherName = (cols[fatherIdx >= 0 ? fatherIdx : 2] || '').trim();
        const rawDept = cols[deptIdx >= 0 ? deptIdx : 3] || '';
        const rawSem = cols[semIdx >= 0 ? semIdx : 4] || '1';
        const session = (cols[sessionIdx >= 0 ? sessionIdx : 5] || '2026-2030').trim();
        const regNo = (cols[regIdx >= 0 ? regIdx : 6] || `GGMDC/QTA/2026/${roll}`).trim();
        const rawGender = (cols[genderIdx >= 0 ? genderIdx : 7] || 'Female').toLowerCase();
        const phone = (cols[phoneIdx >= 0 ? phoneIdx : 8] || '').trim();
        const email = (cols[emailIdx >= 0 ? emailIdx : 9] || '').trim();
        const cnic = (cols[cnicIdx >= 0 ? cnicIdx : 10] || '').trim();
        const rawCgpa = parseFloat(cols[cgpaIdx >= 0 ? cgpaIdx : 11] || '3.50');

        let isValid = true;
        let validationError: string | undefined;

        if (!roll) {
          isValid = false;
          validationError = 'Missing Roll Number (Primary Key)';
        } else if (existingRolls.has(roll)) {
          isValid = false;
          validationError = `Already Registered in System (${roll})`;
        } else if (seenInBatch.has(roll)) {
          isValid = false;
          validationError = `Duplicate Roll Number in CSV file (${roll})`;
        } else if (!name) {
          isValid = false;
          validationError = 'Missing Student Name';
        } else if (!fatherName) {
          isValid = false;
          validationError = "Missing Father's Name";
        }

        if (roll) {
          seenInBatch.add(roll);
        }

        const semNumber = (Math.max(1, Math.min(8, parseInt(rawSem) || 1)) as SemesterNumber);
        const gender: 'Female' | 'Male' = rawGender.includes('male') && !rawGender.includes('female') ? 'Male' : 'Female';
        const overallCgpa = isNaN(rawCgpa) ? 3.5 : Math.max(1.0, Math.min(4.0, Number(rawCgpa.toFixed(2))));

        rows.push({
          rollNumber: roll,
          name,
          fatherName,
          department: matchDepartment(rawDept),
          currentSemester: semNumber,
          session,
          registrationNumber: regNo,
          gender,
          phone,
          email,
          cnic,
          overallCgpa,
          isValid,
          validationError,
        });
      }

      setParsedRows(rows);
    } catch (err) {
      console.error(err);
      showToast('Error parsing CSV content. Please check the delimiter formatting.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle File Input Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setRawText(text);
      parseRawContent(text);
    };
    reader.readAsText(file);
  };

  // Download official sample CSV template
  const handleDownloadSampleCsv = () => {
    const headers = [
      'Roll Number',
      'Name',
      'Father Name',
      'Department',
      'Semester',
      'Session',
      'Registration Number',
      'Gender',
      'Phone',
      'Email',
      'CNIC',
      'CGPA',
    ];

    const sampleRows = [
      [
        '2026-ENG-021',
        'Sumbul Tareen',
        'Nawabzada Tariq Tareen',
        'English',
        '1',
        '2026-2030',
        'GGMDC/QTA/2026/ENG-021',
        'Female',
        '+92 300 9876543',
        'sumbul.tareen.eng21@ggmdc.edu.pk',
        '54400-1234567-8',
        '3.85',
      ],
      [
        '2026-SOC-021',
        'Gul Meena',
        'Sardar Bahadur Khan',
        'Sociology',
        '1',
        '2026-2030',
        'GGMDC/QTA/2026/SOC-021',
        'Female',
        '+92 301 8765432',
        'gul.meena.soc21@ggmdc.edu.pk',
        '54400-2345678-9',
        '3.65',
      ],
      [
        '2026-ISL-021',
        'Bibi Zainab',
        'Maulana Abdul Haq',
        'Islamic Studies',
        '1',
        '2026-2030',
        'GGMDC/QTA/2026/ISL-021',
        'Female',
        '+92 302 7654321',
        'bibi.zainab.isl21@ggmdc.edu.pk',
        '54400-3456789-0',
        '3.90',
      ],
      [
        '2026-ZOO-021',
        'Yasmin Mengal',
        'Mir Noorullah Mengal',
        'Zoology',
        '1',
        '2026-2030',
        'GGMDC/QTA/2026/ZOO-021',
        'Female',
        '+92 303 6543210',
        'yasmin.mengal.zoo21@ggmdc.edu.pk',
        '54400-4567890-1',
        '3.72',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ggmdc_students_bulk_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Perform bulk import
  const handleCommitImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast('No valid student records found to import.', 'error');
      return;
    }

    const studentsToCreate = validRows.map(r => ({
      rollNumber: r.rollNumber,
      name: r.name,
      fatherName: r.fatherName,
      department: r.department,
      currentSemester: r.currentSemester,
      session: r.session,
      registrationNumber: r.registrationNumber,
      gender: r.gender,
      phone: r.phone,
      email: r.email,
      cnic: r.cnic,
      overallCgpa: r.overallCgpa,
      admissionDate: new Date().toISOString().split('T')[0],
    }));

    const res = bulkAddStudents(studentsToCreate);
    if (res.success) {
      onClose();
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>Bulk Import Students via CSV</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-normal">
                  Auto-Sync Enabled
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Primary Key: Unique Roll Number &bull; Auto-syncs with Marksheets, Gazettes &amp; Date Sheets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Download Sample Template + Tab Toggle */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          {/* Method Selector */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'file'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload CSV File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Excel / CSV Text</span>
            </button>
          </div>

          {/* Download Sample Button */}
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl shadow-2xs transition self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Zone */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .txt, text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-1">
                  <UploadCloud className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">
                  {fileName ? (
                    <span className="text-emerald-800">{fileName}</span>
                  ) : (
                    'Click to Browse or Drag & Drop Student CSV File'
                  )}
                </h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Supports comma, tab, or semicolon separated files (.csv or .txt). Must contain unique Roll Numbers as Primary Key.
                </p>
              </div>
            </div>
          )}

          {/* Paste CSV / Excel Data */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Paste Comma or Tab-Separated Rows (Directly from Excel or Sheets)</span>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => {
                      setRawText('');
                      setParsedRows([]);
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <textarea
                rows={6}
                value={rawText}
                onChange={e => {
                  setRawText(e.target.value);
                  parseRawContent(e.target.value);
                }}
                placeholder={`Roll Number\tName\tFather Name\tDepartment\tSemester\tSession\tRegistration Number\tGender\tPhone\tEmail\tCNIC\tCGPA\n2026-ENG-025\tSamina Khan\tAbdul Sattar Khan\tEnglish\t1\t2026-2030\tGGMDC/QTA/2026/ENG-025\tFemale\t+92 300 1122334\tsamina.khan@ggmdc.edu.pk\t54400-9988776-5\t3.80`}
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* Parsing Results & Table Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    Parsed Candidates Preview ({parsedRows.length} Total)
                  </h4>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{validCount} Ready to Import</span>
                  </span>
                  {invalidCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{invalidCount} Skipped (Duplicates/Incomplete)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 font-mono">Roll Number (PK)</th>
                      <th className="px-3 py-2">Candidate Name</th>
                      <th className="px-3 py-2">Father Name</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2 text-center">Semester</th>
                      <th className="px-3 py-2">Session</th>
                      <th className="px-3 py-2 font-mono">Reg Number</th>
                      <th className="px-3 py-2 text-center">CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50 hover:bg-rose-50'}
                      >
                        <td className="px-3 py-1.5 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700"
                              title={row.validationError}
                            >
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>{row.validationError}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 font-mono font-bold text-slate-800">
                          {row.rollNumber || <span className="text-rose-500 italic">Empty</span>}
                        </td>
                        <td className="px-3 py-1.5 font-semibold text-slate-900">{row.name}</td>
                        <td className="px-3 py-1.5 text-slate-600">{row.fatherName}</td>
                        <td className="px-3 py-1.5 font-medium text-indigo-900">{row.department}</td>
                        <td className="px-3 py-1.5 text-center font-bold text-slate-700">
                          Sem {row.currentSemester}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 text-[11px]">{row.session}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600 text-[11px]">
                          {row.registrationNumber}
                        </td>
                        <td className="px-3 py-1.5 text-center font-bold text-emerald-700">
                          {row.overallCgpa.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Informational Guidance */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-900">
                Institutional Auto-Synchronization Rule:
              </p>
              <p className="text-[11px] leading-relaxed">
                Imported students are immediately registered with their unique Roll Number as Primary Key. The system automatically creates their enrolled course records, synchronizes with the Principal&apos;s Gazette notifications and Marksheet Hub, and enables one-click roll number slip printing on the Result Notice Board.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {validCount > 0 ? (
              <span className="text-emerald-800 font-bold">
                {validCount} candidate record{validCount === 1 ? '' : 's'} ready for registration.
              </span>
            ) : (
              'Upload a CSV file or paste formatted rows to proceed.'
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleCommitImport}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                validCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Import {validCount > 0 ? validCount : ''} Student{validCount === 1 ? '' : 's'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
