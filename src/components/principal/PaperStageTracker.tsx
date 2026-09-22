import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { Course, ExamPaper, ExamDateSheetRow, SubjectType, SemesterNumber, UserRole } from '../../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Calendar,
  Send,
  Eye,
  Filter,
  Search,
  ArrowRight,
  User,
  ShieldCheck,
  Building2,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  Check,
  MessageSquare,
} from 'lucide-react';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import { WhatsAppTemplateType } from '../../utils/whatsapp';

export type PaperPipelineStage =
  | 'stuck_at_teacher_upload'
  | 'stuck_at_qa_review'
  | 'stuck_at_teacher_revision'
  | 'qa_approved'
  | 'fully_scheduled';

export interface CoursePipelineItem {
  course: Course;
  paper?: ExamPaper;
  dateSheetRow?: ExamDateSheetRow;
  stage: PaperPipelineStage;
  stageLabel: string;
  stageStep: number; // 1 to 5
  stuckParty: string;
  stuckPartyRole: UserRole;
  stuckPartyId?: string;
  stuckDurationDays: number;
  severity: 'urgent' | 'warning' | 'normal' | 'completed';
  actionNeeded: string;
}

export const PaperStageTracker: React.FC = () => {
  const {
    courses,
    papers,
    dateSheetRows,
    teachers,
    setPreviewPaper,
    sendExpediteNotice,
    globalDeadline,
    subjects,
    semesters,
  } = useExam();

  // Filters & Search
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Expedite modal state
  const [expediteItem, setExpediteItem] = useState<CoursePipelineItem | null>(null);
  const [expediteCustomNote, setExpediteCustomNote] = useState<string>('');

  // WhatsApp Notification modal state
  const [whatsAppModalState, setWhatsAppModalState] = useState<{
    isOpen: boolean;
    initialTeacherId?: string;
    initialTemplateType?: WhatsAppTemplateType;
    initialCourseCode?: string;
    initialCustomNotes?: string;
  }>({ isOpen: false });

  // QA Inspection modal
  const [inspectQAPaper, setInspectQAPaper] = useState<ExamPaper | null>(null);

  // Compute full pipeline mapping for every course
  const pipelineItems: CoursePipelineItem[] = useMemo(() => {
    return courses.map(course => {
      const paper = papers.find(p => p.courseCode === course.code);
      const dateSheetRow = dateSheetRows.find(d => d.courseCode === course.code);

      // Find assigned teacher
      const assignedTeacher = teachers.find(
        t => t.department === course.subject && t.assignedSemesters.includes(course.semester)
      ) || teachers.find(t => t.department === course.subject) || teachers[0];

      if (!paper) {
        // Stage 1: Stuck at teacher upload
        return {
          course,
          paper: undefined,
          dateSheetRow: undefined,
          stage: 'stuck_at_teacher_upload',
          stageLabel: 'Faculty Paper Draft Pending',
          stageStep: 1,
          stuckParty: assignedTeacher?.name || 'Assigned Faculty',
          stuckPartyRole: 'teacher',
          stuckPartyId: assignedTeacher?.id,
          stuckDurationDays: 4,
          severity: 'urgent',
          actionNeeded: 'Faculty must draft & submit question paper',
        };
      }

      if (paper.status === 'pending_qa') {
        // Stage 2: Stuck at QA review
        return {
          course,
          paper,
          dateSheetRow,
          stage: 'stuck_at_qa_review',
          stageLabel: 'Awaiting QA Paper Review',
          stageStep: 2,
          stuckParty: 'Dr. Marcus Sterling (QA Paper Checker)',
          stuckPartyRole: 'qa',
          stuckDurationDays: 2,
          severity: 'warning',
          actionNeeded: 'QA Cell must validate against syllabus rubric',
        };
      }

      if (paper.status === 'qa_rejected') {
        // Stage 3: Stuck at faculty revision
        return {
          course,
          paper,
          dateSheetRow,
          stage: 'stuck_at_teacher_revision',
          stageLabel: 'QA Rejected (Correction Required)',
          stageStep: 2,
          stuckParty: paper.teacherName,
          stuckPartyRole: 'teacher',
          stuckPartyId: paper.teacherId,
          stuckDurationDays: 3,
          severity: 'urgent',
          actionNeeded: 'Faculty must revise paper per QA remarks & re-upload v2',
        };
      }

      if (paper.status === 'qa_approved') {
        if (dateSheetRow) {
          // Stage 5: Fully scheduled
          return {
            course,
            paper,
            dateSheetRow,
            stage: 'fully_scheduled',
            stageLabel: 'QA Certified & Scheduled in Date Sheet',
            stageStep: 5,
            stuckParty: 'None (Ready for Exam Conduction)',
            stuckPartyRole: 'principal',
            stuckDurationDays: 0,
            severity: 'completed',
            actionNeeded: 'Sealed printing clearance authorized',
          };
        } else {
          // Stage 4: QA approved awaiting datesheet row
          return {
            course,
            paper,
            dateSheetRow: undefined,
            stage: 'qa_approved',
            stageLabel: 'QA Certified (Awaiting Date Sheet Slot)',
            stageStep: 4,
            stuckParty: 'Office of the Principal (Exam Cell)',
            stuckPartyRole: 'principal',
            stuckDurationDays: 1,
            severity: 'normal',
            actionNeeded: 'Assign exam date, shift, and hall location',
          };
        }
      }

      return {
        course,
        paper,
        dateSheetRow,
        stage: 'stuck_at_teacher_upload',
        stageLabel: 'Pending Submission',
        stageStep: 1,
        stuckParty: assignedTeacher?.name || 'Faculty',
        stuckPartyRole: 'teacher',
        stuckDurationDays: 1,
        severity: 'warning',
        actionNeeded: 'Action required',
      };
    });
  }, [courses, papers, dateSheetRows, teachers]);

  // Stage counts for metrics
  const totalCourses = pipelineItems.length;
  const stuckAtTeacherUpload = pipelineItems.filter(i => i.stage === 'stuck_at_teacher_upload').length;
  const stuckAtQAReview = pipelineItems.filter(i => i.stage === 'stuck_at_qa_review').length;
  const stuckAtRevision = pipelineItems.filter(i => i.stage === 'stuck_at_teacher_revision').length;
  const qaApproved = pipelineItems.filter(i => i.stage === 'qa_approved').length;
  const fullyScheduled = pipelineItems.filter(i => i.stage === 'fully_scheduled').length;
  const totalBottlenecks = stuckAtTeacherUpload + stuckAtQAReview + stuckAtRevision;

  // Filtered items
  const filteredItems = useMemo(() => {
    return pipelineItems.filter(item => {
      // Stage filter
      if (selectedStageFilter !== 'all' && item.stage !== selectedStageFilter) {
        return false;
      }
      // Subject filter
      if (selectedSubjectFilter !== 'all' && item.course.subject !== selectedSubjectFilter) {
        return false;
      }
      // Semester filter
      if (selectedSemesterFilter !== 'all' && String(item.course.semester) !== selectedSemesterFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = item.course.code.toLowerCase().includes(q);
        const matchesTitle = item.course.title.toLowerCase().includes(q);
        const matchesTeacher = item.stuckParty.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesTeacher) return false;
      }
      return true;
    });
  }, [pipelineItems, selectedStageFilter, selectedSubjectFilter, selectedSemesterFilter, searchQuery]);

  const handleSendExpedite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediteItem) return;

    sendExpediteNotice({
      targetRole: expediteItem.stuckPartyRole,
      recipientId: expediteItem.stuckPartyId,
      courseCode: expediteItem.course.code,
      courseTitle: expediteItem.course.title,
      stage: expediteItem.stageLabel,
      customNote: expediteCustomNote.trim() ? expediteCustomNote : undefined,
    });

    setExpediteItem(null);
    setExpediteCustomNote('');
  };

  return (
    <div className="space-y-6">
      {/* Executive Header & Bottleneck Diagnostic Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Institutional Stage Tracking & Bottleneck Audit</span>
            </div>
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">
              Paper Submission Lifecycle & Stage Bottleneck Tracker
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Real-time audit of all <strong>{totalCourses} accredited courses</strong> across English, Islamic Studies, Sociology, and Zoology. Identifies exactly where question papers are stalled and enables immediate administrative intervention.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400">Institutional Cutoff</div>
              <div className="text-sm font-mono font-bold text-slate-800">{globalDeadline.deadlineDate} &bull; {globalDeadline.deadlineTime}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-[100px]">
              <div className="text-xl font-black text-rose-600">{totalBottlenecks}</div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Stalled Papers</div>
            </div>
          </div>
        </div>

        {/* 5-Stage Interactive Funnel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {/* Stage 1: Stuck at Teacher Upload */}
          <button
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'stuck_at_teacher_upload' ? 'all' : 'stuck_at_teacher_upload')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedStageFilter === 'stuck_at_teacher_upload'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                Stage 1 &bull; Faculty
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700">{stuckAtTeacherUpload}</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Not Yet Uploaded</div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Stuck at course teacher drafting</p>
            {selectedStageFilter === 'stuck_at_teacher_upload' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600"></span>
            )}
          </button>

          {/* Stage 2: Stuck at QA Review */}
          <button
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'stuck_at_qa_review' ? 'all' : 'stuck_at_qa_review')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedStageFilter === 'stuck_at_qa_review'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Stage 2 &bull; QA Cell
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{stuckAtQAReview}</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Under QA Review</div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Awaiting rubric validation</p>
            {selectedStageFilter === 'stuck_at_qa_review' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600"></span>
            )}
          </button>

          {/* Stage 3: Stuck at Teacher Revision */}
          <button
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'stuck_at_teacher_revision' ? 'all' : 'stuck_at_teacher_revision')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedStageFilter === 'stuck_at_teacher_revision'
                ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20 shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                Stage 3 &bull; Re-Upload
              </span>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-orange-700">{stuckAtRevision}</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">QA Rejected (Needs Fix)</div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Teacher must upload v2 revision</p>
            {selectedStageFilter === 'stuck_at_teacher_revision' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-600"></span>
            )}
          </button>

          {/* Stage 4: QA Approved awaiting slot */}
          <button
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'qa_approved' ? 'all' : 'qa_approved')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedStageFilter === 'qa_approved'
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Stage 4 &bull; Exam Cell
              </span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700">{qaApproved}</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">QA Certified</div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Approved, awaiting slot allocation</p>
            {selectedStageFilter === 'qa_approved' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
            )}
          </button>

          {/* Stage 5: Fully Scheduled */}
          <button
            onClick={() => setSelectedStageFilter(selectedStageFilter === 'fully_scheduled' ? 'all' : 'fully_scheduled')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedStageFilter === 'fully_scheduled'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Stage 5 &bull; Date Sheet
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{fullyScheduled}</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">Fully Scheduled</div>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Hall & invigilator assigned</p>
            {selectedStageFilter === 'fully_scheduled' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Action Controls Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, title, teacher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={selectedStageFilter}
            onChange={e => setSelectedStageFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Stages ({totalCourses})</option>
            <option value="stuck_at_teacher_upload">🔴 Stuck: Not Uploaded ({stuckAtTeacherUpload})</option>
            <option value="stuck_at_qa_review">🟡 Stuck: Under QA Review ({stuckAtQAReview})</option>
            <option value="stuck_at_teacher_revision">🟠 Stuck: QA Rejected ({stuckAtRevision})</option>
            <option value="qa_approved">🟢 Stage 4: QA Certified ({qaApproved})</option>
            <option value="fully_scheduled">🔵 Stage 5: In Date Sheet ({fullyScheduled})</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {subjects.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSemesterFilter}
            onChange={e => setSelectedSemesterFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Semesters</option>
            {semesters.map(s => (
              <option key={s} value={String(s)}>
                Semester {s}
              </option>
            ))}
          </select>

          {(selectedStageFilter !== 'all' ||
            selectedSubjectFilter !== 'all' ||
            selectedSemesterFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedStageFilter('all');
                setSelectedSubjectFilter('all');
                setSelectedSemesterFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredItems.length}</strong> of {totalCourses} courses
        </div>
      </div>

      {/* Main Pipeline Tracking Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Course & Subject</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-4 py-3 min-w-[200px]">Lifecycle Progress</th>
                <th className="px-4 py-3">Current Stage Diagnosis</th>
                <th className="px-4 py-3">Bottleneck Party</th>
                <th className="px-4 py-3 text-right">Principal Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No courses match the selected filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the stage or department filters above.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  return (
                    <tr key={item.course.id} className="hover:bg-slate-50/80 transition">
                      {/* Course info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {item.course.code}
                          </span>
                          <span className="font-semibold text-slate-900">{item.course.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{item.course.subject}</span>
                          <span>&bull;</span>
                          <span>Semester {item.course.semester}</span>
                          <span>&bull;</span>
                          <span>{item.course.creditHours} Cr. Hrs</span>
                        </div>
                      </td>

                      {/* Assigned Faculty */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                            {item.stuckParty.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{item.paper ? item.paper.teacherName : item.stuckParty}</div>
                            <div className="text-[10px] text-slate-400">
                              {item.paper ? `Submitted: ${new Date(item.paper.createdAt).toLocaleDateString()}` : 'Not yet submitted'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 5-Step Lifecycle Progress Bar */}
                      <td className="px-4 py-3.5">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                            <span className={item.stageStep >= 1 ? 'text-indigo-600 font-bold' : 'text-slate-400'}>1. Draft</span>
                            <span className={item.stageStep >= 2 ? (item.stage === 'stuck_at_teacher_revision' ? 'text-rose-600 font-bold' : 'text-indigo-600 font-bold') : 'text-slate-400'}>2. QA</span>
                            <span className={item.stageStep >= 4 ? 'text-indigo-600 font-bold' : 'text-slate-400'}>3. Clearance</span>
                            <span className={item.stageStep >= 5 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>4. Scheduled</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all duration-300 ${
                                item.stage === 'stuck_at_teacher_revision'
                                  ? 'bg-rose-500'
                                  : item.stage === 'stuck_at_teacher_upload'
                                  ? 'bg-rose-400'
                                  : item.stage === 'stuck_at_qa_review'
                                  ? 'bg-amber-400'
                                  : item.stage === 'qa_approved'
                                  ? 'bg-indigo-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${(item.stageStep / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {item.paper ? `Version ${item.paper.version} &bull; ${item.paper.file.name}` : 'Paper file missing'}
                          </div>
                        </div>
                      </td>

                      {/* Current Stage Diagnosis */}
                      <td className="px-4 py-3.5">
                        {item.stage === 'stuck_at_teacher_upload' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Stuck at Teacher Upload</span>
                          </span>
                        )}

                        {item.stage === 'stuck_at_qa_review' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Stuck at QA Paper Review</span>
                          </span>
                        )}

                        {item.stage === 'stuck_at_teacher_revision' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>Stuck: QA Rejected (Revision Req)</span>
                          </span>
                        )}

                        {item.stage === 'qa_approved' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>QA Certified (Ready for Date Sheet)</span>
                          </span>
                        )}

                        {item.stage === 'fully_scheduled' && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Scheduled in Date Sheet</span>
                            </span>
                            {item.dateSheetRow && (
                              <div className="text-[10px] text-slate-500 mt-1 font-medium">
                                {item.dateSheetRow.examDate} &bull; {item.dateSheetRow.shift} &bull; {item.dateSheetRow.hallLocation}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Bottleneck Party */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{item.stuckParty}</div>
                        <div className="text-[10px] text-slate-400">{item.actionNeeded}</div>
                      </td>

                      {/* Principal Intervention Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {/* If paper uploaded, can inspect paper */}
                        {item.paper && (
                          <button
                            onClick={() => setPreviewPaper(item.paper || null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                            title="Inspect submitted question paper"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Paper</span>
                          </button>
                        )}

                        {/* If QA reviewed, can view QA verdict */}
                        {item.paper?.qaReview && (
                          <button
                            onClick={() => setInspectQAPaper(item.paper || null)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                            title="Inspect QA Rubric & Feedback Notes"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>QA Notes</span>
                          </button>
                        )}

                        {/* 1-Click WhatsApp Direct Notification */}
                        {item.stage !== 'fully_scheduled' && (
                          <button
                            onClick={() => {
                              const targetTeacherId =
                                item.stuckPartyId ||
                                (item.stuckPartyRole === 'teacher'
                                  ? teachers.find(t => t.name === item.stuckParty)?.id
                                  : undefined);
                              setWhatsAppModalState({
                                isOpen: true,
                                initialTeacherId: targetTeacherId,
                                initialTemplateType:
                                  item.stage === 'stuck_at_teacher_revision'
                                    ? 'qa_revision'
                                    : 'paper_reminder',
                                initialCourseCode: item.course.code,
                                initialCustomNotes: item.actionNeeded,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
                            title="Send 1-Click WhatsApp Notification to Faculty"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {/* Send Expedite Directive (if stuck) */}
                        {item.stage !== 'fully_scheduled' && (
                          <button
                            onClick={() => {
                              setExpediteItem(item);
                              setExpediteCustomNote(
                                `Office of the Principal: Course paper submission for ${item.course.code} (${item.course.title}) is currently held up at stage: ${item.stageLabel}. Please take immediate action.`
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                            title="Dispatch urgent administrative notice to stalled party"
                          >
                            <Send className="w-3.5 h-3.5 text-rose-600" />
                            <span>Expedite</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Modal: Send Expedite Directive from Principal */}
      {/* ========================================================================= */}
      {expediteItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setExpediteItem(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between border-b border-rose-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 text-white rounded-lg">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Issue Administrative Expedite Notice</h3>
                  <p className="text-xs text-rose-200">
                    Direct executive notification from Principal to stalled party
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpediteItem(null)}
                className="text-rose-300 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendExpedite} className="p-6 space-y-4">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900">
                <div className="font-bold">Target Stakeholder: {expediteItem.stuckParty}</div>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  Stuck Stage: <strong>{expediteItem.stageLabel}</strong> ({expediteItem.course.code} &bull; {expediteItem.course.title})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Principal Executive Directive Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={expediteCustomNote}
                  onChange={e => setExpediteCustomNote(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="Enter specific instructions, cutoff hour, or compliance mandate..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExpediteItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!expediteItem) return;
                    const targetTeacherId =
                      expediteItem.stuckPartyId ||
                      (expediteItem.stuckPartyRole === 'teacher'
                        ? teachers.find(t => t.name === expediteItem.stuckParty)?.id
                        : undefined);
                    const currItem = expediteItem;
                    const note = expediteCustomNote;
                    setExpediteItem(null);
                    setWhatsAppModalState({
                      isOpen: true,
                      initialTeacherId: targetTeacherId,
                      initialTemplateType:
                        currItem.stage === 'stuck_at_teacher_revision'
                          ? 'qa_revision'
                          : 'paper_reminder',
                      initialCourseCode: currItem.course.code,
                      initialCustomNotes: note,
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                  title="Forward this urgent directive directly via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp (1-Click)</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Urgent Directive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Modal: Inspect QA Rubric & Feedback Notes */}
      {/* ========================================================================= */}
      {inspectQAPaper?.qaReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setInspectQAPaper(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">QA Paper Evaluation & Rubric Scores</h3>
                  <p className="text-xs text-slate-400">
                    {inspectQAPaper.courseCode} &mdash; {inspectQAPaper.courseTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectQAPaper(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-800">Evaluated By: </span>
                  <span className="text-slate-600">{inspectQAPaper.qaReview.reviewedBy}</span>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                      inspectQAPaper.qaReview.verdict === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Verdict: {inspectQAPaper.qaReview.verdict.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Rubric scores checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Institutional Quality Criteria:</h4>
                <div className="space-y-1.5">
                  {Object.entries(inspectQAPaper.qaReview.rubricScores).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-200"
                    >
                      <span className="text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          val ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {val ? 'Passed' : 'Deficient'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">QA Examiner Notes & Directives:</h4>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-serif leading-relaxed">
                  &ldquo;{inspectQAPaper.qaReview.feedbackNotes}&rdquo;
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInspectQAPaper(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Close Audit View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal with prefilled parameters */}
      <WhatsAppNotificationModal
        isOpen={whatsAppModalState.isOpen}
        onClose={() => setWhatsAppModalState(prev => ({ ...prev, isOpen: false }))}
        initialTeacherId={whatsAppModalState.initialTeacherId}
        initialTemplateType={whatsAppModalState.initialTemplateType}
        initialCourseCode={whatsAppModalState.initialCourseCode}
        initialCustomNotes={whatsAppModalState.initialCustomNotes}
      />
    </div>
  );
};
