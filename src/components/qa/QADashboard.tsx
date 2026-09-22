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
} from 'lucide-react';

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
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

  // Pre-configured common rejection reasons for fast selection
  const COMMON_DEFICIENCIES = [
    'Total marks mismatch between section tally and declared exam total.',
    'Insufficient higher-order analytical questions (Bloom\'s Taxonomy violation).',
    'Missing candidate instructions header and time allocation parameters.',
    'Lack of elective choice questions in descriptive / essay section.',
    'Ambiguity in phrasing of technical terms in Question 2/3.',
  ];

  // Open evaluation modal
  const openEvaluationModal = (paper: ExamPaper) => {
    setEvaluatingPaper(paper);
    // Auto check marks tally
    const calculatedSum = paper.sections.reduce((acc, s) => acc + s.marks, 0);
    const marksMatch = calculatedSum === paper.totalMarks;

    setRubricScores({
      curriculumAlignment: true,
      marksTallyAccuracy: marksMatch,
      difficultyDistribution: true,
      formattingStandard: true,
      bloomsTaxonomy: true,
    });

    setFeedbackNotes(
      marksMatch
        ? `Thoroughly reviewed ${paper.courseCode}. Questions conform to syllabus requirements with comprehensive learning outcomes and balanced cognitive distribution. Recommended for examination printing.`
        : `Calculated question marks total ${calculatedSum}, which does not equal the required total of ${paper.totalMarks}. Please recalibrate section marks.`
    );
    setRejectionReasons([]);
  };

  // Submit Approval
  const handleApprove = () => {
    if (!evaluatingPaper) return;
    qaReviewPaper(evaluatingPaper.id, 'approved', {
      reviewerName,
      rubricScores,
      feedbackNotes: feedbackNotes || 'Approved without reservations. Ready for upcoming examination date sheet generation.',
    });
    setEvaluatingPaper(null);
  };

  // Submit Rejection
  const handleReject = () => {
    if (!evaluatingPaper) return;
    const reasons = rejectionReasons.length > 0 ? rejectionReasons : [
      feedbackNotes || 'Paper formatting or marks breakdown does not satisfy quality standards.'
    ];

    qaReviewPaper(evaluatingPaper.id, 'rejected', {
      reviewerName,
      rubricScores,
      feedbackNotes: feedbackNotes || 'Correction required by the teacher before re-submission.',
      rejectionReasons: reasons,
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
            className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
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

              {/* Quality Rubric Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Examination Quality Assurance Rubric Checklist
                </h4>

                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rubricScores.curriculumAlignment}
                      onChange={e => setRubricScores({ ...rubricScores, curriculumAlignment: e.target.checked })}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">1. Curriculum & Syllabus Alignment</span>
                      <span className="text-slate-500 text-[11px]">
                        Questions correspond directly to prescribed syllabus learning outcomes for Semester {evaluatingPaper.semester}.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rubricScores.marksTallyAccuracy}
                      onChange={e => setRubricScores({ ...rubricScores, marksTallyAccuracy: e.target.checked })}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">2. Marks Tally Accuracy Verification</span>
                      <span className="text-slate-500 text-[11px]">
                        Individual question marks and section subtotals correctly sum up to {evaluatingPaper.totalMarks} marks without mathematical discrepancy.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rubricScores.bloomsTaxonomy}
                      onChange={e => setRubricScores({ ...rubricScores, bloomsTaxonomy: e.target.checked })}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">3. Bloom's Taxonomy & Difficulty Spread</span>
                      <span className="text-slate-500 text-[11px]">
                        Balanced division between foundational recall (30-40%) and higher-order critical evaluation/analysis (60-70%).
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rubricScores.formattingStandard}
                      onChange={e => setRubricScores({ ...rubricScores, formattingStandard: e.target.checked })}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">4. Official Formatting & Clarity of Instructions</span>
                      <span className="text-slate-500 text-[11px]">
                        Standard typography, university header, time allowances, and unambiguous candidate instructions.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Reviewer Feedback Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  QA Evaluation Feedback & Remarks
                </label>
                <textarea
                  rows={3}
                  value={feedbackNotes}
                  onChange={e => setFeedbackNotes(e.target.value)}
                  placeholder="Enter detailed feedback or praise for the question paper..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans"
                />
              </div>

              {/* Specific Deficiencies Selection (used if rejecting) */}
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
                <span className="text-xs font-bold text-rose-900 block mb-1">
                  Deficiency Checklist (Select if Rejecting Paper):
                </span>
                <div className="space-y-1 text-[11px]">
                  {COMMON_DEFICIENCIES.map((def, idx) => (
                    <label key={idx} className="flex items-start gap-2 text-rose-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rejectionReasons.includes(def)}
                        onChange={e => {
                          if (e.target.checked) {
                            setRejectionReasons([...rejectionReasons, def]);
                          } else {
                            setRejectionReasons(rejectionReasons.filter(r => r !== def));
                          }
                        }}
                        className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                      />
                      <span>{def}</span>
                    </label>
                  ))}
                </div>
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
