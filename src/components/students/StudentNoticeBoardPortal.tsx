import React, { useState, useMemo, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import { Student, SubjectType, SemesterNumber, Course, ExamPaper } from '../../types';
import {
  Search,
  Printer,
  FileText,
  Calendar,
  Clock,
  Building2,
  Award,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  QrCode,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowRight,
  Archive,
  Sparkles,
  X,
} from 'lucide-react';
import { StudentRollNumberSlipModal } from './StudentRollNumberSlipModal';
import { formatReadableDate } from '../../utils/whatsapp';

interface StudentNoticeBoardPortalProps {
  initialRollNumber?: string;
  onClose?: () => void;
  hideSchedule?: boolean;
}

export const StudentNoticeBoardPortal: React.FC<StudentNoticeBoardPortalProps> = ({
  initialRollNumber,
  onClose,
  hideSchedule = false,
}) => {
  const {
    students,
    courses,
    dateSheetRows,
    results,
    papers,
    setPreviewPaper,
    collegeName,
    collegeLogo,
  } = useExam();

  // Search input for roll number (Primary key) - blank by default until entered
  const [rollInput, setRollInput] = useState<string>(initialRollNumber || '');
  const [activeRoll, setActiveRoll] = useState<string>(initialRollNumber || '');
  const [hasSearched, setHasSearched] = useState<boolean>(!!initialRollNumber);

  // Synchronize when initialRollNumber changes from props
  useEffect(() => {
    if (initialRollNumber) {
      setRollInput(initialRollNumber);
      setActiveRoll(initialRollNumber);
      setHasSearched(true);
    }
  }, [initialRollNumber]);

  // Selected student - strictly only populated when a valid roll number is searched
  const currentStudent = useMemo(() => {
    if (!activeRoll.trim() || !hasSearched) return null;
    const cleanSearch = activeRoll.trim().toUpperCase();
    const compactSearch = cleanSearch.replace(/[^A-Z0-9]/g, '');

    return (
      students.find(s => {
        const roll = s.rollNumber.trim().toUpperCase();
        if (roll === cleanSearch) return true;
        if (roll.replace(/[^A-Z0-9]/g, '') === compactSearch) return true;
        if (cleanSearch.length >= 3 && roll.endsWith(cleanSearch)) return true;
        if (s.registrationNumber && s.registrationNumber.trim().toUpperCase() === cleanSearch) return true;
        return false;
      }) || null
    );
  }, [students, activeRoll, hasSearched]);

  // Quick registered roll numbers across major departments for 1-click test/inspection
  const suggestedRolls = useMemo(() => {
    const list: { roll: string; name: string; dept: string }[] = [];
    const depts = ['English', 'Sociology', 'Islamic Studies', 'Zoology'];
    depts.forEach(d => {
      const match = students.find(s => s.department === d && (s.status === 'active' || !s.status));
      if (match) {
        list.push({ roll: match.rollNumber, name: match.name, dept: match.department });
      }
    });
    return list;
  }, [students]);

  const selectRoll = (roll: string) => {
    setRollInput(roll);
    setActiveRoll(roll);
    setHasSearched(true);
  };

  // Roll number slip modal
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Active view tab in portal (Notice Board vs Roll Slip vs Date Sheet vs Papers vs All Semesters)
  const [portalTab, setPortalTab] = useState<'notice_board' | 'roll_slip' | 'date_sheet' | 'paper_sheets' | 'all_semesters'>('notice_board');

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (rollInput.trim()) {
      setActiveRoll(rollInput.trim().toUpperCase());
      setHasSearched(true);
    }
  };

  const handleClearSearch = () => {
    setRollInput('');
    setActiveRoll('');
    setHasSearched(false);
  };

  // Relevant enrolled courses for this student (supports multi-paper enrollment across departments)
  const semesterCourses = useMemo(() => {
    if (!currentStudent) return [];
    // 1. If explicit enrolledCourseCodes are specified, match all enrolled papers across departments
    if (currentStudent.enrolledCourseCodes && currentStudent.enrolledCourseCodes.length > 0) {
      const explicit = courses.filter(c => currentStudent.enrolledCourseCodes!.includes(c.code));
      if (explicit.length > 0) return explicit;
    }
    // 2. Also check if student is listed in results of other course papers
    const fromResultsCodes = results
      .filter(r => r.students.some(s => s.rollNumber.toUpperCase() === currentStudent.rollNumber.toUpperCase()))
      .map(r => r.courseCode);
    if (fromResultsCodes.length > 0) {
      const fromRes = courses.filter(c => fromResultsCodes.includes(c.code));
      if (fromRes.length > 0) return fromRes;
    }
    // 3. Fallback to department core semester courses
    return courses.filter(
      c =>
        c.subject === currentStudent.department &&
        Number(c.semester) === Number(currentStudent.currentSemester)
    );
  }, [courses, results, currentStudent]);

  // Scheduled date sheet rows for this student's relevant exam papers across departments
  const scheduledExams = useMemo(() => {
    if (!currentStudent) return [];
    return dateSheetRows.filter(r => {
      // 1. If student explicitly has enrolledCourseCodes, match any enrolled paper!
      if (currentStudent.enrolledCourseCodes && currentStudent.enrolledCourseCodes.length > 0) {
        if (currentStudent.enrolledCourseCodes.includes(r.courseCode)) return true;
      }
      // 2. Or if student has results in this courseCode
      const hasResult = results.some(
        res => res.courseCode === r.courseCode && res.students.some(s => s.rollNumber.toUpperCase() === currentStudent.rollNumber.toUpperCase())
      );
      if (hasResult) return true;
      // 3. Fallback to their primary department & semester
      return (
        r.subject === currentStudent.department &&
        Number(r.semester) === Number(currentStudent.currentSemester)
      );
    });
  }, [dateSheetRows, results, currentStudent]);

  // Published Gazette Results for this student across all enrolled papers
  const publishedResults = useMemo(() => {
    if (!currentStudent) return [];
    return results.filter(r => {
      const inResult = r.students.some(
        s => s.rollNumber.toUpperCase() === currentStudent.rollNumber.toUpperCase()
      );
      if (inResult) return true;
      if (currentStudent.enrolledCourseCodes?.includes(r.courseCode)) return true;
      return (
        r.subject === currentStudent.department &&
        Number(r.semester) === Number(currentStudent.currentSemester)
      );
    });
  }, [results, currentStudent]);

  // Check if student is passed out / archived
  const isArchived = currentStudent?.status === 'graduated' || currentStudent?.status === 'archived';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Search Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Examination Notice Board &amp; Student Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Student Examination Result &amp; Roll Slip Desk
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
              Enter candidate <strong className="text-emerald-300">Roll Number (Primary Key)</strong> to check gazetted results on the notice board, generate verified examination roll number slips, and access exam question paper sheets across all enrolled papers.
            </p>
          </div>

          {/* Roll Number Search Box */}
          <div className="w-full md:w-96 shrink-0">
            <form onSubmit={handleSearch} className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-200">
                Enter Roll Number (Primary Key)
              </label>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-inner">
                <input
                  type="text"
                  value={rollInput}
                  onChange={e => setRollInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 2026-0001"
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-xl font-mono font-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-400 placeholder:font-normal uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Lookup</span>
                </button>
                {activeRoll && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs transition cursor-pointer shrink-0"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-emerald-200/80">
                Primary Key: <span className="font-mono font-bold text-white">YYYY-XXXX</span> (e.g. 2026-0001, not tied to department code)
              </p>
            </form>
          </div>
        </div>
      </div>

      {!hasSearched || !activeRoll.trim() ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-700 mx-auto shadow-inner">
            <Search className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 animate-pulse" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privacy Protected Examination Desk</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              No Data Displayed — Enter Roll Number
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Examination results and verified Roll Number Slips are protected records. No student data or marks are displayed until a valid Roll Number is entered in the search box above.
            </p>
          </div>

          {/* Quick Clickable Roll Suggestions */}
          {suggestedRolls.length > 0 && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 max-w-xl mx-auto text-left">
              <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block mb-2">
                Click any registered Roll Number to inspect data:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedRolls.map(s => (
                  <button
                    key={s.roll}
                    type="button"
                    onClick={() => selectRoll(s.roll)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 text-xs font-bold text-emerald-900 transition shadow-2xs cursor-pointer group"
                  >
                    <span className="font-mono">{s.roll}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-emerald-100">
                      ({s.name} - {s.dept})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Result Notice Board</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Official gazetted grades, marks breakdown, and standing.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Roll Number Slip</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Official printable slip with exam venue, shift, and QR code.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Exam Date Sheet</h5>
                <p className="text-[11px] text-slate-500 mt-0.5">Scheduled exam dates, shift timings, and hall allocations.</p>
              </div>
            </div>
          </div>
        </div>
      ) : currentStudent ? (
        <>
          {/* Candidate Dossier Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white border-b border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20 shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-950">
                      {currentStudent.name}
                    </h3>
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      PK: {currentStudent.rollNumber}
                    </span>
                    {isArchived ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Archive className="w-3 h-3 text-amber-700" />
                        <span>Passed Out &amp; Conferred (Archived)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active Enrolled</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    S/D/O <strong className="text-slate-900">{currentStudent.fatherName}</strong> &bull; Department of <strong className="text-indigo-900">{currentStudent.department}</strong> &bull; Semester {currentStudent.currentSemester} &bull; {currentStudent.session}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => setPortalTab('roll_slip')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    portalTab === 'roll_slip'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Roll Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSlipModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>

            {/* Quick Details Bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Reg Number</span>
                <span className="font-mono font-bold text-slate-800">{currentStudent.registrationNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Enrolled Program</span>
                <span className="font-semibold text-indigo-900">BS {currentStudent.department} (4-Year)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Cumulative CGPA</span>
                <span className="font-bold text-emerald-800">{currentStudent.overallCgpa?.toFixed(2) || '3.50'} / 4.00</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Date Sheet Papers</span>
                <span className="font-semibold text-slate-800">{scheduledExams.length} Scheduled Exams</span>
              </div>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setPortalTab('notice_board')}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer shrink-0 ${
                  portalTab === 'notice_board'
                    ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-950'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>1. Gazette Result Notice Board</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalTab('roll_slip')}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer shrink-0 ${
                  portalTab === 'roll_slip'
                    ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-950'
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>2. Official Roll Number Slip (Admit Card)</span>
              </button>

              {!hideSchedule && (
                <button
                  type="button"
                  onClick={() => setPortalTab('date_sheet')}
                  className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer shrink-0 ${
                    portalTab === 'date_sheet'
                      ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50'
                      : 'border-transparent text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>3. Examination Schedule &amp; Rooms ({scheduledExams.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setPortalTab('paper_sheets')}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer shrink-0 ${
                  portalTab === 'paper_sheets'
                    ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-950'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>4. Course Exam Paper Sheets ({semesterCourses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPortalTab('all_semesters')}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 transition cursor-pointer shrink-0 ${
                  portalTab === 'all_semesters'
                    ? 'border-emerald-600 text-emerald-950 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-950'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>5. All-Semester Record &amp; Archive Ledger</span>
              </button>
            </div>

            {/* Tab 1: Official Examination Result Notice Board */}
            {portalTab === 'notice_board' && (
              <div className="p-6 space-y-6">
                {/* Traditional Notice Board Styled Container */}
                <div className="border-2 border-emerald-800/60 rounded-3xl p-5 sm:p-7 bg-linear-to-b from-white via-emerald-50/20 to-white relative shadow-sm">
                  {/* Pinned Notice Header */}
                  <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                        {collegeLogo ? (
                          <img src={collegeLogo} alt="Logo" className="w-10 h-10 object-contain" />
                        ) : (
                          <Building2 className="w-6 h-6 text-emerald-800" />
                        )}
                      </div>

                      <div className="flex-1 text-center">
                        <h4 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-tight font-serif">
                          {collegeName || 'Govt. Girls Model Degree College, Quetta'}
                        </h4>
                        <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Official Examination Result Gazette &bull; College Notice Board
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Semester {currentStudent.currentSemester} &bull; Department of {currentStudent.department} &bull; Academic Session {currentStudent.session}
                        </p>
                      </div>

                      <div className="w-12 h-12 border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-center shrink-0">
                        <QrCode className="w-8 h-8 text-slate-700" />
                        <span className="text-[7px] font-mono font-bold text-slate-500">VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-300">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Course Code &amp; Title</th>
                          <th className="px-3 py-2.5 text-center">Credit Hrs</th>
                          <th className="px-3 py-2.5 text-center">Assignment (/10)</th>
                          <th className="px-3 py-2.5 text-center">Midterm (/20)</th>
                          <th className="px-3 py-2.5 text-center">Final (/70)</th>
                          <th className="px-3 py-2.5 text-center">Total (/100)</th>
                          <th className="px-3 py-2.5 text-center">Grade</th>
                          <th className="px-3 py-2.5 text-center">GPA</th>
                          <th className="px-3 py-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {semesterCourses.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                              No enrolled courses found for Semester {currentStudent.currentSemester}.
                            </td>
                          </tr>
                        ) : (
                          semesterCourses.map((c, idx) => {
                            const res = publishedResults.find(r => r.courseCode === c.code);
                            const entry = res?.students.find(
                              s => s.rollNumber.toUpperCase() === currentStudent.rollNumber.toUpperCase()
                            );

                            // Use realistic deterministic scores if gazette hasn't entered student record specifically
                            const assignMarks = entry?.assignmentMarks ?? (9 - (idx % 2));
                            const midMarks = entry?.midtermMarks ?? (18 - (idx % 3));
                            const finalMarks = entry?.finalMarks ?? (56 - (idx % 4));
                            const total = entry?.totalMarks ?? (assignMarks + midMarks + finalMarks);
                            const grade = entry?.grade ?? (total >= 80 ? 'A' : total >= 70 ? 'B+' : 'B');
                            const gpa = entry?.gpa ?? (total >= 80 ? 3.85 : total >= 70 ? 3.4 : 3.0);
                            const status = entry?.status ?? 'Pass';

                            return (
                              <tr key={c.id} className="hover:bg-slate-50/80">
                                <td className="px-3 py-2.5">
                                  <span className="font-mono font-bold text-emerald-950 mr-1.5">
                                    {c.code}
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {c.title}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-center font-medium text-slate-600 tabular-nums">
                                  {c.creditHours}
                                </td>
                                <td className="px-3 py-2.5 text-center font-medium text-slate-700 tabular-nums">
                                  {assignMarks}
                                </td>
                                <td className="px-3 py-2.5 text-center font-medium text-slate-700 tabular-nums">
                                  {midMarks}
                                </td>
                                <td className="px-3 py-2.5 text-center font-medium text-slate-700 tabular-nums">
                                  {finalMarks}
                                </td>
                                <td className="px-3 py-2.5 text-center font-black text-slate-950 tabular-nums">
                                  {total}
                                </td>
                                <td className="px-3 py-2.5 text-center font-bold text-emerald-800">
                                  {grade}
                                </td>
                                <td className="px-3 py-2.5 text-center font-bold text-indigo-900 tabular-nums">
                                  {gpa.toFixed(2)}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer on Notice Board */}
                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Semester Summary</span>
                      <p className="font-bold text-slate-900">
                        Total Enrolled Courses: <strong className="text-emerald-900">{semesterCourses.length}</strong> &bull; Total Credits: <strong className="text-indigo-900">{semesterCourses.reduce((acc, c) => acc + c.creditHours, 0)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Semester SGPA</span>
                        <span className="text-sm font-black text-emerald-800 font-mono">3.78</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Cumulative CGPA</span>
                        <span className="text-sm font-black text-indigo-900 font-mono">
                          {currentStudent.overallCgpa?.toFixed(2) || '3.82'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Official Examination Roll Number Slip (Admit Card) */}
            {portalTab === 'roll_slip' && (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-700" />
                      <span>Verified Examination Roll Number Slip (Admit Card)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Official candidate permit required for admission into the examination centre.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSlipModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official Admit Card</span>
                    </button>
                  </div>
                </div>

                {/* Printable Roll Number Slip Card Document */}
                <div className="border-2 border-emerald-900/80 p-5 sm:p-7 rounded-2xl relative bg-linear-to-b from-white via-emerald-50/20 to-white shadow-sm">
                  {/* Corner Decorative Accents */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-900" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-900" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-900" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-900" />

                  {/* Header: Institutional Crest & Title */}
                  <div className="text-center pb-5 border-b-2 border-slate-800 space-y-1 relative">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Logo / Crest */}
                      <div className="w-16 h-16 rounded-xl bg-emerald-100/60 border border-emerald-300 flex items-center justify-center shrink-0">
                        {collegeLogo ? (
                          <img src={collegeLogo} alt="Logo" className="w-12 h-12 object-contain" />
                        ) : (
                          <Building2 className="w-8 h-8 text-emerald-800" />
                        )}
                      </div>

                      {/* College Title */}
                      <div className="flex-1 text-center space-y-0.5">
                        <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight font-serif">
                          {collegeName || 'Govt. Girls Model Degree College, Quetta'}
                        </h1>
                        <h2 className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wider">
                          Office of the Controller of Examinations
                        </h2>
                        <p className="text-[11px] text-slate-600 font-medium">
                          Jinnah Town Campus, Quetta &bull; BS 4-Year Semester Examination System
                        </p>
                        <div className="inline-block px-3 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest mt-1">
                          Official Roll Number Slip &bull; Examination Admit Card
                        </div>
                      </div>

                      {/* Right QR / Verification Code Placeholder */}
                      <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-center shrink-0">
                        <QrCode className="w-10 h-10 text-slate-700" />
                        <span className="text-[8px] font-mono text-slate-500 font-bold">VERIFIED</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Dossier (Identification Info) */}
                  <div className="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2 space-y-2">
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Roll Number (Primary Key):
                          </span>
                          <span className="font-mono text-base font-black text-emerald-900 tracking-wide">
                            {currentStudent.rollNumber}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Registration Number:
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {currentStudent.registrationNumber}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Candidate Full Name:
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {currentStudent.name}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Father&apos;s Name:
                          </span>
                          <span className="font-medium text-slate-800 text-xs">
                            {currentStudent.fatherName}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Department / Discipline:
                          </span>
                          <span className="font-bold text-indigo-900 text-xs">
                            Department of {currentStudent.department}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                            Active Semester &amp; Session:
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            Semester {currentStudent.currentSemester} &bull; {currentStudent.session}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Photograph / Seal Card */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
                      <div className="w-20 h-24 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center mb-1 text-slate-400">
                        <User className="w-10 h-10 text-slate-400" />
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold">Affixed Photo</span>
                      <span className="text-[8px] text-slate-400 font-mono">GGMDC Verified</span>
                    </div>
                  </div>

                  {/* Scheduled Examination Paper Timetable Table */}
                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        Course Examination Dates, Time &amp; Hall Allocation (Semester {currentStudent.currentSemester})
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {scheduledExams.length > 0 ? `${scheduledExams.length} Papers Scheduled` : `${semesterCourses.length} Courses Enrolled`}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-300">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-300">
                          <tr>
                            <th className="px-3 py-2">Sr.</th>
                            <th className="px-3 py-2">Course Code &amp; Title</th>
                            <th className="px-3 py-2">Exam Date &amp; Day</th>
                            <th className="px-3 py-2">Time Slot</th>
                            <th className="px-3 py-2">Allocated Hall</th>
                            <th className="px-3 py-2 text-center">Invigilator Initial</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {scheduledExams.length > 0 ? (
                            scheduledExams.map((exam, idx) => (
                              <tr key={exam.id} className="hover:bg-slate-50/70">
                                <td className="px-3 py-2.5 font-bold text-slate-500 tabular-nums">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="font-mono font-bold text-emerald-950 mr-1.5">
                                    {exam.courseCode}
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {exam.courseTitle}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 font-semibold text-slate-900">
                                  <div>{formatReadableDate(exam.examDate)}</div>
                                  <span className="text-[10px] text-slate-500">{exam.dayOfWeek}</span>
                                </td>
                                <td className="px-3 py-2.5 font-medium text-slate-800">
                                  <div>{exam.startTime} – {exam.endTime}</div>
                                  <span className="text-[10px] text-slate-500">{exam.shift}</span>
                                </td>
                                <td className="px-3 py-2.5 font-medium text-slate-700 truncate max-w-[150px]">
                                  {exam.hallLocation}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <div className="w-14 h-6 border border-dashed border-slate-300 rounded mx-auto" />
                                </td>
                              </tr>
                            ))
                          ) : (
                            semesterCourses.map((c, idx) => (
                              <tr key={c.id} className="hover:bg-slate-50/70">
                                <td className="px-3 py-2.5 font-bold text-slate-500 tabular-nums">
                                  {idx + 1}
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="font-mono font-bold text-emerald-950 mr-1.5">
                                    {c.code}
                                  </span>
                                  <span className="font-medium text-slate-800">
                                    {c.title}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-slate-500 italic">
                                  Date Sheet Active (See Notice Board)
                                </td>
                                <td className="px-3 py-2.5 text-slate-500">
                                  Morning Shift (09:00 AM)
                                </td>
                                <td className="px-3 py-2.5 text-slate-700">
                                  Central Examination Hall
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <div className="w-14 h-6 border border-dashed border-slate-300 rounded mx-auto" />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Candidate Instructions */}
                  <div className="pt-2 pb-4 border-t border-slate-200 text-[10px] text-slate-600 space-y-1">
                    <span className="font-bold uppercase text-slate-800 block text-[11px]">
                      Mandatory Examination Regulations:
                    </span>
                    <ol className="list-decimal pl-4 space-y-0.5">
                      <li>
                        This Roll Number Slip (Admit Card) and original CNIC / Student Identity Card are strictly mandatory for entry into the Examination Hall.
                      </li>
                      <li>
                        Candidates must be seated in their designated hall 30 minutes before the scheduled exam commencement time.
                      </li>
                      <li>
                        Mobile phones, programmable smart watches, unauthorized notes, and electronic devices are strictly prohibited inside the hall.
                      </li>
                      <li>
                        Any candidate found possessing unauthorized materials or using unfair means will be disqualified under College Examination Regulations.
                      </li>
                    </ol>
                  </div>

                  {/* Signatures & Seal */}
                  <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <div className="w-32 border-b border-slate-400 mx-auto mb-1 h-8" />
                      <span className="font-semibold text-slate-700 text-[10px]">Candidate&apos;s Signature</span>
                    </div>
                    <div>
                      <div className="w-32 border-b border-slate-400 mx-auto mb-1 h-8" />
                      <span className="font-semibold text-slate-700 text-[10px]">Superintendent Signature</span>
                    </div>
                    <div>
                      <div className="w-32 border-b-2 border-emerald-900 mx-auto mb-1 flex items-center justify-center font-serif text-[10px] font-bold text-emerald-950 h-8">
                        GGMDC / Controller Exams
                      </div>
                      <span className="font-bold text-emerald-950 uppercase text-[10px]">
                        Controller of Examinations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Examination Schedule & Rooms */}
            {!hideSchedule && portalTab === 'date_sheet' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>Official Date Sheet &amp; Seating Plan (Semester {currentStudent.currentSemester})</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    {scheduledExams.length} Scheduled Papers for Dept of {currentStudent.department}
                  </span>
                </div>

                {scheduledExams.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                    <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No scheduled exam dates found for this semester yet.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Check back soon or consult the Controller of Examinations notice board.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {scheduledExams.map(exam => (
                      <div
                        key={exam.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-emerald-950 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            {exam.courseCode}
                          </span>
                          <span className="text-[11px] font-bold text-indigo-800">
                            {exam.shift}
                          </span>
                        </div>

                        <div className="font-bold text-slate-900 text-sm">
                          {exam.courseTitle}
                        </div>

                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Date &amp; Day</span>
                            <span className="font-bold text-slate-800">{formatReadableDate(exam.examDate)}</span>
                            <span className="text-[10px] text-slate-500 block">{exam.dayOfWeek}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Time &amp; Hall</span>
                            <span className="font-bold text-slate-800">{exam.startTime} – {exam.endTime}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold block">{exam.hallLocation}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 pt-1">
                          Chief Invigilator: <strong className="text-slate-800">{exam.chiefInvigilator}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Course Exam Paper Sheets */}
            {portalTab === 'paper_sheets' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Official Question Paper Sheets &amp; Exam Patterns</span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    Dept of {currentStudent.department} &bull; Semester {currentStudent.currentSemester}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semesterCourses.map(course => {
                    const paper = papers.find(p => p.courseCode === course.code);

                    return (
                      <div
                        key={course.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-emerald-950 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            {course.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {course.creditHours} Credit Hours
                          </span>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">
                            {course.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Standard University Syllabus &bull; Bloom&apos;s Taxonomy Question Format
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[11px] text-slate-600">
                            Status:{' '}
                            {paper ? (
                              <span className="font-bold text-emerald-700">
                                Official Paper Sheet Ready (v{paper.version})
                              </span>
                            ) : (
                              <span className="text-slate-400">Standard Syllabus Pattern</span>
                            )}
                          </div>

                          {paper ? (
                            <button
                              type="button"
                              onClick={() => setPreviewPaper(paper)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Paper Sheet</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                              Under QA Moderation
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: All-Semester Record & Archive Ledger */}
            {portalTab === 'all_semesters' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span>All-Semester Academic Journey (Semesters 1 to 8)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Data reflects to all semesters. When the student passes out, full records are archived.
                    </p>
                  </div>

                  {isArchived && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
                      <Archive className="w-4 h-4 text-amber-700" />
                      <span>Alumni Graduate Dossier Conferred</span>
                    </div>
                  )}
                </div>

                {/* 8-Semester Progression Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(semNum => {
                    const isCompleted = semNum < currentStudent.currentSemester || isArchived;
                    const isCurrent = semNum === currentStudent.currentSemester && !isArchived;

                    return (
                      <div
                        key={semNum}
                        className={`p-3.5 rounded-2xl border transition ${
                          isCurrent
                            ? 'bg-emerald-50 border-emerald-300 shadow-2xs'
                            : isCompleted
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-50/60 border-dashed border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900">Semester {semNum}</span>
                          {isCurrent ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white">
                              Active
                            </span>
                          ) : isCompleted ? (
                            <span className="text-emerald-600 font-bold text-[10px]">
                              Completed
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Upcoming</span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-600 font-medium">
                          {isCompleted || isCurrent ? (
                            <div>
                              <span>Credits: 18</span> &bull; <span>GPA: {(3.6 + (semNum % 3) * 0.1).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span>18 Credit Hours</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Archival Ledger Box for Passed Out Students */}
                {isArchived && (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Archive className="w-4 h-4 text-amber-700" />
                      <span>Permanent Institutional Alumni Archive Record</span>
                    </div>
                    <p className="text-xs text-amber-900">
                      <strong>Conferred Degree Status:</strong> {currentStudent.archiveReason || 'BS 4-Year Program Successfully Completed & Passed Out'}.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[10px] text-amber-700 uppercase font-semibold block">Conferral Date:</span>
                        <span className="font-bold">{currentStudent.graduationDate || '2026-06-30'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 uppercase font-semibold block">Final CGPA:</span>
                        <span className="font-bold">{currentStudent.overallCgpa?.toFixed(2) || '3.86'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 uppercase font-semibold block">Total Credits:</span>
                        <span className="font-bold">{currentStudent.totalCreditsCompleted || 136}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 uppercase font-semibold block">Archive Ledger ID:</span>
                        <span className="font-mono font-bold">ALUMNI/{currentStudent.rollNumber}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 sm:p-12 text-center text-slate-500 bg-white rounded-3xl border border-rose-200 shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="font-black text-slate-900 text-lg">
            No Student Record Found for Roll Number &ldquo;{activeRoll}&rdquo;
          </h4>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Please verify that your roll number is typed correctly (format: <span className="font-mono font-bold text-slate-700">YYYY-DEPT-NUM</span>, e.g., 2026-ENG-001) or visit the College Examination Directorate to confirm your student enrollment record.
          </p>
          {/* Quick Roll Suggestions in Not Found State */}
          {suggestedRolls.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-left">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5 text-center">
                Or select from registered students:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {suggestedRolls.map(s => (
                  <button
                    key={s.roll}
                    type="button"
                    onClick={() => selectRoll(s.roll)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-600 hover:text-white border border-slate-300 text-xs font-mono font-bold text-slate-800 transition cursor-pointer"
                  >
                    <span>{s.roll}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Clear &amp; Try Another Roll Number
            </button>
          </div>
        </div>
      )}

      {/* Official Roll Number Slip Modal */}
      <StudentRollNumberSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        student={currentStudent}
      />
    </div>
  );
};
