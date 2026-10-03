import React, { useRef } from 'react';
import { Student } from '../../types';
import { useExam } from '../../context/ExamContext';
import {
  X,
  Printer,
  Calendar,
  Building2,
  Clock,
  User,
  ShieldCheck,
  Award,
  AlertCircle,
  FileText,
  QrCode,
} from 'lucide-react';
import { formatReadableDate } from '../../utils/whatsapp';

interface StudentRollNumberSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export const StudentRollNumberSlipModal: React.FC<StudentRollNumberSlipModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { dateSheetRows, collegeName, collegeLogo, courses } = useExam();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  // Filter scheduled exams for this student's department and semester
  const scheduledExams = dateSheetRows.filter(
    row =>
      row.subject === student.department &&
      Number(row.semester) === Number(student.currentSemester)
  );

  // If dateSheetRows has no rows for this semester yet, populate with courses catalog for the semester
  const semesterCourses = courses.filter(
    c => c.subject === student.department && Number(c.semester) === Number(student.currentSemester)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Top Modal Controls (Excluded in print via print:hidden) */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Official Examination Roll Number Slip (Admit Card)
              </h3>
              <p className="text-[11px] text-slate-400">
                Primary Key: <span className="font-mono text-emerald-300 font-bold">{student.rollNumber}</span> &bull; {student.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Roll Number Slip Document */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 bg-white">
          {/* Official Document Border Box */}
          <div className="border-2 border-emerald-900/80 p-5 sm:p-7 rounded-2xl relative bg-linear-to-b from-white via-emerald-50/20 to-white">
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-900" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-900" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-900" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-900" />

            {/* Header: Institutional Crest & Title */}
            <div className="text-center pb-5 border-b-2 border-slate-800 space-y-1 relative">
              <div className="flex items-center justify-between gap-4">
                {/* Left Logo / Crest */}
                <div className="w-16 h-16 rounded-xl bg-emerald-100/60 border border-emerald-300 flex items-center justify-center shrink-0">
                  {collegeLogo ? (
                    <img src={collegeLogo} alt="Logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <Building2 className="w-8 h-8 text-emerald-800" />
                  )}
                </div>

                {/* College Title */}
                <div className="flex-1 text-center space-y-0.5">
                  <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight font-serif">
                    {collegeName || 'Govt. Girls Model Degree College, Quetta'}
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wider">
                    Office of the Controller of Examinations
                  </h2>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Jinnah Town Campus, Quetta &bull; BS 4-Year Semester Examination System
                  </p>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest mt-1">
                    Official Roll Number Slip &bull; Examination Admit Card
                  </div>
                </div>

                {/* Right QR / Verification Code Placeholder */}
                <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 bg-white flex flex-col items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-slate-700" />
                  <span className="text-[8px] font-mono text-slate-500 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Candidate Dossier (Identification Info) */}
            <div className="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Roll Number (Primary Key):
                    </span>
                    <span className="font-mono text-base font-black text-emerald-900 tracking-wide">
                      {student.rollNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Registration Number:
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {student.registrationNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Candidate Full Name:
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {student.name}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Father's Name:
                    </span>
                    <span className="font-medium text-slate-800 text-xs">
                      {student.fatherName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Department / Discipline:
                    </span>
                    <span className="font-bold text-indigo-900 text-xs">
                      Department of {student.department}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Active Semester &amp; Session:
                    </span>
                    <span className="font-bold text-slate-800 text-xs">
                      Semester {student.currentSemester} &bull; {student.session}
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Photograph / Seal Card */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
                <div className="w-20 h-24 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center mb-1 text-slate-400">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <span className="text-[9px] text-slate-500 font-semibold">Affixed Photo</span>
                <span className="text-[8px] text-slate-400 font-mono">GGMDC Verified</span>
              </div>
            </div>

            {/* Scheduled Examination Paper Timetable Table */}
            <div className="py-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  Course Examination Dates, Time &amp; Hall Allocation (Semester {student.currentSemester})
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {scheduledExams.length > 0 ? `${scheduledExams.length} Papers Scheduled` : `${semesterCourses.length} Courses Enrolled`}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-300">
                    <tr>
                      <th className="px-3 py-2">Sr.</th>
                      <th className="px-3 py-2">Course Code &amp; Title</th>
                      <th className="px-3 py-2">Exam Date &amp; Day</th>
                      <th className="px-3 py-2">Time Slot</th>
                      <th className="px-3 py-2">Allocated Hall</th>
                      <th className="px-3 py-2 text-center">Invigilator Initial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scheduledExams.length > 0 ? (
                      scheduledExams.map((exam, idx) => (
                        <tr key={exam.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2.5 font-bold text-slate-500 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono font-bold text-emerald-950 mr-1.5">
                              {exam.courseCode}
                            </span>
                            <span className="font-medium text-slate-800">
                              {exam.courseTitle}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-900">
                            <div>{formatReadableDate(exam.examDate)}</div>
                            <span className="text-[10px] text-slate-500">{exam.dayOfWeek}</span>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-slate-800">
                            <div>{exam.startTime} – {exam.endTime}</div>
                            <span className="text-[10px] text-slate-500">{exam.shift}</span>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-slate-700 truncate max-w-[150px]">
                            {exam.hallLocation}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="w-14 h-6 border border-dashed border-slate-300 rounded mx-auto" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      semesterCourses.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-2.5 font-bold text-slate-500 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono font-bold text-emerald-950 mr-1.5">
                              {c.code}
                            </span>
                            <span className="font-medium text-slate-800">
                              {c.title}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 italic">
                            Date Sheet Active (See Notice Board)
                          </td>
                          <td className="px-3 py-2.5 text-slate-500">
                            Morning Shift (09:00 AM)
                          </td>
                          <td className="px-3 py-2.5 text-slate-700">
                            Central Examination Hall
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="w-14 h-6 border border-dashed border-slate-300 rounded mx-auto" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidate Instructions */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-900 block text-xs">
                Important Examination Instructions for Candidate:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] leading-relaxed">
                <li>
                  This Roll Number Slip (Admit Card) is strictly mandatory for entering the Examination Hall.
                </li>
                <li>
                  Candidates must report to their assigned Exam Hall at least <strong>30 minutes prior</strong> to the commencement of the exam.
                </li>
                <li>
                  Mobile phones, programmable calculators, smart watches, and unauthorized paper materials are strictly prohibited.
                </li>
                <li>
                  Keep this slip safe until the declaration of official gazetted results by the University/College.
                </li>
              </ul>
            </div>

            {/* Signatures & Seal Block */}
            <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="border-t border-slate-800 pt-1.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">
                  Candidate's Signature
                </span>
                <span className="text-[9px] text-slate-400">To be signed in exam hall</span>
              </div>

              <div className="border-t border-slate-800 pt-1.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase block">
                  Chief Invigilator
                </span>
                <span className="text-[9px] text-slate-400">Hall Verification Stamp</span>
              </div>

              <div className="border-t border-slate-800 pt-1.5">
                <span className="text-[10px] font-bold text-emerald-950 uppercase block">
                  Controller of Examinations
                </span>
                <span className="text-[9px] text-slate-400">Govt. Girls Model Degree College</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
