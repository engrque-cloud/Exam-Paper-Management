import React from 'react';
import { Building2, Award } from 'lucide-react';
import { StudentMarksheetRecord } from './PrintableMarksheetModal';

interface PrintableMarksheetCardProps {
  record: StudentMarksheetRecord;
  collegeName?: string;
  collegeLogo?: string | null;
  collegeLogoRight?: string | null;
  currentDateFormatted?: string;
  className?: string;
}

export const PrintableMarksheetCard: React.FC<PrintableMarksheetCardProps> = ({
  record,
  collegeName,
  collegeLogo,
  collegeLogoRight,
  currentDateFormatted,
  className = '',
}) => {
  // Compute cumulative summary across all courses
  const totalCourses = record.courseEntries.length;
  const totalMaxMarks = totalCourses * 100;
  const totalObtainedMarks = record.courseEntries.reduce(
    (acc, curr) => acc + (curr.entry.totalMarks || 0),
    0
  );
  const overallPercentage = totalCourses > 0 ? (totalObtainedMarks / totalMaxMarks) * 100 : 0;
  const totalGpaSum = record.courseEntries.reduce(
    (acc, curr) => acc + (curr.entry.gpa || 0),
    0
  );
  const cumulativeGpa = totalCourses > 0 ? totalGpaSum / totalCourses : 0;
  const anyFailed = record.courseEntries.some(c => c.entry.status === 'Fail');
  const overallResultStatus = anyFailed ? 'PROMOTED WITH DEFICIT' : 'PASSED';

  // Primary semester & program details from first course or defaults
  const primaryEntry = record.courseEntries[0];
  const departmentName = primaryEntry?.course.subject || 'Higher Education';
  const semesterNumber = primaryEntry?.course.semester || 1;
  const academicSession = primaryEntry?.course.academicSession || 'Fall 2026';

  const issueDate = currentDateFormatted || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`border-4 border-double border-slate-900 p-6 sm:p-8 rounded-lg bg-white relative font-serif text-slate-900 page-break-inside-avoid ${className}`}
    >
      {/* Watermark in background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <Building2 className="w-96 h-96 text-slate-900" />
      </div>

      {/* Official Institutional Header (Exact match to Date Sheet) */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center relative z-10">
        <div className="flex items-center justify-between gap-4 mb-2">
          {/* Left Logo Slot */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-900 flex items-center justify-center p-1.5 shrink-0 bg-white shadow-2xs">
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
          </div>

          {/* College / University Name matching Date Sheet */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
              {collegeName || 'Govt. Girls Model Degree College'}
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mt-0.5 font-sans">
              Office of the Controller of Examinations &bull; Jinnah Town, Quetta
            </h2>
            <div className="text-[11px] font-semibold text-slate-600 mt-0.5 font-sans">
              Affiliated with University of Balochistan &bull; Higher Education Department
            </div>
            <div className="inline-block px-4 py-0.5 mt-1.5 rounded-full border border-slate-900 font-black text-xs uppercase tracking-wider bg-slate-100 text-slate-900 font-sans">
              OFFICIAL SEMESTER RESULT MARKS SHEET / TRANSCRIPT
            </div>
          </div>

          {/* Right Logo / Institutional Seal Slot */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-900 flex items-center justify-center p-1.5 shrink-0 bg-white shadow-2xs">
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
                  SEAL
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 font-sans mt-3 px-2 border-t border-slate-200 pt-2">
          <span>
            <strong>Transcript Serial:</strong> GGMDC/TR-
            {record.rollNumber.replace(/[^a-zA-Z0-9]/g, '')}-2026
          </span>
          <span>
            <strong>Issue Date:</strong> {issueDate}
          </span>
          <span>
            <strong>Academic Session:</strong> {academicSession}
          </span>
        </div>
      </div>

      {/* Candidate Demographic Particulars Box */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-5 text-xs font-sans grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Candidate Name
          </span>
          <span className="font-bold text-slate-900 text-sm">{record.studentName}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Roll Number
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">{record.rollNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Department / Major
          </span>
          <span className="font-semibold text-slate-900">{departmentName}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Enrolled Semester
          </span>
          <span className="font-semibold text-slate-900">
            Semester {semesterNumber} (Regular)
          </span>
        </div>
      </div>

      {/* Detailed Course Marks & Grade Ledger Table */}
      <div className="mb-5 overflow-x-auto">
        <table className="w-full text-left text-xs font-sans border-collapse border border-slate-400">
          <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
            <tr>
              <th className="border border-slate-300 px-3 py-2 text-center w-10">Sr</th>
              <th className="border border-slate-300 px-3 py-2 w-24">Course Code</th>
              <th className="border border-slate-300 px-3 py-2">Course Title</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-16">Assign (10)</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-16">Mid (20)</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-16">Final (70)</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-16 font-black">
                Total (100)
              </th>
              <th className="border border-slate-300 px-3 py-2 text-center w-14 font-black">Grade</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-14">GPA</th>
              <th className="border border-slate-300 px-3 py-2 text-center w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {record.courseEntries.map(({ course, entry }, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 px-3 py-2 text-center font-mono text-slate-500">
                  {idx + 1}
                </td>
                <td className="border border-slate-300 px-3 py-2 font-mono font-bold text-indigo-900">
                  {course.courseCode}
                </td>
                <td className="border border-slate-300 px-3 py-2 font-semibold text-slate-900">
                  {course.courseTitle}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {entry.assignmentMarks}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {entry.midtermMarks}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center text-slate-700">
                  {entry.finalMarks}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center font-bold font-mono text-slate-950 bg-slate-50">
                  {entry.totalMarks}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center font-bold">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      entry.grade === 'A+' || entry.grade === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : entry.grade === 'B+' || entry.grade === 'B'
                        ? 'bg-blue-100 text-blue-800'
                        : entry.grade === 'F'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {entry.grade}
                  </span>
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold text-slate-800">
                  {entry.gpa.toFixed(1)}
                </td>
                <td className="border border-slate-300 px-3 py-2 text-center font-bold">
                  <span className={entry.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700'}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cumulative Summary Box */}
      <div className="p-4 bg-slate-100/90 border border-slate-300 rounded-xl mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans text-xs">
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Total Marks Obtained
          </span>
          <span className="font-bold text-slate-900 text-sm">
            {totalObtainedMarks} <span className="text-slate-400 font-normal">/ {totalMaxMarks}</span>
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Overall Percentage
          </span>
          <span className="font-bold text-slate-900 text-sm">
            {overallPercentage.toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Semester GPA (SGPA)
          </span>
          <span className="font-bold text-emerald-700 text-sm">
            {cumulativeGpa.toFixed(2)} / 4.00
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[10px] font-bold block">
            Semester Result
          </span>
          <span
            className={`font-black text-sm ${
              anyFailed ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {overallResultStatus}
          </span>
        </div>
      </div>

      {/* Grading System Scale & Key */}
      <div className="text-[10px] font-sans border border-slate-300 rounded-lg p-3 bg-white text-slate-600 mb-8 leading-relaxed">
        <div className="font-bold text-slate-800 uppercase mb-1">
          Grading Scale & Regulatory Footnote:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-200 pb-2 mb-2">
          <div>A+ : 85–100% (4.00 GPA)</div>
          <div>A : 80–84% (3.70 GPA)</div>
          <div>B+ : 75–79% (3.30 GPA)</div>
          <div>B : 70–74% (3.00 GPA)</div>
          <div>C : 60–69% (2.50 GPA)</div>
        </div>
        <p>&bull; Minimum pass percentage per course is 50% as per HEC semester regulations.</p>
        <p>
          &bull; This official marks sheet is computer-generated and issued by the Examination
          Authority of Govt. Girls Model Degree College, Quetta.
        </p>
        <p>&bull; Errors and omissions excepted (E&amp;OE).</p>
      </div>

      {/* Signatures & Official Stamping (Matching Date Sheet Authority) */}
      <div className="font-sans grid grid-cols-3 pt-8 border-t border-slate-400 text-xs text-center">
        <div>
          <div className="w-36 mx-auto border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-serif italic">
            Tabulator / Incharge
          </div>
          <p className="text-slate-600 font-semibold">Verification Officer</p>
          <p className="text-slate-400 text-[10px]">Academic Records</p>
        </div>

        <div>
          <div className="w-36 mx-auto border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-serif italic">
            Prof. Tariq Mahmood
          </div>
          <p className="text-slate-600 font-semibold">Controller of Examinations</p>
          <p className="text-slate-400 text-[10px]">GGMDC, Jinnah Town</p>
        </div>

        <div>
          <div className="w-36 mx-auto border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-serif italic">
            Prof. Dr. Bilquis Jahan
          </div>
          <p className="text-slate-600 font-semibold">Principal &amp; CAO</p>
          <p className="text-slate-400 text-[10px]">Govt. Girls Model Degree College</p>
        </div>
      </div>
    </div>
  );
};
