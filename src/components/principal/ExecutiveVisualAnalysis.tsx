import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  COLLEGE_METADATA,
  INSTITUTIONAL_BENCHMARKS,
  COLLEGE_DEPARTMENTS,
  COLLEGE_64_COURSES,
  COLLEGE_DUTY_ROSTER,
} from '../../data/collegeData';
import { SubjectType, DutyRosterItem } from '../../types';
import {
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  Printer,
  Download,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  FileText,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Award,
  BookOpen,
  GraduationCap,
  Upload,
  Copy,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

export const ExecutiveVisualAnalysis: React.FC = () => {
  const { sendExpediteNotice } = useExam();

  // Courses List state (allows dynamic paste & import from user sheet)
  const [coursesList, setCoursesList] = useState(COLLEGE_64_COURSES);
  const [showImportModal, setShowImportModal] = useState(false);
  const [rawCsvInput, setRawCsvInput] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Local state for interactive filtering
  const [selectedDept, setSelectedDept] = useState<SubjectType | 'All'>('All');
  const [selectedExamType, setSelectedExamType] = useState<'All' | 'Final' | 'Mid' | 'Reappear'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delayed_results' | 'stalled_papers' | 'reappear'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnalysisView, setActiveAnalysisView] = useState<'visual_charts' | 'faculty_papers' | 'course_ledger' | 'delayed_inspector' | 'duty_roster'>('visual_charts');

  // Duty Roster interactive confirmation state
  const [dutyRoster, setDutyRoster] = useState<DutyRosterItem[]>(COLLEGE_DUTY_ROSTER);
  const [noticeSentMap, setNoticeSentMap] = useState<Record<string, boolean>>({});
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Quick confirm duty
  const handleConfirmDuty = (dutyId: string) => {
    setDutyRoster(prev =>
      prev.map(d =>
        d.id === dutyId ? { ...d, confirmed: true, confirmedAt: new Date().toISOString() } : d
      )
    );
  };

  // Quick expedite notice dispatch
  const handleDispatchNotice = (courseCode: string, courseTitle: string, teacherName: string, reason: string) => {
    sendExpediteNotice({
      targetRole: 'teacher',
      courseCode,
      courseTitle,
      stage: reason,
      customNote: `Official administrative notice issued from Principal Office (Govt. Girls Model Degree College, Quetta) to ${teacherName}.`,
    });
    setNoticeSentMap(prev => ({ ...prev, [courseCode]: true }));
  };

  // Confirmed duties count
  const confirmedDutiesCount = dutyRoster.filter(d => d.confirmed).length;

  // Copy all teachers and paper names to clipboard
  const handleCopyAllTeachersAndPapers = () => {
    const header = [
      '# GOVT. GIRLS MODEL DEGREE COLLEGE, JINNAH TOWN, QUETTA',
      '# FACULTY & ASSIGNED PAPERS DIRECTORY (64 COURSES)',
      '',
      'No.\tTeacher / Examiner Name\tDepartment\tCourse Code\tPaper Title\tExam Type\tPaper Submitted\tResult Submitted',
    ].join('\n');

    const body = coursesList
      .map(
        (c, idx) =>
          `${idx + 1}\t${c.assignedTeacher}\t${c.subject}\t${c.code}\t${c.title}\t${c.examType}\t${
            c.paperSubmitted ? 'Yes' : 'No'
          }\t${c.resultSubmitted ? 'Yes' : 'No'}`
      )
      .join('\n');

    navigator.clipboard.writeText(`${header}\n${body}`).then(() => {
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 3000);
    });
  };

  // Flexible CSV / TSV table parser for sheet rows
  const handleImportCsv = (customText?: string) => {
    const text = typeof customText === 'string' ? customText : rawCsvInput;
    if (!text.trim()) return;

    const rows = text.trim().split(/\r?\n/);
    if (rows.length === 0) return;

    const parsed: typeof coursesList = [];
    let importedCount = 0;

    const cleanCell = (s: string) => s.replace(/^["']|["']$/g, '').trim();

    rows.forEach((row, idx) => {
      const isTab = row.includes('\t');
      const cells = isTab ? row.split('\t').map(cleanCell) : row.split(',').map(cleanCell);

      if (cells.length < 2 || cells[0].startsWith('#')) return;

      const firstLower = cells[0].toLowerCase();
      const secondLower = cells[1].toLowerCase();
      if (
        firstLower.includes('teacher') ||
        firstLower.includes('faculty') ||
        firstLower.includes('dept') ||
        firstLower.includes('sr') ||
        firstLower.includes('no.') ||
        secondLower.includes('teacher') ||
        secondLower.includes('paper')
      ) {
        return;
      }

      let teacherName = '';
      let paperTitle = '';
      let code = `CRS-${String(idx + 1).padStart(3, '0')}`;
      let subject: SubjectType = 'English';
      let examType: 'Final' | 'Mid' | 'Reappear' = 'Final';

      if (cells.length >= 5) {
        const offset = !isNaN(Number(cells[0])) ? 1 : 0;
        teacherName = cells[offset] || 'Faculty Member';
        const rawDept = cells[offset + 1]?.toLowerCase() || '';
        if (rawDept.includes('islamic')) subject = 'Islamic Studies';
        else if (rawDept.includes('socio')) subject = 'Sociology';
        else if (rawDept.includes('zoo')) subject = 'Zoology';
        else if (rawDept.includes('chem')) subject = 'Chemistry';
        else subject = 'English';

        code = cells[offset + 2] || code;
        paperTitle = cells[offset + 3] || 'Course Paper';
        const rawExam = cells[offset + 4]?.toLowerCase() || '';
        if (rawExam.includes('mid')) examType = 'Mid';
        else if (rawExam.includes('reappear')) examType = 'Reappear';
        else examType = 'Final';
      } else if (cells.length >= 2) {
        teacherName = cells[0];
        paperTitle = cells[1];
        if (cells.length >= 3) {
          const rawDept = cells[2].toLowerCase();
          if (rawDept.includes('islamic')) subject = 'Islamic Studies';
          else if (rawDept.includes('socio')) subject = 'Sociology';
          else if (rawDept.includes('zoo')) subject = 'Zoology';
          else if (rawDept.includes('chem')) subject = 'Chemistry';
        }
      }

      if (teacherName && paperTitle) {
        parsed.push({
          code,
          title: paperTitle,
          subject,
          semester: 1,
          examType,
          paperSubmitted: true,
          resultSubmitted: false,
          assignedTeacher: teacherName,
        });
        importedCount++;
      }
    });

    if (parsed.length > 0) {
      setCoursesList(parsed);
      setImportNotice(`Successfully synchronized ${importedCount} teachers and paper names into the system catalog!`);
      setShowImportModal(false);
      setRawCsvInput('');
    } else {
      setImportNotice('No valid rows found. Please ensure your pasted content has teacher name and paper name.');
    }
  };

  // Filtered course catalog
  const filteredCourses = useMemo(() => {
    return coursesList.filter(c => {
      if (selectedDept !== 'All' && c.subject !== selectedDept) return false;
      if (selectedExamType !== 'All' && c.examType !== selectedExamType) return false;
      if (statusFilter === 'delayed_results' && !(c.resultDelayedDays && c.resultDelayedDays > 15)) return false;
      if (statusFilter === 'stalled_papers' && c.paperSubmitted) return false;
      if (statusFilter === 'reappear' && c.examType !== 'Reappear') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.assignedTeacher.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [coursesList, selectedDept, selectedExamType, statusFilter, searchQuery]);

  // Delayed courses list (>15 days)
  const delayedCourses = useMemo(() => {
    return coursesList.filter(c => c.resultDelayedDays && c.resultDelayedDays > 15);
  }, [coursesList]);

  // Stalled papers list (not submitted)
  const stalledCourses = useMemo(() => {
    return coursesList.filter(c => !c.paperSubmitted);
  }, [coursesList]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Official College Header Banner (Matches Sheet) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200/80 relative overflow-hidden">
        {/* Subtle Institutional Geometric Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Official Institutional Record
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {COLLEGE_METADATA.confidentiality}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {COLLEGE_METADATA.city}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 uppercase">
              {COLLEGE_METADATA.institutionName}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-emerald-800 mt-0.5">
              {COLLEGE_METADATA.campus} &nbsp;&bull;&nbsp; {COLLEGE_METADATA.systemName}
            </p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{COLLEGE_METADATA.reportTitle}</span>
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleCopyAllTeachersAndPapers}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition active:scale-98"
              title="Copy all faculty names and assigned paper titles to clipboard for Excel / Sheets"
            >
              {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNotice ? 'Copied 64 Courses & Teachers!' : 'Copy Teachers & Papers'}</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition active:scale-98"
              title="Paste or import spreadsheet rows with teacher names and paper names"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Paste / Import Sheet CSV</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-98"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Gazette Sheet</span>
            </button>

            <button
              onClick={() => {
                // Download CSV data matching the sheet
                const headers = "Department,Course Code,Title,Exam Type,Paper Submitted,Result Submitted,Delay Status,Faculty\n";
                const rows = coursesList.map(c => 
                  `"${c.subject}","${c.code}","${c.title}","${c.examType}","${c.paperSubmitted ? 'Yes' : 'No'}","${c.resultSubmitted ? 'Yes' : 'No'}","${c.resultDelayedDays ? c.resultDelayedDays + 'd delayed' : 'Normal'}","${c.assignedTeacher}"`
                ).join("\n");
                const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `Govt_Girls_Degree_College_Executive_Sheet_Fall2026.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Notification Banner */}
      {importNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importNotice}</span>
          </div>
          <button
            onClick={() => setImportNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 underline text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Top Primary Metric Cards (Exact numbers from Sheet) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL PAPERS: 64 (Final 58 · Mid 4 · Reappear 2) — 91% */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Papers
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              91%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {INSTITUTIONAL_BENCHMARKS.totalPapers}
            </span>
            <span className="text-xs text-slate-400 font-medium">courses scheduled</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Final 58 &bull; Mid 4 &bull; Reappear 2</span>
          </div>
        </div>

        {/* PAPERS SUBMITTED: 59 of 64 total papers — 92% */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Papers Submitted
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              {Math.round(INSTITUTIONAL_BENCHMARKS.paperSubmissionRate)}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-600 tracking-tight">
              {INSTITUTIONAL_BENCHMARKS.papersSubmitted}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of {INSTITUTIONAL_BENCHMARKS.totalPapers} total papers
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(INSTITUTIONAL_BENCHMARKS.papersSubmitted / INSTITUTIONAL_BENCHMARKS.totalPapers) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* RESULTS SUBMITTED: 25 of 64 total papers — 39% */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Results Submitted
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {Math.round(INSTITUTIONAL_BENCHMARKS.resultSubmissionRate)}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-600 tracking-tight">
              {INSTITUTIONAL_BENCHMARKS.resultsSubmitted}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of {INSTITUTIONAL_BENCHMARKS.totalPapers} total papers
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${(INSTITUTIONAL_BENCHMARKS.resultsSubmitted / INSTITUTIONAL_BENCHMARKS.totalPapers) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* OVERALL COMPLETION: 71.9% ("college-wide average", 72%) */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 text-slate-900 rounded-2xl p-5 shadow-xs border border-emerald-200 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Overall Completion
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-2xs">
              {INSTITUTIONAL_BENCHMARKS.overallCompletionRounded}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-900 tracking-tight">
              {INSTITUTIONAL_BENCHMARKS.overallCompletion}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200/80 text-xs font-medium text-emerald-700">
            &quot;college-wide average&quot;
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Secondary Operational Status Badges (Exact from Sheet) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* RESULT OVERDUE (>3d): 0 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase">
              Result Overdue (&gt;3d)
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {INSTITUTIONAL_BENCHMARKS.operationalIndicators.resultOverdue3d}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Optimal zero backlog</span>
            </span>
          </div>
        </div>

        {/* RESULT DELAYED (>15d): 25 */}
        <button
          onClick={() => {
            setActiveAnalysisView('delayed_inspector');
            setStatusFilter('delayed_results');
          }}
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-left transition group cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase group-hover:text-rose-700">
              Result Delayed (&gt;15d)
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {INSTITUTIONAL_BENCHMARKS.operationalIndicators.resultDelayed15d}
            </span>
            <span className="text-[11px] text-rose-700 font-semibold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Click to inspect 25 courses</span>
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition" />
        </button>

        {/* REAPPEAR PAPERS: 2 */}
        <button
          onClick={() => {
            setActiveAnalysisView('course_ledger');
            setSelectedExamType('Reappear');
          }}
          className="p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-left transition group cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase group-hover:text-indigo-700">
              Reappear Papers
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {INSTITUTIONAL_BENCHMARKS.operationalIndicators.reappearPapers}
            </span>
            <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3" />
              <span>Supplementary exam</span>
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
        </button>

        {/* DUTY ROSTER CONFIRMED: 50 of 64 */}
        <button
          onClick={() => setActiveAnalysisView('duty_roster')}
          className="p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-left transition group cursor-pointer"
        >
          <div>
            <span className="text-xs font-bold text-slate-500 block uppercase group-hover:text-blue-700">
              Duty Roster Confirmed
            </span>
            <span className="text-2xl font-black text-blue-600 mt-1 block">
              {confirmedDutiesCount} of {dutyRoster.length}
            </span>
            <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" />
              <span>{Math.round((confirmedDutiesCount / dutyRoster.length) * 100)}% verified</span>
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. DEPARTMENT PERFORMANCE — PAPER SUBMISSION & RESULT SUBMISSION */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
              Institutional Benchmark Matrix
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              Department Performance &mdash; Paper Submission &amp; Result Submission
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Department Selector:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value as SubjectType | 'All')}
              className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800"
            >
              <option value="All">All 5 Departments</option>
              {COLLEGE_DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Department Interactive Performance Grid (Exact values from sheet) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {INSTITUTIONAL_BENCHMARKS.departmentPerformance.map(perf => {
            const isSelected = selectedDept === perf.subject;
            return (
              <div
                key={perf.department}
                onClick={() => {
                  if (perf.totalPapers > 0) {
                    setSelectedDept(perf.subject);
                  }
                }}
                className={`p-4 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                      {perf.department}
                    </span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        perf.overallCompletion >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : perf.overallCompletion >= 50
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {perf.overallCompletion.toFixed(1)}%
                    </span>
                  </div>

                  {/* Papers Submitted */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Papers Submitted
                    </span>
                    <span className="text-base font-black text-slate-800 mt-0.5 block">
                      {perf.papersSubmitted} of {perf.totalPapers}
                    </span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${perf.totalPapers > 0 ? (perf.papersSubmitted / perf.totalPapers) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Results Submitted */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Results Submitted
                    </span>
                    <span className="text-base font-black text-slate-800 mt-0.5 block">
                      {perf.resultsSubmitted} of {perf.totalResults}
                    </span>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${perf.totalResults > 0 ? (perf.resultsSubmitted / perf.totalResults) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-600 font-bold block">
                    Overall completion: {perf.overallCompletion.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                    {perf.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. VISUAL ANALYSIS & SUB-MODULE NAVIGATION */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 bg-slate-200/90 rounded-2xl border border-slate-300">
        <button
          onClick={() => setActiveAnalysisView('visual_charts')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeAnalysisView === 'visual_charts'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span>Visual Analysis</span>
        </button>

        <button
          onClick={() => setActiveAnalysisView('faculty_papers')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeAnalysisView === 'faculty_papers'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>Faculty &amp; Papers</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">
            {coursesList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveAnalysisView('delayed_inspector')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeAnalysisView === 'delayed_inspector'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Delayed (25)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
            &gt;15d
          </span>
        </button>

        <button
          onClick={() => setActiveAnalysisView('duty_roster')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeAnalysisView === 'duty_roster'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Duty Roster ({confirmedDutiesCount}/64)</span>
        </button>

        <button
          onClick={() => setActiveAnalysisView('course_ledger')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeAnalysisView === 'course_ledger'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Full Ledger</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: Visual Charts & Analytics */}
      {/* ========================================================================= */}
      {activeAnalysisView === 'visual_charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Department Submission Velocity (Papers vs Results) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Department Comparison
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Papers Submitted % vs Results Submitted %
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  <span>Papers</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                  <span>Results</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {INSTITUTIONAL_BENCHMARKS.departmentPerformance
                .filter(d => d.totalPapers > 0)
                .map(d => {
                  const paperPct = Math.round((d.papersSubmitted / d.totalPapers) * 100);
                  const resultPct = Math.round((d.resultsSubmitted / d.totalResults) * 100);

                  return (
                    <div key={d.department} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>{d.department}</span>
                        <span>Overall: {d.overallCompletion.toFixed(1)}%</span>
                      </div>

                      {/* Dual Bar Track */}
                      <div className="space-y-1">
                        {/* Paper Bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 w-12">Papers</span>
                          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${paperPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 w-10 text-right">
                            {paperPct}%
                          </span>
                        </div>

                        {/* Result Bar */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 w-12">Results</span>
                          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-700"
                              style={{ width: `${resultPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 w-10 text-right">
                            {resultPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Paper Submission Rate: 92% (59/64)</span>
              <span>Result Submission Rate: 39% (25/64)</span>
            </div>
          </div>

          {/* Chart 2: Exam Types & Duty Confirmation Distribution */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Composition Analysis
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    Exam Types &amp; Duty Roster Status
                  </h3>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  64 Total Courses
                </span>
              </div>

              {/* Exam Types Visual Composition */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-600 block uppercase">
                  Exam Type Split (Final 58 &bull; Mid 4 &bull; Reappear 2)
                </span>

                <div className="w-full h-7 rounded-xl overflow-hidden flex shadow-xs border border-slate-200">
                  <div
                    style={{ width: `${(58 / 64) * 100}%` }}
                    className="bg-indigo-600 h-full flex items-center justify-center text-white text-[11px] font-extrabold"
                    title="Final Examinations: 58 Courses (90.6%)"
                  >
                    Final 58 (91%)
                  </div>
                  <div
                    style={{ width: `${(4 / 64) * 100}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center text-slate-950 text-[11px] font-extrabold"
                    title="Midterm Examinations: 4 Courses (6.3%)"
                  >
                    Mid 4
                  </div>
                  <div
                    style={{ width: `${(2 / 64) * 100}%` }}
                    className="bg-rose-500 h-full flex items-center justify-center text-white text-[10px] font-extrabold"
                    title="Reappear Examinations: 2 Courses (3.1%)"
                  >
                    Rep 2
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                    <span className="text-slate-500 block text-[10px] font-bold">Final Term</span>
                    <span className="text-lg font-black text-indigo-900">58</span>
                    <span className="text-[10px] text-slate-400 block">Graduation terminal</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                    <span className="text-slate-500 block text-[10px] font-bold">Midterm</span>
                    <span className="text-lg font-black text-amber-900">4</span>
                    <span className="text-[10px] text-slate-400 block">Continuous assess</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                    <span className="text-slate-500 block text-[10px] font-bold">Reappear</span>
                    <span className="text-lg font-black text-rose-900">2</span>
                    <span className="text-[10px] text-slate-400 block">Supplementary</span>
                  </div>
                </div>
              </div>

              {/* Duty Roster Visual Status */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Duty Roster Staffing</span>
                  <span className="text-blue-700">{confirmedDutiesCount} Confirmed &bull; {dutyRoster.length - confirmedDutiesCount} Pending</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{ width: `${(confirmedDutiesCount / dutyRoster.length) * 100}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${((dutyRoster.length - confirmedDutiesCount) / dutyRoster.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Balochistan Higher Education Regulatory Guidelines Compliant
              </span>
              <button
                onClick={() => setActiveAnalysisView('duty_roster')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Manage Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 1.5: Faculty & Course Paper Directory (Interactive Copy & View) */}
      {/* ========================================================================= */}
      {activeAnalysisView === 'faculty_papers' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          {/* Header & Quick Bulk Copy Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Official Faculty Registry
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {coursesList.length} Total Paper Assignments
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Faculty Teachers &amp; Assigned Paper Names
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Directly extracted from the Govt. Girls Model Degree College (Jinnah Town, Quetta) Examination Management catalog.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyAllTeachersAndPapers}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-98"
                title="Copy full list formatted for pasting directly into Excel or Google Sheets"
              >
                {copiedNotice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedNotice ? 'Copied 64 Courses & Faculty!' : 'Copy All 64 (Excel/Sheets)'}</span>
              </button>

              <button
                onClick={() => {
                  const filteredText = [
                    '# FILTERED FACULTY & PAPERS LIST',
                    'Teacher Name\tPaper Title\tCourse Code\tDepartment\tExam Type',
                    ...filteredCourses.map(c => `${c.assignedTeacher}\t${c.title}\t${c.code}\t${c.subject}\t${c.examType}`)
                  ].join('\n');
                  navigator.clipboard.writeText(filteredText);
                  setCopiedNotice(true);
                  setTimeout(() => setCopiedNotice(false), 2500);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                <span>Copy Filtered ({filteredCourses.length})</span>
              </button>

              <button
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Paste / Import CSV</span>
              </button>
            </div>
          </div>

          {/* Department Breakdown Quick Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {INSTITUTIONAL_BENCHMARKS.departmentPerformance.map(dept => {
              const isCurrentDept = selectedDept === dept.department;
              return (
                <button
                  key={dept.department}
                  onClick={() => setSelectedDept(isCurrentDept ? 'All' : (dept.department as SubjectType))}
                  className={`p-3 rounded-2xl border text-left transition ${
                    isCurrentDept
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 block truncate">
                    {dept.department}
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-base font-black text-slate-900">
                      {dept.totalPapers}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      papers
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{dept.papersSubmitted} sub.</span>
                    <span className="font-bold text-indigo-600">{dept.overallCompletion.toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teacher name, paper name, course code (e.g. ENG-101, Dr. Samina)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value as SubjectType | 'All')}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Departments ({coursesList.length})</option>
                <option value="English">English (13)</option>
                <option value="Islamic Studies">Islamic Studies (14)</option>
                <option value="Sociology">Sociology (19)</option>
                <option value="Zoology">Zoology (18)</option>
                <option value="Chemistry">Chemistry (0)</option>
              </select>

              <select
                value={selectedExamType}
                onChange={e => setSelectedExamType(e.target.value as 'All' | 'Final' | 'Mid' | 'Reappear')}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Exam Types</option>
                <option value="Final">Final (58)</option>
                <option value="Mid">Mid (4)</option>
                <option value="Reappear">Reappear (2)</option>
              </select>
            </div>
          </div>

          {/* Faculty & Assigned Papers Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">Sr.</th>
                  <th className="py-3 px-4">Faculty Teacher / Examiner</th>
                  <th className="py-3 px-4">Assigned Paper Title</th>
                  <th className="py-3 px-3">Course Code</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Exam Type</th>
                  <th className="py-3 px-3 text-center">Paper Status</th>
                  <th className="py-3 px-3 text-center">Result Status</th>
                  <th className="py-3 px-4 text-right">Quick Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No faculty or course papers found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, idx) => {
                    const rowText = `${course.assignedTeacher} — ${course.code}: ${course.title} (${course.subject})`;
                    return (
                      <tr key={course.code} className="hover:bg-purple-50/40 transition">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {course.assignedTeacher.replace(/^(Dr\.|Prof\.|Ms\.)\s*/, '').charAt(0)}
                            </div>
                            <span>{course.assignedTeacher}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {course.title}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {course.code}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            course.subject === 'English' ? 'bg-blue-100 text-blue-800' :
                            course.subject === 'Islamic Studies' ? 'bg-emerald-100 text-emerald-800' :
                            course.subject === 'Sociology' ? 'bg-purple-100 text-purple-800' :
                            course.subject === 'Zoology' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {course.subject}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            course.examType === 'Final' ? 'bg-indigo-50 text-indigo-700' :
                            course.examType === 'Mid' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-100 text-rose-800 font-black'
                          }`}>
                            {course.examType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {course.paperSubmitted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {course.resultSubmitted ? (
                            <span className="text-[11px] font-bold text-emerald-700">Submitted</span>
                          ) : course.resultDelayedDays && course.resultDelayedDays > 15 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              {course.resultDelayedDays}d Delayed
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Normal</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(rowText);
                              setCopiedNotice(true);
                              setTimeout(() => setCopiedNotice(false), 2000);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                            title="Copy teacher name and paper name to clipboard"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Showing {filteredCourses.length} of {coursesList.length} course paper assignments</span>
            <button
              onClick={handleCopyAllTeachersAndPapers}
              className="font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Roster (64 Items)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: Result Delay Diagnostics (The 25 Courses delayed >15 days) */}
      {/* ========================================================================= */}
      {activeAnalysisView === 'delayed_inspector' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                  Critical Escalation Required
                </span>
                <span className="text-xs text-slate-400">
                  25 of 64 Total Courses
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Result Delayed (&gt;15 Days) Administrative Inspection
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The institution has 25 courses where exam was concluded over 15 days ago but final marks ledger has not been uploaded by faculty.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  delayedCourses.forEach(c => {
                    handleDispatchNotice(c.code, c.title, c.assignedTeacher, 'Result Delayed >15 Days');
                  });
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>Issue Bulk Expedite to All 25 Faculty</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  <th className="py-3 px-4">Exam Type</th>
                  <th className="py-3 px-4">Delay Incurred</th>
                  <th className="py-3 px-4 text-right">Regulatory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delayedCourses.map(course => {
                  const noticeSent = noticeSentMap[course.code];
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 block">{course.code}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{course.title}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {course.subject}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{course.assignedTeacher}</span>
                        <span className="text-[10px] text-slate-400">Department Examiner</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {course.examType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.resultDelayedDays} Days Overdue</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {noticeSent ? (
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Expedite Dispatched</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDispatchNotice(course.code, course.title, course.assignedTeacher, 'Result Delayed >15 Days')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition inline-flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Urgent Reminder</span>
                          </button>
                        )}
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
      {/* SUB-VIEW 3: Duty Roster & Invigilation Center (50/64 Confirmed) */}
      {/* ========================================================================= */}
      {activeAnalysisView === 'duty_roster' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                  Duty Roster Roster Registry
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {confirmedDutiesCount} Confirmed &bull; {dutyRoster.length - confirmedDutiesCount} Pending Confirmation
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Faculty Invigilation Schedule &amp; Hall Allocations
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDutyRoster(prev => prev.map(d => ({ ...d, confirmed: true, confirmedAt: new Date().toISOString() })));
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm All Remaining 14 Duties</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Exam Date &amp; Slot</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Hall Location</th>
                  <th className="py-3 px-4">Chief Invigilator</th>
                  <th className="py-3 px-4">Assistant Invigilator</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dutyRoster.slice(0, 20).map(duty => (
                  <tr key={duty.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{duty.examDate}</div>
                      <span className="text-[10px] text-slate-400">{duty.timeSlot}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 block">{duty.courseCode}</span>
                      <span className="text-[10px] text-slate-400">{duty.subject} &bull; {duty.examType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 max-w-xs truncate">
                      {duty.hallLocation}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {duty.chiefInvigilator}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {duty.assistantInvigilator}
                    </td>
                    <td className="py-3.5 px-4">
                      {duty.confirmed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Pending Sign-off</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!duty.confirmed && (
                        <button
                          onClick={() => handleConfirmDuty(duty.id)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold transition"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            Showing first 20 rows of 64 total duties &bull; Full roster synchronized with Controller Office
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: Complete 64-Course Master Catalog Ledger */}
      {/* ========================================================================= */}
      {activeAnalysisView === 'course_ledger' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Institutional Course Ledger (64 Courses Total)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                59 Papers Submitted (92%) &bull; 25 Results Submitted (39%) &bull; 2 Reappear Courses
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search code, title, faculty..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 w-52"
                />
              </div>

              <select
                value={selectedExamType}
                onChange={e => setSelectedExamType(e.target.value as any)}
                className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800"
              >
                <option value="All">All Exam Types</option>
                <option value="Final">Final (58)</option>
                <option value="Mid">Mid (4)</option>
                <option value="Reappear">Reappear (2)</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="delayed_results">Delayed Results (&gt;15d)</option>
                <option value="stalled_papers">Stalled Papers (5)</option>
                <option value="reappear">Reappear Courses (2)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Exam Type</th>
                  <th className="py-3 px-4">Paper Submission</th>
                  <th className="py-3 px-4">Result Submission</th>
                  <th className="py-3 px-4">Faculty In-Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-slate-900 block">{course.code}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-xs">{course.title}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {course.subject}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-600">
                      Sem {course.semester}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          course.examType === 'Final'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : course.examType === 'Mid'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {course.examType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {course.paperSubmitted ? (
                        <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Submitted</span>
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Not Submitted (Stalled)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {course.resultSubmitted ? (
                        <span className="text-blue-700 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Gazetted / Submitted</span>
                        </span>
                      ) : course.resultDelayedDays && course.resultDelayedDays > 15 ? (
                        <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>{course.resultDelayedDays}d Delayed</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Under Grading</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {course.assignedTeacher}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredCourses.length} of 64 courses</span>
            <span>Govt. Girls Model Degree College &bull; Examination Branch</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. Printable Executive Gazette Sheet Modal */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 text-slate-900 border border-slate-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Print Official Executive Report
              </span>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              >
                Close Window
              </button>
            </div>

            {/* Printable Document Body */}
            <div className="border-2 border-slate-900 p-8 rounded-2xl bg-white space-y-6">
              {/* Institutional Crest & Title */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-950">
                  {COLLEGE_METADATA.institutionName}
                </h2>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  {COLLEGE_METADATA.campus} &bull; {COLLEGE_METADATA.systemName}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {COLLEGE_METADATA.reportTitle}
                </p>
              </div>

              {/* Top Benchmark Summary Table */}
              <div className="grid grid-cols-4 gap-4 text-center border p-4 rounded-xl bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Papers</span>
                  <span className="text-2xl font-black text-slate-900">64</span>
                  <span className="text-[10px] text-slate-500 block">Final 58 &bull; Mid 4 &bull; Rep 2</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Papers Submitted</span>
                  <span className="text-2xl font-black text-emerald-600">59 (92%)</span>
                  <span className="text-[10px] text-slate-500 block">5 Stalled across faculty</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Results Submitted</span>
                  <span className="text-2xl font-black text-blue-600">25 (39%)</span>
                  <span className="text-[10px] text-slate-500 block">25 delayed &gt;15 days</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Overall Completion</span>
                  <span className="text-2xl font-black text-indigo-900">71.9%</span>
                  <span className="text-[10px] text-slate-500 block">College-wide benchmark</span>
                </div>
              </div>

              {/* Department Performance Table */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                  Department Performance Summary &mdash; Fall 2026
                </h4>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Department</th>
                      <th className="p-2 border-r border-slate-300">Papers Submitted</th>
                      <th className="p-2 border-r border-slate-300">Results Submitted</th>
                      <th className="p-2 text-right">Overall Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTITUTIONAL_BENCHMARKS.departmentPerformance.map(d => (
                      <tr key={d.department} className="border-b border-slate-200">
                        <td className="p-2 font-bold border-r border-slate-200">{d.department}</td>
                        <td className="p-2 border-r border-slate-200">{d.papersSubmitted} of {d.totalPapers}</td>
                        <td className="p-2 border-r border-slate-200">{d.resultsSubmitted} of {d.totalResults}</td>
                        <td className="p-2 font-black text-right">{d.overallCompletion.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-8 text-center text-xs">
                <div className="border-t border-slate-400 pt-2 font-semibold">
                  <span>Controller of Examinations</span>
                </div>
                <div className="border-t border-slate-400 pt-2 font-semibold">
                  <span>Convener Quality Assurance</span>
                </div>
                <div className="border-t border-slate-400 pt-2 font-bold">
                  <span>Principal / CAO (Executive Seal)</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Confirm &amp; Print to System Printer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. IMPORT MODAL: Paste CSV / TSV with Teachers and Papers */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Paste / Import Teacher &amp; Paper Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Import faculty and courses directly from Google Sheets or Excel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Paste Spreadsheet Rows (TSV or CSV):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sampleText = [
                        'Teacher Name\tPaper Title\tCourse Code\tDepartment\tExam Type',
                        'Dr. Samina Tareen\tAdvanced English Grammar\tENG-101\tEnglish\tFinal',
                        'Prof. Farhana Kakar\tClassical Poetry & Drama\tENG-201\tEnglish\tFinal',
                        'Ms. Shabana Mengal\tIslamic Jurisprudence\tISL-101\tIslamic Studies\tFinal',
                        'Dr. Nargis Jamali\tSociological Theories\tSOC-101\tSociology\tFinal',
                        'Prof. Razia Baloch\tCell Biology & Genetics\tZOO-101\tZoology\tFinal'
                      ].join('\n');
                      setRawCsvInput(sampleText);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Insert Sample
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoursesList(COLLEGE_64_COURSES);
                      setShowImportModal(false);
                      setImportNotice('Reset to official 64 College courses & teachers successfully.');
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline"
                  >
                    Reset to Default 64
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={rawCsvInput}
                onChange={e => setRawCsvInput(e.target.value)}
                placeholder="Example format (tab or comma separated):&#10;Teacher Name, Paper Title, Course Code, Department&#10;Dr. Samina Tareen, Advanced English Grammar, ENG-101, English&#10;Prof. Farhana Kakar, Classical Poetry, ENG-201, English&#10;&#10;Or paste columns directly copied from Google Sheets / Excel!"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-700">Supported Formats:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Direct copy-paste from Google Sheets or Microsoft Excel (tab-delimited)</li>
                  <li>Comma-separated values (CSV)</li>
                  <li>Minimum required columns: <strong>Teacher Name</strong> and <strong>Paper Name / Title</strong></li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={!rawCsvInput.trim()}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>Parse &amp; Update System Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
