import React, { useState } from 'react';
import {
  Printer,
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Layers,
  Search,
  FileCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { StudentMarksheetRecord } from './PrintableMarksheetModal';
import { PrintableMarksheetCard } from './PrintableMarksheetCard';

interface BatchPrintableMarksheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: StudentMarksheetRecord[];
  title?: string;
  initialIndex?: number;
}

export const BatchPrintableMarksheetsModal: React.FC<BatchPrintableMarksheetsModalProps> = ({
  isOpen,
  onClose,
  records,
  title = 'Official Student Marksheets Batch Production',
  initialIndex = 0,
}) => {
  const { collegeName, collegeLogo, collegeLogoRight } = useExam();

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [localSearch, setLocalSearch] = useState<string>('');

  if (!isOpen || records.length === 0) return null;

  const filteredRecords = localSearch.trim()
    ? records.filter(
        r =>
          r.studentName.toLowerCase().includes(localSearch.toLowerCase()) ||
          r.rollNumber.toLowerCase().includes(localSearch.toLowerCase())
      )
    : records;

  const activeRecord =
    filteredRecords[currentIndex] || filteredRecords[0] || records[0];

  const handlePrintAll = () => {
    window.print();
  };

  const handlePrintSingle = (recordToPrint: StudentMarksheetRecord) => {
    // Switch to single view mode and print
    setCurrentIndex(filteredRecords.findIndex(r => r.rollNumber === recordToPrint.rollNumber));
    setViewMode('single');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="printable-batch-marksheets-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-300 overflow-hidden my-4 text-slate-900 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Controls Bar (no-print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">{title}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {records.length} {records.length === 1 ? 'Student' : 'Students'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Transcript & Marksheet Production &bull; Authorized by Examination Directorate
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Display all marksheets in continuous view for bulk printing"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Marksheets ({filteredRecords.length})</span>
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'single'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Navigate and review one student at a time"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Individual Pager</span>
              </button>
            </div>

            {/* Print Action */}
            <button
              onClick={handlePrintAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              title="Print all generated student marksheets with automatic A4 page breaks"
            >
              <Printer className="w-4 h-4" />
              <span>
                {viewMode === 'all'
                  ? `Print All (${filteredRecords.length})`
                  : 'Print Marksheet'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Sub-Bar for Filter & Paging (no-print) */}
        <div className="no-print bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={e => {
                  setLocalSearch(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder="Find in this batch by name / roll..."
                className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 text-slate-800"
              />
            </div>
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Clear
              </button>
            )}
          </div>

          {viewMode === 'single' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 text-xs">
                Candidate {currentIndex + 1} of {filteredRecords.length}:
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
                  title="Previous student marksheet"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <select
                  value={currentIndex}
                  onChange={e => setCurrentIndex(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {filteredRecords.map((rec, i) => (
                    <option key={rec.rollNumber} value={i}>
                      {rec.rollNumber} - {rec.studentName}
                    </option>
                  ))}
                </select>
                <button
                  disabled={currentIndex >= filteredRecords.length - 1}
                  onClick={() =>
                    setCurrentIndex(prev =>
                      Math.min(filteredRecords.length - 1, prev + 1)
                    )
                  }
                  className="p-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
                  title="Next student marksheet"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500 font-medium">
            Format: Standard Official A4 Marksheet with Dual Verification Seals
          </div>
        </div>

        {/* Printable Scroll Container */}
        <div
          id="printable-batch-marksheets"
          className="p-4 sm:p-8 overflow-y-auto bg-slate-50 flex-1 space-y-8"
        >
          {viewMode === 'all' ? (
            filteredRecords.map((rec, idx) => (
              <div
                key={rec.rollNumber}
                className="print-page-break max-w-4xl mx-auto shadow-md rounded-lg overflow-hidden bg-white"
              >
                <div className="no-print bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      #{idx + 1}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono font-bold text-indigo-900">
                      {rec.rollNumber}
                    </span>
                    <span>&bull;</span>
                    <span className="font-semibold text-slate-900">
                      {rec.studentName}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePrintSingle(rec)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-emerald-50 text-emerald-800 font-semibold border border-slate-200 text-xs shadow-2xs transition"
                  >
                    <Printer className="w-3 h-3 text-emerald-600" />
                    <span>Print Single</span>
                  </button>
                </div>
                <PrintableMarksheetCard
                  record={rec}
                  collegeName={collegeName}
                  collegeLogo={collegeLogo}
                  collegeLogoRight={collegeLogoRight}
                  currentDateFormatted={currentDateFormatted}
                />
              </div>
            ))
          ) : (
            <div className="max-w-4xl mx-auto shadow-md rounded-lg overflow-hidden bg-white">
              <PrintableMarksheetCard
                record={activeRecord}
                collegeName={collegeName}
                collegeLogo={collegeLogo}
                collegeLogoRight={collegeLogoRight}
                currentDateFormatted={currentDateFormatted}
              />
            </div>
          )}
        </div>

        {/* Modal Footer (no-print) */}
        <div className="no-print bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Ready for dispatch or distribution. Automatic page numbering &amp; security seals embedded.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>
                {viewMode === 'all'
                  ? `Print All ${filteredRecords.length} Marksheets`
                  : 'Print This Marksheet'}
              </span>
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
