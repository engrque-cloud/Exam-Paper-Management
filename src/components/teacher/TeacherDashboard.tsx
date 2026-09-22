import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  SubjectType,
  SemesterNumber,
  ExamPaper,
  PaperFile,
  PaperQuestionSection,
  Course,
} from '../../types';
import {
  getSampleQuestionsForCourse,
} from '../../data/courses';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  FileCheck,
  User,
  Building2,
  Shield,
  CalendarCheck,
  Timer,
  Printer,
} from 'lucide-react';
import { computePaperUploadDeadline, formatReadableDate } from '../../utils/whatsapp';
import { PrintableDateSheetModal } from '../admin/PrintableDateSheetModal';

export const TeacherDashboard: React.FC = () => {
  const {
    currentTeacher,
    setTeacherId,
    teachers,
    papers,
    notifications,
    submitNewPaper,
    reuploadRevisedPaper,
    setPreviewPaper,
    globalDeadline,
    deadlineStatus,
    setIsDeadlineModalOpen,
    subjects,
    semesters,
    courses,
    dateSheetRows,
    paperUploadDaysBefore,
  } = useExam();

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [selectedPaperForReupload, setSelectedPaperForReupload] = useState<ExamPaper | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New paper form state
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>(currentTeacher.department);
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber>(
    currentTeacher.assignedSemesters[0] || 1
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [examType, setExamType] = useState<ExamPaper['examType']>('Final Term Examination');
  const [creditHours, setCreditHours] = useState<number>(3);
  const [uploadedFile, setUploadedFile] = useState<PaperFile | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Re-upload form state
  const [reuploadFile, setReuploadFile] = useState<PaperFile | null>(null);
  const [reuploadNotes, setReuploadNotes] = useState<string>('');
  const [reuploadSections, setReuploadSections] = useState<PaperQuestionSection[]>([]);

  // Find courses matching selected subject & semester
  const availableCourses = courses.filter(
    c => c.subject === selectedSubject && Number(c.semester) === Number(selectedSemester)
  );

  // Selected course object
  const currentCourse = courses.find(c => c.id === selectedCourseId) || availableCourses[0];

  // Sync available course when subject/semester changes
  React.useEffect(() => {
    if (availableCourses.length > 0) {
      const match = availableCourses.find(c => c.id === selectedCourseId) || availableCourses[0];
      setSelectedCourseId(match.id);
      setCreditHours(match.creditHours || 3);
    }
  }, [selectedSubject, selectedSemester, courses]);

  // When opening upload modal, prepare file and pre-populate metadata
  const openNewUploadModal = (prefillCourse?: Course) => {
    const courseToUse = prefillCourse || availableCourses[0] || courses[0];
    if (courseToUse) {
      setSelectedSubject(courseToUse.subject);
      setSelectedSemester(courseToUse.semester);
      setSelectedCourseId(courseToUse.id);
      setCreditHours(courseToUse.creditHours || 3);
      setUploadedFile({
        name: `${courseToUse.code}_Exam_Question_Paper_${new Date().getFullYear()}.pdf`,
        type: 'pdf',
        sizeKb: Math.floor(Math.random() * 200) + 150,
        uploadedAt: new Date().toISOString(),
      });
    } else {
      setSelectedSubject(subjects[0] || 'English');
      setSelectedSemester(semesters[0] || 1);
      setSelectedCourseId('');
      setCreditHours(3);
      setUploadedFile({
        name: `Exam_Question_Paper_${new Date().getFullYear()}.pdf`,
        type: 'pdf',
        sizeKb: 180,
        uploadedAt: new Date().toISOString(),
      });
    }
    setShowUploadModal(true);
  };

  // Open re-upload modal for rejected paper
  const openReuploadModal = (paper: ExamPaper) => {
    setSelectedPaperForReupload(paper);
    // Create fixed questions resolving previous QA objections (e.g. marks sum to 50)
    const fixedSections = JSON.parse(JSON.stringify(paper.sections || [])) as PaperQuestionSection[];
    if (paper.courseCode === 'SOC-401' && fixedSections.length > 0) {
      // Fix SOC-401 marks to equal 50 and add elective choice
      fixedSections[0].marks = 20;
      fixedSections[0].questions = [
        { qNum: 'Q1', text: 'Define sampling bias and explain simple random vs stratified sampling.', marks: 10 },
        { qNum: 'Q2', text: 'Differentiate between independent, dependent, and confounding variables with sociological examples.', marks: 10 },
      ];
      if (fixedSections[1]) {
        fixedSections[1].marks = 30;
        fixedSections[1].instructions = 'Attempt any 2 of 3 questions. (15 marks each)';
        fixedSections[1].questions = [
          { qNum: 'Q3', text: 'Design an empirical survey measuring digital inequality across rural school districts.', marks: 15 },
          { qNum: 'Q4', text: 'Critique the validity of participant observation in high-density urban environments.', marks: 15 },
          { qNum: 'Q5', text: 'Evaluate ethical protocols when conducting qualitative research with vulnerable demographics.', marks: 15 },
        ];
      }
    }
    setReuploadSections(fixedSections);
    setReuploadFile({
      name: `${paper.courseCode}_Final_Exam_Revised_v${paper.version + 1}.pdf`,
      type: 'pdf',
      sizeKb: 310,
      uploadedAt: new Date().toISOString(),
    });
    setReuploadNotes(
      'Adjusted marks tally and added candidate instructions header as requested by QA.'
    );
    setShowReuploadModal(true);
  };

  // Handle new paper submit (simplified: subject, semester, course code, exam type, credit hours)
  const handleCreatePaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse) return;

    const fileToUse = uploadedFile || {
      name: `${currentCourse.code}_Exam_Paper.pdf`,
      type: 'pdf',
      sizeKb: 280,
      uploadedAt: new Date().toISOString(),
    };

    submitNewPaper({
      courseCode: currentCourse.code,
      courseTitle: currentCourse.title,
      subject: selectedSubject,
      semester: selectedSemester,
      examType,
      creditHours: creditHours || currentCourse.creditHours || 3,
      academicSession: 'Fall 2026',
      totalMarks: 50,
      durationMinutes: 120,
      file: fileToUse,
    });

    setShowUploadModal(false);
  };

  // Handle re-upload submit
  const handleReuploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaperForReupload || !reuploadFile) return;

    reuploadRevisedPaper(
      selectedPaperForReupload.id,
      reuploadFile,
      reuploadSections,
      reuploadNotes
    );

    setShowReuploadModal(false);
    setSelectedPaperForReupload(null);
  };

  // Filter papers for this teacher (or all for demo inspection)
  const teacherPapers = papers.filter(p => p.teacherId === currentTeacher.id);
  const rejectedPapers = teacherPapers.filter(p => p.status === 'qa_rejected');
  const pendingPapers = teacherPapers.filter(p => p.status === 'pending_qa');
  const approvedPapers = teacherPapers.filter(p => p.status === 'qa_approved');

  // Relevant admin notices for this teacher
  const teacherNotices = notifications.filter(
    n =>
      n.type === 'exam_call' &&
      (n.recipientRole === 'all' ||
        (n.recipientRole === 'teacher' && (!n.recipientId || n.recipientId === currentTeacher.id)))
  );

  // Date Sheet slots where this teacher is assigned as Paper Setter (5-day upload deadline applies)
  const assignedUploadDateSheets = dateSheetRows.filter(
    r =>
      r.paperSetterTeacherId === currentTeacher.id ||
      r.paperSetterTeacherName === currentTeacher.name ||
      (r.subject === currentTeacher.department && currentTeacher.assignedSemesters.includes(r.semester))
  );

  // Date Sheet slots where this teacher has Invigilation Duty on exam day
  const assignedInvigilationDuties = dateSheetRows.filter(
    r =>
      r.chiefInvigilatorTeacherId === currentTeacher.id ||
      r.chiefInvigilator === currentTeacher.name ||
      r.assistantInvigilatorTeacherId === currentTeacher.id ||
      r.assistantInvigilator === currentTeacher.name
  );

  return (
    <div className="space-y-6">
      {/* Teacher Profile & Fast Actions Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${currentTeacher.avatarColor} text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0`}
            >
              {currentTeacher.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentTeacher.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ID: {currentTeacher.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentTeacher.designation} &bull; Dept of{' '}
                <span className="font-semibold text-slate-700">{currentTeacher.department}</span>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 font-medium">Assigned Semesters:</span>
                {currentTeacher.assignedSemesters.map(sem => (
                  <span
                    key={sem}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                  >
                    Semester {sem}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="teacher-upload-paper-btn"
              onClick={() => openNewUploadModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Exam Paper (PDF/DOCX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* GLOBAL SUBMISSION DEADLINE NOTICE FOR TEACHERS */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs ${
          deadlineStatus.isPassed
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : deadlineStatus.isUrgent
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                deadlineStatus.isPassed
                  ? 'bg-rose-100 text-rose-700'
                  : deadlineStatus.isUrgent
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    deadlineStatus.isPassed
                      ? 'bg-rose-600 text-white'
                      : deadlineStatus.isUrgent
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {deadlineStatus.isPassed
                    ? 'Global Cutoff Reached'
                    : deadlineStatus.isUrgent
                    ? 'Urgent Submission Window'
                    : 'Institutional Cutoff Active'}
                </span>
                <h3 className="font-bold text-sm sm:text-base">
                  Official Last Date: {deadlineStatus.formattedDate} ({globalDeadline.deadlineTime})
                </h3>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {deadlineStatus.isPassed ? (
                  <span>
                    The official paper submission deadline expired on <strong>{deadlineStatus.formattedDate}</strong>.{' '}
                    {globalDeadline.allowLateSubmissions
                      ? `Late submissions are currently allowed within the ${globalDeadline.gracePeriodDays}-day grace window (marked as Late for QA audit).`
                      : 'Submissions are strictly closed.'}
                  </span>
                ) : (
                  <span>
                    Faculty must submit complete question papers (PDF/DOCX) for their assigned courses before the cutoff.{' '}
                    <strong>Time Remaining: {deadlineStatus.daysLeft} Days, {deadlineStatus.hoursLeft} Hours, {deadlineStatus.minutesLeft} Mins.</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setIsDeadlineModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-semibold border border-black/10 text-slate-800 shadow-2xs transition"
            >
              View Regulations
            </button>
          </div>
        </div>
      </div>

      {/* REJECTION URGENT ALERT CALLOUT (Requirement 2: On rejection the teacher got notified and again uploads the paper) */}
      {rejectedPapers.length > 0 && (
        <div className="space-y-3">
          {rejectedPapers.map(rp => (
            <div
              key={rp.id}
              className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm text-rose-950"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        Action Required
                      </span>
                      <h3 className="font-bold text-base text-rose-900">
                        Exam Paper Rejected by QA Reviewer &mdash; Revision Required
                      </h3>
                    </div>

                    <p className="text-xs text-rose-800 font-medium mt-1">
                      Paper for <strong className="underline">{rp.courseCode} - {rp.courseTitle}</strong>{' '}
                      (Semester {rp.semester}) requires immediate correction and re-upload.
                    </p>

                    {/* QA Remarks Card */}
                    <div className="mt-3 p-3.5 bg-white/80 rounded-xl border border-rose-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="font-semibold text-rose-900">
                          QA Examiner: {rp.qaReview?.reviewedBy || 'QA Reviewer'}
                        </span>
                        <span>
                          {rp.qaReview?.reviewedAt
                            ? new Date(rp.qaReview.reviewedAt).toLocaleDateString()
                            : ''}
                        </span>
                      </div>

                      {rp.qaReview?.feedbackNotes && (
                        <p className="text-slate-800 font-medium italic">
                          "{rp.qaReview.feedbackNotes}"
                        </p>
                      )}

                      {rp.qaReview?.rejectionReasons && (
                        <div className="pt-2 border-t border-rose-100 text-slate-700">
                          <span className="font-bold text-rose-900 text-[11px] block">
                            Deficiencies to Correct:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] mt-1 text-rose-900">
                            {rp.qaReview.rejectionReasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action: Re-upload revised paper */}
                <div className="flex md:flex-col items-center gap-2 shrink-0">
                  <button
                    id={`reupload-btn-${rp.id}`}
                    onClick={() => openReuploadModal(rp)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-upload Revised Paper</span>
                  </button>
                  <button
                    onClick={() => setPreviewPaper(rp)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-800 font-semibold text-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Deficient Paper</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Call Notices Bar */}
      {teacherNotices.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-indigo-950">
                  Official Exam Call Notices from Admin
                </h4>
                {teacherNotices[0].deadline && (
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                    Deadline: {teacherNotices[0].deadline}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                {teacherNotices[0].message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DATE SHEET & DUTY ASSIGNMENTS (5-Day Paper Cutoffs & Invigilation on Exam Date) */}
      {(assignedUploadDateSheets.length > 0 || assignedInvigilationDuties.length > 0) && (
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-emerald-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  My Official Date Sheet &amp; Examination Duties
                </h3>
                <p className="text-xs text-slate-500">
                  Paper upload deadlines strictly enforced 5 days prior to examination &bull; Invigilation duties on exam day
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title="Print official date sheet for this department"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                Print Date Sheet
              </button>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Active Exam Schedule
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Paper Upload Cutoffs (Configurable Days Before Date Sheet) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Paper Upload Assignments (Cutoff Directives)
                </span>
                <span className="text-[11px] text-slate-500">
                  {assignedUploadDateSheets.length} Assigned
                </span>
              </div>

              {assignedUploadDateSheets.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No question papers assigned to your ID for upload.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedUploadDateSheets.map(ds => {
                    const daysBefore = ds.uploadDaysBefore || paperUploadDaysBefore || 5;
                    const deadline = ds.paperUploadDeadline || computePaperUploadDeadline(ds.examDate, daysBefore);
                    const matchingPaper = papers.find(p => p.courseCode === ds.courseCode);
                    const isUploaded = !!(matchingPaper && (matchingPaper.status === 'qa_approved' || matchingPaper.file));
                    const relatedCourse = courses.find(c => c.code === ds.courseCode);

                    return (
                      <div
                        key={ds.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                                {ds.courseCode}
                              </span>
                              <span className="text-xs text-slate-500 font-semibold">
                                Sem {ds.semester}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {ds.courseTitle}
                            </h4>
                          </div>

                          {isUploaded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Uploaded
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                              <Timer className="w-3 h-3 text-amber-700" /> Pending Upload
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200/60">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Date Sheet Exam Date:</span>
                            <span className="font-bold text-slate-800">
                              {formatReadableDate(ds.examDate)} ({ds.startTime})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Exam Hall / Room:</span>
                            <span className="font-medium text-slate-800">{ds.hallLocation}</span>
                          </div>
                          <div className="flex items-center justify-between text-emerald-900 font-bold bg-emerald-100/60 px-2 py-1 rounded-lg mt-1">
                            <span className="flex items-center gap-1 text-[11px]">
                              <Timer className="w-3.5 h-3.5 text-emerald-700" /> {daysBefore}-Day Upload Cutoff:
                            </span>
                            <span className="text-xs">{formatReadableDate(deadline)}</span>
                          </div>
                        </div>

                        {!isUploaded && relatedCourse && (
                          <button
                            type="button"
                            onClick={() => openNewUploadModal(relatedCourse)}
                            className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-98"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            Upload Question Paper Now (PDF/DOCX)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Invigilation Duties on Exam Day */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Invigilation Duties (On Exam Date)
                </span>
                <span className="text-[11px] text-slate-500">
                  {assignedInvigilationDuties.length} Duty Slots
                </span>
              </div>

              {assignedInvigilationDuties.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No invigilation duties scheduled for your ID on the date sheet.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedInvigilationDuties.map(ds => {
                    const isChief =
                      ds.chiefInvigilatorTeacherId === currentTeacher.id ||
                      ds.chiefInvigilator === currentTeacher.name;

                    return (
                      <div
                        key={ds.id}
                        className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 hover:bg-teal-50/70 transition flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-700 text-white">
                                {isChief ? 'Chief Invigilator' : 'Assistant Invigilator'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {ds.shift}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                              {ds.courseCode}: {ds.courseTitle}
                            </h4>
                          </div>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-teal-300 text-teal-900 shrink-0">
                            {ds.dayOfWeek || 'Exam Day'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 space-y-1.5 pt-2 border-t border-teal-200/80">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Exam Date:</span>
                            <span className="font-bold text-slate-900">
                              {formatReadableDate(ds.examDate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Timing:</span>
                            <span className="font-bold text-slate-900">
                              {ds.startTime} – {ds.endTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Exam Hall / Room:</span>
                            <span className="font-semibold text-slate-900">
                              {ds.hallLocation}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-teal-900 bg-white/80 p-2 rounded-xl border border-teal-200 text-[11px]">
                            <span className="font-medium">
                              ⚠️ Reporting Time: 30 mins prior ({ds.startTime === '09:00 AM' ? '08:30 AM' : '01:30 PM'})
                            </span>
                            <span className="font-bold">{ds.totalCandidates} Candidates</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher's Submitted Exam Papers Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              My Submitted Examination Papers ({teacherPapers.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status tracking: QA Quality Review, Approval for Exam Date Sheet, or Re-upload requests.
            </p>
          </div>

          <button
            onClick={() => openNewUploadModal()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Paper</span>
          </button>
        </div>

        {teacherPapers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No papers uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't uploaded exam papers under {currentTeacher.name}'s ID yet. Click below to submit your first question paper.
            </p>
            <button
              onClick={() => openNewUploadModal()}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Upload Exam Paper (PDF / DOCX)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Course & Subject</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Attachment Details</th>
                  <th className="px-4 py-3">Review Status</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teacherPapers.map(paper => (
                  <tr key={paper.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{paper.courseTitle}</div>
                      <span className="font-mono text-indigo-700 text-[11px] font-bold">
                        {paper.courseCode} &bull; {paper.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        Semester {paper.semester}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="font-mono uppercase text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
                          {paper.file.type}
                        </span>
                        <span className="truncate max-w-[140px] text-xs">{paper.file.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {paper.file.sizeKb} KB &bull; {paper.totalMarks} Marks &bull; {paper.durationMinutes}m
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {paper.status === 'qa_approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved & Scheduled
                        </span>
                      )}
                      {paper.status === 'pending_qa' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending QA Review
                        </span>
                      )}
                      {paper.status === 'qa_rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Rejected &bull; Re-upload Needed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        v{paper.version}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setPreviewPaper(paper)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {paper.status === 'qa_rejected' && (
                        <button
                          onClick={() => openReuploadModal(paper)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-upload</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. Upload New Exam Paper Modal */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div
          id="teacher-upload-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Upload Examination Paper</h3>
                  <p className="text-xs text-slate-400">
                    Submitting under {currentTeacher.name} &bull; {currentTeacher.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePaper} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Deadline Status Callout inside Upload Modal */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  deadlineStatus.isPassed
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0 text-indigo-600" />
                  <span>
                    <strong>Submission Cutoff:</strong> {deadlineStatus.formattedDate} at {globalDeadline.deadlineTime}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    deadlineStatus.isPassed
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-indigo-200 text-indigo-900'
                  }`}
                >
                  {deadlineStatus.isPassed ? 'Late Submission Policy' : `${deadlineStatus.daysLeft} Days Remaining`}
                </span>
              </div>

              {/* Department & Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject / Department
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value as SubjectType)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={e => setSelectedSemester(Number(e.target.value) as SemesterNumber)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Code & Title
                </label>
                {availableCourses.length > 0 ? (
                  <select
                    value={selectedCourseId}
                    onChange={e => {
                      setSelectedCourseId(e.target.value);
                      const c = courses.find(item => item.id === e.target.value);
                      if (c) setCreditHours(c.creditHours || 3);
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {availableCourses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.title} ({c.creditHours} Credit Hours)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                    No predefined courses configured yet for {selectedSubject} (Semester {selectedSemester}). Use the Admin Curriculum screen to register courses.
                  </div>
                )}
              </div>

              {/* Exam Type & Credit Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={e => setExamType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Final Term Examination">Final Term Examination</option>
                    <option value="Midterm Examination">Midterm Examination</option>
                    <option value="Supplementary Examination">Supplementary Examination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Credit Hours
                  </label>
                  <select
                    value={creditHours}
                    onChange={e => setCreditHours(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-indigo-700"
                  >
                    <option value={1}>1 Credit Hour</option>
                    <option value={2}>2 Credit Hours</option>
                    <option value={3}>3 Credit Hours</option>
                    <option value={4}>4 Credit Hours</option>
                    <option value={5}>5 Credit Hours</option>
                  </select>
                </div>
              </div>

              {/* PDF / DOCX File Upload Drag & Drop Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Paper File (PDF or DOCX required)
                </label>
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const ext = file.name.endsWith('.docx') ? 'docx' : 'pdf';
                      setUploadedFile({
                        name: file.name,
                        type: ext,
                        sizeKb: Math.round(file.size / 1024),
                        uploadedAt: new Date().toISOString(),
                      });
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                    dragOver
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-800">
                    Drag and drop your PDF or DOCX exam paper here, or browse
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official format: Maximum file size 25MB (.pdf, .docx)
                  </p>

                  <input
                    type="file"
                    id="paper-file-upload-input"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const ext = file.name.endsWith('.docx') ? 'docx' : 'pdf';
                        setUploadedFile({
                          name: file.name,
                          type: ext,
                          sizeKb: Math.round(file.size / 1024),
                          uploadedAt: new Date().toISOString(),
                        });
                      }
                    }}
                  />

                  <label
                    htmlFor="paper-file-upload-input"
                    className="mt-3 inline-block px-3.5 py-1.5 text-xs font-semibold bg-white text-indigo-600 border border-slate-300 rounded-lg cursor-pointer hover:bg-indigo-50 shadow-2xs"
                  >
                    Select Local File
                  </label>

                  {/* Attached File Indicator */}
                  {uploadedFile && (
                    <div className="mt-3 p-2.5 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center justify-between text-xs text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-indigo-950 truncate max-w-[200px]">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[10px] text-indigo-700">
                            {uploadedFile.type.toUpperCase()} &bull; {uploadedFile.sizeKb} KB
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Ready for QA
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  Submit to QA Paper Checker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Re-upload Revised Paper Modal (Requirement 2) */}
      {/* ========================================================================= */}
      {showReuploadModal && selectedPaperForReupload && (
        <div
          id="teacher-reupload-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowReuploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between border-b border-rose-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-800/60 text-rose-200 rounded-lg">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    Re-upload Revised Paper &mdash; {selectedPaperForReupload.courseCode}
                  </h3>
                  <p className="text-xs text-rose-200">
                    Preparing Version {selectedPaperForReupload.version + 1} with QA corrective measures
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReuploadModal(false)}
                className="text-rose-300 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReuploadSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Previous QA Objections summary */}
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs">
                <p className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  QA Reviewer Feedback for v{selectedPaperForReupload.version}:
                </p>
                <p className="text-rose-800 italic">
                  "{selectedPaperForReupload.qaReview?.feedbackNotes}"
                </p>
              </div>

              {/* Upload Replacement File */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Revised Paper File (PDF or DOCX)
                </label>
                <div className="p-4 border-2 border-dashed border-indigo-300 bg-indigo-50/40 rounded-xl text-center">
                  <UploadCloud className="w-7 h-7 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-800">
                    Attach corrected document (PDF or DOCX)
                  </p>
                  {reuploadFile && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-indigo-200 inline-flex items-center gap-2 text-xs">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-indigo-950">{reuploadFile.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({reuploadFile.sizeKb} KB)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Revision Notes field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teacher's Corrective Action & Revision Remarks
                </label>
                <textarea
                  rows={3}
                  required
                  value={reuploadNotes}
                  onChange={e => setReuploadNotes(e.target.value)}
                  placeholder="Explain how previous QA objections were fixed..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Corrected Question Sections */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Corrected Sections & Total Marks Balance
                  </label>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Corrected Total: {reuploadSections.reduce((acc, s) => acc + s.marks, 0)} / {selectedPaperForReupload.totalMarks} Marks
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reuploadSections.map((sec, sIdx) => (
                    <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                        <span>{sec.title}</span>
                        <span className="text-emerald-700">[{sec.marks} Marks]</span>
                      </div>
                      <p className="text-[11px] text-slate-500 italic mb-2">{sec.instructions}</p>
                      <div className="space-y-1 pl-2 border-l-2 border-emerald-400">
                        {sec.questions.map((q, qIdx) => (
                          <div key={qIdx} className="flex justify-between text-[11px] text-slate-700">
                            <span>
                              <strong>{q.qNum}:</strong> {q.text}
                            </span>
                            <span className="font-semibold shrink-0 ml-2 text-slate-500">
                              ({q.marks}M)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Re-upload footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReuploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Submit Revised Version {selectedPaperForReupload.version + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Date Sheet Modal for Teachers */}
      <PrintableDateSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        preSelectedSubject={currentTeacher.department}
      />
    </div>
  );
};
