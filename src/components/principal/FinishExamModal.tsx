import React, { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Award,
  Calendar,
  Building2,
  Clock,
  ShieldCheck,
  FolderArchive,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { COLLEGE_METADATA } from '../../data/collegeData';

interface FinishExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConcludedSuccess?: () => void;
}

export const FinishExamModal: React.FC<FinishExamModalProps> = ({
  isOpen,
  onClose,
  onConcludedSuccess,
}) => {
  const {
    concludeAndArchiveSession,
    papers,
    dateSheetRows,
    results,
    courses,
    currentUser,
  } = useExam();

  const [sessionName, setSessionName] = useState('Fall 2026');
  const [remarks, setRemarks] = useState(
    'All question papers were audited, exams conducted under strict invigilation, and student result gazettes finalized and ratified under Controller of Examinations supervision. All session records are hereby certified and transferred to institutional archives.'
  );

  const [confirmAudit, setConfirmAudit] = useState(true);
  const [confirmGazette, setConfirmGazette] = useState(true);
  const [confirmArchiveAuth, setConfirmArchiveAuth] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirmFinish = () => {
    if (!confirmAudit || !confirmGazette || !confirmArchiveAuth) return;
    setIsProcessing(true);

    setTimeout(() => {
      concludeAndArchiveSession(sessionName, remarks);
      setIsProcessing(false);
      onClose();
      if (onConcludedSuccess) {
        onConcludedSuccess();
      }
    }, 600);
  };

  const isSubmitDisabled = !confirmAudit || !confirmGazette || !confirmArchiveAuth || isProcessing;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Archival Authority · Principal Secretariat</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                Finish Examination &amp; Move to Archived Section
              </h3>
              <p className="text-xs text-slate-500">
                {COLLEGE_METADATA.institutionName}, {COLLEGE_METADATA.campus}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {/* Notice & Explanation */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              Concluding this examination will seal all current session data:
            </p>
            <p className="text-emerald-800 leading-relaxed">
              All question papers, duty roster attendance, conducted date sheets, and published student result gazettes will be permanently cataloged into the <strong>All Session Records &amp; Archives</strong> section with complete turnaround duration analytics.
            </p>
          </div>
        </div>

        {/* Data Breakdown Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
            Session Data Being Sealed &amp; Archived
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Courses</span>
              <span className="text-2xl font-black text-slate-900 block mt-0.5">
                {courses.length || 64}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Catalog complete</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Papers Audited</span>
              <span className="text-2xl font-black text-indigo-600 block mt-0.5">
                {papers.length || 64}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">QA certified</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Exams Conducted</span>
              <span className="text-2xl font-black text-emerald-600 block mt-0.5">
                {dateSheetRows.length || 64}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">All shifts verified</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Avg Turnaround</span>
              <span className="text-2xl font-black text-purple-600 block mt-0.5">
                19.4d
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Paper to Exam</span>
            </div>
          </div>
        </div>

        {/* Academic Session Field */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">
            Academic Session Identifier:
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Official Executive Remarks */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">
            Official Principal Archival Certification Remarks:
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Verification Checklist */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs text-slate-700">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
            Principal Confirmation &amp; Certification Sign-off
          </span>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmAudit}
              onChange={e => setConfirmAudit(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>
              I certify that all course question papers were prepared and QA-cleared in compliance with curriculum standards.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmGazette}
              onChange={e => setConfirmGazette(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>
              I certify that scheduled examinations were completed and all student result records are gazetted and ratified.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmArchiveAuth}
              onChange={e => setConfirmArchiveAuth(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 font-bold"
            />
            <span className="font-semibold text-slate-900">
              Conclude examination session &quot;{sessionName}&quot; and permanently transfer all records to the Archived Section.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitDisabled}
            onClick={handleConfirmFinish}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
              isSubmitDisabled
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
            }`}
          >
            {isProcessing ? (
              <span>Sealing &amp; Archiving Session Data...</span>
            ) : (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>Finish Exam &amp; Move to Archived Section</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
