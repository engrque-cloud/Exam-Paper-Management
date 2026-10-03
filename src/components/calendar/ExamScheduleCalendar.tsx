import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber, Course, ExamDateSheetRow, ExamPaper } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  Sparkles,
  Printer,
  CalendarCheck,
  Timer,
  Info,
  CalendarDays,
  LayoutGrid,
  ListOrdered,
  Layers,
  ArrowUpRight,
  Phone,
  UserCheck,
  GraduationCap,
  X,
  ExternalLink,
  ChevronDown,
  Check,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import {
  computePaperUploadDeadline,
  formatReadableDate,
  openWhatsApp,
  formatDisplayPhone,
} from '../../utils/whatsapp';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { PrintableDateSheetModal } from '../admin/PrintableDateSheetModal';

interface ExamScheduleCalendarProps {
  initialCourseCode?: string;
  initialSubject?: SubjectType | 'All';
  compactMode?: boolean;
}

type CalendarViewMode = 'month' | 'week' | 'agenda';
type EventFilterType = 'all' | 'exams' | 'deadlines' | 'urgent_only';

interface CalendarDayEvent {
  id: string;
  type: 'exam' | 'deadline' | 'global_deadline';
  date: string; // YYYY-MM-DD
  courseCode?: string;
  courseTitle?: string;
  subject?: SubjectType;
  semester?: SemesterNumber;
  timeSlot?: string;
  shift?: 'Morning Shift' | 'Evening Shift';
  hallLocation?: string;
  chiefInvigilator?: string;
  assistantInvigilator?: string;
  paperSetterTeacherName?: string;
  paperSetterTeacherPhone?: string;
  totalCandidates?: number;
  isPaperUploaded?: boolean;
  paperStatus?: 'qa_approved' | 'pending_qa' | 'qa_rejected' | 'not_submitted';
  isOverdue?: boolean;
  isUrgent?: boolean;
  daysRemaining?: number;
  rowId?: string;
}

export const ExamScheduleCalendar: React.FC<ExamScheduleCalendarProps> = ({
  initialCourseCode,
  initialSubject = 'All',
  compactMode = false,
}) => {
  const {
    dateSheetRows,
    courses,
    subjects,
    semesters,
    papers,
    teachers,
    globalDeadline,
    deadlineStatus,
    setPreviewPaper,
    currentRole,
    currentUser,
    collegeName,
    showToast,
  } = useExam();

  // Calendar Date State - default to October 2026 (the active examination season)
  const [currentDate, setCurrentDate] = useState(() => {
    // Check if there are scheduled rows, default to the month of the first row or Oct 2026
    if (dateSheetRows.length > 0 && dateSheetRows[0].examDate) {
      const parts = dateSheetRows[0].examDate.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      }
    }
    return new Date(2026, 9, 1); // October 2026 (0-indexed: 9 = Oct)
  });

  // Selected Day for detailed inspection drawer
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    if (initialCourseCode) {
      const row = dateSheetRows.find(r => r.courseCode === initialCourseCode);
      if (row) return row.examDate;
    }
    return '2026-10-05';
  });

  // View Mode: Month Grid vs 7-Day Week vs Chronological Agenda
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filter States
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(initialCourseCode || 'all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectType | 'All'>(initialSubject);
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<SemesterNumber | 'All'>('All');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<EventFilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [whatsAppModalState, setWhatsAppModalState] = useState<{
    isOpen: boolean;
    teacherId?: string;
    courseCode?: string;
  }>({ isOpen: false });

  // Detailed Event Modal
  const [activeEventModal, setActiveEventModal] = useState<CalendarDayEvent | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    // Current academic local time anchor or system now
    const academicToday = new Date(2026, 9, 3); // 2026-10-03
    setCurrentDate(new Date(academicToday.getFullYear(), academicToday.getMonth(), 1));
    setSelectedDateStr('2026-10-05');
  };

  // Jump calendar to specific date
  const jumpToDate = (targetDateStr: string) => {
    if (!targetDateStr) return;
    const parts = targetDateStr.split('-');
    if (parts.length === 3) {
      setCurrentDate(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
      setSelectedDateStr(targetDateStr);
    }
  };

  // Helper to calculate days diff from today (2026-10-03)
  const getDaysDiff = (dateStr: string): number => {
    try {
      const target = new Date(dateStr + 'T00:00:00');
      const today = new Date('2026-10-03T00:00:00');
      const diffMs = target.getTime() - today.getTime();
      return Math.round(diffMs / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Build Comprehensive List of Calendar Events
  const allEvents = useMemo(() => {
    const events: CalendarDayEvent[] = [];

    // 1. Process Date Sheet Rows -> Exam Events & Course Upload Deadlines
    dateSheetRows.forEach(row => {
      const matchingPaper = papers.find(p => p.courseCode === row.courseCode);
      const isUploaded = !!(matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file));
      const paperStatus: CalendarDayEvent['paperStatus'] = matchingPaper
        ? (matchingPaper.status as CalendarDayEvent['paperStatus'])
        : 'not_submitted';

      // (A) Exam Event
      events.push({
        id: `exam-${row.id}`,
        type: 'exam',
        date: row.examDate,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        subject: row.subject,
        semester: row.semester,
        timeSlot: `${row.startTime} - ${row.endTime}`,
        shift: row.shift,
        hallLocation: row.hallLocation,
        chiefInvigilator: row.chiefInvigilator,
        assistantInvigilator: row.assistantInvigilator,
        paperSetterTeacherName: row.paperSetterTeacherName,
        paperSetterTeacherPhone: row.paperSetterTeacherPhone,
        totalCandidates: row.totalCandidates,
        isPaperUploaded: isUploaded,
        paperStatus,
        rowId: row.id,
      });

      // (B) Course Paper Upload Deadline Event
      const deadlineDate =
        row.paperUploadDeadline || computePaperUploadDeadline(row.examDate, row.uploadDaysBefore || 5);
      const daysRemaining = getDaysDiff(deadlineDate);
      const isOverdue = !isUploaded && daysRemaining < 0;
      const isUrgent = !isUploaded && daysRemaining <= 2;

      events.push({
        id: `deadline-${row.id}`,
        type: 'deadline',
        date: deadlineDate,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        subject: row.subject,
        semester: row.semester,
        hallLocation: row.hallLocation,
        paperSetterTeacherName: row.paperSetterTeacherName,
        paperSetterTeacherPhone: row.paperSetterTeacherPhone,
        isPaperUploaded: isUploaded,
        paperStatus,
        isOverdue,
        isUrgent,
        daysRemaining,
        rowId: row.id,
      });
    });

    // 2. Add Global Submission Regulatory Deadline
    if (globalDeadline.deadlineDate) {
      events.push({
        id: 'global-submission-deadline',
        type: 'global_deadline',
        date: globalDeadline.deadlineDate,
        courseTitle: 'Official Global Paper Submission Regulatory Cutoff',
        timeSlot: globalDeadline.deadlineTime,
        isUrgent: deadlineStatus.isUrgent,
        isOverdue: deadlineStatus.isPassed,
        daysRemaining: deadlineStatus.daysLeft,
      });
    }

    return events;
  }, [dateSheetRows, papers, globalDeadline, deadlineStatus]);

  // Filtered Events according to user controls
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // 1. Course specific filter
      if (selectedCourseFilter !== 'all') {
        if (event.type === 'global_deadline') return false;
        if (event.courseCode !== selectedCourseFilter) return false;
      }

      // 2. Subject / Department filter
      if (selectedSubjectFilter !== 'All') {
        if (event.type === 'global_deadline') return false;
        if (event.subject !== selectedSubjectFilter) return false;
      }

      // 3. Semester filter
      if (selectedSemesterFilter !== 'All') {
        if (event.type === 'global_deadline') return false;
        if (event.semester !== Number(selectedSemesterFilter)) return false;
      }

      // 4. Event Category Filter
      if (eventCategoryFilter === 'exams' && event.type !== 'exam') return false;
      if (eventCategoryFilter === 'deadlines' && event.type !== 'deadline') return false;
      if (eventCategoryFilter === 'urgent_only') {
        if (event.type === 'exam') return false;
        if (event.type === 'deadline' && (event.isPaperUploaded || (!event.isUrgent && !event.isOverdue))) {
          return false;
        }
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = event.courseCode?.toLowerCase().includes(q);
        const matchesTitle = event.courseTitle?.toLowerCase().includes(q);
        const matchesHall = event.hallLocation?.toLowerCase().includes(q);
        const matchesSetter = event.paperSetterTeacherName?.toLowerCase().includes(q);
        const matchesChief = event.chiefInvigilator?.toLowerCase().includes(q);
        return matchesCode || matchesTitle || matchesHall || matchesSetter || matchesChief;
      }

      return true;
    });
  }, [allEvents, selectedCourseFilter, selectedSubjectFilter, selectedSemesterFilter, eventCategoryFilter, searchQuery]);

  // Map of date string -> events on that day
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarDayEvent[]>();
    filteredEvents.forEach(evt => {
      const existing = map.get(evt.date) || [];
      existing.push(evt);
      map.set(evt.date, existing);
    });
    return map;
  }, [filteredEvents]);

  // Specific Selected Course Detailed Object
  const selectedCourseDetails = useMemo(() => {
    if (selectedCourseFilter === 'all') return null;
    const course = courses.find(c => c.code === selectedCourseFilter);
    const dateSheet = dateSheetRows.find(r => r.courseCode === selectedCourseFilter);
    const matchingPaper = papers.find(p => p.courseCode === selectedCourseFilter);
    const uploadDeadline = dateSheet?.paperUploadDeadline || (dateSheet ? computePaperUploadDeadline(dateSheet.examDate, dateSheet.uploadDaysBefore || 5) : '2026-10-15');
    const daysUntilDeadline = getDaysDiff(uploadDeadline);
    const daysUntilExam = dateSheet ? getDaysDiff(dateSheet.examDate) : 0;

    return {
      course,
      dateSheet,
      paper: matchingPaper,
      uploadDeadline,
      daysUntilDeadline,
      daysUntilExam,
      isUploaded: !!(matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file)),
    };
  }, [selectedCourseFilter, courses, dateSheetRows, papers]);

  // Calendar Grid Days Calculation
  const calendarGridDays = useMemo(() => {
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    // Monday as day 0 (0: Mon, 1: Tue, ..., 6: Sun)
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    const todayStr = '2026-10-03';

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Next month filler days (fill up to 35 or 42 grid slots)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }

    return days;
  }, [year, month, selectedDateStr]);

  // Selected Day's Events
  const selectedDayEvents = useMemo(() => {
    return eventsByDate.get(selectedDateStr) || [];
  }, [eventsByDate, selectedDateStr]);

  // Statistics for Calendar Header Metrics
  const metrics = useMemo(() => {
    const scheduledExamsCount = filteredEvents.filter(e => e.type === 'exam').length;
    const deadlinesCount = filteredEvents.filter(e => e.type === 'deadline').length;
    const verifiedPapersCount = filteredEvents.filter(e => e.type === 'deadline' && e.isPaperUploaded).length;
    const pendingActionCount = filteredEvents.filter(e => e.type === 'deadline' && !e.isPaperUploaded).length;
    return {
      scheduledExamsCount,
      deadlinesCount,
      verifiedPapersCount,
      pendingActionCount,
    };
  }, [filteredEvents]);

  // Month Formatter
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* 1. CALENDAR HERO & CONTROL HEADER */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-800 tracking-wide">
                Interactive Schedule Intelligence
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                Govt. Girls Model Degree College
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif flex items-center gap-2.5">
              <CalendarDays className="w-6 h-6 text-emerald-600" />
              Examination Timetable &amp; Course Deadlines
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Visualize scheduled examination sessions, invigilation duty assignments, and upcoming question paper upload deadlines for specific courses with real-time countdowns.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Open Printable Date Sheet for Official College Posting"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Schedule</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setWhatsAppModalState({
                  isOpen: true,
                  courseCode: selectedCourseFilter !== 'all' ? selectedCourseFilter : undefined,
                })
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Dispatch WhatsApp Alert</span>
            </button>
          </div>
        </div>

        {/* 2. STATS BAR (4 METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900 block">Exams Plotted</span>
              <span className="text-2xl font-black text-emerald-950 tabular-nums block mt-0.5">
                {metrics.scheduledExamsCount}
              </span>
              <span className="text-[10px] text-emerald-700">Scheduled sessions</span>
            </div>
            <GraduationCap className="w-8 h-8 text-emerald-500/40" />
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-indigo-900 block">Course Deadlines</span>
              <span className="text-2xl font-black text-indigo-950 tabular-nums block mt-0.5">
                {metrics.deadlinesCount}
              </span>
              <span className="text-[10px] text-indigo-700">Upload cutoffs</span>
            </div>
            <Clock className="w-8 h-8 text-indigo-500/40" />
          </div>

          <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-teal-900 block">Papers Ready</span>
              <span className="text-2xl font-black text-teal-950 tabular-nums block mt-0.5">
                {metrics.verifiedPapersCount}
              </span>
              <span className="text-[10px] text-teal-700">Verified for printing</span>
            </div>
            <FileCheck2 className="w-8 h-8 text-teal-500/40" />
          </div>

          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-900 block">Papers Pending</span>
              <span className="text-2xl font-black text-amber-950 tabular-nums block mt-0.5">
                {metrics.pendingActionCount}
              </span>
              <span className="text-[10px] text-amber-800">Action required</span>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500/40" />
          </div>
        </div>
      </div>

      {/* 3. SPECIFIC COURSE FOCUS SPOTLIGHT (Displayed when user filters by a course) */}
      {selectedCourseDetails && selectedCourseDetails.course && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-lg border border-emerald-500/30 relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-400/30">
                  {selectedCourseDetails.course.code}
                </span>
                <span className="text-xs text-slate-300">
                  {selectedCourseDetails.course.subject} &bull; Semester {selectedCourseDetails.course.semester} &bull; {selectedCourseDetails.course.creditHours} Credit Hours
                </span>
                {selectedCourseDetails.isUploaded ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paper Uploaded &amp; Certified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> Paper Upload Pending
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                {selectedCourseDetails.course.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Paper Upload Deadline</span>
                  <div className="text-base font-bold text-amber-300 mt-0.5">
                    {formatReadableDate(selectedCourseDetails.uploadDeadline)}
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {selectedCourseDetails.daysUntilDeadline > 0
                      ? `${selectedCourseDetails.daysUntilDeadline} days remaining`
                      : selectedCourseDetails.daysUntilDeadline === 0
                      ? 'Due Today!'
                      : `Deadline passed (${Math.abs(selectedCourseDetails.daysUntilDeadline)} days ago)`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Scheduled Examination Date</span>
                  <div className="text-base font-bold text-emerald-300 mt-0.5">
                    {selectedCourseDetails.dateSheet
                      ? formatReadableDate(selectedCourseDetails.dateSheet.examDate)
                      : 'Pending Scheduling'}
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {selectedCourseDetails.dateSheet
                      ? `${selectedCourseDetails.dateSheet.startTime} (${selectedCourseDetails.dateSheet.shift})`
                      : 'Awaiting Date Sheet slot'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[11px] text-slate-400 block">Assigned Examination Hall</span>
                  <div className="text-sm font-semibold text-white mt-0.5 truncate">
                    {selectedCourseDetails.dateSheet?.hallLocation || 'TBD'}
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Invigilator: {selectedCourseDetails.dateSheet?.chiefInvigilator || 'Senior Faculty'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions for this course */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              {selectedCourseDetails.dateSheet && (
                <button
                  type="button"
                  onClick={() => jumpToDate(selectedCourseDetails.dateSheet!.examDate)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Jump to Exam Date</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => jumpToDate(selectedCourseDetails.uploadDeadline)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition active:scale-95 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Jump to Deadline</span>
              </button>

              {selectedCourseDetails.paper && (
                <button
                  type="button"
                  onClick={() => setPreviewPaper(selectedCourseDetails.paper || null)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Inspect Paper</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedCourseFilter('all')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Course Spotlight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INTERACTIVE TOOLBAR: SEARCH & MULTI-DIMENSIONAL FILTERS */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
              <span>Month Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
              <span>Week View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-600" />
              <span>Timeline Agenda</span>
            </button>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
            >
              Today (Oct 03, 2026)
            </button>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-bold text-slate-900 min-w-[130px] text-center select-none">
                {monthName}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar Row: Specific Course Dropdown + Department + Semester + Event Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Specific Course Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter by Specific Course:
            </label>
            <div className="relative">
              <select
                id="calendar-course-select"
                value={selectedCourseFilter}
                onChange={e => setSelectedCourseFilter(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              >
                <option value="all">All Specific Courses ({courses.length})</option>
                {courses.map(course => (
                  <option key={course.id} value={course.code}>
                    {course.code} &bull; {course.title} (Sem {course.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Department:
            </label>
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value as SubjectType | 'All')}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="All">All Departments</option>
              {subjects.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Event Category Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Event Classification:
            </label>
            <select
              value={eventCategoryFilter}
              onChange={e => setEventCategoryFilter(e.target.value as EventFilterType)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            >
              <option value="all">All Events (Exams &amp; Deadlines)</option>
              <option value="exams">Scheduled Exams Only</option>
              <option value="deadlines">Paper Upload Deadlines Only</option>
              <option value="urgent_only">⚠ Urgent &amp; Pending Uploads Only</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Search Code, Teacher, Hall:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. ENG-101, Hall A, Jenkins..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedCourseFilter !== 'all' ||
          selectedSubjectFilter !== 'All' ||
          eventCategoryFilter !== 'all' ||
          searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700">Active Filters:</span>
            {selectedCourseFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                Course: {selectedCourseFilter}
                <button
                  type="button"
                  onClick={() => setSelectedCourseFilter('all')}
                  className="hover:text-emerald-950"
                >
                  &times;
                </button>
              </span>
            )}
            {selectedSubjectFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px]">
                Dept: {selectedSubjectFilter}
                <button
                  type="button"
                  onClick={() => setSelectedSubjectFilter('All')}
                  className="hover:text-blue-950"
                >
                  &times;
                </button>
              </span>
            )}
            {eventCategoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                Filter: {eventCategoryFilter}
                <button
                  type="button"
                  onClick={() => setEventCategoryFilter('all')}
                  className="hover:text-amber-950"
                >
                  &times;
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900"
                >
                  &times;
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCourseFilter('all');
                setSelectedSubjectFilter('All');
                setEventCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-medium ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. MAIN CALENDAR VIEW AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Area: View (Month Grid / Week View / Agenda View) (8 or 12 cols depending on layout) */}
        <div className="lg:col-span-8 space-y-4">
          {/* ========================================================================= */}
          {/* (A) MONTH GRID VIEW                                                       */}
          {/* ========================================================================= */}
          {viewMode === 'month' && (
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 overflow-hidden">
              {/* Day of Week Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 gap-1 pb-2 border-b border-slate-100 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                  <div
                    key={day}
                    className={`text-xs font-bold uppercase tracking-wider py-1.5 ${
                      idx === 6 ? 'text-rose-500' : 'text-slate-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {calendarGridDays.map((cell, idx) => {
                  const dayEvents = eventsByDate.get(cell.dateStr) || [];
                  const examEvents = dayEvents.filter(e => e.type === 'exam');
                  const deadlineEvents = dayEvents.filter(e => e.type === 'deadline');
                  const globalDeadlineEvent = dayEvents.find(e => e.type === 'global_deadline');
                  const hasUrgent = dayEvents.some(e => e.isUrgent || e.isOverdue);
                  const isSelected = cell.dateStr === selectedDateStr;

                  return (
                    <div
                      key={`${cell.dateStr}-${idx}`}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[105px] sm:min-h-[115px] p-1.5 sm:p-2 rounded-2xl border transition flex flex-col justify-between cursor-pointer group relative ${
                        isSelected
                          ? 'ring-2 ring-emerald-600 bg-emerald-50/40 border-emerald-300 shadow-xs'
                          : cell.isCurrentMonth
                          ? 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                          : 'bg-slate-50/50 border-slate-100/60 text-slate-300'
                      }`}
                    >
                      {/* Top Header of Day Cell */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold tabular-nums inline-flex items-center justify-center w-6 h-6 rounded-full ${
                            cell.isToday
                              ? 'bg-emerald-600 text-white shadow-xs font-black'
                              : cell.isCurrentMonth
                              ? 'text-slate-700'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.dayNumber}
                        </span>

                        {/* Event count badges */}
                        {dayEvents.length > 0 && (
                          <div className="flex items-center gap-1">
                            {hasUrgent && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Urgent deadline" />
                            )}
                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                              {dayEvents.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Event Chips List */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {/* 1. Global Deadline Indicator */}
                        {globalDeadlineEvent && (
                          <div
                            onClick={e => {
                              e.stopPropagation();
                              setActiveEventModal(globalDeadlineEvent);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold truncate flex items-center gap-1 hover:bg-indigo-100"
                            title="Global Paper Submission Cutoff"
                          >
                            <Clock className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                            <span className="truncate">Global Cutoff</span>
                          </div>
                        )}

                        {/* 2. Scheduled Exam Chips (Emerald) */}
                        {examEvents.slice(0, 2).map(evt => (
                          <div
                            key={evt.id}
                            onClick={e => {
                              e.stopPropagation();
                              setActiveEventModal(evt);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold truncate flex items-center gap-1 hover:bg-emerald-100 transition shadow-2xs"
                            title={`Exam: ${evt.courseCode} - ${evt.courseTitle} (${evt.timeSlot}, ${evt.hallLocation})`}
                          >
                            <GraduationCap className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate font-mono">{evt.courseCode}</span>
                            <span className="text-[9px] text-emerald-700 font-normal hidden sm:inline truncate">
                              &bull; {evt.shift === 'Morning Shift' ? 'M' : 'E'}
                            </span>
                          </div>
                        ))}

                        {/* 3. Course Upload Deadline Chips (Amber / Rose) */}
                        {deadlineEvents.slice(0, 2).map(evt => (
                          <div
                            key={evt.id}
                            onClick={e => {
                              e.stopPropagation();
                              setActiveEventModal(evt);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded border truncate flex items-center gap-1 transition shadow-2xs ${
                              evt.isPaperUploaded
                                ? 'bg-teal-50 border-teal-200 text-teal-800'
                                : evt.isOverdue
                                ? 'bg-rose-50 border-rose-300 text-rose-950 font-extrabold animate-pulse'
                                : evt.isUrgent
                                ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                                : 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                            }`}
                            title={`Upload Deadline: ${evt.courseCode} (${evt.isPaperUploaded ? 'Uploaded' : 'Action Required'})`}
                          >
                            {evt.isPaperUploaded ? (
                              <Check className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            )}
                            <span className="truncate">
                              {evt.isPaperUploaded ? '✓ ' : 'Due: '}
                              {evt.courseCode}
                            </span>
                          </div>
                        ))}

                        {/* More events indicator if overflow */}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] font-semibold text-slate-500 pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>

                      {/* Bottom status dot line */}
                      <div className="flex items-center gap-1 h-1.5">
                        {examEvents.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                        {deadlineEvents.some(d => d.isPaperUploaded) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        )}
                        {deadlineEvents.some(d => !d.isPaperUploaded) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend Row */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    <span>Scheduled Exam</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
                    <span>Upload Deadline (Pending)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-teal-100 border border-teal-300 inline-block" />
                    <span>Paper Certified &amp; Uploaded</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300 inline-block" />
                    <span>Global Cutoff</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Tip: Click any date to inspect sessions &amp; deadlines
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* (B) WEEK VIEW                                                             */}
          {/* ========================================================================= */}
          {viewMode === 'week' && (
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    7-Day Timetable Horizon: {formatReadableDate(selectedDateStr)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Shift-by-shift view of morning/evening exams and associated paper deadlines.
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(selectedDateStr + 'T00:00:00');
                      d.setDate(d.getDate() - 7);
                      setSelectedDateStr(d.toISOString().split('T')[0]);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    &larr; Prev Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(selectedDateStr + 'T00:00:00');
                      d.setDate(d.getDate() + 7);
                      setSelectedDateStr(d.toISOString().split('T')[0]);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    Next Week &rarr;
                  </button>
                </div>
              </div>

              {/* 7-Day Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, offset) => {
                  const base = new Date(selectedDateStr + 'T00:00:00');
                  // Align to monday
                  const dayOfWeek = (base.getDay() + 6) % 7;
                  base.setDate(base.getDate() - dayOfWeek + offset);
                  const dateString = base.toISOString().split('T')[0];
                  const dayEvents = eventsByDate.get(dateString) || [];
                  const exams = dayEvents.filter(e => e.type === 'exam');
                  const deadlines = dayEvents.filter(e => e.type === 'deadline');

                  const isCurrentSelected = dateString === selectedDateStr;

                  return (
                    <div
                      key={dateString}
                      onClick={() => setSelectedDateStr(dateString)}
                      className={`rounded-2xl p-3 border transition flex flex-col justify-between cursor-pointer min-h-[300px] ${
                        isCurrentSelected
                          ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500'
                          : 'bg-slate-50/50 border-slate-200/80 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="pb-2 mb-2 border-b border-slate-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold uppercase text-slate-500 block">
                              {base.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-sm font-black text-slate-900">
                              {base.getDate()} {base.toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                          {dayEvents.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Section 1: Morning Shift */}
                        <div className="space-y-1.5 mb-3">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            Morning Shift
                          </span>
                          {exams
                            .filter(e => e.shift === 'Morning Shift')
                            .map(evt => (
                              <div
                                key={evt.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveEventModal(evt);
                                }}
                                className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-300/80 text-emerald-950 text-xs shadow-2xs hover:bg-emerald-200 transition"
                              >
                                <div className="font-bold font-mono">{evt.courseCode}</div>
                                <div className="text-[10px] text-emerald-800 truncate">
                                  {evt.courseTitle}
                                </div>
                                <div className="text-[9px] text-emerald-700 font-semibold mt-1">
                                  {evt.timeSlot}
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Section 2: Evening Shift */}
                        <div className="space-y-1.5 mb-3">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                            Evening Shift
                          </span>
                          {exams
                            .filter(e => e.shift === 'Evening Shift')
                            .map(evt => (
                              <div
                                key={evt.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveEventModal(evt);
                                }}
                                className="p-2 rounded-xl bg-teal-100/70 border border-teal-300/80 text-teal-950 text-xs shadow-2xs hover:bg-teal-200 transition"
                              >
                                <div className="font-bold font-mono">{evt.courseCode}</div>
                                <div className="text-[10px] text-teal-800 truncate">
                                  {evt.courseTitle}
                                </div>
                                <div className="text-[9px] text-teal-700 font-semibold mt-1">
                                  {evt.timeSlot}
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Section 3: Deadlines */}
                        {deadlines.length > 0 && (
                          <div className="space-y-1 pt-2 border-t border-slate-200/60">
                            <span className="text-[9px] uppercase font-bold text-amber-700 block tracking-wider">
                              Deadlines Due
                            </span>
                            {deadlines.map(evt => (
                              <div
                                key={evt.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  setActiveEventModal(evt);
                                }}
                                className={`p-1.5 rounded-lg border text-[11px] ${
                                  evt.isPaperUploaded
                                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                                    : 'bg-amber-100/80 border-amber-300 text-amber-950 font-bold'
                                }`}
                              >
                                <div className="truncate">
                                  {evt.isPaperUploaded ? '✓' : '⚠'} {evt.courseCode}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-center pt-2">
                        <span className="text-[10px] text-slate-400 hover:text-emerald-700 font-medium">
                          Inspect day &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* (C) TIMELINE / AGENDA VIEW                                                */}
          {/* ========================================================================= */}
          {viewMode === 'agenda' && (
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Chronological Examination &amp; Deadline Timeline
                  </h3>
                  <p className="text-xs text-slate-500">
                    Listing all upcoming institutional milestones sorted by calendar date.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {filteredEvents.length} Active Events
                </span>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No examination events or deadlines match the current filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEvents
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(evt => {
                      const daysDiff = getDaysDiff(evt.date);
                      return (
                        <div
                          key={evt.id}
                          onClick={() => {
                            setSelectedDateStr(evt.date);
                            setActiveEventModal(evt);
                          }}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                            evt.type === 'exam'
                              ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                              : evt.type === 'deadline'
                              ? evt.isPaperUploaded
                                ? 'bg-teal-50/40 border-teal-200 hover:bg-teal-50'
                                : 'bg-amber-50/70 border-amber-300 hover:bg-amber-100/60'
                              : 'bg-indigo-50/50 border-indigo-200'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                evt.type === 'exam'
                                  ? 'bg-emerald-600 text-white'
                                  : evt.type === 'deadline'
                                  ? evt.isPaperUploaded
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-amber-600 text-white'
                                  : 'bg-indigo-600 text-white'
                              }`}
                            >
                              {evt.type === 'exam' ? (
                                <GraduationCap className="w-5 h-5" />
                              ) : evt.type === 'deadline' ? (
                                evt.isPaperUploaded ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )
                              ) : (
                                <CalendarIcon className="w-5 h-5" />
                              )}
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {evt.type === 'exam'
                                    ? `EXAMINATION: ${evt.courseCode} - ${evt.courseTitle}`
                                    : evt.type === 'deadline'
                                    ? `QUESTION PAPER UPLOAD DEADLINE: ${evt.courseCode}`
                                    : evt.courseTitle}
                                </span>

                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    evt.type === 'exam'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : evt.isPaperUploaded
                                      ? 'bg-teal-100 text-teal-800'
                                      : 'bg-amber-200 text-amber-900'
                                  }`}
                                >
                                  {evt.type === 'exam'
                                    ? 'Scheduled Exam'
                                    : evt.isPaperUploaded
                                    ? 'Paper Certified'
                                    : 'Upload Required'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>{formatReadableDate(evt.date)}</span>
                                {evt.timeSlot && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{evt.timeSlot} ({evt.shift})</span>
                                  </>
                                )}
                                {evt.hallLocation && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{evt.hallLocation}</span>
                                  </>
                                )}
                                {evt.paperSetterTeacherName && (
                                  <>
                                    <span>&bull;</span>
                                    <span>Faculty: {evt.paperSetterTeacherName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span
                              className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg ${
                                daysDiff > 0
                                  ? 'bg-slate-100 text-slate-700'
                                  : daysDiff === 0
                                  ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {daysDiff > 0
                                ? `In ${daysDiff} days`
                                : daysDiff === 0
                                ? 'Today!'
                                : `${Math.abs(daysDiff)} days ago`}
                            </span>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setActiveEventModal(evt);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Area: Selected Day Inspector & Upcoming Deadlines List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* DAY INSPECTOR PANEL */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Day Schedule Inspector
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {formatReadableDate(selectedDateStr)}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {selectedDayEvents.length} Events
              </span>
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 text-center space-y-2 border border-dashed border-slate-200">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-600">
                  No exams or deadlines scheduled on this date.
                </p>
                <p className="text-[11px] text-slate-400">
                  Select another date on the calendar or click below to schedule an exam.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {selectedDayEvents.map(evt => (
                  <div
                    key={evt.id}
                    onClick={() => setActiveEventModal(evt)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer hover:shadow-xs ${
                      evt.type === 'exam'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : evt.type === 'deadline'
                        ? evt.isPaperUploaded
                          ? 'bg-teal-50/70 border-teal-200'
                          : 'bg-amber-50/90 border-amber-300'
                        : 'bg-indigo-50/70 border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded inline-block ${
                            evt.type === 'exam'
                              ? 'bg-emerald-200/80 text-emerald-900'
                              : evt.isPaperUploaded
                              ? 'bg-teal-200/80 text-teal-900'
                              : 'bg-amber-200 text-amber-950 font-extrabold'
                          }`}
                        >
                          {evt.type === 'exam'
                            ? 'Scheduled Exam'
                            : evt.type === 'deadline'
                            ? 'Paper Upload Deadline'
                            : 'Global Cutoff'}
                        </span>

                        <h4 className="text-sm font-bold text-slate-900 font-mono">
                          {evt.courseCode}
                        </h4>
                        <p className="text-xs text-slate-700 line-clamp-1 font-medium">
                          {evt.courseTitle}
                        </p>
                      </div>

                      {evt.type === 'exam' && (
                        <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {evt.type === 'deadline' && (
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                      )}
                    </div>

                    <div className="space-y-1 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      {evt.timeSlot && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{evt.timeSlot} ({evt.shift})</span>
                        </div>
                      )}
                      {evt.hallLocation && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{evt.hallLocation}</span>
                        </div>
                      )}
                      {evt.paperSetterTeacherName && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>Setter: {evt.paperSetterTeacherName}</span>
                        </div>
                      )}
                      {evt.chiefInvigilator && (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span>Chief: {evt.chiefInvigilator}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick 1-click action buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          if (evt.courseCode) {
                            const p = papers.find(pap => pap.courseCode === evt.courseCode);
                            if (p) setPreviewPaper(p);
                            else showToast(`Paper for ${evt.courseCode} is not uploaded yet.`, 'info');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setWhatsAppModalState({
                            isOpen: true,
                            courseCode: evt.courseCode,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold inline-flex items-center gap-1 ml-auto shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Notify</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING DEADLINES RADAR WIDGET */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upcoming Course Deadlines
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Sorted by urgency</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {allEvents
                .filter(e => e.type === 'deadline')
                .sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999))
                .slice(0, 5)
                .map(dl => (
                  <div
                    key={dl.id}
                    onClick={() => {
                      setSelectedDateStr(dl.date);
                      if (dl.courseCode) setSelectedCourseFilter(dl.courseCode);
                    }}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      dl.isPaperUploaded
                        ? 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                        : dl.isOverdue
                        ? 'bg-rose-50 border-rose-200 hover:bg-rose-100/60'
                        : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
                    }`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {dl.courseCode}
                        </span>
                        {dl.isPaperUploaded ? (
                          <span className="text-[9px] font-semibold text-teal-700 bg-teal-100/80 px-1 rounded">
                            Uploaded
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-amber-800 bg-amber-200/80 px-1 rounded">
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Due: {formatReadableDate(dl.date)} &bull; {dl.paperSetterTeacherName}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold tabular-nums block ${
                          dl.isPaperUploaded
                            ? 'text-teal-700'
                            : (dl.daysRemaining ?? 0) <= 0
                            ? 'text-rose-600 font-extrabold'
                            : 'text-amber-800'
                        }`}
                      >
                        {dl.isPaperUploaded
                          ? 'Certified'
                          : (dl.daysRemaining ?? 0) === 0
                          ? 'Today'
                          : (dl.daysRemaining ?? 0) > 0
                          ? `${dl.daysRemaining}d left`
                          : `${Math.abs(dl.daysRemaining ?? 0)}d late`}
                      </span>
                      <span className="text-[9px] text-slate-400">View &rarr;</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. DETAILED EVENT MODAL (When an event chip is clicked) */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeEventModal.type === 'exam'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {activeEventModal.type === 'exam' ? (
                    <GraduationCap className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {activeEventModal.type === 'exam'
                      ? 'Scheduled Examination Record'
                      : 'Course Paper Upload Deadline'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono">
                    {activeEventModal.courseCode || 'College Cutoff'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveEventModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Course Title:</span>
                <p className="text-sm font-bold text-slate-900">
                  {activeEventModal.courseTitle}
                </p>
                {activeEventModal.subject && (
                  <p className="text-xs text-slate-600">
                    Department of {activeEventModal.subject} &bull; Semester {activeEventModal.semester}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Event Date</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {formatReadableDate(activeEventModal.date)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Timings / Shift</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    {activeEventModal.timeSlot || 'All Day'}
                  </span>
                </div>
              </div>

              {activeEventModal.hallLocation && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Assigned Examination Hall</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                      {activeEventModal.hallLocation}
                    </span>
                  </div>
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
              )}

              {activeEventModal.paperSetterTeacherName && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Paper Setter Faculty</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                      {activeEventModal.paperSetterTeacherName}
                    </span>
                    {activeEventModal.paperSetterTeacherPhone && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDisplayPhone(activeEventModal.paperSetterTeacherPhone)}
                      </span>
                    )}
                  </div>
                  {activeEventModal.paperSetterTeacherPhone && (
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsApp(
                          activeEventModal.paperSetterTeacherPhone!,
                          `Assalam-o-Alaikum ${activeEventModal.paperSetterTeacherName}. Institutional reminder regarding exam paper upload for ${activeEventModal.courseCode}.`
                        )
                      }
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              )}

              {activeEventModal.chiefInvigilator && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Invigilation Supervision</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    Chief Invigilator: {activeEventModal.chiefInvigilator}
                  </p>
                  {activeEventModal.assistantInvigilator && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Assistant: {activeEventModal.assistantInvigilator}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {activeEventModal.courseCode && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseFilter(activeEventModal.courseCode!);
                    setActiveEventModal(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800"
                >
                  Spotlight This Course
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveEventModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official WhatsApp Dispatch Modal */}
      <WhatsAppNotificationModal
        isOpen={whatsAppModalState.isOpen}
        onClose={() => setWhatsAppModalState({ isOpen: false })}
        defaultTeacherId={whatsAppModalState.teacherId}
        defaultCourseCode={whatsAppModalState.courseCode}
        defaultTemplateType="datesheet_paper_upload"
      />

      {/* Printable Date Sheet Modal */}
      <PrintableDateSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
