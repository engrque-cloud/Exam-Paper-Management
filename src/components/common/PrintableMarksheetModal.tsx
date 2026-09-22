import React from 'react';
import {
  Printer,
  X,
  GraduationCap,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { ExamResult, StudentResultEntry } from '../../types';
import { PrintableMarksheetCard } from './PrintableMarksheetCard';

export interface StudentMarksheetRecord {
  rollNumber: string;
  studentName: string;
  courseEntries: {
    course: ExamResult;
    entry: StudentResultEntry;
  }[];
}

export interface PrintableMarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentMarksheetRecord | null;
}

export const PrintableMarksheetModal: React.FC<PrintableMarksheetModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const {
    collegeName,
    collegeLogo,
    collegeLogoRight,
  } = useExam();

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="printable-marksheet-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-300 overflow-hidden my-6 text-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Controls Top Bar (Screen only, hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Official Student Marks Sheet / Transcript Preview</h3>
              <p className="text-xs text-slate-400">
                Candidate: <span className="font-semibold text-white">{record.studentName}</span> &bull; Roll No: <span className="font-mono text-emerald-300 font-bold">{record.rollNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Marks Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Mark Sheet Document */}
        <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto bg-white font-serif">
          <div id="printable-marksheet-content">
            <PrintableMarksheetCard
              record={record}
              collegeName={collegeName}
              collegeLogo={collegeLogo}
              collegeLogoRight={collegeLogoRight}
              currentDateFormatted={currentDateFormatted}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Ready to print on standard A4 / Letter paper. Press Print or (Ctrl+P).
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Marks Sheet</span>
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
