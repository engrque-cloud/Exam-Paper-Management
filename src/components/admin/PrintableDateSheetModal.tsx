import React, { useState } from 'react';
import {
  Printer,
  X,
  Building2,
  Calendar,
  Filter,
  CheckCircle2,
  Shield,
  Layers,
  FileSpreadsheet,
  Clock,
  MapPin,
  Users,
  Award,
  Image as ImageIcon,
  Camera,
  Upload,
} from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { ExamDateSheetRow, SubjectType } from '../../types';
import { formatReadableDate } from '../../utils/whatsapp';
import { LogoCustomizerModal } from './LogoCustomizerModal';

interface PrintableDateSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSubject?: SubjectType | 'All';
}

export const PrintableDateSheetModal: React.FC<PrintableDateSheetModalProps> = ({
  isOpen,
  onClose,
  preSelectedSubject = 'All',
}) => {
  const {
    dateSheetRows,
    subjects,
    paperUploadDaysBefore,
    collegeLogo,
    collegeLogoRight,
    collegeName,
  } = useExam();

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>(preSelectedSubject);
  const [selectedShift, setSelectedShift] = useState<'All' | 'Morning Shift' | 'Evening Shift'>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [showDirectives, setShowDirectives] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [tableDensity, setTableDensity] = useState<'standard' | 'compact'>('standard');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter rows
  const filteredRows = dateSheetRows.filter(row => {
    if (selectedSubject !== 'All' && row.subject !== selectedSubject) return false;
    if (selectedShift !== 'All' && row.shift !== selectedShift) return false;
    if (selectedSemester !== 'All' && String(row.semester) !== selectedSemester) return false;
    return true;
  }).sort((a, b) => {
    // Sort by exam date, then start time
    if (a.examDate !== b.examDate) return a.examDate.localeCompare(b.examDate);
    return a.startTime.localeCompare(b.startTime);
  });

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate summary metrics for the header
  const morningCount = filteredRows.filter(r => r.shift === 'Morning Shift').length;
  const eveningCount = filteredRows.filter(r => r.shift === 'Evening Shift').length;
  const totalCandidates = filteredRows.reduce((acc, curr) => acc + (curr.totalCandidates || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-7xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* NON-PRINT HEADER BAR */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Official Examination Date Sheet Printout
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {filteredRows.length} Scheduled Slots
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Print preview formatted for A4 landscape &bull; Question Paper Cutoff: Strictly {paperUploadDaysBefore} days prior
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
              title="Add, upload, or change college logo in date sheet"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>{collegeLogo ? 'Change College Logo' : 'Add College Logo'}</span>
            </button>

            <button
              id="btn-trigger-browser-print"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Date Sheet (Ctrl + P)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NON-PRINT FILTER CONTROLS */}
        <div className="no-print p-4 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Filter Printout:
            </span>

            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500 font-medium">Department:</label>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Departments (32 Semesters)</option>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500 font-medium">Shift:</label>
              <select
                value={selectedShift}
                onChange={e => setSelectedShift(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Shifts</option>
                <option value="Morning Shift">Morning Shift (09:00 AM)</option>
                <option value="Evening Shift">Evening Shift (02:00 PM)</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500 font-medium">Semester:</label>
              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="All">All Semesters (1–8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={String(sem)}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Table Density */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setTableDensity('standard')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  tableDensity === 'standard' ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setTableDensity('compact')}
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${
                  tableDensity === 'compact' ? 'bg-slate-900 text-white' : 'text-slate-600'
                }`}
              >
                Compact (Fit to Page)
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={showDirectives}
                onChange={e => setShowDirectives(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Show Instructions
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Show Signatures
            </label>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-50">
          <div
            id="printable-datesheet"
            className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-xs max-w-6xl mx-auto text-slate-900 font-sans"
          >
            {/* OFFICIAL INSTITUTIONAL HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
              <div className="flex items-center justify-between gap-4 mb-2">
                {/* Left Logo Slot */}
                <div
                  onClick={() => setIsLogoModalOpen(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-900 flex items-center justify-center p-1.5 shrink-0 relative group cursor-pointer hover:border-emerald-600 transition bg-white shadow-2xs"
                  title="Click to add, upload, or change college logo"
                >
                  {collegeLogo ? (
                    <img
                      src={collegeLogo}
                      alt="College Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Building2 className="w-8 h-8 text-emerald-900" />
                      <span className="text-[7px] font-black uppercase text-emerald-950 tracking-tighter leading-tight mt-0.5">
                        GGMDC
                      </span>
                    </div>
                  )}
                  {/* Subtle interactive hover indicator for screen view (hidden on print) */}
                  <div className="no-print absolute inset-0 bg-slate-900/70 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>{collegeLogo ? 'Change' : 'Add Logo'}</span>
                  </div>
                </div>

                <div className="flex-1 text-center px-2">
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
                    {collegeName || 'Govt. Girls Model Degree College'}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mt-0.5">
                    Office of the Controller of Examinations · Jinnah Town, Quetta
                  </h2>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    Affiliated with University of Balochistan · Higher Education Department
                  </div>
                  <div className="inline-block px-4 py-0.5 mt-1.5 rounded-full border border-slate-900 font-black text-xs uppercase tracking-wider bg-slate-100 text-slate-900">
                    Official Semester Examination Date Sheet &amp; Faculty Duty Roster
                  </div>
                </div>

                {/* Right Logo / Institutional Seal Slot */}
                <div
                  onClick={() => setIsLogoModalOpen(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-900 flex items-center justify-center p-1.5 shrink-0 relative group cursor-pointer hover:border-emerald-600 transition bg-white shadow-2xs"
                  title="Click to customize seals and logos"
                >
                  {collegeLogoRight ? (
                    <img
                      src={collegeLogoRight}
                      alt="Institutional Seal"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Award className="w-8 h-8 text-emerald-900" />
                      <span className="text-[7px] font-black uppercase text-emerald-950 tracking-tighter leading-tight mt-0.5">
                        EXAMS
                      </span>
                    </div>
                  )}
                  <div className="no-print absolute inset-0 bg-slate-900/70 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Seal/Logo</span>
                  </div>
                </div>
              </div>

              {/* Notification Metadata */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mt-3 pt-2 border-t border-slate-300 flex-wrap gap-2">
                <span>
                  <strong>Notification Ref:</strong> GGMDC/EXAM/DS-2026/F-891
                </span>
                <span>
                  <strong>Academic Session:</strong> Fall 2026 (Undergraduate BS 4-Year Program)
                </span>
                <span>
                  <strong>Date of Notification:</strong> {todayFormatted}
                </span>
              </div>
            </div>

            {/* POLICY HIGHLIGHT BANNER */}
            <div className="mb-4 p-3 rounded-lg border border-slate-400 bg-slate-50 text-xs text-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <strong>⚠️ Mandatory Paper Submission Cutoff Policy:</strong> All course paper setters must upload confidential question papers strictly{' '}
                <span className="font-black text-black underline">
                  {paperUploadDaysBefore} days prior
                </span>{' '}
                to the date sheet examination date.
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
                <span>Morning Shift: 09:00 AM – 12:00 PM</span>
                <span>&bull;</span>
                <span>Evening Shift: 02:00 PM – 05:00 PM</span>
                <span>&bull;</span>
                <span>Reporting Time: 30 Mins Prior</span>
              </div>
            </div>

            {/* SUMMARY STATS TABLE (COMPACT) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-medium text-slate-800">
              <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Total Papers</span>
                <strong className="text-sm font-black">{filteredRows.length}</strong>
              </div>
              <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Morning Shift</span>
                <strong className="text-sm font-black">{morningCount}</strong>
              </div>
              <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Evening Shift</span>
                <strong className="text-sm font-black">{eveningCount}</strong>
              </div>
              <div className="p-2 border border-slate-300 rounded bg-slate-50 text-center">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Total Candidates</span>
                <strong className="text-sm font-black">{totalCandidates}</strong>
              </div>
            </div>

            {/* MASTER DATE SHEET & DUTY ROSTER TABLE */}
            {filteredRows.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-xl my-4 text-slate-500 font-medium">
                No examination slots match the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto my-3">
                <table className="w-full border-collapse border border-slate-900 text-left text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 border-b-2 border-slate-900 font-black">
                      <th className="border border-slate-900 p-2 text-center w-8">#</th>
                      <th className="border border-slate-900 p-2 whitespace-nowrap">Exam Date &amp; Day</th>
                      <th className="border border-slate-900 p-2 whitespace-nowrap">Shift &amp; Time</th>
                      <th className="border border-slate-900 p-2">Course Code &amp; Title</th>
                      <th className="border border-slate-900 p-2 text-center whitespace-nowrap">Dept / Sem</th>
                      <th className="border border-slate-900 p-2">Exam Hall / Room</th>
                      <th className="border border-slate-900 p-2">Chief Invigilator</th>
                      <th className="border border-slate-900 p-2">Assistant Invigilator</th>
                      <th className="border border-slate-900 p-2 text-center bg-slate-300 font-black whitespace-nowrap">
                        Paper Cutoff ({paperUploadDaysBefore}d)
                      </th>
                      <th className="border border-slate-900 p-2 text-center w-12">Cand.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, idx) => {
                      const cutoff = row.paperUploadDeadline;
                      const cutoffDays = row.uploadDaysBefore || paperUploadDaysBefore;
                      const isEven = idx % 2 === 0;

                      return (
                        <tr
                          key={row.id}
                          className={`page-break-inside-avoid ${isEven ? 'bg-white' : 'bg-slate-50'} ${
                            tableDensity === 'compact' ? 'text-[11px]' : 'text-xs'
                          }`}
                        >
                          <td className="border border-slate-900 p-2 text-center font-bold text-slate-700">
                            {idx + 1}
                          </td>
                          <td className="border border-slate-900 p-2 whitespace-nowrap">
                            <span className="font-black text-slate-900">{formatReadableDate(row.examDate)}</span>
                            <span className="block text-[10px] font-bold text-slate-600 uppercase">
                              {row.dayOfWeek}
                            </span>
                          </td>
                          <td className="border border-slate-900 p-2 whitespace-nowrap">
                            <span className="font-bold text-slate-900">{row.shift}</span>
                            <span className="block text-[10px] text-slate-600">
                              {row.startTime} – {row.endTime}
                            </span>
                          </td>
                          <td className="border border-slate-900 p-2">
                            <span className="font-mono font-black text-slate-900 mr-1.5">
                              {row.courseCode}
                            </span>
                            <span className="font-medium text-slate-800">{row.courseTitle}</span>
                            {row.paperSetterTeacherName && (
                              <span className="block text-[10px] text-slate-500 italic mt-0.5">
                                Setter: {row.paperSetterTeacherName}
                              </span>
                            )}
                          </td>
                          <td className="border border-slate-900 p-2 text-center whitespace-nowrap">
                            <span className="font-bold text-slate-900">{row.subject}</span>
                            <span className="block text-[10px] text-slate-600 font-semibold">
                              Sem {row.semester}
                            </span>
                          </td>
                          <td className="border border-slate-900 p-2 font-medium text-slate-900">
                            {row.hallLocation}
                          </td>
                          <td className="border border-slate-900 p-2 font-semibold text-slate-900">
                            {row.chiefInvigilator}
                          </td>
                          <td className="border border-slate-900 p-2 text-slate-800 font-medium">
                            {row.assistantInvigilator || '—'}
                          </td>
                          <td className="border border-slate-900 p-2 text-center font-black bg-slate-100 whitespace-nowrap">
                            <span className="text-slate-900">{formatReadableDate(cutoff)}</span>
                            <span className="block text-[9px] text-slate-500 font-bold uppercase">
                              ({cutoffDays} Days Prior)
                            </span>
                          </td>
                          <td className="border border-slate-900 p-2 text-center font-bold text-slate-900">
                            {row.totalCandidates || 65}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* MANDATORY CODE OF CONDUCT & EXAMINATION DIRECTIVES */}
            {showDirectives && (
              <div className="page-break-inside-avoid mt-6 p-4 rounded-xl border border-slate-900 bg-slate-50 text-xs space-y-1.5">
                <h4 className="font-black text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-slate-900" />
                  Mandatory Instructions for Faculty &amp; Candidates
                </h4>
                <ol className="list-decimal pl-5 space-y-1 text-slate-800 font-medium text-[11px] leading-relaxed">
                  <li>
                    <strong>Paper Setter Submission Deadline:</strong> In accordance with Institutional Examination Regulation 14(b), course instructors must upload verified question papers through the faculty portal strictly{' '}
                    <u>{paperUploadDaysBefore} days prior</u> to the scheduled examination date.
                  </li>
                  <li>
                    <strong>Candidate Reporting &amp; Identification:</strong> Candidates must occupy their allocated examination seats at least 15 minutes before paper commencement. No candidate will be admitted without original Roll Number Slips and College Student Identity Cards.
                  </li>
                  <li>
                    <strong>Prohibition of Electronic Devices:</strong> Mobile phones, smartwatches, programmable calculators, and unauthorized materials are strictly prohibited inside the examination halls. Confiscation and disciplinary action under UMC regulations will apply.
                  </li>
                  <li>
                    <strong>Invigilation Staff Protocol:</strong> Chief and Assistant Invigilators must report to the Central Examination Control Cell 30 minutes before commencement to collect sealed question paper packets and attendance rosters.
                  </li>
                  <li>
                    <strong>Hall Handover:</strong> At the conclusion of the shift, invigilators must verify candidate counts, seal answer booklets in tamper-evident envelopes, and deliver them to the Controller of Examinations Secretariat.
                  </li>
                </ol>
              </div>
            )}

            {/* OFFICIAL SIGNATURES & AUTHORIZATION BLOCK */}
            {showSignatures && (
              <div className="page-break-inside-avoid mt-10 pt-6 border-t border-slate-400">
                <div className="grid grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <div className="h-14 border-b border-slate-400 mb-1.5 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-slate-500 text-[11px]">Prof. M. Arshad</span>
                    </div>
                    <strong className="block text-slate-900">Superintendent of Exams</strong>
                    <span className="text-[10px] text-slate-500">Prepared &amp; Verified</span>
                  </div>

                  <div>
                    <div className="h-14 border-b border-slate-400 mb-1.5 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-slate-500 text-[11px]">Dr. Shahida Parveen</span>
                    </div>
                    <strong className="block text-slate-900">Deputy Controller</strong>
                    <span className="text-[10px] text-slate-500">Academic Concurrence</span>
                  </div>

                  <div>
                    <div className="h-14 border-b border-slate-400 mb-1.5 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-slate-800 text-[11px]">Prof. Tariq Mahmood</span>
                    </div>
                    <strong className="block text-slate-900">Controller of Examinations</strong>
                    <span className="text-[10px] text-slate-500">Official Seal &amp; Authority</span>
                  </div>

                  <div>
                    <div className="h-14 border-b border-slate-400 mb-1.5 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-slate-900 font-bold text-[11px]">Prof. Dr. Bilquis Jahan</span>
                    </div>
                    <strong className="block text-slate-900">Principal &amp; CAO</strong>
                    <span className="text-[10px] text-slate-500">Approved &amp; Counter-Signed</span>
                  </div>
                </div>

                {/* Distribution list */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-600 flex flex-wrap justify-between items-center gap-2">
                  <span>
                    <strong>Copy Forwarded To:</strong> 1. PS to Principal &bull; 2. All Heads of Departments &bull; 3. Chief Proctor &bull; 4. Notice Boards &amp; Official Faculty Portal
                  </span>
                  <span>
                    Document generated via Examination Automation System &bull; {todayFormatted}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NON-PRINT FOOTER BAR */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between gap-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Tip: For optimal printout quality, select <strong className="text-white">Landscape</strong> in your browser print settings.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Date Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* LOGO & BRANDING CUSTOMIZATION MODAL */}
        <LogoCustomizerModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
        />
      </div>
    </div>
  );
};
