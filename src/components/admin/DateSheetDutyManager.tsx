import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber, ExamDateSheetRow } from '../../types';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  Search,
  Filter,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  FileUp,
  Sparkles,
  Edit3,
  Trash2,
  X,
  ExternalLink,
  Shield,
  UserCheck,
  CalendarCheck,
  Timer,
  Info,
  PhoneCall,
  Printer,
  Settings2,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import {
  computePaperUploadDeadline,
  formatReadableDate,
  openWhatsApp,
  WhatsAppTemplates,
} from '../../utils/whatsapp';
import { PrintableDateSheetModal } from './PrintableDateSheetModal';
import { LogoCustomizerModal } from './LogoCustomizerModal';

export const DateSheetDutyManager: React.FC = () => {
  const {
    dateSheetRows,
    paperUploadDaysBefore,
    setPaperUploadDaysBefore,
    applyUploadDaysToAllRows,
    createDateSheetRow,
    updateDateSheetRow,
    deleteDateSheetRow,
    autoScheduleAllCoursesDateSheet,
    sendDateSheetWhatsApp,
    teachers,
    courses,
    subjects,
    semesters,
    papers,
    collegeLogo,
    showToast,
  } = useExam();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<SubjectType | 'All'>('All');
  const [filterShift, setFilterShift] = useState<'All' | 'Morning Shift' | 'Evening Shift'>('All');

  // Modal State for Create / Edit Date Sheet Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Policy configuration state
  const [isPolicyPopoverOpen, setIsPolicyPopoverOpen] = useState(false);
  const [customPolicyDays, setCustomPolicyDays] = useState<number>(paperUploadDaysBefore || 5);

  // Form Fields
  const [formCourseCode, setFormCourseCode] = useState('');
  const [formExamDate, setFormExamDate] = useState('2026-10-20');
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('12:00 PM');
  const [formShift, setFormShift] = useState<'Morning Shift' | 'Evening Shift'>('Morning Shift');
  const [formHallLocation, setFormHallLocation] = useState('Hall A (Room 101 - Humanities Complex)');
  const [formChiefInvigilatorId, setFormChiefInvigilatorId] = useState('');
  const [formAssistantInvigilatorId, setFormAssistantInvigilatorId] = useState('');
  const [formPaperSetterTeacherId, setFormPaperSetterTeacherId] = useState('');
  const [formUploadDaysBefore, setFormUploadDaysBefore] = useState<number>(paperUploadDaysBefore || 5);
  const [formTotalCandidates, setFormTotalCandidates] = useState<number>(75);
  const [formSendWhatsAppImmediately, setFormSendWhatsAppImmediately] = useState(true);
  const [formWhatsAppTarget, setFormWhatsAppTarget] = useState<'paper_setter' | 'chief' | 'both'>('both');

  // Available Halls Preset
  const PRESET_HALLS = [
    'Hall A (Room 101 - Humanities Complex)',
    'Hall B (Room 102 - Science Wing)',
    'Hall C (Room 204 - Social Sciences Block)',
    'Al-Farabi Main Auditorium (Ground Floor)',
    'Al-Ghazali Examination Hall (Floor 2)',
    'Darwin Science Amphitheater (Bio Block)',
    'Room 305 - Central Academic Building',
    'Seminar Hall 2 - Postgraduate Wing',
  ];

  // Calculated upload deadline for current form exam date and configured cutoff offset
  const computedFormDeadline = useMemo(() => {
    return computePaperUploadDeadline(formExamDate, formUploadDaysBefore || 5);
  }, [formExamDate, formUploadDaysBefore]);

  // Selected course details
  const selectedCourseObj = useMemo(() => {
    return courses.find(c => c.code === formCourseCode) || courses[0];
  }, [courses, formCourseCode]);

  // Open modal for new entry
  const handleOpenCreateModal = () => {
    setEditingRowId(null);
    const firstCourse = courses[0];
    setFormCourseCode(firstCourse?.code || '');
    setFormExamDate('2026-10-20');
    setFormStartTime('09:00 AM');
    setFormEndTime('12:00 PM');
    setFormShift('Morning Shift');
    setFormHallLocation(PRESET_HALLS[0]);

    // Auto-pick teachers
    const deptTeachers = teachers.filter(t => t.department === firstCourse?.subject);
    const setter = deptTeachers[0] || teachers[0];
    const chief = teachers[1] || teachers[0];
    const assist = teachers[2] || teachers[0];

    setFormPaperSetterTeacherId(setter?.id || '');
    setFormChiefInvigilatorId(chief?.id || '');
    setFormAssistantInvigilatorId(assist?.id || '');
    setFormUploadDaysBefore(paperUploadDaysBefore || 5);
    setFormTotalCandidates(70);
    setFormSendWhatsAppImmediately(true);
    setFormWhatsAppTarget('both');
    setIsModalOpen(true);
  };

  // Open modal to edit existing row
  const handleOpenEditModal = (row: ExamDateSheetRow) => {
    setEditingRowId(row.id);
    setFormCourseCode(row.courseCode);
    setFormExamDate(row.examDate);
    setFormStartTime(row.startTime);
    setFormEndTime(row.endTime);
    setFormShift(row.shift);
    setFormHallLocation(row.hallLocation);

    const setterId = row.paperSetterTeacherId || teachers.find(t => t.name === row.paperSetterTeacherName)?.id || teachers[0]?.id || '';
    const chiefId = row.chiefInvigilatorTeacherId || teachers.find(t => t.name === row.chiefInvigilator)?.id || teachers[1]?.id || '';
    const assistId = row.assistantInvigilatorTeacherId || teachers.find(t => t.name === row.assistantInvigilator)?.id || teachers[2]?.id || '';

    setFormPaperSetterTeacherId(setterId);
    setFormChiefInvigilatorId(chiefId);
    setFormAssistantInvigilatorId(assistId);
    setFormUploadDaysBefore(row.uploadDaysBefore || paperUploadDaysBefore || 5);
    setFormTotalCandidates(row.totalCandidates);
    setFormSendWhatsAppImmediately(false);
    setIsModalOpen(true);
  };

  // Handle saving Date Sheet entry
  const handleSaveDateSheet = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCourseCode) {
      showToast('Please select a course for the date sheet.', 'error');
      return;
    }
    if (!formExamDate) {
      showToast('Please select an exam date.', 'error');
      return;
    }

    const course = courses.find(c => c.code === formCourseCode) || courses[0];
    const paperSetterObj = teachers.find(t => t.id === formPaperSetterTeacherId) || teachers[0];
    const chiefObj = teachers.find(t => t.id === formChiefInvigilatorId) || teachers[1] || teachers[0];
    const assistObj = teachers.find(t => t.id === formAssistantInvigilatorId) || teachers[2] || teachers[0];

    if (editingRowId) {
      // Update existing row
      updateDateSheetRow(editingRowId, {
        courseCode: course.code,
        courseTitle: course.title,
        subject: course.subject,
        semester: course.semester,
        examDate: formExamDate,
        startTime: formStartTime,
        endTime: formEndTime,
        shift: formShift,
        hallLocation: formHallLocation,
        chiefInvigilator: chiefObj.name,
        chiefInvigilatorTeacherId: chiefObj.id,
        chiefInvigilatorPhone: chiefObj.whatsappNumber || chiefObj.phone,
        assistantInvigilator: assistObj.name,
        assistantInvigilatorTeacherId: assistObj.id,
        assistantInvigilatorPhone: assistObj.whatsappNumber || assistObj.phone,
        paperSetterTeacherId: paperSetterObj.id,
        paperSetterTeacherName: paperSetterObj.name,
        paperSetterTeacherPhone: paperSetterObj.whatsappNumber || paperSetterObj.phone,
        uploadDaysBefore: formUploadDaysBefore,
        totalCandidates: formTotalCandidates,
      });

      if (formSendWhatsAppImmediately) {
        sendDateSheetWhatsApp({
          rowId: editingRowId,
          target: formWhatsAppTarget === 'both' ? 'both' : (formWhatsAppTarget === 'chief' ? 'chief_invigilator' : 'paper_setter'),
        });
      }

      showToast(`Date Sheet row for ${course.code} updated! ${formUploadDaysBefore}-day deadline: ${computedFormDeadline}.`, 'success');
    } else {
      // Create new row
      createDateSheetRow({
        courseCode: course.code,
        courseTitle: course.title,
        subject: course.subject,
        semester: course.semester,
        examDate: formExamDate,
        startTime: formStartTime,
        endTime: formEndTime,
        shift: formShift,
        hallLocation: formHallLocation,
        chiefInvigilator: chiefObj.name,
        chiefInvigilatorTeacherId: chiefObj.id,
        chiefInvigilatorPhone: chiefObj.whatsappNumber || chiefObj.phone,
        assistantInvigilator: assistObj.name,
        assistantInvigilatorTeacherId: assistObj.id,
        assistantInvigilatorPhone: assistObj.whatsappNumber || assistObj.phone,
        paperSetterTeacherId: paperSetterObj.id,
        paperSetterTeacherName: paperSetterObj.name,
        paperSetterTeacherPhone: paperSetterObj.whatsappNumber || paperSetterObj.phone,
        uploadDaysBefore: formUploadDaysBefore,
        totalCandidates: formTotalCandidates,
        sendWhatsAppImmediately: formSendWhatsAppImmediately,
        targetWhatsAppTeacher: formWhatsAppTarget,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered Date Sheet Rows
  const filteredRows = useMemo(() => {
    return dateSheetRows.filter(row => {
      const matchesSearch =
        searchQuery === '' ||
        row.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.hallLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (row.chiefInvigilator && row.chiefInvigilator.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (row.paperSetterTeacherName && row.paperSetterTeacherName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject = filterSubject === 'All' || row.subject === filterSubject;
      const matchesShift = filterShift === 'All' || row.shift === filterShift;

      return matchesSearch && matchesSubject && matchesShift;
    });
  }, [dateSheetRows, searchQuery, filterSubject, filterShift]);

  // Statistics
  const stats = useMemo(() => {
    const totalScheduled = dateSheetRows.length;
    const papersUploadedCount = dateSheetRows.filter(r => {
      const matchingPaper = papers.find(p => p.courseCode === r.courseCode);
      return matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file);
    }).length;
    const whatsappDispatchedCount = dateSheetRows.filter(r => r.whatsappNoticeSent).length;
    return {
      totalScheduled,
      papersUploadedCount,
      pendingUploadCount: Math.max(0, totalScheduled - papersUploadedCount),
      whatsappDispatchedCount,
    };
  }, [dateSheetRows, papers]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Key Administrator Workflow Guideline */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Administrator Examination Scheduling Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
              Date Sheet & Teacher Duty Assignment
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Finalize examination dates, allocate Exam Halls / Rooms, configure timings, and assign invigilation duties.
              The system <strong className="text-emerald-300 font-semibold">computes and assigns the Question Paper Upload Deadline (currently configured to {paperUploadDaysBefore} days prior to the exam date, fully customizable)</strong>,
              and enables instant 1-Click WhatsApp dispatches and official printouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-open-datesheet-logo-modal"
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Configure institutional branding and college logo for printable date sheets"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>{collegeLogo ? 'Date Sheet Logo' : 'Add College Logo'}</span>
            </button>

            <button
              id="btn-open-datesheet-print-modal"
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer"
              title="Open print preview and export official date sheet to PDF or paper printout"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              Print Date Sheet
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/30 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule New Exam
            </button>

            <button
              onClick={() => autoScheduleAllCoursesDateSheet()}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Auto-schedules all curriculum courses with staggered dates, halls, and configurable upload deadlines"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              Auto-Schedule All
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Scheduled Exams</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalScheduled}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Across all departments</div>
          </div>

          {/* Configurable Cutoff Stat Card */}
          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Paper Upload Cutoff</span>
              <button
                type="button"
                onClick={() => {
                  setCustomPolicyDays(paperUploadDaysBefore || 5);
                  setIsPolicyPopoverOpen(!isPolicyPopoverOpen);
                }}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                title="Configure cutoff days"
              >
                <Settings2 className="w-3 h-3" />
                Configure
              </button>
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1 flex items-baseline gap-1.5">
              <span>{paperUploadDaysBefore}</span>
              <span className="text-sm font-semibold text-slate-300">Days Before</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 flex items-center justify-between">
              <span>Configurable policy</span>
              <button
                type="button"
                onClick={() => applyUploadDaysToAllRows(paperUploadDaysBefore)}
                className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                title="Re-apply this cutoff to all existing date sheet slots"
              >
                Apply to all rows
              </button>
            </div>

            {/* Quick Policy Configuration Popover */}
            {isPolicyPopoverOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 p-3 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl text-white space-y-2 text-xs">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Configure Upload Deadline Offset:</span>
                  <button
                    type="button"
                    onClick={() => setIsPolicyPopoverOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customPolicyDays}
                    onChange={e => setCustomPolicyDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-center text-sm"
                  />
                  <span className="text-slate-300 text-xs">Days Before Exam</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPaperUploadDaysBefore(customPolicyDays);
                      setIsPolicyPopoverOpen(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition"
                  >
                    Save as Default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      applyUploadDaysToAllRows(customPolicyDays);
                      setIsPolicyPopoverOpen(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-bold text-slate-950 transition"
                  >
                    Apply to All
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Papers Uploaded</div>
            <div className="text-2xl font-bold text-teal-300 mt-1">
              {stats.papersUploadedCount} <span className="text-xs text-slate-400 font-normal">/ {stats.totalScheduled}</span>
            </div>
            <div className="text-[11px] text-amber-300 mt-0.5">{stats.pendingUploadCount} Pending Upload</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <div className="text-xs text-slate-400 font-medium">WhatsApp Dispatches</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.whatsappDispatchedCount}</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Direct 1-click orders sent</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course, hall, or teacher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Dept:</span>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Departments</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Shift:</span>
            <select
              value={filterShift}
              onChange={e => setFilterShift(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Shifts</option>
              <option value="Morning Shift">Morning Shift (09:00 AM)</option>
              <option value="Evening Shift">Evening Shift (02:00 PM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Date Sheet Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Date Sheet & Teacher Duties Roster</h2>
              <p className="text-xs text-slate-500">
                Displaying {filteredRows.length} examination slots with automatic 5-day paper upload deadlines
              </p>
            </div>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <div className="text-base font-bold text-slate-700">No Date Sheet Entries Found</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Click &quot;Schedule New Exam&quot; to add a date sheet slot or click &quot;Auto-Schedule All Courses&quot; to populate the entire session.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule First Exam Slot
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRows.map((row) => {
              const daysBefore = row.uploadDaysBefore || paperUploadDaysBefore || 5;
              const uploadDeadline = row.paperUploadDeadline || computePaperUploadDeadline(row.examDate, daysBefore);
              const matchingPaper = papers.find(p => p.courseCode === row.courseCode);
              const isPaperUploaded = !!(matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file));
              const isMorning = row.shift === 'Morning Shift';

              return (
                <div
                  key={row.id}
                  className="p-5 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left: Exam Date, Time & Course Details */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Date Block */}
                    <div className="w-20 text-center shrink-0 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {row.dayOfWeek ? row.dayOfWeek.slice(0, 3) : 'Exam'}
                      </div>
                      <div className="text-xl font-black text-emerald-950 leading-tight">
                        {row.examDate.split('-')[2] || '01'}
                      </div>
                      <div className="text-[10px] font-medium text-emerald-800">
                        {formatReadableDate(row.examDate).split(' ')[0]}
                      </div>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold">
                          {row.courseCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {row.subject} &bull; Sem {row.semester}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isMorning
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          }`}
                        >
                          {row.shift} ({row.startTime} – {row.endTime})
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
                        {row.courseTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <strong className="text-slate-900">Hall/Room:</strong> {row.hallLocation}
                        </span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-600">
                          Candidates: <strong className="text-slate-800">{row.totalCandidates}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Teacher Duties & 5-Day Upload Deadline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 lg:max-w-md w-full">
                    {/* Teacher Duties Box */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-emerald-600" />
                        Assigned Teacher Duties
                      </div>

                      <div className="text-xs">
                        <div className="text-slate-500 text-[10px]">Paper Setter (Upload Duty):</div>
                        <div className="font-bold text-slate-900 truncate">
                          {row.paperSetterTeacherName || 'Assigned Instructor'}
                        </div>
                      </div>

                      <div className="text-xs pt-1 border-t border-slate-200">
                        <div className="text-slate-500 text-[10px]">Duty Invigilators (Exam Date):</div>
                        <div className="font-medium text-slate-800 text-[11px] truncate">
                          Chief: <span className="font-bold">{row.chiefInvigilator}</span>
                        </div>
                        {row.assistantInvigilator && (
                          <div className="font-medium text-slate-600 text-[11px] truncate">
                            Asst: {row.assistantInvigilator}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 5-Day Upload Deadline Box */}
                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3 text-emerald-600" />
                            {daysBefore}-Day Paper Cutoff
                          </span>
                          {isPaperUploaded ? (
                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-200 text-emerald-900 text-[9px] font-bold">
                              Uploaded
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-sm bg-amber-200 text-amber-950 text-[9px] font-bold animate-pulse">
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-extrabold text-emerald-950 mt-1">
                          {formatReadableDate(uploadDeadline)}
                        </div>
                        <div className="text-[10px] text-emerald-700">
                          ({daysBefore} days before {formatReadableDate(row.examDate)})
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 pt-1 border-t border-emerald-200/80">
                        {row.whatsappNoticeSent ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> WhatsApp Dispatched
                          </span>
                        ) : (
                          <span className="text-slate-500">WhatsApp not sent yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: WhatsApp Dispatch & Action Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2 w-full">
                      {/* WhatsApp Paper Setter */}
                      <button
                        type="button"
                        onClick={() =>
                          sendDateSheetWhatsApp({
                            rowId: row.id,
                            target: 'paper_setter',
                          })
                        }
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
                        title={`Send WhatsApp notice to teacher responsible for uploading the paper (notifying them of exam date & ${daysBefore}-day deadline)`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp Setter ({daysBefore}d Cutoff)
                      </button>

                      {/* WhatsApp Invigilators Duty Order */}
                      <button
                        type="button"
                        onClick={() =>
                          sendDateSheetWhatsApp({
                            rowId: row.id,
                            target: 'chief_invigilator',
                          })
                        }
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
                        title="Send WhatsApp examination duty order to Chief Invigilator"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        WhatsApp Duty Order
                      </button>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(row)}
                        className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Edit schedule, timings, hall, or duty assignments"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${row.courseCode} from the Date Sheet?`)) {
                            deleteDateSheetRow(row.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete slot from date sheet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Date Sheet Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-emerald-200/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white p-5 sm:p-6 border-b border-emerald-200 flex items-center justify-between text-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingRowId ? 'Edit Exam Date Sheet Slot' : 'Schedule New Exam Date Sheet Slot'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign Exam Hall / Room, Timings, Faculty Duties & Calculate 5-Day Upload Deadline
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDateSheet} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* 1. Course Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Course & Subject Paper *
                </label>
                <select
                  value={formCourseCode}
                  onChange={e => {
                    const code = e.target.value;
                    setFormCourseCode(code);
                    const c = courses.find(item => item.code === code);
                    if (c) {
                      const deptTeachers = teachers.filter(t => t.department === c.subject);
                      if (deptTeachers.length > 0) {
                        setFormPaperSetterTeacherId(deptTeachers[0].id);
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                  required
                >
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code}: {c.title} ({c.subject} &bull; Semester {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Exam Date, Shift & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    value={formExamDate}
                    onChange={e => setFormExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Shift *
                  </label>
                  <select
                    value={formShift}
                    onChange={e => {
                      const shift = e.target.value as 'Morning Shift' | 'Evening Shift';
                      setFormShift(shift);
                      if (shift === 'Morning Shift') {
                        setFormStartTime('09:00 AM');
                        setFormEndTime('12:00 PM');
                      } else {
                        setFormStartTime('02:00 PM');
                        setFormEndTime('05:00 PM');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Morning Shift">Morning Shift (09:00 AM – 12:00 PM)</option>
                    <option value="Evening Shift">Evening Shift (02:00 PM – 05:00 PM)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Timing Range *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formStartTime}
                      onChange={e => setFormStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-1/2 px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="text"
                      value={formEndTime}
                      onChange={e => setFormEndTime(e.target.value)}
                      placeholder="12:00 PM"
                      className="w-1/2 px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Automatic Configurable Paper Upload Deadline Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Calculated Paper Upload Deadline ({formUploadDaysBefore} Days Before Exam)
                    </div>
                    <div className="text-base font-extrabold text-emerald-950">
                      {formatReadableDate(computedFormDeadline)} ({computedFormDeadline})
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      Assigned course teacher must upload the examination paper in PDF/DOCX format on or before this cutoff.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-emerald-300 shadow-2xs shrink-0">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Cutoff Offset:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formUploadDaysBefore}
                    onChange={e => setFormUploadDaysBefore(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-center text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">days prior</span>
                </div>
              </div>

              {/* 4. Exam Hall / Room & Candidates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Exam Hall / Room Location *
                  </label>
                  <input
                    type="text"
                    list="halls-list"
                    value={formHallLocation}
                    onChange={e => setFormHallLocation(e.target.value)}
                    placeholder="e.g. Hall A (Room 101 - Humanities Complex)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                    required
                  />
                  <datalist id="halls-list">
                    {PRESET_HALLS.map(h => (
                      <option key={h} value={h} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Expected Candidates
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={formTotalCandidates}
                    onChange={e => setFormTotalCandidates(parseInt(e.target.value) || 60)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 5. Teacher Duties: Paper Setter & Invigilators */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Assign Teacher Duties & Roles
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Paper Setter Teacher */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Paper Setter / Upload Teacher *
                    </label>
                    <select
                      value={formPaperSetterTeacherId}
                      onChange={e => setFormPaperSetterTeacherId(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      required
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500">Must upload paper 5 days before</span>
                  </div>

                  {/* Chief Invigilator */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Chief Invigilator (Exam Date) *
                    </label>
                    <select
                      value={formChiefInvigilatorId}
                      onChange={e => setFormChiefInvigilatorId(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      required
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500">Hall in-charge on exam day</span>
                  </div>

                  {/* Assistant Invigilator */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Assistant Invigilator (Exam Date)
                    </label>
                    <select
                      value={formAssistantInvigilatorId}
                      onChange={e => setFormAssistantInvigilatorId(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500">Candidate attendance & roll call</span>
                  </div>
                </div>
              </div>

              {/* 6. WhatsApp Dispatch Options */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formSendWhatsAppImmediately}
                    onChange={e => setFormSendWhatsAppImmediately(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    Open WhatsApp Notification for assigned teachers immediately upon saving
                  </span>
                </label>

                {formSendWhatsAppImmediately && (
                  <div className="pl-6 space-y-2">
                    <div className="text-xs text-slate-600">Send WhatsApp Message To:</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="whatsappTarget"
                          value="paper_setter"
                          checked={formWhatsAppTarget === 'paper_setter'}
                          onChange={() => setFormWhatsAppTarget('paper_setter')}
                        />
                        Paper Setter (Paper Upload 5-Day Cutoff Directive)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="whatsappTarget"
                          value="chief"
                          checked={formWhatsAppTarget === 'chief'}
                          onChange={() => setFormWhatsAppTarget('chief')}
                        />
                        Chief Invigilator (Exam Duty Order)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="whatsappTarget"
                          value="both"
                          checked={formWhatsAppTarget === 'both'}
                          onChange={() => setFormWhatsAppTarget('both')}
                        />
                        Both (Paper Setter & Invigilators)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  {editingRowId ? 'Update Date Sheet Entry' : `Schedule & Lock ${formUploadDaysBefore}-Day Deadline`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Date Sheet Modal Dialog */}
      <PrintableDateSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        preSelectedSubject={filterSubject}
      />

      {/* Date Sheet Logo & Branding Modal Dialog */}
      <LogoCustomizerModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSuccess={() => setIsPrintModalOpen(true)}
      />
    </div>
  );
};
