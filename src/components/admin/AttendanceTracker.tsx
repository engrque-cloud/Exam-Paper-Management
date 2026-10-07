import React, { useState, useMemo, useRef } from 'react';
import { useExam } from '../../context/ExamContext';
import { AttendanceRecord, SubjectType, SemesterNumber } from '../../types';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Filter,
  Search,
  Sliders,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Printer,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  HelpCircle,
  X,
  FileText,
  Building2,
  Percent,
} from 'lucide-react';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';

export const AttendanceTracker: React.FC = () => {
  const {
    attendanceRecords,
    attendanceThreshold,
    setAttendanceThreshold,
    addAttendanceRecord,
    bulkUploadAttendance,
    updateAttendanceRecord,
    toggleAttendanceExemption,
    deleteAttendanceRecord,
    clearAllAttendance,
    students,
    courses,
    collegeName,
    collegeLogo,
  } = useExam();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedEligibility, setSelectedEligibility] = useState<'All' | 'eligible' | 'ineligible' | 'exempted'>('All');

  // Modal states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [customThresholdInput, setCustomThresholdInput] = useState<string>(String(attendanceThreshold));
  const [exemptionModalRecord, setExemptionModalRecord] = useState<AttendanceRecord | null>(null);
  const [exemptionReasonInput, setExemptionReasonInput] = useState('');

  // Bulk Upload Modal internal states
  const [pastedCSV, setPastedCSV] = useState('');
  const [bulkParseErrors, setBulkParseErrors] = useState<string[]>([]);
  const [bulkParsedPreview, setBulkParsedPreview] = useState<Array<{
    rollNumber: string;
    studentName: string;
    courseCode: string;
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
    isEligible: boolean;
    isExempted?: boolean;
    exemptionReason?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Record Modal internal state
  const [newRollNumber, setNewRollNumber] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newTotalClasses, setNewTotalClasses] = useState(48);
  const [newAttendedClasses, setNewAttendedClasses] = useState(40);
  const [newIsExempted, setNewIsExempted] = useState(false);
  const [newExemptionReason, setNewExemptionReason] = useState('');
  const [newFormError, setNewFormError] = useState<string | null>(null);

  // Quick lookup helper for student when roll number entered
  const matchedStudent = useMemo(() => {
    if (!newRollNumber.trim()) return null;
    return students.find(s => s.rollNumber.toUpperCase() === newRollNumber.trim().toUpperCase()) || null;
  }, [students, newRollNumber]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(r => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRoll = r.rollNumber.toLowerCase().includes(q);
        const matchName = r.studentName.toLowerCase().includes(q);
        const matchCourse = r.courseCode.toLowerCase().includes(q) || r.courseTitle.toLowerCase().includes(q);
        if (!matchRoll && !matchName && !matchCourse) return false;
      }
      // Department filter
      if (selectedDept !== 'All' && r.department !== selectedDept) return false;
      // Semester filter
      if (selectedSemester !== 'All' && String(r.semester) !== selectedSemester) return false;
      // Course filter
      if (selectedCourse !== 'All' && r.courseCode !== selectedCourse) return false;
      // Eligibility filter
      if (selectedEligibility === 'eligible' && !r.isEligible) return false;
      if (selectedEligibility === 'ineligible' && r.isEligible) return false;
      if (selectedEligibility === 'exempted' && !r.isExempted) return false;

      return true;
    });
  }, [attendanceRecords, searchQuery, selectedDept, selectedSemester, selectedCourse, selectedEligibility]);

  // Statistics
  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const eligibleCount = attendanceRecords.filter(r => r.isEligible).length;
    const ineligibleCount = attendanceRecords.filter(r => !r.isEligible).length;
    const exemptedCount = attendanceRecords.filter(r => r.isExempted).length;
    const avgPercentage = total > 0
      ? Number((attendanceRecords.reduce((acc, r) => acc + r.attendancePercentage, 0) / total).toFixed(1))
      : 0;

    return {
      total,
      eligibleCount,
      ineligibleCount,
      exemptedCount,
      eligibleRate: total > 0 ? Number(((eligibleCount / total) * 100).toFixed(1)) : 0,
      ineligibleRate: total > 0 ? Number(((ineligibleCount / total) * 100).toFixed(1)) : 0,
      avgPercentage,
    };
  }, [attendanceRecords]);

  // Handle threshold change
  const handleApplyThreshold = (value: number) => {
    setAttendanceThreshold(value);
    setCustomThresholdInput(String(value));
  };

  const handleCustomThresholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customThresholdInput);
    if (!isNaN(val) && val >= 10 && val <= 100) {
      handleApplyThreshold(val);
    }
  };

  // CSV Template download
  const handleDownloadTemplate = () => {
    const headers = 'Roll Number,Student Name,Course Code,Total Classes,Classes Attended,Exemption (Yes/No),Exemption Reason\n';
    const sampleRows = [
      '2026-0001,Ahmed Ali Khan,ENG-101,48,44,No,',
      '2026-0002,Fatima Zahra,ENG-101,48,46,No,',
      '2026-0003,Ayesha Siddiqa,ENG-101,48,34,Yes,Civil Hospital Medical Certificate #842',
      '2026-0004,Zainab Noor,ENG-101,48,30,No,',
      '2026-0005,Sumera Mengal,ENG-201,48,42,No,',
    ].join('\n');

    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_Import_Template_${attendanceThreshold}pct.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export current attendance sheet as CSV
  const handleExportCSV = () => {
    if (attendanceRecords.length === 0) return;
    const headers = 'Roll Number,Student Name,Department,Semester,Course Code,Course Title,Total Classes,Attended Classes,Attendance %,Threshold %,Exam Eligibility,Exemption Status,Exemption Reason,Last Updated\n';
    const rows = attendanceRecords.map(r => {
      const eligibilityStr = r.isEligible ? 'Eligible' : 'Short Attendance (Barred)';
      const exemptionStr = r.isExempted ? 'Exempted' : 'None';
      const cleanReason = (r.exemptionReason || '').replace(/"/g, '""');
      return `"${r.rollNumber}","${r.studentName}","${r.department}",${r.semester},"${r.courseCode}","${r.courseTitle}",${r.totalClasses},${r.attendedClasses},${r.attendancePercentage}%,${attendanceThreshold}%,"${eligibilityStr}","${exemptionStr}","${cleanReason}","${r.lastUpdated}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GGMDC_Attendance_Eligibility_Gazette_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse CSV text for Bulk Upload
  const parseCSVContent = (content: string) => {
    setBulkParseErrors([]);
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      setBulkParseErrors(['Uploaded file or pasted text is empty.']);
      setBulkParsedPreview([]);
      return;
    }

    const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
    const firstRowParts = lines[0].split(delimiter).map(c => c.trim().toLowerCase().replace(/"/g, ''));
    const isHeader = firstRowParts.some(p => p.includes('roll') || p.includes('name') || p.includes('course') || p.includes('class') || p.includes('attend'));
    const dataLines = isHeader ? lines.slice(1) : lines;

    const parsed: Array<{
      rollNumber: string;
      studentName: string;
      courseCode: string;
      totalClasses: number;
      attendedClasses: number;
      percentage: number;
      isEligible: boolean;
      isExempted?: boolean;
      exemptionReason?: string;
    }> = [];
    const errors: string[] = [];

    dataLines.forEach((line, idx) => {
      const rawCols = line.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
      if (rawCols.length < 3) return; // skip empty or malformed

      const rollNumber = rawCols[0]?.toUpperCase();
      let studentName = rawCols[1] || '';
      let courseCode = rawCols[2]?.toUpperCase() || '';
      let totalClasses = 48;
      let attendedClasses = 0;
      let isExempted = false;
      let exemptionReason: string | undefined = undefined;

      // Detect if col 1 was actually course code (e.g. Roll, Course, Total, Attended)
      if (rawCols[1] && rawCols[1].match(/^[A-Z]{2,4}-?\d{3}$/i)) {
        courseCode = rawCols[1].toUpperCase();
        studentName = '';
        totalClasses = Number(rawCols[2]) || 48;
        attendedClasses = Number(rawCols[3]) || 0;
      } else {
        totalClasses = Number(rawCols[3]) || 48;
        attendedClasses = Number(rawCols[4]) || 0;
        const exCol = (rawCols[5] || '').toLowerCase();
        if (exCol === 'yes' || exCol === 'true' || exCol === '1' || exCol === 'exempt') {
          isExempted = true;
          exemptionReason = rawCols[6] || 'Approved Medical / Official Exemption';
        }
      }

      if (!rollNumber) {
        errors.push(`Line ${idx + (isHeader ? 2 : 1)}: Missing Roll Number.`);
        return;
      }
      if (!courseCode) {
        errors.push(`Line ${idx + (isHeader ? 2 : 1)} (${rollNumber}): Missing Course Code.`);
        return;
      }
      if (isNaN(totalClasses) || totalClasses <= 0) {
        errors.push(`Line ${idx + (isHeader ? 2 : 1)} (${rollNumber}): Invalid total classes.`);
        return;
      }
      if (isNaN(attendedClasses) || attendedClasses < 0 || attendedClasses > totalClasses) {
        errors.push(`Line ${idx + (isHeader ? 2 : 1)} (${rollNumber}): Attended classes (${attendedClasses}) cannot exceed total classes (${totalClasses}).`);
        return;
      }

      // Lookup student name if omitted
      if (!studentName) {
        const found = students.find(s => s.rollNumber.toUpperCase() === rollNumber);
        studentName = found ? found.name : `Candidate ${rollNumber}`;
      }

      const pct = Number(((attendedClasses / totalClasses) * 100).toFixed(1));
      const isElig = isExempted || pct >= attendanceThreshold;

      parsed.push({
        rollNumber,
        studentName,
        courseCode,
        totalClasses,
        attendedClasses,
        percentage: pct,
        isEligible: isElig,
        isExempted,
        exemptionReason,
      });
    });

    setBulkParseErrors(errors);
    setBulkParsedPreview(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setPastedCSV(text);
      parseCSVContent(text);
    };
    reader.readAsText(file);
  };

  const handleCommitBulkUpload = () => {
    if (bulkParsedPreview.length === 0) return;
    bulkUploadAttendance(bulkParsedPreview);
    setIsBulkModalOpen(false);
    setPastedCSV('');
    setBulkParsedPreview([]);
    setBulkParseErrors([]);
  };

  // Add single record submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewFormError(null);
    if (!newRollNumber.trim()) {
      setNewFormError('Student Roll Number is required (Primary Key).');
      return;
    }
    if (!newCourseCode.trim()) {
      setNewFormError('Course Code is required.');
      return;
    }
    if (newTotalClasses <= 0) {
      setNewFormError('Total classes must be a positive integer.');
      return;
    }
    if (newAttendedClasses < 0 || newAttendedClasses > newTotalClasses) {
      setNewFormError('Attended classes cannot be negative or exceed total classes.');
      return;
    }

    const st = students.find(s => s.rollNumber.toUpperCase() === newRollNumber.trim().toUpperCase());
    const crs = courses.find(c => c.code.toUpperCase() === newCourseCode.trim().toUpperCase());

    const res = addAttendanceRecord({
      rollNumber: newRollNumber.trim().toUpperCase(),
      studentName: st?.name || `Candidate ${newRollNumber.trim().toUpperCase()}`,
      department: (st?.department || crs?.subject || 'English') as SubjectType,
      semester: (st?.currentSemester || crs?.semester || 1) as SemesterNumber,
      courseCode: newCourseCode.trim().toUpperCase(),
      courseTitle: crs?.title || newCourseCode.trim().toUpperCase(),
      totalClasses: newTotalClasses,
      attendedClasses: newAttendedClasses,
      isExempted: newIsExempted,
      exemptionReason: newIsExempted ? (newExemptionReason.trim() || 'Official Dean / Board Exemption Granted') : undefined,
    });

    if (res.success) {
      setIsAddModalOpen(false);
      setNewRollNumber('');
      setNewCourseCode('');
      setNewTotalClasses(48);
      setNewAttendedClasses(40);
      setNewIsExempted(false);
      setNewExemptionReason('');
    } else {
      setNewFormError(res.error || 'Failed to add attendance record.');
    }
  };

  // Edit record submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateAttendanceRecord(editingRecord.id, {
      totalClasses: editingRecord.totalClasses,
      attendedClasses: editingRecord.attendedClasses,
      isExempted: editingRecord.isExempted,
      exemptionReason: editingRecord.exemptionReason,
    });
    setEditingRecord(null);
  };

  // Exemption prompt submit
  const handleExemptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exemptionModalRecord) return;
    toggleAttendanceExemption(exemptionModalRecord.id, exemptionReasonInput.trim());
    setExemptionModalRecord(null);
    setExemptionReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <GraduationCap className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HEC &amp; Degree College Examination Regulations</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Student Attendance Tracking &amp; Exam Eligibility Registry
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
              Monitors candidate course attendance against the statutory eligibility threshold. Students with <strong className="text-emerald-300 font-bold">&ge; {attendanceThreshold}%</strong> attendance are certified eligible for exams. Candidates with short attendance are detained unless an official Medical/Dean Exemption is authorized.
            </p>
          </div>

          {/* Action Buttons: Add, Bulk Upload, Export, Print */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="attendance-bulk-upload-btn"
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Upload (CSV)</span>
            </button>

            <button
              type="button"
              id="attendance-add-record-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={attendanceRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs backdrop-blur-md transition disabled:opacity-50 cursor-pointer"
              title="Download full attendance data as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs backdrop-blur-md transition cursor-pointer print:hidden"
              title="Print official attendance roster"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Roster</span>
            </button>
          </div>
        </div>

        {/* Configurable Threshold Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exam Eligibility Threshold:</span>
            </span>

            {/* Presets */}
            <button
              type="button"
              onClick={() => handleApplyThreshold(75)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                attendanceThreshold === 75
                  ? 'bg-emerald-400 text-slate-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              75% (HEC Standard)
            </button>

            <button
              type="button"
              onClick={() => handleApplyThreshold(70)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                attendanceThreshold === 70
                  ? 'bg-emerald-400 text-slate-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              70% (Lenient)
            </button>

            <button
              type="button"
              onClick={() => handleApplyThreshold(80)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                attendanceThreshold === 80
                  ? 'bg-emerald-400 text-slate-950 shadow-md ring-2 ring-emerald-300'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              80% (Strict Honor)
            </button>

            {/* Custom Input */}
            <form onSubmit={handleCustomThresholdSubmit} className="inline-flex items-center gap-1.5 ml-1">
              <input
                type="number"
                min={10}
                max={100}
                value={customThresholdInput}
                onChange={e => setCustomThresholdInput(e.target.value)}
                className="w-16 px-2 py-1 text-xs text-center font-bold font-mono bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="%"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Set %
              </button>
            </form>
          </div>

          <div className="text-[11px] text-emerald-200/90 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Policy: Minimum {attendanceThreshold}% lecture attendance required to qualify for examination admit slip.</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Records */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Evaluated Records</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-500">Course lecture logs</p>
        </div>

        {/* Eligible */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold uppercase tracking-wider">Exam Eligible</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 flex items-baseline gap-1.5">
            <span>{stats.eligibleCount}</span>
            <span className="text-xs font-bold text-emerald-600">({stats.eligibleRate}%)</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 font-medium">&ge; {attendanceThreshold}% or Exempted</p>
        </div>

        {/* Short Attendance (Barred) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-bold uppercase tracking-wider">Short Attendance</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 flex items-baseline gap-1.5">
            <span>{stats.ineligibleCount}</span>
            <span className="text-xs font-bold text-rose-600">({stats.ineligibleRate}%)</span>
          </div>
          <p className="text-[11px] text-rose-600/80 font-medium">Barred from Sitting Exam</p>
        </div>

        {/* Exemptions Granted */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-bold uppercase tracking-wider">Dean Exemptions</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{stats.exemptedCount}</div>
          <p className="text-[11px] text-amber-700/80 font-medium">Medical / Special waiver</p>
        </div>

        {/* Average Attendance Rate */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Mean Attendance</span>
            <Percent className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.avgPercentage}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                stats.avgPercentage >= attendanceThreshold ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, stats.avgPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by candidate Roll Number (Primary Key), Name, or Course Code..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Eligibility Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedEligibility('All')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedEligibility === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({attendanceRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedEligibility('eligible')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                selectedEligibility === 'eligible' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Eligible ({stats.eligibleCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedEligibility('ineligible')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                selectedEligibility === 'ineligible' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Short Attendance ({stats.ineligibleCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedEligibility('exempted')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                selectedEligibility === 'exempted' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exempted ({stats.exemptedCount})
            </button>
          </div>
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Department */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 shrink-0">Department:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="All">All Departments</option>
              {ALL_SUBJECTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 shrink-0">Semester:</span>
            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="All">All Semesters</option>
              {ALL_SEMESTERS.map(sem => (
                <option key={sem} value={String(sem)}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 shrink-0">Course:</span>
            <select
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.code}>{c.code} - {c.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Candidate Attendance Roster &amp; Exam Admissibility
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 font-semibold text-slate-700">
              {filteredRecords.length} records shown
            </span>
          </div>

          {attendanceRecords.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all attendance records?')) {
                  clearAllAttendance();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
            >
              Clear All Records
            </button>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">No Attendance Records Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No student attendance records matched your current search or filter criteria. You can bulk upload attendance from CSV or add individual lecture records.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 shadow-sm transition cursor-pointer"
              >
                Upload Attendance CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDept('All');
                  setSelectedSemester('All');
                  setSelectedCourse('All');
                  setSelectedEligibility('All');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Roll Number (PK)</th>
                  <th className="py-3 px-4">Candidate Name &amp; Dept</th>
                  <th className="py-3 px-4">Course Paper</th>
                  <th className="py-3 px-4 text-center">Lectures Held</th>
                  <th className="py-3 px-4 text-center">Attended</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4 text-center">Exam Admissibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map(rec => {
                  const isEligible = rec.isEligible;
                  const isShort = !isEligible;
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isShort ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Roll Number Primary Key */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                          {rec.rollNumber}
                        </span>
                      </td>

                      {/* Candidate Name & Dept */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{rec.studentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {rec.department} &bull; Sem {rec.semester}
                        </div>
                      </td>

                      {/* Course Paper */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">{rec.courseCode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={rec.courseTitle}>
                          {rec.courseTitle}
                        </div>
                      </td>

                      {/* Total Classes */}
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {rec.totalClasses}
                      </td>

                      {/* Classes Attended */}
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {rec.attendedClasses}
                      </td>

                      {/* Attendance % + Progress bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black text-xs font-mono ${
                              rec.attendancePercentage >= attendanceThreshold
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {rec.attendancePercentage}%
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              rec.attendancePercentage >= attendanceThreshold
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, rec.attendancePercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Exam Admissibility Badge */}
                      <td className="py-3 px-4 text-center">
                        {rec.isExempted ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <ShieldCheck className="w-3 h-3 text-amber-700" />
                              <span>Exempted ({rec.attendancePercentage}%)</span>
                            </span>
                            {rec.exemptionReason && (
                              <span
                                className="text-[10px] text-amber-700 max-w-[150px] truncate mt-0.5 cursor-help"
                                title={rec.exemptionReason}
                              >
                                {rec.exemptionReason}
                              </span>
                            )}
                          </div>
                        ) : isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Exam Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Short Attendance (Barred)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Exemption Toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              if (rec.isExempted) {
                                toggleAttendanceExemption(rec.id);
                              } else {
                                setExemptionModalRecord(rec);
                                setExemptionReasonInput('');
                              }
                            }}
                            className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              rec.isExempted
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                            title={rec.isExempted ? 'Revoke Dean Exemption' : 'Grant Medical/Dean Exemption'}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditingRecord(rec)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="Edit Attendance Counts"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete attendance record for ${rec.rollNumber} (${rec.courseCode})?`)) {
                                deleteAttendanceRecord(rec.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. BULK UPLOAD MODAL */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Bulk Upload Student Attendance (CSV)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Imports lecture counts &amp; automatically evaluates exam eligibility based on {attendanceThreshold}% threshold
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Instructions and Template download */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                <div className="space-y-1">
                  <p className="font-bold">Required CSV Columns:</p>
                  <p className="font-mono text-[11px] text-emerald-800">
                    Roll Number, Student Name, Course Code, Total Classes, Classes Attended, Exemption (Yes/No), Exemption Reason
                  </p>
                  <p className="text-[11px] text-slate-600">
                    *Roll Number is the Primary Key. If name is left blank, it will automatically be matched from the Student Registry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs shrink-0 cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Upload File Drag Drop or Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select CSV File from Computer:
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              {/* Or Paste CSV text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Or Paste Raw CSV / Excel Tab-Delimited Text:
                </label>
                <textarea
                  rows={5}
                  value={pastedCSV}
                  onChange={e => {
                    setPastedCSV(e.target.value);
                    parseCSVContent(e.target.value);
                  }}
                  placeholder="Paste rows here, e.g.&#10;2026-0001,Ahmed Ali Khan,ENG-101,48,42,No,&#10;2026-0002,Fatima Zahra,ENG-101,48,46,No,"
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              {/* Parsing Warnings / Errors */}
              {bulkParseErrors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl space-y-1 text-xs text-rose-800">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Parsing Warnings ({bulkParseErrors.length}):</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {bulkParseErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {bulkParseErrors.length > 5 && (
                      <li>...and {bulkParseErrors.length - 5} more issues.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Parsed Preview Table */}
              {bulkParsedPreview.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden space-y-2">
                  <div className="p-2.5 bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Parsed Preview ({bulkParsedPreview.length} records ready to import)</span>
                    <span className="text-[11px] text-emerald-700">
                      Calculated against {attendanceThreshold}% threshold
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50 font-bold text-slate-600 sticky top-0">
                        <tr>
                          <th className="p-2">Roll No</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Course</th>
                          <th className="p-2 text-center">Classes</th>
                          <th className="p-2 text-center">Attendance %</th>
                          <th className="p-2 text-center">Admissibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {bulkParsedPreview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-900">{row.rollNumber}</td>
                            <td className="p-2 text-slate-800">{row.studentName}</td>
                            <td className="p-2 font-mono font-bold text-slate-700">{row.courseCode}</td>
                            <td className="p-2 text-center">{row.attendedClasses}/{row.totalClasses}</td>
                            <td className="p-2 text-center font-bold">
                              <span className={row.percentage >= attendanceThreshold ? 'text-emerald-700' : 'text-rose-700'}>
                                {row.percentage}%
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              {row.isExempted ? (
                                <span className="text-amber-700 font-bold">Exempted</span>
                              ) : row.isEligible ? (
                                <span className="text-emerald-700 font-bold">Eligible</span>
                              ) : (
                                <span className="text-rose-700 font-bold">Short (Barred)</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                {bulkParsedPreview.length} records ready
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bulkParsedPreview.length === 0}
                  onClick={handleCommitBulkUpload}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  Commit Attendance Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD SINGLE RECORD MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Add Single Student Attendance Record
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Calculates examination eligibility with active threshold ({attendanceThreshold}%)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              {newFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{newFormError}</span>
                </div>
              )}

              {/* Student Roll Number Selection / Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Candidate Roll Number (Primary Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-0001"
                  value={newRollNumber}
                  onChange={e => setNewRollNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                />
                {matchedStudent && (
                  <div className="mt-1.5 p-2 bg-emerald-50 rounded-lg text-emerald-900 border border-emerald-200 text-[11px]">
                    Found: <strong className="font-bold">{matchedStudent.name}</strong> ({matchedStudent.department} &bull; Sem {matchedStudent.currentSemester})
                  </div>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Course Code &amp; Paper *
                </label>
                <select
                  required
                  value={newCourseCode}
                  onChange={e => setNewCourseCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.title} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lecture counts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total Lectures Held *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTotalClasses}
                    onChange={e => setNewTotalClasses(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lectures Attended *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={newTotalClasses}
                    required
                    value={newAttendedClasses}
                    onChange={e => setNewAttendedClasses(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Live Preview Pill */}
              {newTotalClasses > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Calculated Percentage:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm">
                      {((newAttendedClasses / newTotalClasses) * 100).toFixed(1)}%
                    </span>
                    {(newIsExempted || (newAttendedClasses / newTotalClasses) * 100 >= attendanceThreshold) ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Eligible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Short (Barred)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Exemption Checkbox */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newIsExempted}
                    onChange={e => setNewIsExempted(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                  <span>Grant Dean / Medical Exemption</span>
                </label>
                {newIsExempted && (
                  <input
                    type="text"
                    value={newExemptionReason}
                    onChange={e => setNewExemptionReason(e.target.value)}
                    placeholder="Enter reason or certificate reference number..."
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-xl text-xs"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Save Attendance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EDIT RECORD MODAL */}
      {/* ========================================================================= */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  Update Attendance: {editingRecord.rollNumber}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {editingRecord.studentName} &bull; {editingRecord.courseCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Classes</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingRecord.totalClasses}
                    onChange={e => setEditingRecord({ ...editingRecord, totalClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attended Classes</label>
                  <input
                    type="number"
                    min={0}
                    max={editingRecord.totalClasses}
                    required
                    value={editingRecord.attendedClasses}
                    onChange={e => setEditingRecord({ ...editingRecord, attendedClasses: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Recalculated:</span>
                <span className="font-mono font-black text-sm">
                  {((editingRecord.attendedClasses / editingRecord.totalClasses) * 100).toFixed(1)}%
                </span>
              </div>

              {/* Exemption toggle */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingRecord.isExempted}
                    onChange={e => setEditingRecord({ ...editingRecord, isExempted: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Dean / Medical Exemption</span>
                </label>
                {editingRecord.isExempted && (
                  <input
                    type="text"
                    value={editingRecord.exemptionReason || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, exemptionReason: e.target.value })}
                    placeholder="Exemption reason..."
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-xl text-xs"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. GRANT EXEMPTION MODAL */}
      {/* ========================================================================= */}
      {exemptionModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">
                  Grant Official Exam Exemption
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExemptionModalRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExemptionSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold">
                  {exemptionModalRecord.studentName} ({exemptionModalRecord.rollNumber})
                </div>
                <div className="text-[11px] text-amber-800">
                  Course: {exemptionModalRecord.courseCode} ({exemptionModalRecord.attendancePercentage}% - Short Attendance)
                </div>
                <p className="text-[11px] text-amber-700 pt-1">
                  Authorizing this exemption will officially qualify the candidate for the examination admit slip despite short attendance.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Exemption Reason or Board Reference Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={exemptionReasonInput}
                  onChange={e => setExemptionReasonInput(e.target.value)}
                  placeholder="e.g. Civil Hospital Quetta Medical Certificate #842 approved by Principal..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExemptionModalRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirm Exemption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
