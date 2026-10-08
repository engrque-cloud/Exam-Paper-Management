import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { ExamPaper, SubjectType, SemesterNumber, QAReviewDetails } from '../../types';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Search,
  BookOpen,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Download,
  ExternalLink,
} from 'lucide-react';
import { QAPaperDistributionChart } from './QAPaperDistributionChart';

export const QADashboard: React.FC = () => {
  const { papers, qaReviewPaper, setPreviewPaper } = useExam();

  // Filters
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [subjectFilter, setSubjectFilter] = useState<SubjectType | 'All'>('All');
  const [semesterFilter, setSemesterFilter] = useState<SemesterNumber | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Paper for Active QA Evaluation
  const [evaluatingPaper, setEvaluatingPaper] = useState<ExamPaper | null>(null);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('Dr. Marcus Sterling (Senior QA Examiner)');
  const [rubricScores, setRubricScores] = useState<QAReviewDetails['rubricScores']>({
    curriculumAlignment: true,
    marksTallyAccuracy: true,
    difficultyDistribution: true,
    formattingStandard: true,
    bloomsTaxonomy: true,
  });
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [issueError, setIssueError] = useState<string | null>(null);

  // Open evaluation modal
  const openEvaluationModal = (paper: ExamPaper) => {
    setEvaluatingPaper(paper);
    setFeedbackNotes('');
    setIssueError(null);
    setRubricScores({
      curriculumAlignment: true,
      marksTallyAccuracy: true,
      difficultyDistribution: true,
      formattingStandard: true,
      bloomsTaxonomy: true,
    });
  };

  // Submit Approval
  const handleApprove = () => {
    if (!evaluatingPaper) return;
    setIssueError(null);
    qaReviewPaper(evaluatingPaper.id, 'approved', {
      reviewerName,
      rubricScores,
      feedbackNotes: feedbackNotes.trim() || 'Question paper approved by QA Cell without issues. Ready for examination date sheet and printing.',
    });
    setEvaluatingPaper(null);
  };

  // Submit Rejection
  const handleReject = () => {
    if (!evaluatingPaper) return;
    const issueText = feedbackNotes.trim();
    if (!issueText) {
      setIssueError('Please state what the issue is before rejecting the paper so the teacher knows what to correct.');
      return;
    }
    setIssueError(null);
    qaReviewPaper(evaluatingPaper.id, 'rejected', {
      reviewerName,
      rubricScores,
      feedbackNotes: issueText,
      rejectionReasons: [issueText],
    });
    setEvaluatingPaper(null);
  };

  // Filtered papers
  const filteredPapers = papers.filter(p => {
    if (activeTab === 'pending' && p.status !== 'pending_qa') return false;
    if (activeTab === 'approved' && p.status !== 'qa_approved') return false;
    if (activeTab === 'rejected' && p.status !== 'qa_rejected') return false;

    if (subjectFilter !== 'All' && p.subject !== subjectFilter) return false;
    if (semesterFilter !== 'All' && p.semester !== semesterFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.courseCode.toLowerCase().includes(q) ||
        p.courseTitle.toLowerCase().includes(q) ||
        p.teacherName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = papers.filter(p => p.status === 'pending_qa').length;
  const approvedCount = papers.filter(p => p.status === 'qa_approved').length;
  const rejectedCount = papers.filter(p => p.status === 'qa_rejected').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white rounded-2xl p-6 text-slate-900 shadow-sm border border-emerald-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                Quality Assurance Review Board
              </span>
              <span className="text-slate-500 text-xs">&bull; Regulatory Paper Inspection</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
              QA Paper Quality Checker Portal
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Inspect submitted examination papers against curriculum rubrics, marks tally accuracy, and Bloom's taxonomy.
              Approving a paper automatically generates the Date Sheet row for the Principal; rejecting a paper immediately alerts the instructor to re-upload.
            </p>
          </div>

          <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-100/90 text-xs shadow-2xs">
            <span className="text-slate-500 block font-semibold">Evaluation Workflow:</span>
            <div className="flex items-center gap-2 mt-1 text-slate-700">
              <span className="text-emerald-600 font-bold">Approve</span> &rarr; Date Sheet Row
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-rose-600 font-bold">Reject</span> &rarr; Teacher Re-upload
            </div>
          </div>
        </div>

        {/* Tab Selector & Counts */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-emerald-200/60">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Review Queue</span>
            <span className="px-2 py-0.2 rounded-full bg-slate-900/10 text-xs font-bold">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approved Archive</span>
            <span className="px-2 py-0.2 rounded-full bg-slate-900/10 text-xs font-bold">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Rejected (Awaiting Revision)</span>
            <span className="px-2 py-0.2 rounded-full bg-slate-900/10 text-xs font-bold">
              {rejectedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Real-time QA Distribution & Bottleneck Identification Section */}
      <QAPaperDistributionChart
        onSelectTab={tab => setActiveTab(tab)}
        onSelectSubject={subj => setSubjectFilter(subj)}
      />

      {/* Main Papers Queue List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              {activeTab === 'pending'
                ? `Papers Awaiting Quality Check (${filteredPapers.length})`
                : activeTab === 'approved'
                ? `QA Approved Question Papers (${filteredPapers.length})`
                : `Rejected Papers Awaiting Revision (${filteredPapers.length})`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review syllabus mapping, section totals, and questions before giving formal clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject filter */}
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value as any)}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            >
              <option value="All">All Subjects</option>
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
                placeholder="Search code or teacher..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44"
              />
            </div>
          </div>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-40 text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">No papers found</p>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no papers matching the selected tab and filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPapers.map(paper => {
              const totalSectionMarks = paper.sections.reduce((acc, s) => acc + s.marks, 0);
              const marksMatch = totalSectionMarks === paper.totalMarks;

              return (
                <div
                  key={paper.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                          {paper.courseCode}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{paper.courseTitle}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          Semester {paper.semester} &bull; {paper.subject}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700">
                          v{paper.version}
                        </span>
                        {paper.submissionTimingStatus === 'late' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Late Submission
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            On Time
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span>Teacher: <strong className="text-slate-800">{paper.teacherName}</strong></span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono uppercase text-[11px] font-semibold text-slate-700">
                          {paper.file.type} &bull; {paper.file.name} ({paper.file.sizeKb} KB)
                        </span>
                        <span>&bull;</span>
                        <span className={marksMatch ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-bold'}>
                          Sections: {totalSectionMarks} / {paper.totalMarks} Marks
                          {!marksMatch && ' (Mismatch!)'}
                        </span>
                      </div>

                      {/* QA Review notes if reviewed */}
                      {paper.qaReview && (
                        <p className="mt-2 text-xs italic bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                          <strong>QA Note:</strong> "{paper.qaReview.feedbackNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewPaper(paper)}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    {paper.status === 'pending_qa' ? (
                      <button
                        id={`review-paper-btn-${paper.id}`}
                        onClick={() => openEvaluationModal(paper)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition"
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Perform QA Review</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => openEvaluationModal(paper)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        Re-evaluate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Interactive QA Evaluation Modal / Rubric Sheet */}
      {/* ========================================================================= */}
      {evaluatingPaper && (
        <div
          id="qa-eval-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setEvaluatingPaper(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    Paper Quality Assurance Evaluation &mdash; {evaluatingPaper.courseCode}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {evaluatingPaper.courseTitle} &bull; {evaluatingPaper.subject} (Semester {evaluatingPaper.semester})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvaluatingPaper(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* Paper Summary Pill */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Paper Setter</span>
                  <span className="font-bold text-slate-800">{evaluatingPaper.teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Document Format</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {evaluatingPaper.file.name} ({evaluatingPaper.file.type.toUpperCase()})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Marks / Duration</span>
                  <span className="font-bold text-slate-800">
                    {evaluatingPaper.totalMarks} Marks &bull; {evaluatingPaper.durationMinutes} mins
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Calculated Sections Sum</span>
                  <span
                    className={`font-bold ${
                      evaluatingPaper.sections.reduce((acc, s) => acc + s.marks, 0) === evaluatingPaper.totalMarks
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {evaluatingPaper.sections.reduce((acc, s) => acc + s.marks, 0)} Marks
                  </span>
                </div>
                <button
                  onClick={() => setPreviewPaper(evaluatingPaper)}
                  className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                >
                  Inspect Full Questions
                </button>
              </div>

              {/* Uploaded Paper Document & Questions Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Uploaded Paper Preview</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sectionsText = (evaluatingPaper.sections || []).length > 0
                          ? '\n\nQuestions:\n' +
                            evaluatingPaper.sections
                              .map(
                                s =>
                                  `\n${s.title} (${s.marks} Marks)\n` +
                                  s.questions.map(q => `${q.qNum}: ${q.text} [${q.marks}M]`).join('\n')
                              )
                              .join('\n')
                          : `\n\nOfficial Examination Paper Document: ${evaluatingPaper.file.name}\n`;

                        const blob = new Blob(
                          [
                            `CONFIDENTIAL EXAMINATION QUESTION PAPER\nCourse: ${evaluatingPaper.courseCode} - ${evaluatingPaper.courseTitle}\nSubject: ${evaluatingPaper.subject} (Semester ${evaluatingPaper.semester})\nTotal Marks: ${evaluatingPaper.totalMarks}\nTime Allowed: ${evaluatingPaper.durationMinutes} mins\nTeacher: ${evaluatingPaper.teacherName}\nStatus: ${evaluatingPaper.status}` +
                              sectionsText,
                          ],
                          { type: 'text/plain;charset=utf-8' }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = evaluatingPaper.file.name;
                        a.click();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPaper(evaluatingPaper)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                      title="Open full preview"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Fullscreen View</span>
                    </button>
                  </div>
                </div>

                {/* Preview Sheet Container */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 overflow-hidden">
                  {evaluatingPaper.file.fileDataUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-slate-300 bg-white">
                      {evaluatingPaper.file.type === 'pdf' ? (
                        <iframe
                          src={evaluatingPaper.file.fileDataUrl}
                          className="w-full h-72 border-0"
                          title="Uploaded Paper PDF"
                        />
                      ) : (
                        <div className="p-3 flex justify-center bg-slate-100">
                          <img
                            src={evaluatingPaper.file.fileDataUrl}
                            alt="Uploaded Paper Preview"
                            className="max-h-72 object-contain rounded border border-slate-300"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {evaluatingPaper.sections && evaluatingPaper.sections.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-300 p-5 font-serif text-slate-900 shadow-2xs max-h-72 overflow-y-auto space-y-4">
                      <div className="text-center border-b pb-3 border-slate-200">
                        <h5 className="font-bold text-sm uppercase tracking-wide">
                          Govt. Girls Model Degree College, Quetta
                        </h5>
                        <p className="text-xs text-slate-600 font-sans mt-0.5">
                          {evaluatingPaper.examType} Examination &bull; {evaluatingPaper.courseCode}: {evaluatingPaper.courseTitle}
                        </p>
                        <div className="text-[11px] text-slate-500 font-sans flex justify-center flex-wrap gap-3 mt-1">
                          <span>Time Allowed: {evaluatingPaper.durationMinutes} Mins</span>
                          <span>&bull;</span>
                          <span>Max Marks: {evaluatingPaper.totalMarks}</span>
                          <span>&bull;</span>
                          <span>Dept: {evaluatingPaper.subject}</span>
                          <span>&bull;</span>
                          <span>Semester {evaluatingPaper.semester}</span>
                        </div>
                      </div>

                      {evaluatingPaper.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-2 border-b border-slate-100 pb-3 last:border-b-0">
                          <div className="flex items-center justify-between font-sans">
                            <h6 className="font-bold text-xs text-slate-800 uppercase">{section.title}</h6>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {section.marks} Marks
                            </span>
                          </div>
                          {section.instructions && (
                            <p className="text-xs italic text-slate-500 font-sans">{section.instructions}</p>
                          )}
                          <div className="space-y-1.5 pl-2">
                            {section.questions.map((q, qIdx) => (
                              <div key={qIdx} className="flex items-start justify-between text-xs gap-3">
                                <div className="flex-1">
                                  <span className="font-bold font-sans mr-2">{q.qNum}:</span>
                                  <span>{q.text}</span>
                                </div>
                                <span className="font-sans font-semibold text-slate-500 text-[11px] shrink-0">
                                  [{q.marks} M]
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-slate-900 truncate">
                            {evaluatingPaper.file.name}
                          </h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                            {evaluatingPaper.file.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Size: {evaluatingPaper.file.sizeKb} KB &bull; Uploaded on{' '}
                          {new Date(evaluatingPaper.file.uploadedAt).toLocaleDateString()} by {evaluatingPaper.teacherName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* What is the Issue Text Box */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>What is the issue with this paper?</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    (Required if rejecting, optional if approving)
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={feedbackNotes}
                  onChange={e => {
                    setFeedbackNotes(e.target.value);
                    if (issueError) setIssueError(null);
                  }}
                  placeholder="Type the issue here (e.g., marks distribution is incorrect, syllabus mismatch, missing questions, formatting errors, or notes for the faculty member)..."
                  className={`w-full text-xs px-3.5 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:outline-none font-sans text-slate-900 placeholder:text-slate-400 bg-white transition ${
                    issueError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 focus:border-indigo-600'
                  }`}
                />
                {issueError && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{issueError}</span>
                  </p>
                )}
              </div>

              {/* Reviewer Identification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Authorized QA Examiner Signature
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Decision Impact Warning */}
              <div className="grid grid-cols-2 gap-3 text-[11px] pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <p className="font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approval Trigger:
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-700">
                    Paper is certified; Principal dashboard will show paper submitted and automatically generate an upcoming exam Date Sheet row!
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <p className="font-bold flex items-center gap-1 text-rose-800">
                    <XCircle className="w-3.5 h-3.5" />
                    Rejection Trigger:
                  </p>
                  <p className="mt-0.5 text-[10px] text-rose-700">
                    Teacher receives urgent notification with your remarks and re-uploads the revised paper.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEvaluatingPaper(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="qa-reject-btn"
                    type="button"
                    onClick={handleReject}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Paper & Notify Teacher</span>
                  </button>

                  <button
                    id="qa-approve-btn"
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Generate Date Sheet Row</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
