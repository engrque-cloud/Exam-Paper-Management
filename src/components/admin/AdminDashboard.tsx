import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber, Course } from '../../types';
import { CurriculumManagement } from './CurriculumManagement';
import { DateSheetDutyManager } from './DateSheetDutyManager';
import {
  Send,
  FileUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Search,
  BookOpen,
  Filter,
  Eye,
  BellRing,
  Info,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
  ShieldCheck,
  Check,
  X,
  ShieldAlert,
  GraduationCap,
  MessageSquare,
  Phone,
  Mail,
  Copy,
  CheckCheck,
  ExternalLink,
  KeyRound,
} from 'lucide-react';
import { WhatsAppNotificationModal } from '../common/WhatsAppNotificationModal';
import {
  WhatsAppTemplateType,
  openWhatsApp,
  formatDisplayPhone,
  openMailClient,
  generateApprovalEmailContent,
} from '../../utils/whatsapp';
import { UserAccount } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    papers,
    adminSendCallNotification,
    setPreviewPaper,
    teachers,
    globalDeadline,
    updateGlobalDeadline,
    deadlineStatus,
    setIsDeadlineModalOpen,
    userAccounts,
    approveUserId,
    rejectUserId,
    pendingUsersCount,
    setUserIdPending,
    markUserWhatsAppSent,
    collegeName,
    subjects,
    semesters,
    courses,
  } = useExam();

  // Admin Top-level Tab state: 'datesheet' vs 'matrix' vs 'approvals' vs 'curriculum'
  const [activeAdminTab, setActiveAdminTab] = useState<'datesheet' | 'matrix' | 'approvals' | 'curriculum'>('datesheet');

  // User Approvals Filter & State
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Credentials & WhatsApp Modal state
  const [credentialsModalUser, setCredentialsModalUser] = useState<UserAccount | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Call Notification Form state
  const [showCallModal, setShowCallModal] = useState(false);
  const [targetSubject, setTargetSubject] = useState<SubjectType | 'All'>('All');
  const [targetSemester, setTargetSemester] = useState<SemesterNumber | 'All'>('All');
  const [targetTeacherId, setTargetTeacherId] = useState<string>('all');
  const [deadline, setDeadline] = useState<string>(globalDeadline.deadlineDate);
  const [title, setTitle] = useState<string>(
    'URGENT: Submit Final Examination Papers (PDF / DOCX Format)'
  );
  const [instructions, setInstructions] = useState<string>(
    'In accordance with University Examination Regulations, all assigned course faculty are instructed to upload complete question papers strictly in PDF or DOCX format. Ensure total marks tally with syllabus specifications and questions adhere to Bloom\'s Cognitive Taxonomy.'
  );

  // Matrix Filter state
  const [matrixSubject, setMatrixSubject] = useState<SubjectType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // WhatsApp Notification modal state
  const [whatsAppModalState, setWhatsAppModalState] = useState<{
    isOpen: boolean;
    initialTeacherId?: string;
    initialTemplateType?: WhatsAppTemplateType;
    initialCourseCode?: string;
    initialCustomNotes?: string;
  }>({ isOpen: false });

  // Handle Send Call
  const handleSendCall = (e: React.FormEvent) => {
    e.preventDefault();
    adminSendCallNotification({
      title,
      message: instructions,
      subject: targetSubject,
      semester: targetSemester,
      targetTeacherId: targetTeacherId !== 'all' ? targetTeacherId : undefined,
      deadline,
    });
    setShowCallModal(false);
  };

  // Stats calculation
  const totalCoursesCount = courses.length;
  const submittedCount = papers.length;
  const approvedCount = papers.filter(p => p.status === 'qa_approved').length;
  const inQACount = papers.filter(p => p.status === 'pending_qa').length;
  const rejectedCount = papers.filter(p => p.status === 'qa_rejected').length;

  // Filtered Users list
  const filteredUsers = userAccounts.filter(u => {
    if (approvalStatusFilter === 'pending' && u.approvalStatus !== 'pending') return false;
    if (approvalStatusFilter === 'approved' && u.approvalStatus !== 'approved') return false;
    if (approvalStatusFilter === 'rejected' && u.approvalStatus !== 'rejected') return false;
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle reject user submit
  const handleConfirmReject = () => {
    if (!rejectingUserId) return;
    rejectUserId(rejectingUserId, rejectionReasonInput || 'ID credentials could not be verified by Examination Controller.');
    setRejectingUserId(null);
    setRejectionReasonInput('');
  };

  // Find paper for a given course
  const getPaperForCourse = (courseCode: string) => {
    return papers.find(p => p.courseCode === courseCode);
  };

  // Filtered courses for the matrix
  const filteredCourses = courses.filter(c => {
    if (matrixSubject !== 'All' && c.subject !== matrixSubject) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Button */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white rounded-2xl p-6 text-slate-900 shadow-sm border border-emerald-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                Examination Regulatory Office
              </span>
              <span className="text-slate-500 text-xs">&bull; Fall 2026 Conduction</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              Admin &amp; Exam Controller Dashboard
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Dispatch official paper submission calls to faculty, monitor 32 semester courses across English, Islamic Studies, Sociology, and Zoology, and ensure timely QA certification.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="admin-dispatch-notice-btn"
              onClick={() => setShowCallModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm shadow-emerald-600/20 transition active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Paper Submission Notice</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-emerald-200/60">
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Total Courses</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCoursesCount}</span>
            <span className="text-[11px] text-slate-400">4 Depts &bull; 8 Semesters</span>
          </div>
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">Papers Uploaded</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{submittedCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">
              {Math.round((submittedCount / totalCoursesCount) * 100)}% Coverage
            </span>
          </div>
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">In QA Review</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{inQACount}</span>
            <span className="text-[11px] text-amber-600/90 font-medium">Awaiting QA Check</span>
          </div>
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">QA Approved</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">{approvedCount}</span>
            <span className="text-[11px] text-emerald-700 font-medium">Date Sheet Ready</span>
          </div>
          <div className="p-3 bg-white/90 rounded-xl border border-emerald-100/90 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold block">QA Rejected</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{rejectedCount}</span>
            <span className="text-[11px] text-rose-600/90 font-medium">Re-upload Pending</span>
          </div>
        </div>
      </div>

      {/* GLOBAL PAPER SUBMISSION REGULATORY DEADLINE CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Global Paper Submission Deadline (Last Date)
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    deadlineStatus.isPassed
                      ? 'bg-rose-100 text-rose-800'
                      : deadlineStatus.isUrgent
                      ? 'bg-amber-100 text-amber-800 font-extrabold'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {deadlineStatus.isPassed
                    ? 'Cutoff Passed'
                    : deadlineStatus.isUrgent
                    ? 'Approaching Cutoff'
                    : 'Window Open'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Official Last Date: <strong className="text-slate-900">{deadlineStatus.formattedDate}</strong> at{' '}
                <strong className="text-slate-900">{globalDeadline.deadlineTime}</strong> ({globalDeadline.timezone}).
                Policy: <span className="font-medium text-slate-700">{globalDeadline.allowLateSubmissions ? `Late submissions accepted with ${globalDeadline.gracePeriodDays} days grace period` : 'Strict cutoff - late submissions barred'}</span>.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Notice: "{globalDeadline.announcementNotes}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Extension Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500 font-medium px-2 hidden sm:inline">Extend:</span>
              <button
                type="button"
                onClick={() => {
                  const curr = new Date(globalDeadline.deadlineDate);
                  curr.setDate(curr.getDate() + 3);
                  updateGlobalDeadline({ deadlineDate: curr.toISOString().split('T')[0] });
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 shadow-2xs transition"
                title="Extend deadline by 3 days"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  const curr = new Date(globalDeadline.deadlineDate);
                  curr.setDate(curr.getDate() + 7);
                  updateGlobalDeadline({ deadlineDate: curr.toISOString().split('T')[0] });
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 shadow-2xs transition"
                title="Extend deadline by 7 days"
              >
                +7 Days (1 Wk)
              </button>
            </div>

            {/* Open Full Deadline Configuration Modal */}
            <button
              id="admin-open-deadline-settings-btn"
              onClick={() => setIsDeadlineModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Configure Deadline</span>
            </button>

            {/* Direct 1-Click WhatsApp Dispatcher */}
            <button
              id="admin-open-whatsapp-dispatch-btn"
              onClick={() =>
                setWhatsAppModalState({
                  isOpen: true,
                  initialTemplateType: 'paper_reminder',
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs"
              title="Open Direct 1-Click WhatsApp Notification Dispatcher"
            >
              <MessageSquare className="w-3.5 h-3.5 text-white fill-white/20" />
              <span>WhatsApp Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-emerald-100 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex-wrap">
          <button
            id="admin-tab-datesheet"
            onClick={() => setActiveAdminTab('datesheet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeAdminTab === 'datesheet'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/50'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>1. Date Sheet &amp; Teacher Duties (5-Day Cutoff &amp; WhatsApp)</span>
          </button>

          <button
            id="admin-tab-matrix"
            onClick={() => setActiveAdminTab('matrix')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeAdminTab === 'matrix'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/50'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>2. Course Submission Matrix (32 Semesters)</span>
          </button>

          <button
            id="admin-tab-approvals"
            onClick={() => setActiveAdminTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeAdminTab === 'approvals'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/50'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>3. User ID Approvals &amp; Access Control</span>
            {pendingUsersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-xs animate-pulse">
                {pendingUsersCount} Pending
              </span>
            )}
          </button>

          <button
            id="admin-tab-curriculum"
            onClick={() => setActiveAdminTab('curriculum')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeAdminTab === 'curriculum'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/50'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>4. Curriculum (Add Subjects, Semesters &amp; Credit Hours)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Registered Accounts: <strong className="text-slate-800">{userAccounts.length}</strong> &bull; Subjects: <strong className="text-purple-700">{subjects.length}</strong> &bull; Total Courses: <strong className="text-indigo-600">{courses.length}</strong>
        </div>
      </div>

      {/* Tab 1: Date Sheet, Teacher Duties & 5-Day Upload Deadline */}
      {activeAdminTab === 'datesheet' && <DateSheetDutyManager />}

      {/* Main Content Area: Submission Matrix across Subjects & Semesters */}
      {activeAdminTab === 'matrix' && (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              Examination Paper Submission Matrix ({totalCoursesCount} Semesters & Courses)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive tracker for institutional subjects and active semesters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setMatrixSubject('All')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  matrixSubject === 'All'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({subjects.length} Depts)
              </button>
              {subjects.map(subj => (
                <button
                  key={subj}
                  onClick={() => setMatrixSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    matrixSubject === subj
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search course code or title..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Subject & Semester</th>
                <th className="px-4 py-3">Course Code & Title</th>
                <th className="px-4 py-3">Assigned Faculty</th>
                <th className="px-4 py-3">Submission Status</th>
                <th className="px-4 py-3">File Format</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCourses.map(course => {
                const paper = getPaperForCourse(course.code);
                return (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{course.subject}</div>
                      <span className="text-[10px] inline-flex px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 mt-0.5">
                        Semester {course.semester}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mr-2 text-[11px]">
                        {course.code}
                      </span>
                      <span className="font-medium text-slate-800">{course.title}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {paper ? (
                        <div>
                          <p className="font-medium text-slate-800">{paper.teacherName}</p>
                          <p className="text-[10px] text-slate-400">{paper.teacherEmail}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Department Faculty</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {paper ? (
                        paper.status === 'qa_approved' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            QA Approved (Ready)
                          </span>
                        ) : paper.status === 'qa_rejected' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            QA Rejected (Revise)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            In QA Review
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Pending Upload
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {paper ? (
                        <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {paper.file.type} &bull; v{paper.version}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">PDF / DOCX</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {paper ? (
                        <button
                          onClick={() => setPreviewPaper(paper)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              // Find teacher assigned to this course
                              const assignedTeacher =
                                teachers.find(
                                  t =>
                                    t.department === course.subject &&
                                    t.assignedSemesters.includes(course.semester)
                                ) ||
                                teachers.find(t => t.department === course.subject) ||
                                teachers[0];
                              setWhatsAppModalState({
                                isOpen: true,
                                initialTeacherId: assignedTeacher?.id,
                                initialCourseCode: course.code,
                                initialTemplateType: 'paper_reminder',
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 font-bold transition"
                            title="Direct 1-Click WhatsApp Reminder to Faculty"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => {
                              setTargetSubject(course.subject);
                              setTargetSemester(course.semester);
                              setTitle(`Call Notice: Submit Exam Paper for ${course.code} - ${course.title}`);
                              setShowCallModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg border border-slate-200 transition"
                            title="Send targeted paper call notice"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                            <span>Notice</span>
                          </button>
                        </div>
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
      {/* TAB 2: USER & FACULTY ID APPROVALS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'approvals' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Faculty & User ID Verification Center
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin verification authority to review, approve, or reject registered teacher, QA checker, and staff accounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setApprovalStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  approvalStatusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Accounts ({userAccounts.length})
              </button>
              <button
                onClick={() => setApprovalStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  approvalStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending ({pendingUsersCount})</span>
              </button>
              <button
                onClick={() => setApprovalStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  approvalStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved</span>
              </button>
              <button
                onClick={() => setApprovalStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  approvalStatusFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Rejected</span>
              </button>
            </div>
          </div>

          {/* Pending Alert Callout */}
          {pendingUsersCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">
                    {pendingUsersCount} User ID{pendingUsersCount > 1 ? 's' : ''} Awaiting Admin Approval
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Newly registered teachers and staff require official credential authorization before they can upload papers or conduct evaluations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalStatusFilter('pending')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shrink-0 shadow-xs transition"
              >
                Review Pending
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Search user name, email, department or role..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Users List Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Faculty / User</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Mobile / WhatsApp</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Verification & Credentials</th>
                  <th className="px-4 py-3 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const isPending = u.approvalStatus === 'pending';
                  const isApproved = u.approvalStatus === 'approved';
                  const isRejected = u.approvalStatus === 'rejected';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${u.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="uppercase text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {u.role}
                        </span>
                      </td>

                      {/* Mobile / WhatsApp */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatDisplayPhone(u.whatsappNumber || u.phone)}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {u.department ? (
                          <span className="font-semibold text-slate-800">{u.department}</span>
                        ) : (
                          <span className="text-slate-400 italic">Institutional Staff</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {isApproved && (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Approved & Verified
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {u.approvalEmailSent && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                                  <Mail className="w-3 h-3 text-indigo-600" /> Credentials Emailed
                                </span>
                              )}
                              {u.approvalWhatsAppSent && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Sent
                                </span>
                              )}
                            </div>
                            {u.approvedBy && (
                              <p className="text-[10px] text-slate-400">By {u.approvedBy}</p>
                            )}
                          </div>
                        )}

                        {isPending && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Awaiting Admin Approval
                            </span>
                            <p className="text-[10px] text-slate-500">
                              Approval will automatically email credentials to faculty.
                            </p>
                          </div>
                        )}

                        {isRejected && (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <UserX className="w-3.5 h-3.5 text-rose-600" />
                              Access Denied / Rejected
                            </span>
                            {u.rejectionReason && (
                              <p className="text-[10px] text-rose-600 mt-0.5 max-w-xs italic">
                                "{u.rejectionReason}"
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {/* If pending or rejected, show Approve button with auto credentials dialog */}
                        {(!isApproved || isRejected) && (
                          <button
                            id={`approve-user-${u.id}-btn`}
                            onClick={() => {
                              approveUserId(u.id);
                              setCredentialsModalUser({
                                ...u,
                                approvalStatus: 'approved',
                                approvalEmailSent: true,
                                approvalEmailSentAt: new Date().toISOString(),
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-2xs transition active:scale-95"
                            title="Authorize ID and dispatch credentials"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Dispatch</span>
                          </button>
                        )}

                        {/* If approved, show WhatsApp Credentials button */}
                        {isApproved && (
                          <button
                            onClick={() => setCredentialsModalUser(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 shadow-2xs transition active:scale-95"
                            title="View credentials or send WhatsApp message"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Credentials</span>
                          </button>
                        )}

                        {/* If pending or approved, show Reject button */}
                        {!isRejected && (
                          <button
                            id={`reject-user-${u.id}-btn`}
                            onClick={() => {
                              setRejectingUserId(u.id);
                              setRejectionReasonInput('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition active:scale-95"
                            title="Reject ID registration"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {/* Reset to Pending button */}
                        {(isApproved || isRejected) && (
                          <button
                            onClick={() => setUserIdPending(u.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                            title="Reset to pending verification"
                          >
                            <span>Reset</span>
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

      {/* Reject User ID Modal Dialog */}
      {rejectingUserId && (
        <div
          id="admin-reject-user-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setRejectingUserId(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5" />
                <h3 className="font-bold text-sm">Reject User Account Verification</h3>
              </div>
              <button
                onClick={() => setRejectingUserId(null)}
                className="text-white/80 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Please state the official reason for rejecting this account. The applicant will be notified and prevented from logging in until re-evaluated.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={e => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Employee ID does not match HR directory, or course assignment missing."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingUserId(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Credentials & WhatsApp Notification Modal */}
      {credentialsModalUser && (
        <div
          id="credentials-approval-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setCredentialsModalUser(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  Faculty ID Approved & Verified
                </div>
                <h3 className="font-bold text-lg text-white">
                  Official Account Credentials & WhatsApp Delivery
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {collegeName} · Institutional Examination Management System
                </p>
              </div>
              <button
                onClick={() => setCredentialsModalUser(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Faculty Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl ${credentialsModalUser.avatarColor || 'bg-emerald-700'} text-white flex items-center justify-center font-bold text-base shadow-xs`}
                  >
                    {credentialsModalUser.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{credentialsModalUser.name}</h4>
                    <p className="text-xs text-slate-500">
                      {credentialsModalUser.designation || credentialsModalUser.role.toUpperCase()}
                      {credentialsModalUser.department ? ` · Dept. of ${credentialsModalUser.department}` : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        <Mail className="w-3 h-3 text-slate-400" /> {credentialsModalUser.email}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {formatDisplayPhone(credentialsModalUser.whatsappNumber || credentialsModalUser.phone)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Official Email Dispatched */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-indigo-950">
                        1. Official Credentials Dispatched via Email
                      </h5>
                      <p className="text-[11px] text-indigo-700">
                        Official institutional notification generated for <span className="font-mono font-semibold">{credentialsModalUser.email}</span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
                    <CheckCheck className="w-3.5 h-3.5" /> Dispatched
                  </span>
                </div>

                {/* Credentials Box */}
                <div className="bg-white rounded-xl p-3.5 border border-indigo-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Portal URL</span>
                    <p className="text-xs font-mono font-semibold text-slate-800 truncate" title={window.location.origin}>
                      {window.location.origin}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Username (Email)</span>
                    <p className="text-xs font-mono font-bold text-indigo-900 truncate">
                      {credentialsModalUser.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Password</span>
                    <p className="text-xs font-mono font-bold text-rose-700">
                      {credentialsModalUser.password || 'Teacher@123'}
                    </p>
                  </div>
                </div>

                {/* Email Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const text = `Portal: ${window.location.origin}\nUsername: ${credentialsModalUser.email}\nPassword: ${credentialsModalUser.password || 'Teacher@123'}`;
                      navigator.clipboard.writeText(text);
                      setCopiedCredentials(true);
                      setTimeout(() => setCopiedCredentials(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition cursor-pointer"
                  >
                    {copiedCredentials ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Credentials Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const emailContent = generateApprovalEmailContent({
                        name: credentialsModalUser.name,
                        email: credentialsModalUser.email,
                        password: credentialsModalUser.password || 'Teacher@123',
                        role: credentialsModalUser.role,
                        department: credentialsModalUser.department,
                        approvedBy: credentialsModalUser.approvedBy,
                        portalUrl: window.location.origin,
                      });
                      openMailClient(credentialsModalUser.email, emailContent.subject, emailContent.body);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 rounded-xl transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Email App (mailto:)</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Send Credentials via WhatsApp */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-emerald-950">
                        2. Send Username & Password on WhatsApp (1-Click)
                      </h5>
                      <p className="text-[11px] text-emerald-700">
                        Sends official credentials and exam system instructions directly to mobile:
                        <span className="font-bold ml-1 font-mono">
                          {formatDisplayPhone(credentialsModalUser.whatsappNumber || credentialsModalUser.phone)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {credentialsModalUser.approvalWhatsAppSent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCheck className="w-3 h-3 text-emerald-600" /> Sent
                    </span>
                  )}
                </div>

                {/* WhatsApp Message Preview */}
                <div className="bg-white rounded-xl p-3 border border-emerald-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed shadow-2xs max-h-36 overflow-y-auto">
                  {`🏛️ *${collegeName.toUpperCase()}*\n*OFFICE OF CONTROLLER OF EXAMINATIONS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ *ACCOUNT APPROVED & ACTIVATED*\n\nDear *${credentialsModalUser.name}*,\nYour institutional faculty account has been approved and verified.\n\n🔑 *YOUR LOGIN CREDENTIALS:*\n• *Portal Link:* ${window.location.origin}\n• *Username:* ${credentialsModalUser.email}\n• *Password:* ${credentialsModalUser.password || 'Teacher@123'}\n• *Assigned Role:* ${credentialsModalUser.role.toUpperCase()}\n\n📝 *INSTRUCTIONS:*\n1. Open the portal and log in with your credentials above.\n2. Upload examination question papers before the designated deadline.\n3. Questions must adhere to Bloom's taxonomy guidelines.`}
                </div>

                {/* WhatsApp Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    const message = `🏛️ *${collegeName.toUpperCase()}*\n*OFFICE OF CONTROLLER OF EXAMINATIONS*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ *ACCOUNT APPROVED & ACTIVATED*\n\nDear *${credentialsModalUser.name}*,\nYour institutional faculty account has been approved and verified.\n\n🔑 *YOUR LOGIN CREDENTIALS:*\n• *Portal Link:* ${window.location.origin}\n• *Username:* ${credentialsModalUser.email}\n• *Password:* ${credentialsModalUser.password || 'Teacher@123'}\n• *Assigned Role:* ${credentialsModalUser.role.toUpperCase()}\n\n📝 *INSTRUCTIONS:*\n1. Open the portal and log in with your credentials above.\n2. Upload examination question papers before the designated deadline.\n3. Questions must adhere to Bloom's taxonomy guidelines.\n\nFor assistance, contact the Controller of Examinations.`;
                    const targetNum = credentialsModalUser.whatsappNumber || credentialsModalUser.phone || '+923008371920';
                    openWhatsApp(targetNum, message);
                    markUserWhatsAppSent(credentialsModalUser.id);
                    setCredentialsModalUser(prev => (prev ? { ...prev, approvalWhatsAppSent: true } : null));
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Login Credentials via WhatsApp to {credentialsModalUser.name}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setCredentialsModalUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Curriculum Management (Add Subjects, Semesters & Credit Hours) */}
      {activeAdminTab === 'curriculum' && <CurriculumManagement />}

      {/* Modal for Admin to Dispatch Paper Submission Call */}
      {showCallModal && (
        <div
          id="admin-call-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowCallModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Issue Paper Submission Notice</h3>
                  <p className="text-xs text-slate-400">
                    Notifies teachers to upload examination papers in PDF or DOCX format
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendCall} className="p-6 space-y-4">
              {/* Notice Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Notice Heading
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Target Department & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Department / Subject
                  </label>
                  <select
                    value={targetSubject}
                    onChange={e => setTargetSubject(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="All">All Departments ({subjects.join(', ')})</option>
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={targetSemester}
                    onChange={e => setTargetSemester(e.target.value === 'All' ? 'All' : Number(e.target.value) as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="All">All Active Semesters</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specific Teacher & Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faculty Recipient
                  </label>
                  <select
                    value={targetTeacherId}
                    onChange={e => setTargetTeacherId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="all">Broadcast to All Department Teachers</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submission Instructions / Guidelines */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Submission Instructions & Format Guidelines
                </label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans"
                />
              </div>

              {/* Requirement Hint Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Accepted formats: <strong>PDF and DOCX</strong>. Upon upload by teacher, papers enter the QA Paper Checker queue for syllabus and marks validation.
                </p>
              </div>

              {/* Footer buttons */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCallModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const teacherId = targetTeacherId !== 'all' ? targetTeacherId : undefined;
                    const noticeText = instructions;
                    setShowCallModal(false);
                    setWhatsAppModalState({
                      isOpen: true,
                      initialTeacherId: teacherId,
                      initialTemplateType: 'paper_reminder',
                      initialCustomNotes: noticeText,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  title="Dispatch this notice directly to faculty via WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp (1-Click)</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  Broadcast Official Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
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
