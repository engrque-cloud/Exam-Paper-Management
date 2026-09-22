import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Phone,
  User,
  BookOpen,
  Clock,
  Calendar,
  AlertTriangle,
  ExternalLink,
  X,
  ShieldCheck,
  CheckCheck,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { TEACHER_PROFILES, COURSES_CATALOG } from '../../data/courses';
import { COLLEGE_METADATA } from '../../data/collegeData';
import { WhatsAppTemplates, openWhatsApp, cleanPhoneNumber } from '../../utils/whatsapp';
import { useExam } from '../../context/ExamContext';

export type WhatsAppTemplateType =
  | 'paper_reminder'
  | 'qa_revision'
  | 'invigilation'
  | 'result_overdue'
  | 'session_concluded'
  | 'custom';

interface WhatsAppNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTeacherId?: string;
  defaultTemplateType?: WhatsAppTemplateType;
  defaultCourseCode?: string;
  customData?: {
    feedbackNotes?: string;
    examDate?: string;
    shift?: string;
    hallName?: string;
    daysOverdue?: number;
    customMessage?: string;
    customTitle?: string;
  };
}

export const WhatsAppNotificationModal: React.FC<WhatsAppNotificationModalProps> = ({
  isOpen,
  onClose,
  defaultTeacherId,
  defaultTemplateType = 'paper_reminder',
  defaultCourseCode,
  customData,
}) => {
  const { globalDeadline, showToast, addNotification, currentRole } = useExam();

  // Selected recipient teacher
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    defaultTeacherId || TEACHER_PROFILES[0]?.id || ''
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [templateType, setTemplateType] = useState<WhatsAppTemplateType>(defaultTemplateType);

  // Template custom fields
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(
    defaultCourseCode || 'ENG-101'
  );
  const [feedbackNotes, setFeedbackNotes] = useState<string>(
    customData?.feedbackNotes || 'Please ensure Section B conceptual questions align with Bloom taxonomy levels 3 and 4.'
  );
  const [examDate, setExamDate] = useState<string>(customData?.examDate || '2026-10-24');
  const [examShift, setExamShift] = useState<string>(
    customData?.shift || 'Morning (09:00 AM – 12:00 PM)'
  );
  const [examHall, setExamHall] = useState<string>(customData?.hallName || 'Auditorium Hall A (Ground Floor)');
  const [dutyRole, setDutyRole] = useState<string>('Assistant Invigilator');
  const [daysOverdue, setDaysOverdue] = useState<number>(customData?.daysOverdue || 18);
  const [customTitle, setCustomTitle] = useState<string>(customData?.customTitle || 'Urgent Faculty Meeting');
  const [customMessage, setCustomMessage] = useState<string>(
    customData?.customMessage ||
      'All department heads and senior examiners are requested to assemble in the Principal Conference Room on Monday at 10:30 AM for moderation review.'
  );

  const [copied, setCopied] = useState(false);

  // Synchronize defaults on modal open or prop change
  useEffect(() => {
    if (defaultTeacherId) {
      setSelectedTeacherId(defaultTeacherId);
    }
    if (defaultTemplateType) {
      setTemplateType(defaultTemplateType);
    }
    if (defaultCourseCode) {
      setSelectedCourseCode(defaultCourseCode);
    }
    if (customData?.feedbackNotes) {
      setFeedbackNotes(customData.feedbackNotes);
    }
  }, [defaultTeacherId, defaultTemplateType, defaultCourseCode, customData]);

  // Current Teacher Profile
  const currentTeacher = useMemo(() => {
    return TEACHER_PROFILES.find((t) => t.id === selectedTeacherId) || TEACHER_PROFILES[0];
  }, [selectedTeacherId]);

  // Sync phone number when teacher changes
  useEffect(() => {
    if (currentTeacher?.whatsappNumber) {
      setPhoneNumber(currentTeacher.whatsappNumber);
    } else if (currentTeacher?.phone) {
      setPhoneNumber(currentTeacher.phone);
    }
  }, [currentTeacher]);

  // Current Selected Course
  const currentCourse = useMemo(() => {
    return (
      COURSES_CATALOG.find((c) => c.code === selectedCourseCode) ||
      COURSES_CATALOG.find((c) => c.subject === currentTeacher?.department) ||
      COURSES_CATALOG[0]
    );
  }, [selectedCourseCode, currentTeacher]);

  // Calculate days left to deadline
  const daysLeft = useMemo(() => {
    try {
      const now = new Date();
      const target = new Date(`${globalDeadline.deadlineDate}T${globalDeadline.deadlineTime || '23:59'}:00`);
      const diffTime = target.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return 4;
    }
  }, [globalDeadline]);

  // Generate Message Text based on selected template
  const generatedMessage = useMemo(() => {
    const teacherName = currentTeacher?.name || 'Faculty Member';
    const courseCode = currentCourse?.code || 'ENG-101';
    const courseTitle = currentCourse?.title || 'Subject Paper';
    const dept = currentTeacher?.department || 'Department';

    switch (templateType) {
      case 'paper_reminder':
        return WhatsAppTemplates.paperSubmissionReminder({
          teacherName,
          courseCode,
          courseTitle,
          department: dept,
          deadlineDate: globalDeadline.deadlineDate,
          deadlineTime: globalDeadline.deadlineTime,
          daysLeft,
        });

      case 'qa_revision':
        return WhatsAppTemplates.qaRevisionNotice({
          teacherName,
          courseCode,
          courseTitle,
          reviewerName: 'Dr. Tahira Jabeen (QA Convener)',
          feedbackNotes: feedbackNotes || 'Please review Section B formatting.',
        });

      case 'invigilation':
        return WhatsAppTemplates.invigilationDuty({
          teacherName,
          examDate,
          shift: examShift,
          hallName: examHall,
          courseCode,
          courseTitle,
          role: dutyRole,
        });

      case 'result_overdue':
        return WhatsAppTemplates.resultOverdueNotice({
          teacherName,
          courseCode,
          courseTitle,
          daysOverdue,
        });

      case 'session_concluded':
        return WhatsAppTemplates.sessionConcludedNotice({
          sessionName: 'Fall 2026',
          totalCourses: 64,
          gazettedResults: 64,
        });

      case 'custom':
      default:
        return WhatsAppTemplates.customNotice({
          recipientName: teacherName,
          title: customTitle,
          message: customMessage,
          senderName: 'Prof. Dr. Bilquis Jahan (Principal)',
        });
    }
  }, [
    templateType,
    currentTeacher,
    currentCourse,
    globalDeadline,
    daysLeft,
    feedbackNotes,
    examDate,
    examShift,
    examHall,
    dutyRole,
    daysOverdue,
    customTitle,
    customMessage,
  ]);

  // Strictly restrict WhatsApp modal to Admin and Principal sections
  if (!isOpen || (currentRole !== 'admin' && currentRole !== 'principal')) {
    return null;
  }

  const handleSendWhatsApp = () => {
    if (currentRole !== 'admin' && currentRole !== 'principal') {
      showToast('WhatsApp dispatch is restricted to Admin and Principal sections.', 'error');
      return;
    }

    if (!phoneNumber) {
      showToast('Please specify a valid recipient WhatsApp phone number.', 'error');
      return;
    }

    openWhatsApp(phoneNumber, generatedMessage);

    // Record institutional paper trail
    addNotification({
      title: `WhatsApp Dispatched to ${currentTeacher?.name}`,
      message: `Direct 1-Click WhatsApp official message sent for ${currentCourse?.code} (${templateType.replace('_', ' ').toUpperCase()}).`,
      type: 'info',
      category: 'paper',
      targetRole: 'all',
    });

    showToast(`WhatsApp opened for ${currentTeacher?.name}!`, 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    showToast('WhatsApp message copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-emerald-200/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white p-5 sm:p-6 border-b border-emerald-200/80 flex items-center justify-between text-slate-900 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Admin &amp; Principal Section Only
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">&bull; WhatsApp Click-to-Chat</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Official WhatsApp Notification Dispatcher
              </h2>
              <p className="text-xs text-emerald-700 font-medium">
                {COLLEGE_METADATA.institutionName} · Regulatory Communication Hub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content: Two Columns */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
          {/* Left Column: Form & Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Recipient Teacher Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Select Recipient Faculty Member
                </span>
                <span className="text-[10px] text-slate-500">
                  {TEACHER_PROFILES.length} Active Faculty
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {TEACHER_PROFILES.map((t) => {
                  const isSelected = t.id === selectedTeacherId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTeacherId(t.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${t.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                        {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate text-[11px] text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{t.department}</div>
                        <div className="text-[9px] text-emerald-700 font-mono truncate">{t.whatsappNumber || t.phone}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Target WhatsApp Number (E.164 Format)
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                  Cleaned: {cleanPhoneNumber(phoneNumber)}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                  <Smartphone className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp Verified</span>
                </div>
              </div>
            </div>

            {/* 2. Notification Template Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Select Official Institutional Template
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'paper_reminder',
                    label: 'Paper Submission',
                    icon: Clock,
                    desc: 'Cutoff reminder',
                    color: 'text-amber-600',
                  },
                  {
                    id: 'qa_revision',
                    label: 'QA Revision Notice',
                    icon: AlertTriangle,
                    desc: 'Moderation feedback',
                    color: 'text-teal-600',
                  },
                  {
                    id: 'invigilation',
                    label: 'Invigilation Duty',
                    icon: Calendar,
                    desc: 'Exam date & shift',
                    color: 'text-indigo-600',
                  },
                  {
                    id: 'result_overdue',
                    label: 'Overdue Results',
                    icon: AlertTriangle,
                    desc: '15-day delay warning',
                    color: 'text-rose-600',
                  },
                  {
                    id: 'session_concluded',
                    label: 'Session Archived',
                    icon: ShieldCheck,
                    desc: 'Final gazette seal',
                    color: 'text-emerald-600',
                  },
                  {
                    id: 'custom',
                    label: 'Custom Notice',
                    icon: MessageSquare,
                    desc: 'Ad-hoc notification',
                    color: 'text-slate-600',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = templateType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTemplateType(item.id as WhatsAppTemplateType)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        active
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span className="text-[11px] font-bold">{item.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Dynamic Template Inputs */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Template Parameters
              </span>

              {/* Course Selector (for paper & result templates) */}
              {(templateType === 'paper_reminder' ||
                templateType === 'qa_revision' ||
                templateType === 'result_overdue' ||
                templateType === 'invigilation') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-700">Course Paper</label>
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {COURSES_CATALOG.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} ({c.subject} · Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* QA Feedback Textarea */}
              {templateType === 'qa_revision' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-700">QA Feedback &amp; Revision Instructions</label>
                  <textarea
                    rows={2}
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    placeholder="Enter specific revision directives..."
                  />
                </div>
              )}

              {/* Invigilation Parameters */}
              {templateType === 'invigilation' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-700">Exam Conduction Date</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-700">Shift &amp; Timings</label>
                    <select
                      value={examShift}
                      onChange={(e) => setExamShift(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Morning (09:00 AM – 12:00 PM)">Morning (09:00 AM – 12:00 PM)</option>
                      <option value="Evening (02:00 PM – 05:00 PM)">Evening (02:00 PM – 05:00 PM)</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-700">Examination Center / Hall</label>
                    <input
                      type="text"
                      value={examHall}
                      onChange={(e) => setExamHall(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Overdue Days */}
              {templateType === 'result_overdue' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-700">Days Past University 15-Day Target</label>
                  <input
                    type="number"
                    value={daysOverdue}
                    onChange={(e) => setDaysOverdue(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Custom Notice fields */}
              {templateType === 'custom' && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-700">Notice Subject / Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-700">Notice Body</label>
                    <textarea
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live WhatsApp Chat Mock Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Live WhatsApp Message Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-medium">
                  {generatedMessage.length} chars
                </span>
              </div>

              {/* Mock WhatsApp Device Container */}
              <div className="rounded-2xl overflow-hidden border border-emerald-950/20 bg-[#0b141a] shadow-xl flex flex-col text-slate-200">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#202c33] px-3.5 py-2.5 flex items-center justify-between border-b border-[#2a3942]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentTeacher?.name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                        <span>{currentTeacher?.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {currentTeacher?.whatsappNumber || currentTeacher?.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] bg-[#111b21] px-2 py-0.5 rounded text-emerald-400 font-bold border border-emerald-500/20">
                      WhatsApp Web
                    </span>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div className="p-3.5 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] min-h-[300px] max-h-[360px] overflow-y-auto space-y-2">
                  <div className="flex justify-center">
                    <span className="text-[10px] bg-[#182229] text-slate-400 px-2.5 py-1 rounded-md shadow-sm">
                      TODAY
                    </span>
                  </div>

                  {/* Outgoing Message Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[95%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-sm p-3 shadow-md text-xs relative leading-relaxed font-sans">
                      <div className="whitespace-pre-wrap select-text text-[11.5px]">
                        {generatedMessage}
                      </div>

                      <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/70 mt-1">
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCheck className="w-3 h-3 text-cyan-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition active:scale-98"
              >
                <MessageSquare className="w-5 h-5 text-white fill-current" />
                <span>Send via WhatsApp (1-Click)</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Message'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 text-xs shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-configuration direct protocol: Automatically opens WhatsApp Web or WhatsApp Desktop.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
