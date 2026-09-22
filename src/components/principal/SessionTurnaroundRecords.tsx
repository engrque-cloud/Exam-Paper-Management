import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Printer,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Award,
  TrendingDown,
  Building2,
  GraduationCap,
  Layers,
  ChevronRight,
  Info,
  Check,
  Copy,
  BarChart3,
  Users,
  Timer,
  FileText,
  Hourglass,
  ArrowRight,
  Sparkles,
  Archive,
  FolderArchive,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { SubjectType, SemesterNumber, SessionExamRecord } from '../../types';
import {
  ALL_SESSION_RECORDS,
  AVAILABLE_SESSIONS,
  SESSION_SUMMARIES,
  DEPARTMENT_TURNAROUND_BENCHMARKS,
} from '../../data/sessionRecordsData';
import { COLLEGE_METADATA } from '../../data/collegeData';
import { useExam } from '../../context/ExamContext';
import { FinishExamModal } from './FinishExamModal';

export const SessionTurnaroundRecords: React.FC = () => {
  const {
    isSessionConcluded,
    concludedSessionDetails,
    reopenSession,
  } = useExam();

  // Session selection state
  const [selectedSession, setSelectedSession] = useState<string>('Fall 2026');
  const [activeSubView, setActiveSubView] = useState<'timeline_ledger' | 'department_benchmarks' | 'session_trends'>('timeline_ledger');

  // Finish exam & archival modal
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Filters
  const [selectedDept, setSelectedDept] = useState<SubjectType | 'All'>('All');
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber | 'All'>('All');
  const [selectedRating, setSelectedRating] = useState<'All' | 'Optimal' | 'Standard' | 'Delayed Bottleneck'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notices
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<SessionExamRecord | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Active session summary
  const currentSummary = SESSION_SUMMARIES[selectedSession] || SESSION_SUMMARIES['Fall 2026'];

  // Filtered records for the current session or all sessions
  const records = useMemo(() => {
    return ALL_SESSION_RECORDS.filter(record => {
      if (selectedSession !== 'All' && record.sessionName !== selectedSession) return false;
      if (selectedDept !== 'All' && record.department !== selectedDept) return false;
      if (selectedSemester !== 'All' && record.semester !== selectedSemester) return false;
      if (selectedRating !== 'All' && record.turnaroundRating !== selectedRating) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = record.courseCode.toLowerCase().includes(q);
        const matchesTitle = record.courseTitle.toLowerCase().includes(q);
        const matchesTeacher = record.assignedTeacher.toLowerCase().includes(q);
        const matchesDept = record.department.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesTeacher && !matchesDept) return false;
      }
      return true;
    });
  }, [selectedSession, selectedDept, selectedSemester, selectedRating, searchQuery]);

  // Dynamically computed stats for filtered records
  const dynamicStats = useMemo(() => {
    if (records.length === 0) {
      return {
        avgPaperToExam: 0,
        minPaperToExam: 0,
        maxPaperToExam: 0,
        avgExamToResult: 0,
        avgTotalCycle: 0,
        optimalCount: 0,
        bottleneckCount: 0,
        totalStudents: 0,
      };
    }
    const sumPaperToExam = records.reduce((acc, r) => acc + r.daysPaperSubmitToExam, 0);
    const sumExamToResult = records.reduce((acc, r) => acc + r.daysExamToResultPublish, 0);
    const sumTotalCycle = records.reduce((acc, r) => acc + r.totalLifecycleDays, 0);
    const totalStudents = records.reduce((acc, r) => acc + r.totalStudents, 0);

    const paperToExamValues = records.map(r => r.daysPaperSubmitToExam);
    const minPaperToExam = Math.min(...paperToExamValues);
    const maxPaperToExam = Math.max(...paperToExamValues);

    const optimalCount = records.filter(r => r.turnaroundRating === 'Optimal').length;
    const bottleneckCount = records.filter(r => r.turnaroundRating === 'Delayed Bottleneck').length;

    return {
      avgPaperToExam: (sumPaperToExam / records.length).toFixed(1),
      minPaperToExam,
      maxPaperToExam,
      avgExamToResult: (sumExamToResult / records.length).toFixed(1),
      avgTotalCycle: (sumTotalCycle / records.length).toFixed(1),
      optimalCount,
      bottleneckCount,
      totalStudents,
    };
  }, [records]);

  // Handler to export CSV
  const handleExportCSV = () => {
    const headers = [
      'Session',
      'Course Code',
      'Course Title',
      'Department',
      'Semester',
      'Exam Type',
      'Faculty Member',
      'Paper Call Date',
      'Paper Submitted Date',
      'Days Call to Submit',
      'QA Approved Date',
      'Days Submit to QA',
      'Exam Conducted Date',
      'Days Paper to Exam (Lead Time)',
      'Result Submitted Date',
      'Gazette Published Date',
      'Days Exam to Result',
      'Total Cycle Days',
      'Turnaround Rating',
      'Paper Status',
      'Result Status',
    ].join(',');

    const rows = records.map(r => [
      `"${r.sessionName}"`,
      `"${r.courseCode}"`,
      `"${r.courseTitle}"`,
      `"${r.department}"`,
      `"Semester ${r.semester}"`,
      `"${r.examType}"`,
      `"${r.assignedTeacher}"`,
      `"${r.paperCallDate}"`,
      `"${r.paperSubmittedDate}"`,
      r.daysPaperCallToSubmit,
      `"${r.qaApprovedDate}"`,
      r.daysSubmitToQaApproval,
      `"${r.examConductedDate}"`,
      r.daysPaperSubmitToExam,
      `"${r.resultSubmittedDate}"`,
      `"${r.gazettePublishedDate}"`,
      r.daysExamToResultPublish,
      r.totalLifecycleDays,
      `"${r.turnaroundRating}"`,
      `"${r.paperStatus}"`,
      `"${r.resultStatus}"`,
    ].join(','));

    const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Paper_to_Exam_Turnaround_Audit_${selectedSession.replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handler to copy executive summary text
  const handleCopySummary = () => {
    const text = [
      `========================================================================`,
      `EXECUTIVE PAPER-TO-EXAM TURNAROUND AUDIT REPORT`,
      `Institution: ${COLLEGE_METADATA.institutionName}, ${COLLEGE_METADATA.campus}`,
      `Session: ${selectedSession} | Generated: ${new Date().toLocaleDateString('en-GB')}`,
      `========================================================================`,
      ``,
      `KEY TURNAROUND METRICS:`,
      `- Total Courses Audited: ${records.length}`,
      `- Average Time from Paper Submission to Exam Conduction: ${dynamicStats.avgPaperToExam} Days`,
      `- Range (Paper to Exam): ${dynamicStats.minPaperToExam} - ${dynamicStats.maxPaperToExam} Days`,
      `- Average Time from Exam Conduction to Result Gazette: ${dynamicStats.avgExamToResult} Days`,
      `- Average End-to-End Lifecycle: ${dynamicStats.avgTotalCycle} Days`,
      `- Optimal / Rapid Pace Courses: ${dynamicStats.optimalCount} (${((dynamicStats.optimalCount / (records.length || 1)) * 100).toFixed(0)}%)`,
      `- Delayed / Bottleneck Courses: ${dynamicStats.bottleneckCount} (${((dynamicStats.bottleneckCount / (records.length || 1)) * 100).toFixed(0)}%)`,
      ``,
      `DEPARTMENTAL BENCHMARKS:`,
      ...DEPARTMENT_TURNAROUND_BENCHMARKS.filter(d => d.coursesCount > 0).map(d => 
        `* ${d.department}: Avg ${d.avgPaperToExamDays} days (Paper-to-Exam) | ${d.avgResultDays} days (Result) | Rating: ${d.rating}`
      ),
      `========================================================================`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Header Banner with Institutional Context */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden border border-emerald-200/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                {COLLEGE_METADATA.institutionName} · {COLLEGE_METADATA.campus}
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-emerald-600" />
                Turnaround &amp; Velocity Audit
              </span>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                Session Archives
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              All Sessions: Paper &amp; Result Records
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Historical archive tracking the complete lifecycle duration from initial paper call and faculty submission to date sheet scheduling, exam conduction, and gazette publication.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isSessionConcluded ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Session Concluded &amp; Archived</span>
                </div>
                <button
                  onClick={() => reopenSession('Fall 2026')}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300"
                  title="Reopen Fall 2026 session for editing"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Session</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsFinishModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-98 border border-emerald-600"
                title="Conclude exam and archive all 64 course records"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Finish Exam &amp; Move to Archived</span>
              </button>
            )}

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-98"
              title="Print official Executive Paper-to-Exam Turnaround Summary Gazette"
            >
              <Printer className="w-4 h-4" />
              <span>Printout Turnaround Summary</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition"
              title="Copy executive metrics to clipboard"
            >
              {copiedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedNotice ? 'Summary Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition"
              title="Export complete session record spreadsheet"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Academic Session Selector & Global Snapshot */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Select Examination Session
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {selectedSession === 'All' ? 'All Sessions Combined (Cross-Session Historical View)' : `${selectedSession} Examination Session Records`}
            </h2>
          </div>

          {/* Session Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSession('Fall 2026')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedSession === 'Fall 2026'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isSessionConcluded ? (
                <>
                  <Archive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fall 2026</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Archived &amp; Sealed
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Fall 2026 (Active)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSelectedSession('Spring 2026')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedSession === 'Spring 2026'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Spring 2026</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Archived</span>
            </button>

            <button
              onClick={() => setSelectedSession('Fall 2025')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedSession === 'Fall 2025'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Fall 2025</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">Archived</span>
            </button>

            <button
              onClick={() => setSelectedSession('All')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedSession === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Sessions ({ALL_SESSION_RECORDS.length} Records)
            </button>
          </div>
        </div>

        {/* Archival Certification Banner when Concluded */}
        {isSessionConcluded && (selectedSession === 'Fall 2026' || selectedSession === 'All') && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-500/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Official Session Archival Status: Concluded &amp; Ratified
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Institutional Record Sealed
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                  {concludedSessionDetails?.officialRemarks || 'All 64 question papers, conducted date sheet schedules, and ratified student result gazettes have been officially concluded, certified by the Principal, and permanently transferred to the archived repository.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>Concluded By: <strong className="text-emerald-300">{concludedSessionDetails?.concludedBy || 'Prof. Dr. Bilquis Jahan (Principal)'}</strong></span>
                  <span>&bull;</span>
                  <span>Date: <strong className="text-slate-200">{concludedSessionDetails ? new Date(concludedSessionDetails.concludedAt).toLocaleString('en-GB') : new Date().toLocaleDateString('en-GB')}</strong></span>
                  <span>&bull;</span>
                  <span>Courses Archived: <strong className="text-slate-200">64 of 64</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPrintModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>Print Official Summary</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Core Primary Metric Cards ("How much time it take from papers to exam") */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Key Metric 1: Avg Days from Paper to Exam */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 border border-indigo-200 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                Paper-to-Exam Lead Time
              </span>
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-indigo-950">
                {dynamicStats.avgPaperToExam}
              </span>
              <span className="text-sm font-bold text-indigo-700">Days Average</span>
            </div>
            <p className="text-[11px] text-indigo-800/80 mt-1 font-medium">
              Submission to Exam Date (Range: {dynamicStats.minPaperToExam}d – {dynamicStats.maxPaperToExam}d)
            </p>
            <div className="mt-3 pt-3 border-t border-indigo-200/60 flex items-center justify-between text-[11px]">
              <span className="text-indigo-600 font-semibold">Institutional Target:</span>
              <span className="font-bold text-indigo-900">15 – 20 Days</span>
            </div>
          </div>

          {/* Key Metric 2: Exam to Result Publication */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/60 border border-purple-200 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                Exam to Result Gazette
              </span>
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-purple-950">
                {dynamicStats.avgExamToResult}
              </span>
              <span className="text-sm font-bold text-purple-700">Days Average</span>
            </div>
            <p className="text-[11px] text-purple-800/80 mt-1 font-medium">
              Conducted Exam to Official Gazette Ratification
            </p>
            <div className="mt-3 pt-3 border-t border-purple-200/60 flex items-center justify-between text-[11px]">
              <span className="text-purple-600 font-semibold">Regulatory Limit:</span>
              <span className="font-bold text-purple-900">Max 15 Days</span>
            </div>
          </div>

          {/* Key Metric 3: Full End-to-End Cycle */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Total Exam Lifecycle
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Hourglass className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-950">
                {dynamicStats.avgTotalCycle}
              </span>
              <span className="text-sm font-bold text-emerald-700">Days Cycle</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1 font-medium">
              From Initial Paper Call to Final Gazette Notification
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold">Full Cycle Efficiency:</span>
              <span className="font-bold text-emerald-900">High Velocity</span>
            </div>
          </div>

          {/* Key Metric 4: Compliance & Delivery Health */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Turnaround Distribution
              </span>
              <span className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-emerald-600">{dynamicStats.optimalCount}</span>
                <span className="text-xs text-slate-500 font-bold ml-1">Optimal (&le;18d)</span>
              </div>
              <div>
                <span className="text-2xl font-black text-rose-600">{dynamicStats.bottleneckCount}</span>
                <span className="text-xs text-slate-500 font-bold ml-1">Bottleneck</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Fastest Dept:</span>
              <span className="font-bold text-emerald-700">{currentSummary.fastestDepartment}</span>
            </div>
          </div>
        </div>

        {/* 5-Stage Lifecycle Visual Pipeline */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Standard Examination Lifecycle Stages &amp; Durations
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Based on {COLLEGE_METADATA.institutionName} Operational Guidelines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Stage 1: Drafting</span>
              <span className="font-black text-slate-900 block mt-0.5">Paper Call &rarr; Submit</span>
              <span className="text-[11px] font-bold text-indigo-600 block mt-1">Avg 8.8 Days</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Stage 2: Moderation</span>
              <span className="font-black text-slate-900 block mt-0.5">Submit &rarr; QA Approval</span>
              <span className="text-[11px] font-bold text-indigo-600 block mt-1">Avg 2.8 Days</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Stage 3: Logistics</span>
              <span className="font-black text-slate-900 block mt-0.5">QA &rarr; Date Sheet</span>
              <span className="text-[11px] font-bold text-indigo-600 block mt-1">Avg 3.1 Days</span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-300 ring-2 ring-indigo-500/20">
              <span className="text-[10px] font-black text-indigo-600 block uppercase">Stage 4: Core Metric</span>
              <span className="font-black text-indigo-950 block mt-0.5">Paper Submit &rarr; Exam Day</span>
              <span className="text-xs font-black text-indigo-700 block mt-1">{dynamicStats.avgPaperToExam} Days Lead</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Stage 5: Gazette</span>
              <span className="font-black text-slate-900 block mt-0.5">Exam Day &rarr; Published</span>
              <span className="text-[11px] font-bold text-purple-600 block mt-1">Avg 16.8 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Sub-View Navigation Tabs */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveSubView('timeline_ledger')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubView === 'timeline_ledger'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          <span>Paper-to-Exam Audit Ledger</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubView('department_benchmarks')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubView === 'department_benchmarks'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span>Departmental Turnaround Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveSubView('session_trends')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubView === 'session_trends'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <span>Multi-Session Historical Trends</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: Complete Paper-to-Exam Audit Ledger */}
      {/* ========================================================================= */}
      {activeSubView === 'timeline_ledger' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search course code, paper title, teacher name, or department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value as SubjectType | 'All')}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="English">English</option>
                <option value="Islamic Studies">Islamic Studies</option>
                <option value="Sociology">Sociology</option>
                <option value="Zoology">Zoology</option>
                <option value="Chemistry">Chemistry</option>
              </select>

              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>

              <select
                value={selectedRating}
                onChange={e => setSelectedRating(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Turnaround Paces</option>
                <option value="Optimal">Optimal (&le;18 Days)</option>
                <option value="Standard">Standard (19-24 Days)</option>
                <option value="Delayed Bottleneck">Delayed Bottleneck (&ge;25 Days)</option>
              </select>
            </div>
          </div>

          {/* Master Turnaround Ledger Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">Sr.</th>
                  <th className="py-3 px-3">Session</th>
                  <th className="py-3 px-3">Course Code</th>
                  <th className="py-3 px-4">Paper Title</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Faculty Examiner</th>
                  <th className="py-3 px-3 text-center">Paper Submitted</th>
                  <th className="py-3 px-3 text-center">Exam Conducted</th>
                  <th className="py-3 px-4 text-center bg-indigo-50/70 text-indigo-900 border-x border-indigo-100">
                    Lead Time (Paper &rarr; Exam)
                  </th>
                  <th className="py-3 px-3 text-center">Exam &rarr; Result</th>
                  <th className="py-3 px-3 text-center">Total Cycle</th>
                  <th className="py-3 px-3 text-center">Rating</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-slate-400">
                      No session records found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  records.map((rec, idx) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-indigo-50/30 transition cursor-pointer"
                      onClick={() => setSelectedCourseDetail(rec)}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-600 text-[11px]">
                          {rec.sessionName}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {rec.courseCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {rec.courseTitle}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.department === 'English' ? 'bg-blue-100 text-blue-800' :
                          rec.department === 'Islamic Studies' ? 'bg-emerald-100 text-emerald-800' :
                          rec.department === 'Sociology' ? 'bg-purple-100 text-purple-800' :
                          rec.department === 'Zoology' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {rec.assignedTeacher}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                        {rec.paperSubmittedDate}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                        {rec.examConductedDate}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap bg-indigo-50/50 border-x border-indigo-100">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                          rec.daysPaperSubmitToExam <= 18
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : rec.daysPaperSubmitToExam <= 24
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{rec.daysPaperSubmitToExam} Days</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-semibold text-slate-700 text-[11px]">
                        {rec.daysExamToResultPublish}d
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-slate-900 text-[11px]">
                        {rec.totalLifecycleDays}d
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.turnaroundRating === 'Optimal'
                            ? 'bg-emerald-50 text-emerald-700'
                            : rec.turnaroundRating === 'Standard'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700 font-black'
                        }`}>
                          {rec.turnaroundRating}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourseDetail(rec);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-700 rounded-lg transition"
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Displaying <strong>{records.length}</strong> courses for session <strong>{selectedSession}</strong>
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>&le;18d Optimal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>19-24d Standard</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>&ge;25d Bottleneck</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: Departmental Turnaround Benchmarks */}
      {/* ========================================================================= */}
      {activeSubView === 'department_benchmarks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEPARTMENT_TURNAROUND_BENCHMARKS.filter(d => d.coursesCount > 0).map(dept => (
              <div key={dept.department} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-700">{dept.department}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dept.rating === 'Fast Track'
                      ? 'bg-emerald-100 text-emerald-800'
                      : dept.rating === 'Standard'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {dept.rating}
                  </span>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                    Paper-to-Exam Velocity
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-indigo-950">{dept.avgPaperToExamDays}</span>
                    <span className="text-xs font-bold text-indigo-700">Days</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Drafting (Call &rarr; Submit):</span>
                    <span className="font-bold text-slate-800">{dept.avgDraftingDays}d</span>
                  </div>
                  <div className="flex justify-between">
                    <span>QA Moderation:</span>
                    <span className="font-bold text-slate-800">{dept.avgQaDays}d</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exam &rarr; Gazette:</span>
                    <span className="font-bold text-slate-800">{dept.avgResultDays}d</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                    <span>Total Cycle:</span>
                    <span className="text-indigo-600">{dept.totalCycleDays}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Analytical Recommendations */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Executive Lead-Time Diagnostics &amp; Bottleneck Mitigations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>High Velocity (Islamic Studies &amp; English)</span>
                </div>
                <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
                  Both departments maintain a concise paper-to-exam turnaround under 18 days. Early submission enables prompt printing and secretarial sealing well ahead of date sheet notification.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Moderate Variance (Sociology)</span>
                </div>
                <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                  Average lead time sits at 19.9 days. Paper submission was completed swiftly, but post-exam assessment delays (10 results pending &gt;15 days) expand the overall lifecycle.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Operational Bottleneck (Zoology)</span>
                </div>
                <p className="text-xs text-rose-700 mt-2 leading-relaxed">
                  Average paper-to-exam lead time extends to 23.2 days. Lab practical synchronizations and late question drafting account for a 6-day divergence from institutional benchmarks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: Multi-Session Historical Trends */}
      {/* ========================================================================= */}
      {activeSubView === 'session_trends' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Comparative Analysis Across Academic Sessions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracking longitudinal performance trends in paper preparation velocity, examination readiness, and result publication.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Academic Session</th>
                  <th className="py-3 px-3">Session Status</th>
                  <th className="py-3 px-3 text-center">Total Courses</th>
                  <th className="py-3 px-3 text-center">Compliance</th>
                  <th className="py-3 px-4 text-center bg-indigo-50/70 text-indigo-900 border-x border-indigo-100 font-black">
                    Avg. Paper-to-Exam Days
                  </th>
                  <th className="py-3 px-3 text-center">Min / Max Days</th>
                  <th className="py-3 px-3 text-center">Exam &rarr; Result</th>
                  <th className="py-3 px-3 text-center">Total Lifecycle</th>
                  <th className="py-3 px-4 text-center">Fastest Dept</th>
                  <th className="py-3 px-4 text-center">Bottleneck Dept</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {AVAILABLE_SESSIONS.map(sess => {
                  const s = SESSION_SUMMARIES[sess.id];
                  if (!s) return null;
                  return (
                    <tr key={sess.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {s.sessionName} ({s.academicYear})
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Active Current'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {s.totalCourses}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                        {s.complianceRate}%
                      </td>
                      <td className="py-3.5 px-4 text-center bg-indigo-50/50 border-x border-indigo-100 whitespace-nowrap">
                        <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-sm">
                          {s.avgDaysPaperSubmitToExam} Days
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-600 font-mono">
                        {s.minDaysPaperToExam}d – {s.maxDaysPaperToExam}d
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                        {s.avgDaysExamToResult} Days
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {s.avgTotalLifecycleDays} Days
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700 whitespace-nowrap">
                        {s.fastestDepartment}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-rose-700 whitespace-nowrap">
                        {s.bottleneckDepartment}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: Single Course Chronological Audit Trail */}
      {/* ========================================================================= */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                  {selectedCourseDetail.sessionName} · Examination Audit
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {selectedCourseDetail.courseCode}: {selectedCourseDetail.courseTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Faculty: {selectedCourseDetail.assignedTeacher} · {selectedCourseDetail.department}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourseDetail(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Core Turnaround Highlight Card */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700">
                  Lead Time: Paper Submission &rarr; Exam Day
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-indigo-950">
                    {selectedCourseDetail.daysPaperSubmitToExam}
                  </span>
                  <span className="text-xs font-bold text-indigo-700">Days Taken</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                selectedCourseDetail.turnaroundRating === 'Optimal'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : selectedCourseDetail.turnaroundRating === 'Standard'
                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}>
                {selectedCourseDetail.turnaroundRating}
              </span>
            </div>

            {/* Chronological Milestones Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Chronological Milestone Timeline
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span className="font-semibold text-slate-700">1. Paper Call Announced</span>
                  </div>
                  <span className="font-mono text-slate-600">{selectedCourseDetail.paperCallDate}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-slate-700">2. Paper Submitted by Faculty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-600">+{selectedCourseDetail.daysPaperCallToSubmit}d</span>
                    <span className="font-mono text-slate-600">{selectedCourseDetail.paperSubmittedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-700">3. QA Moderation Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-600">+{selectedCourseDetail.daysSubmitToQaApproval}d</span>
                    <span className="font-mono text-slate-600">{selectedCourseDetail.qaApprovedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span className="font-bold text-indigo-950">4. Exam Conducted Date</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-700">+{selectedCourseDetail.daysPaperSubmitToExam}d Lead</span>
                    <span className="font-mono font-bold text-indigo-900">{selectedCourseDetail.examConductedDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-semibold text-slate-700">5. Result Gazette Published</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-600">+{selectedCourseDetail.daysExamToResultPublish}d</span>
                    <span className="font-mono text-slate-600">{selectedCourseDetail.gazettePublishedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Total Cycle: <strong>{selectedCourseDetail.totalLifecycleDays} Days</strong>
              </span>
              <button
                onClick={() => setSelectedCourseDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PRINTABLE MODAL: Official Session Turnaround Summary Report */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header & Quick Action */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Printout Summary: Paper-to-Exam Turnaround Gazette
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-98"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Printer</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div className="mt-6 p-6 border-2 border-slate-800 rounded-2xl space-y-6 text-slate-900 bg-white font-sans">
              {/* College Official Letterhead */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                  Government of Balochistan · Colleges &amp; Higher Education Department
                </p>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {COLLEGE_METADATA.institutionName}
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  {COLLEGE_METADATA.campus} · Controller of Examinations Secretariat
                </p>
                <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-800 mt-2">
                  OFFICIAL EXECUTIVE SUMMARY: PAPER-TO-EXAM TURNAROUND &amp; SESSION AUDIT
                </div>
              </div>

              {/* Meta Header Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Academic Session</span>
                  <span className="font-black text-slate-900">{selectedSession}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Courses Audited</span>
                  <span className="font-black text-slate-900">{records.length} Courses</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Date of Issue</span>
                  <span className="font-black text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Classification</span>
                  <span className="font-black text-rose-700 uppercase">OFFICIAL · CONFIDENTIAL</span>
                </div>
              </div>

              {/* Section I: Executive Macro Velocity Metrics */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  Section I: Core Turnaround &amp; Lead-Time Metrics (How Long from Paper to Exam)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Avg Paper &rarr; Exam Lead</span>
                    <span className="text-2xl font-black text-slate-900 block mt-0.5">{dynamicStats.avgPaperToExam} Days</span>
                    <span className="text-[10px] text-slate-500 font-medium">Target: 15–20 Days</span>
                  </div>

                  <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Exam &rarr; Gazette Result</span>
                    <span className="text-2xl font-black text-slate-900 block mt-0.5">{dynamicStats.avgExamToResult} Days</span>
                    <span className="text-[10px] text-slate-500 font-medium">Regulatory Limit: &le;15d</span>
                  </div>

                  <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Total End-to-End Cycle</span>
                    <span className="text-2xl font-black text-slate-900 block mt-0.5">{dynamicStats.avgTotalCycle} Days</span>
                    <span className="text-[10px] text-slate-500 font-medium">Call to Final Gazette</span>
                  </div>

                  <div className="p-3 border border-slate-300 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Optimal / On-Time %</span>
                    <span className="text-2xl font-black text-emerald-800 block mt-0.5">
                      {((dynamicStats.optimalCount / (records.length || 1)) * 100).toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{dynamicStats.optimalCount} of {records.length} Courses</span>
                  </div>
                </div>
              </div>

              {/* Section II: Departmental Performance Table */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  Section II: Departmental Velocity &amp; Lead-Time Summary
                </h3>

                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 uppercase text-[9px]">
                    <tr>
                      <th className="py-2 px-2 border-r border-slate-300">Department</th>
                      <th className="py-2 px-2 text-center border-r border-slate-300">Courses</th>
                      <th className="py-2 px-2 text-center border-r border-slate-300">Drafting (Days)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-300">QA Moderation (Days)</th>
                      <th className="py-2 px-3 text-center border-r border-slate-300 font-black bg-slate-200">
                        Paper &rarr; Exam Lead (Days)
                      </th>
                      <th className="py-2 px-2 text-center border-r border-slate-300">Result Pub. (Days)</th>
                      <th className="py-2 px-2 text-center border-r border-slate-300">Total Cycle</th>
                      <th className="py-2 px-2 text-center">Institutional Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {DEPARTMENT_TURNAROUND_BENCHMARKS.filter(d => d.coursesCount > 0).map(dept => (
                      <tr key={dept.department}>
                        <td className="py-2 px-2 font-bold border-r border-slate-300">{dept.department}</td>
                        <td className="py-2 px-2 text-center border-r border-slate-300">{dept.coursesCount}</td>
                        <td className="py-2 px-2 text-center border-r border-slate-300">{dept.avgDraftingDays}d</td>
                        <td className="py-2 px-2 text-center border-r border-slate-300">{dept.avgQaDays}d</td>
                        <td className="py-2 px-3 text-center font-black border-r border-slate-300 bg-slate-50">
                          {dept.avgPaperToExamDays} Days
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-300">{dept.avgResultDays}d</td>
                        <td className="py-2 px-2 text-center font-bold border-r border-slate-300">{dept.totalCycleDays}d</td>
                        <td className="py-2 px-2 text-center font-semibold">{dept.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section III: Sample Course Turnaround Excerpt */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-200 pb-1">
                  Section III: Course-by-Course Lead Time Excerpt (Top 10 Courses)
                </h3>

                <table className="w-full text-left text-[10px] border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 uppercase text-[9px]">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-slate-300">Code</th>
                      <th className="py-1.5 px-2 border-r border-slate-300">Course Title</th>
                      <th className="py-1.5 px-2 border-r border-slate-300">Faculty Examiner</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-300">Paper Submitted</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-300">Exam Conducted</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-300 font-bold">Paper &rarr; Exam</th>
                      <th className="py-1.5 px-2 text-center">Pace Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.slice(0, 10).map(r => (
                      <tr key={r.id}>
                        <td className="py-1.5 px-2 font-mono font-bold border-r border-slate-300">{r.courseCode}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{r.courseTitle}</td>
                        <td className="py-1.5 px-2 border-r border-slate-300">{r.assignedTeacher}</td>
                        <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">{r.paperSubmittedDate}</td>
                        <td className="py-1.5 px-2 text-center font-mono border-r border-slate-300">{r.examConductedDate}</td>
                        <td className="py-1.5 px-2 text-center font-black border-r border-slate-300">{r.daysPaperSubmitToExam} Days</td>
                        <td className="py-1.5 px-2 text-center">{r.turnaroundRating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[9px] text-slate-500 mt-1 italic">
                  * Full record containing all {records.length} course audit lines is attached to the complete gazette annexure.
                </p>
              </div>

              {/* Section IV: Formal Institutional Signature Seals */}
              <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-3 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-12 mb-1" />
                  <p className="font-bold text-slate-900">Dr. Tahira Jabeen</p>
                  <p className="text-[10px] text-slate-600">Convener, Quality Assurance Committee</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-12 mb-1" />
                  <p className="font-bold text-slate-900">Prof. Quratulain Mengal</p>
                  <p className="text-[10px] text-slate-600">Controller of Examinations</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-12 mb-1" />
                  <p className="font-bold text-slate-900">Prof. Dr. Bilquis Jahan</p>
                  <p className="text-[10px] text-slate-600">Principal / Head of Institution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Exam & Move to Archive Modal */}
      <FinishExamModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
      />
    </div>
  );
};
