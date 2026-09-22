import React from 'react';
import { useExam } from '../../context/ExamContext';
import { ExamPaper } from '../../types';
import {
  X,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';

interface PaperPreviewModalProps {
  paper: ExamPaper | null;
  onClose: () => void;
}

export const PaperPreviewModal: React.FC<PaperPreviewModalProps> = ({ paper, onClose }) => {
  if (!paper) return null;

  return (
    <div
      id="paper-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="paper-preview-modal-content"
        className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-emerald-200/80 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-emerald-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  Exam Paper Inspection: {paper.courseCode}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Version {paper.version}
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                {paper.courseTitle} &bull; {paper.subject} &bull; Semester {paper.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Simulate download
                const sectionsText = (paper.sections || []).length > 0
                  ? '\n\nQuestions:\n' +
                    paper.sections!
                      .map(
                        s =>
                          `\n${s.title} (${s.marks} Marks)\n` +
                          s.questions.map(q => `${q.qNum}: ${q.text} [${q.marks}M]`).join('\n')
                      )
                      .join('\n')
                  : `\n\nOfficial Examination Paper Document: ${paper.file.name} (${paper.file.type.toUpperCase()}, ${paper.file.sizeKb} KB)\nUploaded for semester examination conduct.\n`;

                const blob = new Blob(
                  [
                    `CONFIDENTIAL EXAMINATION QUESTION PAPER\nCourse: ${paper.courseCode} - ${paper.courseTitle}\nSubject: ${paper.subject} (Semester ${paper.semester})\nCredit Hours: ${paper.creditHours || 3}\nExam Type: ${paper.examType}\nTotal Marks: ${paper.totalMarks || 50}\nTime Allowed: ${paper.durationMinutes || 120} mins\nTeacher: ${paper.teacherName}\nStatus: ${paper.status}` +
                      sectionsText,
                  ],
                  { type: 'text/plain;charset=utf-8' }
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = paper.file.name;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
              title="Download simulated file"
            >
              <Download className="w-3.5 h-3.5" />
              Download {paper.file.type.toUpperCase()}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Container (Styled like academic printed question paper) */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto bg-slate-50">
          {/* Status Alert Banner */}
          {paper.status === 'qa_approved' && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-800">
                  Quality Assurance Approved & Certified
                </p>
                <p className="text-emerald-700 text-xs mt-0.5">
                  Reviewed by {paper.qaReview?.reviewedBy || 'Senior QA Examiner'} on{' '}
                  {paper.qaReview?.reviewedAt ? new Date(paper.qaReview.reviewedAt).toLocaleDateString() : 'N/A'}.
                  {paper.qaReview?.feedbackNotes && (
                    <span className="block mt-1 font-medium italic">
                      "{paper.qaReview.feedbackNotes}"
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {paper.status === 'qa_rejected' && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm flex-1">
                  <p className="font-semibold text-rose-800">
                    Quality Assurance Rejected - Re-upload Required
                  </p>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Evaluated by {paper.qaReview?.reviewedBy || 'QA Officer'}. The teacher has been notified to re-upload.
                  </p>

                  {paper.qaReview?.rejectionReasons && paper.qaReview.rejectionReasons.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="font-semibold text-rose-900">Specific Deficiencies Identified:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-800">
                        {paper.qaReview.rejectionReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {paper.qaReview?.feedbackNotes && (
                    <div className="mt-2 text-xs bg-rose-100/70 p-2.5 rounded-lg border border-rose-200">
                      <span className="font-semibold">Reviewer Notes: </span>
                      {paper.qaReview.feedbackNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {paper.status === 'pending_qa' && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-800">
                  Paper Pending QA Quality Review
                </p>
                <p className="text-amber-700 text-xs mt-0.5">
                  Uploaded by {paper.teacherName}. Awaiting verification by QA Paper Checker.
                </p>
              </div>
            </div>
          )}

          {/* Academic Question Paper Sheet */}
          <div className="bg-white border border-slate-300 rounded-xl shadow-xs p-6 md:p-8 font-serif text-slate-900">
            {/* Exam Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <BookOpen className="w-6 h-6 text-slate-800" />
                <span className="text-xs uppercase tracking-widest font-sans font-bold text-slate-600">
                  Office of the Controller of Examinations
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                UNIVERSITY EXAMINATION COMMISSION
              </h1>
              <h2 className="text-sm md:text-base font-medium text-slate-700 mt-0.5">
                {paper.examType} &mdash; Academic Session {paper.academicSession}
              </h2>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-sans font-semibold rounded border border-slate-300">
                CONFIDENTIAL &bull; QUESTION PAPER
              </div>
            </div>

            {/* Course Metadata Grid */}
            <div className="font-sans text-xs md:text-sm grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6">
              <div>
                <span className="text-slate-500 block text-xs">Course Code & Title:</span>
                <span className="font-bold text-slate-800">{paper.courseCode} - {paper.courseTitle}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Department & Semester:</span>
                <span className="font-bold text-slate-800">{paper.subject} &bull; Sem {paper.semester}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Credit Hours:</span>
                <span className="font-bold text-slate-800">{paper.creditHours || 3} Cr. Hrs</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Exam Type:</span>
                <span className="font-bold text-slate-800">{paper.examType}</span>
              </div>
            </div>

            {/* General Instructions */}
            <div className="font-sans text-xs bg-amber-50/60 p-3 rounded-lg border border-amber-200/80 mb-6 text-slate-700">
              <span className="font-bold text-amber-900 uppercase block mb-1">General Instructions to Candidates:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Read all instructions carefully before answering questions.</li>
                <li>Write your University Roll Number clearly on the answer sheet.</li>
                <li>Mobile phones, programmable calculators, and unauthorized materials are strictly prohibited in the exam hall.</li>
                <li>Write precise answers with relevant diagrams where applicable.</li>
              </ul>
            </div>

            {/* Question Sections or Document File Presentation */}
            {paper.sections && paper.sections.length > 0 ? (
              <div className="space-y-6">
                {paper.sections.map((section, sIdx) => (
                  <div key={sIdx} className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wide">
                        {section.title}
                      </h3>
                      <span className="font-sans font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-300">
                        [{section.marks} Marks]
                      </span>
                    </div>

                    {section.instructions && (
                      <p className="text-xs italic text-slate-600 mb-3 font-sans">
                        Note: {section.instructions}
                      </p>
                    )}

                    <div className="space-y-3 pl-2">
                      {section.questions.map((q, qIdx) => (
                        <div key={qIdx} className="flex items-start justify-between gap-4 text-sm leading-relaxed">
                          <div className="flex gap-2">
                            <span className="font-bold font-sans text-slate-800 shrink-0">{q.qNum}.</span>
                            <span className="text-slate-800">{q.text}</span>
                          </div>
                          <span className="font-sans text-xs text-slate-500 font-semibold shrink-0">
                            ({q.marks})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-6 bg-white text-center space-y-3 shadow-xs">
                <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">
                  Question Paper Document Attached: {paper.file.name}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This examination paper was submitted directly via authorized document upload ({paper.file.type.toUpperCase()} format, {paper.file.sizeKb} KB). Complete test specifications, questions, and mark allocations are contained within the attached confidential syllabus script.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Course: {paper.courseCode} ({paper.subject}, Sem {paper.semester}) &bull; {paper.creditHours || 3} Credit Hours
                  </span>
                </div>
              </div>
            )}

            {/* Paper End Mark */}
            <div className="text-center font-sans text-xs text-slate-400 font-bold uppercase tracking-widest mt-10 pt-4 border-t border-slate-200">
              *** END OF EXAMINATION PAPER ***
            </div>

            {/* Footer Signatures */}
            <div className="font-sans mt-8 pt-6 border-t border-dashed border-slate-300 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div>
                <p className="text-slate-400">Paper Setter:</p>
                <p className="font-semibold text-slate-800 mt-1">{paper.teacherName}</p>
                <p className="text-slate-400 text-[11px]">{paper.teacherEmail}</p>
              </div>
              <div>
                <p className="text-slate-400">File Attachment:</p>
                <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1">
                  <span className="uppercase text-[10px] bg-slate-200 px-1 rounded font-mono font-bold">
                    {paper.file.type}
                  </span>
                  <span className="truncate max-w-[140px]">{paper.file.name}</span>
                </p>
                <p className="text-slate-400 text-[11px]">{paper.file.sizeKb} KB &bull; Uploaded {new Date(paper.file.uploadedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400">QA Sign-off Status:</p>
                <p className={`font-bold mt-1 uppercase text-xs ${
                  paper.status === 'qa_approved' ? 'text-emerald-700' :
                  paper.status === 'qa_rejected' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {paper.status.replace('_', ' ')}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {paper.qaReview?.reviewedBy || 'Pending Examination Board Review'}
                </p>
              </div>
            </div>
          </div>

          {/* Revision History if applicable */}
          {paper.revisionHistory && paper.revisionHistory.length > 0 && (
            <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200 font-sans text-xs">
              <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                <Layers className="w-4 h-4 text-slate-600" />
                Paper Revision Audit Log
              </h4>
              <div className="space-y-2">
                {paper.revisionHistory.map((rev, rIdx) => (
                  <div key={rIdx} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-700">Version {rev.version}</span>
                      <span className="text-slate-400 mx-2">&bull;</span>
                      <span className="text-slate-600">{rev.fileName}</span>
                      {rev.reason && <p className="text-slate-500 italic mt-0.5">{rev.reason}</p>}
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(rev.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
