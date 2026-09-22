import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber, ExamDateSheetRow } from '../../types';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';
import { PaperStageTracker } from './PaperStageTracker';
import { ExamResultDashboard } from './ExamResultDashboard';
import { ExecutiveVisualAnalysis } from './ExecutiveVisualAnalysis';
import { SessionTurnaroundRecords } from './SessionTurnaroundRecords';
import { MarksheetProductionDashboard } from './MarksheetProductionDashboard';
import { FinishExamModal } from './FinishExamModal';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import {
  Building2,
  Calendar,
  FileCheck,
  Printer,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Timer,
  MapPin,
  UserCheck,
  Search,
  Filter,
  Download,
  Award,
  Layers,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  Archive,
  FolderArchive,
  RotateCcw,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const {
    papers,
    dateSheetRows,
    updateDateSheetRow,
    setPreviewPaper,
    globalDeadline,
    deadlineStatus,
    setIsDeadlineModalOpen,
    results,
    courses,
    isSessionConcluded,
    concludedSessionDetails,
    reopenSession,
  } = useExam();

  // Active Main Tab - Defaults to Executive Sheet from Govt Girls Model Degree College
  const [activeDashboardTab, setActiveDashboardTab] = useState<'executive_sheet' | 'session_records' | 'paper_tracking' | 'datesheet' | 'results' | 'marksheets'>('executive_sheet');

  // Filters
  const [subjectFilter, setSubjectFilter] = useState<SubjectType | 'All'>('All');
  const [semesterFilter, setSemesterFilter] = useState<SemesterNumber | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Finish exam & archival modal
  const [isFinishExamModalOpen, setIsFinishExamModalOpen] = useState(false);

  // WhatsApp Notification modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Edit Date Sheet row modal
  const [editingRow, setEditingRow] = useState<ExamDateSheetRow | null>(null);

  // Printable Date Sheet modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filtered date sheet rows
  const filteredRows = dateSheetRows.filter(row => {
    if (subjectFilter !== 'All' && row.subject !== subjectFilter) return false;
    if (semesterFilter !== 'All' && row.semester !== semesterFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        row.courseCode.toLowerCase().includes(q) ||
        row.courseTitle.toLowerCase().includes(q) ||
        row.hallLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Approved papers
  const approvedPapers = papers.filter(p => p.status === 'qa_approved');

  // Stalled papers count
  const stalledPapersCount = courses.filter(c => {
    const p = papers.find(paper => paper.courseCode === c.code);
    return !p || p.status === 'pending_qa' || p.status === 'qa_rejected';
  }).length;

  // Published gazettes
  const gazettedCount = results.filter(r => r.status === 'gazetted_published').length;

  // Handle row edit submission
  const handleSaveRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    // Recalculate day of week
    const parsedDate = new Date(editingRow.examDate + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[parsedDate.getDay()] || editingRow.dayOfWeek;

    updateDateSheetRow(editingRow.id, {
      ...editingRow,
      dayOfWeek,
    });

    setEditingRow(null);
  };

  return (
    <div className="space-y-6">
      {/* Principal Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white rounded-2xl p-6 text-slate-900 shadow-sm border border-emerald-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Examination Command Center
              </span>
              <span className="text-slate-500 text-xs">&bull; Principal / Vice Chancellor Office</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Principal Executive Dashboard
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Unified governance: Track where question papers are stuck across faculty, audit automated date sheet generation, and ratify institutional exam results and gazettes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isSessionConcluded ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Session Concluded &amp; Archived</span>
                </div>

                <button
                  onClick={() => setActiveDashboardTab('session_records')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs active:scale-98"
                  title="View archived papers, results, and turnaround stats"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>View Archives</span>
                </button>

                <button
                  onClick={() => reopenSession('Fall 2026')}
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 border border-slate-300"
                  title="Reopen examination session for active edits"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reopen Session</span>
                </button>
              </div>
            ) : (
              <button
                id="finish-exam-btn"
                onClick={() => setIsFinishExamModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition active:scale-98 border border-emerald-600"
                title="Conclude all papers, exam schedules, and results, and move to permanent archive"
              >
                <FolderArchive className="w-4 h-4 text-emerald-100" />
                <span>Finish Exam &amp; Move to Archived</span>
              </button>
            )}

            <button
              id="principal-whatsapp-notify-btn"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98"
              title="Send Direct 1-Click WhatsApp Notifications to Faculty"
            >
              <MessageSquare className="w-4 h-4 text-white fill-white/20" />
              <span>WhatsApp Dispatch</span>
            </button>

            <button
              id="print-datesheet-btn"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 font-bold text-xs shadow-xs transition active:scale-98"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Print Date Sheet</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-200/60">
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Stalled / Stuck Papers</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              {stalledPapersCount}
            </span>
            <span className="text-[11px] text-slate-400">Needs administrative push</span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">QA-Certified Papers</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {approvedPapers.length}
            </span>
            <span className="text-[11px] text-slate-400">Ready for exam conduct</span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Generated Date Sheet Rows</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {dateSheetRows.length}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">Auto-scheduled exams</span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Gazetted Exam Results</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">
              {gazettedCount} / {courses.length}
            </span>
            <span className="text-[11px] text-slate-400">Official gazettes ratified</span>
          </div>
        </div>
      </div>

      {/* Institutional Submission Window Status */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Faculty Paper Submission Window:</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  deadlineStatus.isPassed
                    ? 'bg-rose-100 text-rose-800'
                    : deadlineStatus.isUrgent
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {deadlineStatus.isPassed
                  ? 'Cutoff Closed'
                  : `${deadlineStatus.daysLeft} Days Remaining`}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Official Institutional Deadline: <strong className="text-slate-800">{deadlineStatus.formattedDate}</strong> at {globalDeadline.deadlineTime} ({globalDeadline.timezone}).
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDeadlineModalOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition shrink-0"
        >
          View Cutoff Regulations
        </button>
      </div>

      {/* Principal Multi-Module Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-1.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
        <button
          onClick={() => setActiveDashboardTab('executive_sheet')}
          className={`py-3 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeDashboardTab === 'executive_sheet'
              ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/50'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <Building2 className={`w-4 h-4 ${activeDashboardTab === 'executive_sheet' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="truncate">Executive Visual Sheet</span>
          <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            71.9%
          </span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('session_records')}
          className={`py-3 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeDashboardTab === 'session_records'
              ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/50'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/50'
          }`}
          title="All Session records of Papers and Results with Paper-to-Exam Turnaround Time Audit & Printable Summary"
        >
          <Timer className={`w-4 h-4 ${activeDashboardTab === 'session_records' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="truncate">Sessions &amp; Turnaround</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            Audit
          </span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('paper_tracking')}
          className={`py-3 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeDashboardTab === 'paper_tracking'
              ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/50'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${activeDashboardTab === 'paper_tracking' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="truncate">Paper Bottlenecks</span>
          {stalledPapersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
              {stalledPapersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveDashboardTab('datesheet')}
          className={`py-3 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeDashboardTab === 'datesheet'
              ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/50'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeDashboardTab === 'datesheet' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="truncate">Date Sheet</span>
          <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            {dateSheetRows.length}
          </span>
        </button>

        <button
          onClick={() => setActiveDashboardTab('results')}
          className={`py-3 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeDashboardTab === 'results'
              ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/50'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <Award className={`w-4 h-4 ${activeDashboardTab === 'results' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="truncate">Results Gazette</span>
          <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            {gazettedCount}
          </span>
        </button>

        <button
          id="tab-student-marksheets"
          onClick={() => setActiveDashboardTab('marksheets')}
          className={`py-3 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeDashboardTab === 'marksheets'
              ? 'bg-white text-emerald-950 shadow-sm border border-emerald-200/50'
              : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-100/50'
          }`}
          title="Student Marksheets Production & Printing - Generate for specific candidate or batch-print for all"
        >
          <GraduationCap className={`w-4 h-4 ${activeDashboardTab === 'marksheets' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="truncate">Student Marksheets</span>
          <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            Print
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: Executive Sheet & Visual Analysis (Govt Girls Model Degree College) */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'executive_sheet' && (
        <ExecutiveVisualAnalysis />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: All Session Records of Papers & Results with Paper-to-Exam Turnaround */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'session_records' && (
        <SessionTurnaroundRecords />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: Paper Stage Bottleneck Tracker & Lifecycle Audit */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'paper_tracking' && (
        <PaperStageTracker />
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Date Sheet & Exam Conduction Schedule */}
      {/* ========================================================================= */}
      {activeDashboardTab === 'datesheet' && (
        <div className="space-y-6">
      {/* REQUIREMENT 1: "On approval, Principal dashboard show paper submitted and datasheet for upcoming exam is generated row" */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                Automated Generation Active
              </span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Upcoming Exam Date Sheet & Schedule Table
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Each row below was automatically generated when the QA reviewer approved the faculty's uploaded paper.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject filter */}
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value as any)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Departments</option>
              {ALL_SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Semester filter */}
            <select
              value={semesterFilter}
              onChange={e => setSemesterFilter(e.target.value === 'All' ? 'All' : Number(e.target.value) as any)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Semesters</option>
              {ALL_SEMESTERS.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search course or venue..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </div>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">No Date Sheet rows yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Date Sheet rows are automatically generated as soon as the QA Paper Checker approves submitted examination papers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Exam Date & Day</th>
                  <th className="px-4 py-3">Shift & Time</th>
                  <th className="px-4 py-3">Course Code & Title</th>
                  <th className="px-4 py-3">Subject & Sem</th>
                  <th className="px-4 py-3">Examination Hall</th>
                  <th className="px-4 py-3">Chief Invigilator</th>
                  <th className="px-4 py-3">Paper Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRows.map(row => {
                  const paper = papers.find(p => p.id === row.paperId);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{row.examDate}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {row.dayOfWeek}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {row.startTime} &ndash; {row.endTime}
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            row.shift === 'Morning Shift'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {row.shift}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mr-1.5 text-[11px]">
                          {row.courseCode}
                        </span>
                        <span className="font-medium text-slate-800">{row.courseTitle}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{row.subject}</span>
                        <div className="text-[10px] text-slate-500">Semester {row.semester}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{row.hallLocation}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {row.totalCandidates} Candidates
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{row.chiefInvigilator}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          QA Verified (v{row.paperVersion})
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        {paper && (
                          <button
                            onClick={() => setPreviewPaper(paper)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                            title="Inspect certified paper"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        )}

                        <button
                          id={`edit-slot-btn-${row.id}`}
                          onClick={() => setEditingRow(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Modify exam date, room, or invigilator"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Adjust Slot</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submitted & Approved Papers Vault for Principal Clearance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Verified Paper Vault & Printing Clearance ({approvedPapers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified question papers submitted by teachers and validated by QA, ready for sealed production.
            </p>
          </div>

          <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-lg border border-emerald-200">
            {approvedPapers.length} Papers Authorized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {approvedPapers.map(paper => (
            <div
              key={paper.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {paper.courseCode}
                  </span>
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">
                    {paper.courseTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {paper.subject} &bull; Semester {paper.semester} &bull; Setter: {paper.teacherName}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-700">
                    {paper.file.name}
                  </span>
                  <span className="text-emerald-700 font-bold">
                    QA Signed by {paper.qaReview?.reviewedBy?.split('(')[0]}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPreviewPaper(paper)}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg shadow-2xs shrink-0"
              >
                Inspect Paper
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* ========================================================================= */}
  {/* TAB 4: Exam Results & Official Gazette */}
  {/* ========================================================================= */}
  {activeDashboardTab === 'results' && (
    <ExamResultDashboard onNavigateToMarksheets={() => setActiveDashboardTab('marksheets')} />
  )}

  {/* ========================================================================= */}
  {/* TAB 5: Student Marksheet Production & Printing (Specific Student or All)  */}
  {/* ========================================================================= */}
  {activeDashboardTab === 'marksheets' && (
    <MarksheetProductionDashboard />
  )}

      {/* ========================================================================= */}
      {/* 1. Edit Exam Schedule Row Modal (Principal Control) */}
      {/* ========================================================================= */}
      {editingRow && (
        <div
          id="principal-edit-slot-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setEditingRow(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Adjust Exam Date & Venue</h3>
                  <p className="text-xs text-slate-400">
                    {editingRow.courseCode} &mdash; {editingRow.courseTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveRow} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exam Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={editingRow.examDate}
                    onChange={e => setEditingRow({ ...editingRow, examDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift
                  </label>
                  <select
                    value={editingRow.shift}
                    onChange={e =>
                      setEditingRow({
                        ...editingRow,
                        shift: e.target.value as any,
                        startTime: e.target.value === 'Morning Shift' ? '09:00 AM' : '02:00 PM',
                        endTime: e.target.value === 'Morning Shift' ? '11:00 AM' : '04:00 PM',
                      })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Morning Shift">Morning Shift (09:00 AM &ndash; 11:00 AM)</option>
                    <option value="Evening Shift">Evening Shift (02:00 PM &ndash; 04:00 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Examination Hall / Room Location
                </label>
                <input
                  type="text"
                  required
                  value={editingRow.hallLocation}
                  onChange={e => setEditingRow({ ...editingRow, hallLocation: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chief Invigilator
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRow.chiefInvigilator}
                    onChange={e => setEditingRow({ ...editingRow, chiefInvigilator: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enrolled Candidates
                  </label>
                  <input
                    type="number"
                    required
                    value={editingRow.totalCandidates}
                    onChange={e => setEditingRow({ ...editingRow, totalCandidates: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  Save Schedule Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Printable Official University Date Sheet View */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div
          id="datesheet-print-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Controls Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base">Official University Examination Date Sheet</h3>
                  <p className="text-xs text-slate-400">Formal Notification for Publication & Student Notice Boards</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  Print Schedule
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 max-h-[75vh] overflow-y-auto bg-white font-serif">
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
                <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-950 uppercase">
                  UNIVERSITY OF HIGHER EXCELLENCE
                </h1>
                <h2 className="text-sm font-sans font-semibold text-slate-700 tracking-widest uppercase mt-0.5">
                  OFFICE OF THE PRINCIPAL & CONTROLLER OF EXAMINATIONS
                </h2>
                <div className="inline-block mt-3 px-4 py-1 bg-slate-100 border border-slate-300 rounded font-sans text-xs font-bold uppercase text-slate-900">
                  OFFICIAL DATE SHEET &bull; FALL 2026 SEMESTER EXAMINATIONS
                </div>
                <p className="text-xs text-slate-500 mt-2 font-sans">
                  Notification No: UHE/EXAM/DS-2026/894 &bull; Dated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              </div>

              {/* Notification Context */}
              <p className="text-xs font-sans text-slate-700 mb-6 leading-relaxed">
                It is hereby notified for the information of all concerned faculty, examiners, and candidates that the Final Term Examination for Undergraduate Programs across <strong>English, Islamic Studies, Sociology, and Zoology (Semesters 1 through 8)</strong> shall be conducted strictly according to the schedule below:
              </p>

              {/* Date Sheet Table */}
              <table className="w-full text-left text-xs font-sans border-collapse border border-slate-400 mb-6">
                <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="border border-slate-300 px-3 py-2.5">Date & Day</th>
                    <th className="border border-slate-300 px-3 py-2.5">Shift & Timing</th>
                    <th className="border border-slate-300 px-3 py-2.5">Course Code</th>
                    <th className="border border-slate-300 px-3 py-2.5">Course Title</th>
                    <th className="border border-slate-300 px-3 py-2.5">Subject & Sem</th>
                    <th className="border border-slate-300 px-3 py-2.5">Examination Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {dateSheetRows.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 px-3 py-2 font-semibold">
                        {row.examDate} ({row.dayOfWeek})
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.shift}<br />
                        <span className="text-slate-500 text-[10px]">{row.startTime} &ndash; {row.endTime}</span>
                      </td>
                      <td className="border border-slate-300 px-3 py-2 font-mono font-bold">
                        {row.courseCode}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 font-medium">
                        {row.courseTitle}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.subject} (Sem {row.semester})
                      </td>
                      <td className="border border-slate-300 px-3 py-2 font-medium">
                        {row.hallLocation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Special Instructions block */}
              <div className="text-xs font-sans border border-slate-300 rounded-lg p-3.5 bg-slate-50 text-slate-700 mb-8 space-y-1">
                <span className="font-bold text-slate-900 block uppercase mb-1">
                  Important Directives for Exam Conduction:
                </span>
                <p>1. Candidates must reach the examination center at least 30 minutes before the commencement of the exam.</p>
                <p>2. No candidate will be admitted without an official University Roll Number Slip and original National ID Card.</p>
                <p>3. Question papers are sealed and certified by the QA Board and will be opened only in the presence of the Chief Invigilator.</p>
              </div>

              {/* Official Signatures */}
              <div className="font-sans grid grid-cols-2 pt-10 border-t border-slate-400 text-xs">
                <div>
                  <div className="w-40 border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900">
                    Dr. Marcus Sterling
                  </div>
                  <p className="text-slate-600 font-semibold">Controller of Examinations</p>
                  <p className="text-slate-400 text-[11px]">Examination Regulatory Division</p>
                </div>

                <div className="text-right">
                  <div className="w-48 ml-auto border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900">
                    Prof. Dr. Richard Hawthorne
                  </div>
                  <p className="text-slate-600 font-semibold">Principal & Chief Academic Officer</p>
                  <p className="text-slate-400 text-[11px]">University Executive Council</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Exam & Conclude Session Modal */}
      <FinishExamModal
        isOpen={isFinishExamModalOpen}
        onClose={() => setIsFinishExamModalOpen(false)}
        onConcludedSuccess={() => setActiveDashboardTab('session_records')}
      />

      {/* WhatsApp Official Institutional Notification Modal */}
      <WhatsAppNotificationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </div>
  );
};
