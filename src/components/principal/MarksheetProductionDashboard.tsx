import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber, ExamResult, StudentResultEntry } from '../../types';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';
import {
  GraduationCap,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Award,
  Layers,
  ChevronRight,
  Eye,
  Check,
  Building2,
  BookOpen,
  ArrowUpDown,
  Download,
  Users,
  FileCheck2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PrintableMarksheetModal,
  StudentMarksheetRecord,
} from '../common/PrintableMarksheetModal';
import { BatchPrintableMarksheetsModal } from '../common/BatchPrintableMarksheetsModal';
import {
  PrintableCombinedMarksheetCard,
  CombinedStudentExamProfile,
} from '../common/PrintableCombinedMarksheetCard';
import { CombinedStudentMarksheetModal } from '../common/CombinedStudentMarksheetModal';

export interface AggregatedStudent {
  rollNumber: string;
  studentName: string;
  department: string;
  semester: number;
  academicSession: string;
  courseEntries: {
    course: ExamResult;
    entry: StudentResultEntry;
  }[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  sgpa: number;
  status: 'Pass' | 'Fail';
  deficitCount: number;
}

export const MarksheetProductionDashboard: React.FC = () => {
  const {
    results,
    courses,
    subjects,
    semesters,
    collegeName,
    collegeLogo,
    collegeLogoRight,
  } = useExam();

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'All'>('All');
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pass' | 'Fail'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected students for batch printing
  const [selectedRolls, setSelectedRolls] = useState<Set<string>>(new Set());

  // Combined Single-Student 1-Page Marksheet State
  const [selectedStudentNameForCombined, setSelectedStudentNameForCombined] = useState<string>('');
  const [nameSearchFilter, setNameSearchFilter] = useState<string>('');
  const [isCombinedModalOpen, setIsCombinedModalOpen] = useState<boolean>(false);
  const [showOnPageCombinedPreview, setShowOnPageCombinedPreview] = useState<boolean>(true);

  // Modals
  const [singleStudentModalRecord, setSingleStudentModalRecord] = useState<StudentMarksheetRecord | null>(null);
  const [batchModalRecords, setBatchModalRecords] = useState<StudentMarksheetRecord[] | null>(null);
  const [batchModalTitle, setBatchModalTitle] = useState<string>('Official Batch Marksheets');

  // Aggregate all unique students from results
  const allStudents = useMemo(() => {
    const studentMap = new Map<string, AggregatedStudent>();

    results.forEach(res => {
      res.students.forEach(st => {
        const rollKey = st.rollNumber.trim().toUpperCase();
        if (!studentMap.has(rollKey)) {
          studentMap.set(rollKey, {
            rollNumber: st.rollNumber,
            studentName: st.studentName,
            department: res.subject,
            semester: res.semester,
            academicSession: res.academicSession || 'Fall 2026',
            courseEntries: [{ course: res, entry: st }],
            totalMarksObtained: st.totalMarks,
            totalMaxMarks: 100,
            percentage: st.percentage,
            sgpa: st.gpa,
            status: st.status,
            deficitCount: st.status === 'Fail' ? 1 : 0,
          });
        } else {
          const current = studentMap.get(rollKey)!;
          current.courseEntries.push({ course: res, entry: st });
          current.totalMarksObtained += st.totalMarks;
          current.totalMaxMarks += 100;
          current.percentage = Number(
            ((current.totalMarksObtained / current.totalMaxMarks) * 100).toFixed(1)
          );
          const gpaSum = current.courseEntries.reduce((acc, c) => acc + c.entry.gpa, 0);
          current.sgpa = Number((gpaSum / current.courseEntries.length).toFixed(2));
          if (st.status === 'Fail') {
            current.status = 'Fail';
            current.deficitCount += 1;
          }
        }
      });
    });

    return Array.from(studentMap.values()).sort((a, b) =>
      a.rollNumber.localeCompare(b.rollNumber)
    );
  }, [results]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return allStudents.filter(st => {
      if (selectedSubject !== 'All' && st.department !== selectedSubject) return false;
      if (selectedSemester !== 'All' && st.semester !== selectedSemester) return false;
      if (statusFilter !== 'All' && st.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRoll = st.rollNumber.toLowerCase().includes(q);
        const matchesName = st.studentName.toLowerCase().includes(q);
        const matchesDept = st.department.toLowerCase().includes(q);
        if (!matchesRoll && !matchesName && !matchesDept) return false;
      }
      return true;
    });
  }, [allStudents, selectedSubject, selectedSemester, statusFilter, searchQuery]);

  // Aggregate Stats
  const totalStudentsCount = allStudents.length;
  const filteredCount = filteredStudents.length;
  const passedStudentsCount = allStudents.filter(s => s.status === 'Pass').length;
  const deficitStudentsCount = allStudents.filter(s => s.status === 'Fail').length;
  const passRate = totalStudentsCount > 0
    ? ((passedStudentsCount / totalStudentsCount) * 100).toFixed(1)
    : '0';
  const avgSgpa = allStudents.length > 0
    ? (allStudents.reduce((acc, s) => acc + s.sgpa, 0) / allStudents.length).toFixed(2)
    : '0.00';

  // All unique candidate names across all results
  const allCandidateNames = useMemo(() => {
    const nameSet = new Set<string>();
    results.forEach(res => {
      res.students.forEach(st => {
        if (st.studentName && st.studentName.trim()) {
          nameSet.add(st.studentName.trim());
        }
      });
    });
    return Array.from(nameSet).sort((a, b) => a.localeCompare(b));
  }, [results]);

  const activeCombinedStudentName =
    selectedStudentNameForCombined || allCandidateNames[0] || '';

  // Filtered candidate names for quick search dropdown
  const filteredCandidateNames = useMemo(() => {
    if (!nameSearchFilter.trim()) return allCandidateNames;
    const q = nameSearchFilter.toLowerCase().trim();
    return allCandidateNames.filter(n => n.toLowerCase().includes(q));
  }, [allCandidateNames, nameSearchFilter]);

  // Combined Profile for Active Candidate
  const combinedProfile = useMemo<CombinedStudentExamProfile | null>(() => {
    const target = activeCombinedStudentName.trim().toLowerCase();
    if (!target) return null;

    const matchingEntries: { course: ExamResult; entry: StudentResultEntry }[] = [];
    results.forEach(res => {
      res.students.forEach(st => {
        if (
          st.studentName.trim().toLowerCase() === target ||
          st.rollNumber.trim().toLowerCase() === target
        ) {
          if (!matchingEntries.some(m => m.course.id === res.id)) {
            matchingEntries.push({ course: res, entry: st });
          }
        }
      });
    });

    if (matchingEntries.length === 0) return null;

    const allRolls = Array.from(new Set(matchingEntries.map(m => m.entry.rollNumber)));
    const primaryRoll = allRolls[0] || '2026-N/A';
    const totalMarksObtained = matchingEntries.reduce((acc, m) => acc + m.entry.totalMarks, 0);
    const totalMaxMarks = matchingEntries.length * 100;
    const percentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(1)) : 0;
    const totalCreditHours = matchingEntries.reduce((acc, m) => acc + (m.course.creditHours || 3), 0);
    const totalWeightedGpa = matchingEntries.reduce((acc, m) => acc + (m.entry.gpa * (m.course.creditHours || 3)), 0);
    const cgpa = totalCreditHours > 0 ? Number((totalWeightedGpa / totalCreditHours).toFixed(2)) : 0;
    const passedCount = matchingEntries.filter(m => m.entry.status === 'Pass').length;
    const failedCount = matchingEntries.filter(m => m.entry.status === 'Fail').length;
    const status: 'Pass' | 'Fail' = failedCount === 0 ? 'Pass' : 'Fail';

    let standingText = '';
    if (failedCount > 0) {
      standingText = `DEFICIT IN ${failedCount} COURSE(S) (PROMOTED WITH REAPPEAR REQUIREMENT)`;
    } else if (cgpa >= 3.7) {
      standingText = 'PASSED WITH HIGHEST DISTINCTION (1ST DIVISION)';
    } else if (cgpa >= 3.0) {
      standingText = 'PASSED WITH 1ST DIVISION';
    } else if (cgpa >= 2.0) {
      standingText = 'PASSED WITH 2ND DIVISION';
    } else {
      standingText = 'PASSED WITH 3RD DIVISION';
    }

    return {
      studentName: matchingEntries[0].entry.studentName,
      primaryRollNumber: primaryRoll,
      allRollNumbers: allRolls,
      department: matchingEntries[0].course.subject,
      degreeProgram: 'BS (4 Years) Degree Program',
      academicSession: matchingEntries[0].course.academicSession || 'Fall 2026',
      courseEntries: matchingEntries,
      totalMarksObtained,
      totalMaxMarks,
      percentage,
      cgpa,
      totalCreditHours,
      passedCount,
      failedCount,
      status,
      standingText,
    };
  }, [activeCombinedStudentName, results]);

  const handleSelectStudentForCombined = (name: string) => {
    setSelectedStudentNameForCombined(name);
    setShowOnPageCombinedPreview(true);
  };

  const handleOpenCombinedModalForStudent = (name: string) => {
    setSelectedStudentNameForCombined(name);
    setIsCombinedModalOpen(true);
  };

  const handleDirectPrintCombined = (name?: string) => {
    if (name) {
      setSelectedStudentNameForCombined(name);
    }
    setIsCombinedModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Toggle selection
  const toggleSelectStudent = (roll: string) => {
    setSelectedRolls(prev => {
      const next = new Set(prev);
      if (next.has(roll)) {
        next.delete(roll);
      } else {
        next.add(roll);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedRolls(new Set(filteredStudents.map(s => s.rollNumber)));
  };

  const deselectAll = () => {
    setSelectedRolls(new Set());
  };

  // Convert AggregatedStudent to StudentMarksheetRecord
  const toMarksheetRecord = (st: AggregatedStudent): StudentMarksheetRecord => ({
    rollNumber: st.rollNumber,
    studentName: st.studentName,
    courseEntries: st.courseEntries,
  });

  // Action: Print Specific Student
  const handlePrintSpecificStudent = (st: AggregatedStudent) => {
    setSingleStudentModalRecord(toMarksheetRecord(st));
  };

  // Action: Batch Print All Filtered
  const handlePrintAllFiltered = () => {
    if (filteredStudents.length === 0) return;
    const records = filteredStudents.map(toMarksheetRecord);
    setBatchModalTitle(
      `Official Marksheets Batch (${filteredStudents.length} Students ${
        selectedSubject !== 'All' ? `• ${selectedSubject}` : ''
      } ${selectedSemester !== 'All' ? `• Sem ${selectedSemester}` : ''})`
    );
    setBatchModalRecords(records);
  };

  // Action: Batch Print Selected
  const handlePrintSelected = () => {
    const selected = filteredStudents.filter(s => selectedRolls.has(s.rollNumber));
    if (selected.length === 0) return;
    const records = selected.map(toMarksheetRecord);
    setBatchModalTitle(`Official Marksheets Batch (${selected.length} Selected Students)`);
    setBatchModalRecords(records);
  };

  // Export Summary CSV
  const handleExportCsv = () => {
    if (filteredStudents.length === 0) return;
    const headers = [
      'Roll Number',
      'Student Name',
      'Department',
      'Semester',
      'Total Marks Obtained',
      'Max Marks',
      'Percentage',
      'SGPA',
      'Academic Standing',
      'Courses Count',
    ];

    const rows = filteredStudents.map(s => [
      `"${s.rollNumber}"`,
      `"${s.studentName}"`,
      `"${s.department}"`,
      s.semester,
      s.totalMarksObtained,
      s.totalMaxMarks,
      `${s.percentage}%`,
      s.sgpa.toFixed(2),
      `"${s.status === 'Pass' ? 'PASSED' : 'PROMOTED WITH DEFICIT'}"`,
      s.courseEntries.length,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Marksheets_Roster_${selectedSubject}_Sem${selectedSemester}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Office of the Principal &bull; Controller of Examinations</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Student Marksheet Production &amp; Printing Command Center
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Formal Transcript Directorate: Generate, verify, and print official semester marks sheets for specific students or batch-print for all enrolled candidates with authentic institutional crests, grading key, and regulatory sign-offs.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {selectedRolls.size > 0 && (
              <button
                onClick={handlePrintSelected}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
                title={`Print ${selectedRolls.size} selected marksheet(s)`}
              >
                <Printer className="w-4 h-4" />
                <span>Print Selected ({selectedRolls.size})</span>
              </button>
            )}

            <button
              id="batch-generate-all-btn"
              onClick={handlePrintAllFiltered}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
              title="Generate and batch-print marksheets for all students currently matching filters"
            >
              <Layers className="w-4 h-4" />
              <span>
                Generate &amp; Print ALL ({filteredCount})
              </span>
            </button>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition"
              title="Export roster summary as CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Statistical Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Candidates</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{totalStudentsCount}</span>
            <span className="text-[10px] text-slate-400">Across all 4 programs</span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Marksheets Ready</span>
            <span className="text-2xl font-black text-emerald-800 mt-0.5 block">{totalStudentsCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Verified</span>
          </div>

          <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Passed Candidates</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{passedStudentsCount}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">{passRate}% Pass Rate</span>
          </div>

          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-[10px] font-bold uppercase text-rose-700 block">With Deficit / Repeat</span>
            <span className="text-2xl font-black text-rose-700 mt-0.5 block">{deficitStudentsCount}</span>
            <span className="text-[10px] text-rose-600">Deficit notifications</span>
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
            <span className="text-[10px] font-bold uppercase text-indigo-700 block">Institutional SGPA</span>
            <span className="text-2xl font-black text-indigo-800 mt-0.5 block">{avgSgpa}</span>
            <span className="text-[10px] text-indigo-600">Out of 4.00 Max</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Selection</span>
            <span className="text-2xl font-black text-emerald-800 mt-0.5 block">
              {selectedRolls.size} <span className="text-xs text-slate-400 font-normal">/ {filteredCount}</span>
            </span>
            <span className="text-[10px] text-slate-500">Selected for batch</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED FEATURE: COMBINE RESULT FOR ONE STUDENT WHEN SELECTING NAME     */}
      {/* All Exam Results Combine to One Page & Print                              */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-slate-50 rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-emerald-500/30 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header & Feature Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Combine Result for One Student (Single-Page Official Transcript)
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    1-Page Certified Print
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select candidate by name below to automatically combine all semester course exam results into a certified 1-page transcript.
                </p>
              </div>
            </div>

            {/* Print and Preview Actions for Selected Student */}
            {combinedProfile && (
              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  id="print-combined-1page-btn"
                  onClick={() => handleDirectPrintCombined(combinedProfile.studentName)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  title="Print this student's combined marksheet (strictly 1 page)"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Combined (1-Page)</span>
                </button>

                <button
                  onClick={() => handleOpenCombinedModalForStudent(combinedProfile.studentName)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-2xs transition cursor-pointer"
                  title="Open full-screen modal view"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Fullscreen Modal</span>
                </button>

                <button
                  onClick={() => setShowOnPageCombinedPreview(prev => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition cursor-pointer"
                  title={showOnPageCombinedPreview ? 'Hide On-Page Document' : 'Show On-Page Document'}
                >
                  {showOnPageCombinedPreview ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span className="text-[11px] hidden md:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span className="text-[11px] hidden md:inline">Preview</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Student Selector by Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Primary Dropdown: Select Candidate by Name */}
            <div className="md:col-span-5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Select Candidate by Name:
              </label>
              <div className="relative">
                <select
                  value={activeCombinedStudentName}
                  onChange={e => handleSelectStudentForCombined(e.target.value)}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-white border-2 border-emerald-500/40 rounded-xl text-slate-900 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {filteredCandidateNames.map(name => {
                    const count = results.reduce(
                      (acc, r) =>
                        acc + (r.students.some(s => s.studentName.toLowerCase() === name.toLowerCase()) ? 1 : 0),
                      0
                    );
                    return (
                      <option key={name} value={name}>
                        {name} &bull; ({count} Exam {count === 1 ? 'Result' : 'Results'} Combined)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Quick Filter search by name */}
            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Filter Name / Search:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Type name (e.g. Fatima, Ahmed, Usman)..."
                  value={nameSearchFilter}
                  onChange={e => setNameSearchFilter(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {nameSearchFilter && (
                  <button
                    onClick={() => setNameSearchFilter('')}
                    className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Candidate Summary Pills */}
            <div className="md:col-span-3 text-right md:text-left">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Combined Aggregate Info:
              </span>
              {combinedProfile ? (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono">
                    {combinedProfile.primaryRollNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                    {combinedProfile.courseEntries.length} Courses
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-black font-mono">
                    CGPA {combinedProfile.cgpa.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Select a name to view combined result</span>
              )}
            </div>
          </div>

          {/* Quick-select Candidate Chips */}
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Quick Pick:
            </span>
            {allCandidateNames.slice(0, 8).map(name => {
              const isSelected = name.toLowerCase() === activeCombinedStudentName.toLowerCase();
              return (
                <button
                  key={name}
                  onClick={() => handleSelectStudentForCombined(name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* On-Page Live 1-Page Document Preview Container */}
          {combinedProfile && showOnPageCombinedPreview && (
            <div className="mt-4 pt-4 border-t border-emerald-100/80">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Live 1-Page Combined Marksheet Preview for {combinedProfile.studentName}:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    Calibrated for standard A4 single page printing
                  </span>
                  <button
                    onClick={() => handleDirectPrintCombined(combinedProfile.studentName)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print This 1-Page</span>
                  </button>
                </div>
              </div>

              {/* Document Rendering */}
              <div className="bg-slate-200/60 p-3 sm:p-6 rounded-2xl overflow-x-auto">
                <div id="printable-combined-marksheet" className="max-w-4xl mx-auto shadow-md">
                  <PrintableCombinedMarksheetCard
                    profile={combinedProfile}
                    collegeName={collegeName}
                    collegeLogo={collegeLogo}
                    collegeLogoRight={collegeLogoRight}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Directory Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-bold">Dept:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Departments ({totalStudentsCount})</option>
                {ALL_SUBJECTS.map(s => {
                  const cnt = allStudents.filter(st => st.department === s).length;
                  return (
                    <option key={s} value={s}>
                      {s} ({cnt})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-bold">Sem:</span>
              <select
                value={selectedSemester}
                onChange={e =>
                  setSelectedSemester(e.target.value === 'All' ? 'All' : (Number(e.target.value) as any))
                }
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Semesters</option>
                {ALL_SEMESTERS.map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Standing Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-bold">Standing:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Standings</option>
                <option value="Pass">Passed Only ({passedStudentsCount})</option>
                <option value="Fail">With Deficit ({deficitStudentsCount})</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate name or roll no..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Selection Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Showing <strong>{filteredCount}</strong> of {totalStudentsCount} candidates
            </span>
            <span className="text-slate-300">&bull;</span>
            <button
              onClick={selectAllFiltered}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
            >
              Select All Filtered ({filteredCount})
            </button>
            {selectedRolls.size > 0 && (
              <>
                <span className="text-slate-300">&bull;</span>
                <button
                  onClick={deselectAll}
                  className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Deselect All
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedRolls.size > 0 ? (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                {selectedRolls.size} candidates selected for batch printing
              </span>
            ) : (
              <span className="text-slate-400 text-xs italic">
                Tip: Check candidates to batch-print specific selections, or click "Generate &amp; Print ALL".
              </span>
            )}
          </div>
        </div>

        {/* Student Marksheet Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      filteredStudents.every(s => selectedRolls.has(s.rollNumber))
                    }
                    onChange={e => {
                      if (e.target.checked) {
                        selectAllFiltered();
                      } else {
                        deselectAll();
                      }
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    title="Toggle select all"
                  />
                </th>
                <th className="px-3 py-3 w-12 text-center">Sr</th>
                <th className="px-3 py-3">Roll Number</th>
                <th className="px-4 py-3">Candidate Name</th>
                <th className="px-3 py-3">Department &amp; Sem</th>
                <th className="px-3 py-3 text-center">Courses</th>
                <th className="px-3 py-3 text-center">Total Marks</th>
                <th className="px-3 py-3 text-center">Percentage</th>
                <th className="px-3 py-3 text-center">SGPA</th>
                <th className="px-3 py-3 text-center">Standing</th>
                <th className="px-4 py-3 text-right">Marksheet Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
                    <p className="font-semibold text-slate-600 text-sm">No candidate records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try resetting your filters or search keywords.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const isChecked = selectedRolls.has(st.rollNumber);
                  return (
                    <tr
                      key={st.rollNumber}
                      className={`hover:bg-emerald-50/40 transition ${
                        isChecked ? 'bg-emerald-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectStudent(st.rollNumber)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="px-3 py-3 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {st.rollNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">
                        <button
                          onClick={() => handleSelectStudentForCombined(st.studentName)}
                          className="flex items-center gap-2 hover:text-emerald-700 hover:underline text-left cursor-pointer group"
                          title="Click to view 1-page combined transcript for this candidate"
                        >
                          <div className="w-7 h-7 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 transition">
                            {st.studentName.charAt(0)}
                          </div>
                          <span>{st.studentName}</span>
                        </button>
                      </td>

                      <td className="px-3 py-3 text-slate-700">
                        <div className="font-semibold">{st.department}</div>
                        <div className="text-[10px] text-slate-500">Semester {st.semester}</div>
                      </td>

                      <td className="px-3 py-3 text-center font-semibold text-slate-700">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                          {st.courseEntries.length} {st.courseEntries.length === 1 ? 'Course' : 'Courses'}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-900">
                        {st.totalMarksObtained} <span className="text-[10px] text-slate-400 font-normal">/ {st.totalMaxMarks}</span>
                      </td>

                      <td className="px-3 py-3 text-center font-bold text-slate-800">
                        {st.percentage}%
                      </td>

                      <td className="px-3 py-3 text-center font-mono font-bold text-emerald-700">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                          {st.sgpa.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            st.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {st.status === 'Pass' ? 'PASSED' : 'DEFICIT'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenCombinedModalForStudent(st.studentName)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold border border-indigo-200 text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                            title={`Combine all course results for ${st.studentName} into 1 page and print`}
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Combine (1-Page)</span>
                          </button>

                          <button
                            onClick={() => handlePrintSpecificStudent(st)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                            title={`Generate and preview official marksheet for ${st.studentName}`}
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => {
                              setSingleStudentModalRecord(toMarksheetRecord(st));
                              setTimeout(() => {
                                window.print();
                              }, 250);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
                            title={`Instant Print Marksheet for ${st.studentName}`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info box */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All marksheets are calibrated to HEC Semester Grading Regulations with authentic verification seals.
            </span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span>Govt. Girls Model Degree College</span>
            <span>&bull;</span>
            <span>Jinnah Town, Quetta</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Modal 1: Single Student Marksheet Inspection & Print */}
      {/* ========================================================================= */}
      <PrintableMarksheetModal
        isOpen={!!singleStudentModalRecord}
        onClose={() => setSingleStudentModalRecord(null)}
        record={singleStudentModalRecord}
      />

      {/* ========================================================================= */}
      {/* Modal 2: Batch Marksheets Production & Printing (All / Selected) */}
      {/* ========================================================================= */}
      {batchModalRecords && (
        <BatchPrintableMarksheetsModal
          isOpen={!!batchModalRecords}
          onClose={() => setBatchModalRecords(null)}
          records={batchModalRecords}
          title={batchModalTitle}
        />
      )}

      {/* ========================================================================= */}
      {/* Modal 3: Combined Student 1-Page Official Marksheet Modal                 */}
      {/* ========================================================================= */}
      <CombinedStudentMarksheetModal
        isOpen={isCombinedModalOpen}
        onClose={() => setIsCombinedModalOpen(false)}
        profile={combinedProfile}
        allCandidateNames={allCandidateNames}
        onSelectStudentName={handleSelectStudentForCombined}
      />
    </div>
  );
};
