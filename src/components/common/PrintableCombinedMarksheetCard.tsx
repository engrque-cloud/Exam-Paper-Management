import React from 'react';
import { Building2, Award, ShieldCheck } from 'lucide-react';
import { ExamResult, StudentResultEntry } from '../../types';

export interface CombinedStudentExamProfile {
  studentName: string;
  primaryRollNumber: string;
  allRollNumbers: string[];
  department: string;
  degreeProgram: string;
  academicSession: string;
  courseEntries: {
    course: ExamResult;
    entry: StudentResultEntry;
  }[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  cgpa: number;
  totalCreditHours: number;
  passedCount: number;
  failedCount: number;
  status: 'Pass' | 'Fail';
  standingText: string;
}

export interface PrintableCombinedMarksheetCardProps {
  profile: CombinedStudentExamProfile;
  collegeName?: string;
  collegeLogo?: string | null;
  collegeLogoRight?: string | null;
  currentDateFormatted?: string;
  className?: string;
}

export const PrintableCombinedMarksheetCard: React.FC<PrintableCombinedMarksheetCardProps> = ({
  profile,
  collegeName,
  collegeLogo,
  collegeLogoRight,
  currentDateFormatted,
  className = '',
}) => {
  const issueDate =
    currentDateFormatted ||
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const serialNumber = `GGMDC/CTR-2026/${profile.primaryRollNumber.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      className={`force-single-page-print border-4 border-double border-slate-900 p-4 sm:p-6 print:p-4 rounded-lg bg-white relative font-serif text-slate-900 page-break-inside-avoid shadow-sm ${className}`}
    >
      {/* Background Institutional Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <Building2 className="w-80 h-80 sm:w-96 sm:h-96 text-slate-900" />
      </div>

      {/* Official Header (Synchronized with Date Sheet & University Gazette) */}
      <div className="border-b-2 border-slate-900 pb-3 mb-3 text-center relative z-10">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          {/* Left Institutional Crest */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-slate-900 flex items-center justify-center p-1 shrink-0 bg-white shadow-2xs">
            {collegeLogo ? (
              <img
                src={collegeLogo}
                alt="College Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Building2 className="w-6 h-6 text-emerald-900" />
                <span className="text-[6px] font-black uppercase text-emerald-950 tracking-tighter leading-tight mt-0.5">
                  GGMDC
                </span>
              </div>
            )}
          </div>

          {/* College & Examination Directorate Header */}
          <div className="flex-1 text-center px-1">
            <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900 font-serif leading-tight">
              {collegeName || 'Govt. Girls Model Degree College, Jinnah Town, Quetta'}
            </h1>
            <h2 className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-widest mt-0.5 font-sans">
              Office of the Controller of Examinations &bull; Academic Examination Directorate
            </h2>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 font-sans">
              Affiliated with University of Balochistan &bull; Higher Education Department
            </div>
            <div className="inline-block px-3 py-0.5 mt-1 rounded-full border border-slate-900 font-black text-[10px] sm:text-[11px] uppercase tracking-wider bg-slate-100 text-slate-900 font-sans">
              OFFICIAL CONSOLIDATED SEMESTER TRANSCRIPT &bull; COMBINED EXAMINATION RECORD
            </div>
          </div>

          {/* Right Quality & Ratification Seal */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-slate-900 flex items-center justify-center p-1 shrink-0 bg-white shadow-2xs">
            {collegeLogoRight ? (
              <img
                src={collegeLogoRight}
                alt="Institutional Seal"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-900" />
                <span className="text-[6px] font-black uppercase text-emerald-950 tracking-tighter leading-tight mt-0.5">
                  VERIFIED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Metadata Ribbon */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600 font-sans border-t border-slate-200 pt-1.5 px-1">
          <span>
            <strong>Transcript Serial:</strong> {serialNumber}
          </span>
          <span>
            <strong>Issue Date:</strong> {issueDate}
          </span>
          <span>
            <strong>Academic Term:</strong> {profile.academicSession} (Combined Regular)
          </span>
        </div>
      </div>

      {/* Candidate Biographical Particulars Box */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mb-3 text-xs font-sans grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:py-2 print:mb-2">
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Candidate Name</span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">{profile.studentName}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Roll Number</span>
          <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
            {profile.primaryRollNumber}
          </span>
          {profile.allRollNumbers.length > 1 && (
            <span className="text-[9px] text-slate-500 block truncate">
              Also enrolled: {profile.allRollNumbers.slice(1).join(', ')}
            </span>
          )}
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Department / Major</span>
          <span className="font-semibold text-slate-900 text-xs">{profile.department}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Degree Program</span>
          <span className="font-semibold text-slate-900 text-xs">{profile.degreeProgram}</span>
        </div>
      </div>

      {/* Combined Course Examination Results Table (Compact Single-Page Fit) */}
      <div className="mb-3 overflow-x-auto print:mb-2">
        <table className="w-full text-left text-[11px] print:text-[10px] font-sans border-collapse border border-slate-400">
          <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[9px] print:text-[8px]">
            <tr>
              <th className="border border-slate-300 px-2 py-1.5 text-center w-8">Sr</th>
              <th className="border border-slate-300 px-2 py-1.5 w-20">Course Code</th>
              <th className="border border-slate-300 px-2 py-1.5">Course Examination Title</th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-12">Sem</th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-12">Cr. Hr</th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-14">Assign (10)</th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-14">Mid (20)</th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-14">Final (70)</th>
              <th className="border border-slate-300 px-2 py-1.5 text-center w-16 font-black bg-slate-200/60">
                Total (100)
              </th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-12 font-black">Grade</th>
              <th className="border border-slate-300 px-1.5 py-1.5 text-center w-12">G.P</th>
              <th className="border border-slate-300 px-2 py-1.5 text-center w-16 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {profile.courseEntries.map(({ course, entry }, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/75'}>
                <td className="border border-slate-300 px-2 py-1 text-center font-mono text-slate-500">
                  {idx + 1}
                </td>
                <td className="border border-slate-300 px-2 py-1 font-mono font-bold text-indigo-900">
                  {course.courseCode}
                </td>
                <td className="border border-slate-300 px-2 py-1 font-semibold text-slate-900">
                  {course.courseTitle}
                  <span className="text-[9px] text-slate-400 font-normal ml-1">
                    ({course.subject})
                  </span>
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-medium text-slate-700">
                  S-{course.semester}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-medium text-slate-700">
                  {course.creditHours || 3}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center text-slate-700">
                  {entry.assignmentMarks}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center text-slate-700">
                  {entry.midtermMarks}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center text-slate-700">
                  {entry.finalMarks}
                </td>
                <td className="border border-slate-300 px-2 py-1 text-center font-bold font-mono text-slate-950 bg-slate-100/70">
                  {entry.totalMarks}
                </td>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-bold">
                  <span
                    className={`inline-block px-1 rounded text-[10px] font-bold ${
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
                <td className="border border-slate-300 px-1.5 py-1 text-center font-mono font-bold text-slate-800">
                  {entry.gpa.toFixed(1)}
                </td>
                <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                  <span
                    className={`text-[10px] ${
                      entry.status === 'Pass' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cumulative Consolidated Results Summary (Single-Page Optimized) */}
      <div className="p-3 bg-slate-100/90 border border-slate-300 rounded-lg mb-3 grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-sans text-xs print:p-2 print:mb-2">
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Credit Hours</span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {profile.totalCreditHours} <span className="text-slate-400 font-normal">Cr. Hrs</span>
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Total Marks</span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {profile.totalMarksObtained}{' '}
            <span className="text-slate-400 font-normal">/ {profile.totalMaxMarks}</span>
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Overall Percentage</span>
          <span className="font-bold text-emerald-700 text-xs sm:text-sm">
            {profile.percentage}%
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Cumulative GPA (CGPA)</span>
          <span className="font-mono font-black text-indigo-900 text-xs sm:text-sm">
            {profile.cgpa.toFixed(2)}{' '}
            <span className="text-slate-400 font-normal text-[10px]">/ 4.00</span>
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase text-[9px] font-bold block">Academic Result</span>
          <span
            className={`font-bold text-xs uppercase ${
              profile.status === 'Pass' ? 'text-emerald-800' : 'text-rose-800'
            }`}
          >
            {profile.status === 'Pass' ? 'PASSED & PROMOTED' : 'DEFICIT COURSES'}
          </span>
        </div>
      </div>

      {/* Academic Standing & Statutory Grading Scale */}
      <div className="border border-slate-300 rounded p-2 text-[9px] font-sans text-slate-600 bg-white mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 print:mb-2">
        <div>
          <span className="font-bold text-slate-800 block uppercase">Official Standing:</span>
          <span className="font-semibold text-slate-900">{profile.standingText}</span>
        </div>
        <div className="text-[8.5px] text-slate-500 leading-tight">
          <strong>Grading Scheme:</strong> A+ (85%+ / 4.0), A (80-84% / 3.7), B+ (75-79% / 3.3), B (70-74% / 3.0), C (60-69% / 2.0), D (50-59% / 1.0), F (&lt;50% / 0.0). Certified single-page transcript copy.
        </div>
      </div>

      {/* Official Signatures & University Authority (Prof. Tariq Mahmood & Prof. Dr. Bilquis Jahan) */}
      <div className="pt-2 border-t-2 border-slate-900 font-sans grid grid-cols-3 gap-3 text-xs items-end print:pt-1">
        <div>
          <div className="text-[10px] text-slate-400 font-mono mb-1">Prepared &amp; Verified By:</div>
          <div className="w-36 border-b border-slate-700 pb-0.5 font-bold text-slate-800 font-serif italic text-[11px]">
            In-Charge Tabulation
          </div>
          <p className="text-slate-500 text-[9px]">Examination Cell, GGMDC</p>
        </div>

        <div className="text-center">
          <div className="w-44 mx-auto border-b-2 border-slate-900 pb-0.5 font-black text-slate-950 font-serif italic text-xs">
            Prof. Tariq Mahmood
          </div>
          <p className="text-slate-900 font-bold text-[10px] uppercase tracking-tight">
            Controller of Examinations
          </p>
          <p className="text-slate-500 text-[9px]">Official Seal &amp; Authority</p>
        </div>

        <div className="text-right">
          <div className="w-44 ml-auto border-b-2 border-slate-900 pb-0.5 font-black text-slate-950 font-serif italic text-xs">
            Prof. Dr. Bilquis Jahan
          </div>
          <p className="text-slate-900 font-bold text-[10px] uppercase tracking-tight">
            Principal &amp; CAO
          </p>
          <p className="text-slate-500 text-[9px]">Approved &amp; Counter-Signed</p>
        </div>
      </div>
    </div>
  );
};
