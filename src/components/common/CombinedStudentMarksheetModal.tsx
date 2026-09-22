import React from 'react';
import {
  Printer,
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import {
  PrintableCombinedMarksheetCard,
  CombinedStudentExamProfile,
} from './PrintableCombinedMarksheetCard';

export interface CombinedStudentMarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CombinedStudentExamProfile | null;
  allCandidateNames?: string[];
  onSelectStudentName?: (name: string) => void;
}

export const CombinedStudentMarksheetModal: React.FC<CombinedStudentMarksheetModalProps> = ({
  isOpen,
  onClose,
  profile,
  allCandidateNames = [],
  onSelectStudentName,
}) => {
  const {
    collegeName,
    collegeLogo,
    collegeLogoRight,
  } = useExam();

  if (!isOpen || !profile) return null;

  const handlePrint = () => {
    window.print();
  };

  // Find index in candidate names
  const currentIndex = allCandidateNames.findIndex(
    n => n.toLowerCase() === profile.studentName.toLowerCase()
  );

  const handlePrev = () => {
    if (currentIndex > 0 && onSelectStudentName) {
      onSelectStudentName(allCandidateNames[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < allCandidateNames.length - 1 && onSelectStudentName) {
      onSelectStudentName(allCandidateNames[currentIndex + 1]);
    }
  };

  return (
    <div
      id="combined-marksheet-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-300 overflow-hidden my-4 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Screen Control Header (no-print) */}
        <div className="no-print bg-slate-950 text-white px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  1-Page Combined Student Examination Transcript
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {profile.courseEntries.length} Exams Combined
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Candidate: <strong className="text-white font-medium">{profile.studentName}</strong> &bull; Roll: <code className="text-emerald-400 font-mono font-bold">{profile.primaryRollNumber}</code>
              </p>
            </div>
          </div>

          {/* Quick Name Switcher & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {allCandidateNames.length > 1 && onSelectStudentName && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Student"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={profile.studentName}
                  onChange={e => onSelectStudentName(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 font-medium border-none focus:ring-0 focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
                >
                  {allCandidateNames.map(name => (
                    <option key={name} value={name} className="bg-slate-900 text-white">
                      {name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= allCandidateNames.length - 1}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Next Student"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Combined (1-Page)</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable 1-Page Document Container */}
        <div className="p-4 sm:p-8 max-h-[82vh] overflow-y-auto bg-slate-50/50">
          <div id="printable-combined-marksheet" className="max-w-4xl mx-auto">
            <PrintableCombinedMarksheetCard
              profile={profile}
              collegeName={collegeName}
              collegeLogo={collegeLogo}
              collegeLogoRight={collegeLogoRight}
            />
          </div>
        </div>

        {/* Footer actions (Screen only) */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All <strong>{profile.courseEntries.length} course results</strong> are combined into a certified 1-page A4 transcript. Click Print or press Ctrl+P.
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print 1-Page Marksheet</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
