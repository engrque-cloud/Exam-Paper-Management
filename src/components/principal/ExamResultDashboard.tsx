import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  ExamResult,
  StudentResultEntry,
  SubjectType,
  SemesterNumber,
  Course,
} from '../../types';
import {
  calculateGradeAndGpa,
  generateSampleStudents,
} from '../../data/initialResults';
import {
  PrintableMarksheetModal,
  StudentMarksheetRecord,
} from '../common/PrintableMarksheetModal';
import { BatchPrintableMarksheetsModal } from '../common/BatchPrintableMarksheetsModal';
import { CombinedStudentMarksheetModal } from '../common/CombinedStudentMarksheetModal';
import { CombinedStudentExamProfile } from '../common/PrintableCombinedMarksheetCard';
import {
  GraduationCap,
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  Printer,
  Search,
  Filter,
  Eye,
  Send,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Award,
  BookOpen,
  FileText,
  User,
  Building,
  Building2,
  Check,
  ChevronRight,
  Sparkles,
  BarChart2,
  Layers,
} from 'lucide-react';

export interface ExamResultDashboardProps {
  onNavigateToMarksheets?: () => void;
}

export const ExamResultDashboard: React.FC<ExamResultDashboardProps> = ({
  onNavigateToMarksheets,
}) => {
  const {
    courses,
    results,
    teachers,
    uploadOrUpdateResult,
    ratifyAndPublishResult,
    updateResultStatus,
    sendExpediteNotice,
    currentUser,
    subjects,
    semesters,
    collegeName,
    collegeLogo,
    collegeLogoRight,
  } = useExam();

  // Selected student marksheet modal
  const [marksheetModalRecord, setMarksheetModalRecord] = useState<StudentMarksheetRecord | null>(null);

  // Batch marksheet modal
  const [batchModalRecords, setBatchModalRecords] = useState<StudentMarksheetRecord[] | null>(null);
  const [batchModalTitle, setBatchModalTitle] = useState<string>('');

  // Filters & State
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [viewingResult, setViewingResult] = useState<ExamResult | null>(null);
  const [ratifyingResult, setRatifyingResult] = useState<ExamResult | null>(null);
  const [ratificationRemarks, setRatificationRemarks] = useState<string>('');
  const [printingGazette, setPrintingGazette] = useState<ExamResult | null>(null);

  // New / Direct Result Upload Modal
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadCourseCode, setUploadCourseCode] = useState<string>('');
  const [uploadStudents, setUploadStudents] = useState<StudentResultEntry[]>([]);

  // Student Roll No lookup
  const [studentSearchRoll, setStudentSearchRoll] = useState<string>('');
  const [foundStudentResults, setFoundStudentResults] = useState<{
    course: ExamResult;
    entry: StudentResultEntry;
  }[] | null>(null);

  // Combined Student Marksheet (1-Page)
  const [selectedStudentForCombined, setSelectedStudentForCombined] = useState<string>('');
  const [isCombinedModalOpen, setIsCombinedModalOpen] = useState<boolean>(false);

  // All candidate names
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
    selectedStudentForCombined ||
    (foundStudentResults && foundStudentResults[0]?.entry?.studentName) ||
    allCandidateNames[0] ||
    '';

  const combinedProfileForStudent = useMemo<CombinedStudentExamProfile | null>(() => {
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

  const handleOpenCombinedModal = (studentName?: string) => {
    if (studentName) {
      setSelectedStudentForCombined(studentName);
    }
    setIsCombinedModalOpen(true);
  };

  // Combined master list of all courses and their result status
  const courseResultOverview = useMemo(() => {
    return courses.map(course => {
      const existing = results.find(r => r.courseCode === course.code);
      const assignedTeacher = teachers.find(
        t => t.department === course.subject && t.assignedSemesters.includes(course.semester)
      ) || teachers.find(t => t.department === course.subject) || teachers[0];

      return {
        course,
        result: existing,
        hasResult: !!existing,
        status: existing ? existing.status : 'pending_faculty_upload',
        assignedTeacher,
      };
    });
  }, [courses, results, teachers]);

  // Aggregate Metrics
  const totalCourses = courses.length;
  const gazettedCount = results.filter(r => r.status === 'gazetted_published').length;
  const pendingRatificationCount = results.filter(
    r => r.status === 'ratified_by_principal' || r.status === 'under_audit' || r.status === 'submitted_by_faculty'
  ).length;
  const pendingUploadCount = totalCourses - results.length;

  const totalAppeared = results.reduce((acc, r) => acc + r.appeared, 0);
  const totalPassed = results.reduce((acc, r) => acc + r.passed, 0);
  const overallPassRate = totalAppeared > 0 ? Number(((totalPassed / totalAppeared) * 100).toFixed(1)) : 0;
  const overallAvgGpa = results.length > 0
    ? Number((results.reduce((acc, r) => acc + r.averageGpa, 0) / results.length).toFixed(2))
    : 0;

  // Filtered rows
  const filteredOverview = useMemo(() => {
    return courseResultOverview.filter(item => {
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'pending_faculty_upload' && item.hasResult) return false;
        if (selectedStatusFilter !== 'pending_faculty_upload' && item.result?.status !== selectedStatusFilter) return false;
      }

      if (selectedSubjectFilter !== 'all' && item.course.subject !== selectedSubjectFilter) {
        return false;
      }

      if (selectedSemesterFilter !== 'all' && String(item.course.semester) !== selectedSemesterFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = item.course.code.toLowerCase().includes(q);
        const matchTitle = item.course.title.toLowerCase().includes(q);
        const matchTeacher = item.assignedTeacher?.name.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchTeacher) return false;
      }

      return true;
    });
  }, [courseResultOverview, selectedStatusFilter, selectedSubjectFilter, selectedSemesterFilter, searchQuery]);

  // Handle student roll number search
  const handleStudentSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentSearchRoll.trim()) {
      setFoundStudentResults(null);
      return;
    }

    const q = studentSearchRoll.trim().toLowerCase();
    const matches: { course: ExamResult; entry: StudentResultEntry }[] = [];

    results.forEach(res => {
      res.students.forEach(st => {
        if (st.rollNumber.toLowerCase().includes(q) || st.studentName.toLowerCase().includes(q)) {
          matches.push({ course: res, entry: st });
        }
      });
    });

    setFoundStudentResults(matches);
  };

  // Open upload modal with preselected course
  const openUploadForCourse = (courseCode: string) => {
    const target = courses.find(c => c.code === courseCode) || courses[0];
    setUploadCourseCode(target.code);
    const generated = generateSampleStudents(target.subject.slice(0, 3).toUpperCase(), 20);
    setUploadStudents(generated);
    setShowUploadModal(true);
  };

  const handleSaveUploadedResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCourseCode) return;
    const course = courses.find(c => c.code === uploadCourseCode);
    if (!course) return;

    uploadOrUpdateResult({
      courseCode: course.code,
      courseTitle: course.title,
      subject: course.subject,
      semester: course.semester,
      academicSession: 'Fall 2026',
      examType: 'Final Term Examination',
      students: uploadStudents,
      status: 'submitted_by_faculty',
      officialRemarks: 'Marks ledger uploaded via Exam Directorate; ready for Principal verification.',
    });

    setShowUploadModal(false);
  };

  // Submit Principal Ratification
  const handleConfirmRatification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratifyingResult) return;

    ratifyAndPublishResult(ratifyingResult.id, ratificationRemarks.trim() || undefined);
    setRatifyingResult(null);
    setRatificationRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Office of the Principal &bull; Controller of Examinations</span>
            </div>
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">
              Exam Results, Official Gazette & Ratification Command Center
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Track course-wise marks submission status, review faculty grade ledgers, audit institutional performance statistics, and ratify final examination result gazettes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateToMarksheets && (
              <button
                onClick={onNavigateToMarksheets}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                title="Go to the dedicated Student Marksheets Production & Printing tab"
              >
                <GraduationCap className="w-4 h-4 text-emerald-200" />
                <span>Student Marksheets Tab &rarr;</span>
              </button>
            )}

            <button
              onClick={() => openUploadForCourse(courses[0]?.code || 'ENG-101')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload / Import Results</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500">Total Courses</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCourses}</div>
            <div className="text-[10px] text-slate-400 mt-1">Institutional curriculum</div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-[10px] font-bold uppercase text-emerald-700">Gazetted & Declared</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{gazettedCount}</div>
            <div className="text-[10px] text-emerald-600 mt-1">Ratified by Principal</div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-[10px] font-bold uppercase text-amber-800">Pending Ratification</div>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{pendingRatificationCount}</div>
            <div className="text-[10px] text-amber-600 mt-1">Awaiting Principal seal</div>
          </div>

          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
            <div className="text-[10px] font-bold uppercase text-rose-800">Awaiting Upload</div>
            <div className="text-2xl font-black text-rose-700 mt-0.5">{pendingUploadCount}</div>
            <div className="text-[10px] text-rose-600 mt-1">Stuck at faculty grading</div>
          </div>

          <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="text-[10px] font-bold uppercase text-indigo-700">Institution Pass Rate</div>
            <div className="text-2xl font-black text-indigo-800 mt-0.5">{overallPassRate}%</div>
            <div className="text-[10px] text-indigo-600 mt-1">{totalPassed} of {totalAppeared} passed</div>
          </div>

          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-[10px] font-bold uppercase text-purple-700">Average CGPA</div>
            <div className="text-2xl font-black text-purple-800 mt-0.5">{overallAvgGpa}</div>
            <div className="text-[10px] text-purple-600 mt-1">4.0 Grade Point Scale</div>
          </div>
        </div>
      </div>

      {/* Fast Student Roll Number & Transcript Lookup */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
              Instant Candidate Transcript & Result Lookup
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Search student roll number (e.g. <code>2026-ENG-001</code>) across all courses
          </span>
        </div>

        <form onSubmit={handleStudentSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Student Roll Number or Name (e.g., 2026-ENG-001, Ahmed Ali, Fatima)..."
            value={studentSearchRoll}
            onChange={e => setStudentSearchRoll(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Transcript</span>
          </button>
          {foundStudentResults !== null && (
            <button
              type="button"
              onClick={() => {
                setStudentSearchRoll('');
                setFoundStudentResults(null);
              }}
              className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </form>

        {/* Search Results Display */}
        {foundStudentResults !== null && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {foundStudentResults.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No student record found matching &ldquo;{studentSearchRoll}&rdquo; in uploaded result ledgers.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-700">
                    Found {foundStudentResults.length} course score record(s):
                  </div>
                  {foundStudentResults.length > 0 && (
                    <button
                      onClick={() => handleOpenCombinedModal(foundStudentResults[0].entry.studentName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
                      title="Combine all results for this student into 1 official printable page"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Combine Result &bull; Print 1-Page Marksheet</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {foundStudentResults.map(({ course, entry }, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{entry.studentName}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {entry.rollNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {course.courseCode}: {course.courseTitle} &bull; {course.subject} Sem {course.semester}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Marks: {entry.totalMarks}/100 ({entry.percentage}%) &bull; Status: {course.status === 'gazetted_published' ? 'Officially Gazetted' : 'Provisional'}
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                            entry.status === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          Grade {entry.grade} &bull; {entry.gpa.toFixed(1)} GPA
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {entry.status}
                          </span>
                          <button
                            onClick={() => {
                              // Find all course entries for this student across all results
                              const allEntriesForStudent: { course: ExamResult; entry: StudentResultEntry }[] = [];
                              results.forEach(r => {
                                const matched = r.students.find(s => s.rollNumber.toLowerCase() === entry.rollNumber.toLowerCase());
                                if (matched) {
                                  allEntriesForStudent.push({ course: r, entry: matched });
                                }
                              });
                              setMarksheetModalRecord({
                                rollNumber: entry.rollNumber,
                                studentName: entry.studentName,
                                courseEntries: allEntriesForStudent.length > 0 ? allEntriesForStudent : [{ course, entry }],
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-2xs transition"
                            title="Generate and Print Student Marksheet / Transcript"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Marksheet</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter course, title, teacher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Result Stages ({totalCourses})</option>
            <option value="gazetted_published">🟢 Gazetted & Published ({gazettedCount})</option>
            <option value="ratified_by_principal">🟡 Ratified by Principal</option>
            <option value="under_audit">🟠 Under Audit</option>
            <option value="submitted_by_faculty">🔵 Submitted by Faculty</option>
            <option value="pending_faculty_upload">🔴 Awaiting Faculty Upload ({pendingUploadCount})</option>
          </select>

          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {subjects.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedSemesterFilter}
            onChange={e => setSelectedSemesterFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Semesters</option>
            {semesters.map(s => (
              <option key={s} value={String(s)}>
                Semester {s}
              </option>
            ))}
          </select>

          {(selectedStatusFilter !== 'all' ||
            selectedSubjectFilter !== 'all' ||
            selectedSemesterFilter !== 'all' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatusFilter('all');
                setSelectedSubjectFilter('all');
                setSelectedSemesterFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredOverview.length}</strong> of {totalCourses} courses
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Course & Subject</th>
                <th className="px-4 py-3">Faculty Examiner</th>
                <th className="px-4 py-3">Result Lifecycle Status</th>
                <th className="px-4 py-3 text-center">Appeared / Passed</th>
                <th className="px-4 py-3 text-center">Pass % & Avg GPA</th>
                <th className="px-4 py-3 text-right">Actions & Ratification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOverview.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No courses match the selected result criteria</p>
                  </td>
                </tr>
              ) : (
                filteredOverview.map(item => {
                  const res = item.result;
                  return (
                    <tr key={item.course.id} className="hover:bg-slate-50/80 transition">
                      {/* Course */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {item.course.code}
                          </span>
                          <span className="font-semibold text-slate-900">{item.course.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.course.subject} &bull; Semester {item.course.semester} &bull; {item.course.creditHours} Cr. Hrs
                        </div>
                      </td>

                      {/* Faculty Examiner */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">
                          {res ? res.teacherName : item.assignedTeacher?.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {res ? `Uploaded: ${new Date(res.submittedAt).toLocaleDateString()}` : 'Grade sheet not uploaded'}
                        </div>
                      </td>

                      {/* Result Lifecycle Status */}
                      <td className="px-4 py-3.5">
                        {!res && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Faculty Award Pending</span>
                          </span>
                        )}

                        {res?.status === 'submitted_by_faculty' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Submitted &bull; Awaiting Audit</span>
                          </span>
                        )}

                        {res?.status === 'under_audit' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Under Exam Audit</span>
                          </span>
                        )}

                        {res?.status === 'ratified_by_principal' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Award className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Ratified &bull; Ready for Gazette</span>
                          </span>
                        )}

                        {res?.status === 'gazetted_published' && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Official Gazette Declared</span>
                            </span>
                            {res.gazetteNumber && (
                              <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                                {res.gazetteNumber}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Appeared / Passed */}
                      <td className="px-4 py-3.5 text-center">
                        {res ? (
                          <div>
                            <span className="font-bold text-slate-800">
                              {res.passed} / {res.appeared}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Failed: {res.failed}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">&mdash;</span>
                        )}
                      </td>

                      {/* Pass % & Avg GPA */}
                      <td className="px-4 py-3.5 text-center">
                        {res ? (
                          <div>
                            <div className="font-bold text-slate-800 flex items-center justify-center gap-1">
                              <span className={res.passPercentage >= 75 ? 'text-emerald-700' : 'text-amber-700'}>
                                {res.passPercentage}%
                              </span>
                              <span className="text-slate-400 font-normal">&bull;</span>
                              <span className="text-purple-700">{res.averageGpa} GPA</span>
                            </div>
                            <div className="w-20 mx-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className={`h-full ${res.passPercentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${res.passPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">&mdash;</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        {/* If result exists, view ledger */}
                        {res && (
                          <button
                            onClick={() => setViewingResult(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            title="Inspect complete student marks ledger"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Marks Ledger</span>
                          </button>
                        )}

                        {/* If gazetted, print gazette */}
                        {res && (
                          <button
                            onClick={() => setPrintingGazette(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                            title="View / Print University Official Gazette"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Gazette</span>
                          </button>
                        )}

                        {/* If pending Principal ratification */}
                        {res && res.status !== 'gazetted_published' && (
                          <button
                            onClick={() => {
                              setRatifyingResult(res);
                              setRatificationRemarks(
                                `Ratified by Office of the Principal & Academic Council. Gazette notification authorized for Fall 2026 semester.`
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs transition"
                            title="Review and ratify this result for official gazette publication"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Ratify Gazette</span>
                          </button>
                        )}

                        {/* If no result uploaded yet */}
                        {!res && (
                          <>
                            <button
                              onClick={() => openUploadForCourse(item.course.code)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                              title="Upload or import marks for this course"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Import</span>
                            </button>
                            <button
                              onClick={() => {
                                sendExpediteNotice({
                                  targetRole: 'teacher',
                                  courseCode: item.course.code,
                                  courseTitle: item.course.title,
                                  stage: 'Exam Result / Marks Sheet Submission',
                                  customNote: `Executive Directive from Principal: Examination results and student marks ledger for ${item.course.code} are overdue. Please upload the compiled award list immediately for institutional ratification.`,
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                              title="Send reminder to faculty"
                            >
                              <Send className="w-3.5 h-3.5 text-rose-600" />
                              <span>Remind</span>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Modal: Detailed Student Marks Ledger & Grade Breakdown */}
      {/* ========================================================================= */}
      {viewingResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setViewingResult(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Course Marks Ledger & Grade Award List</h3>
                  <p className="text-xs text-slate-400">
                    {viewingResult.courseCode}: {viewingResult.courseTitle} &bull; {viewingResult.subject} (Sem {viewingResult.semester})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingResult(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            {/* Header statistics */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Examiner</div>
                <div className="font-bold text-slate-800 mt-0.5">{viewingResult.teacherName}</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Appeared / Passed</div>
                <div className="font-bold text-slate-800 mt-0.5">
                  {viewingResult.passed} / {viewingResult.appeared} ({viewingResult.passPercentage}%)
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Class Average GPA</div>
                <div className="font-bold text-purple-700 mt-0.5">{viewingResult.averageGpa} / 4.0</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="text-slate-400 font-semibold uppercase text-[10px]">Gazette Status</div>
                <div className="font-bold text-emerald-700 mt-0.5 capitalize">
                  {viewingResult.status.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Batch Print Class Marksheets Action Bar */}
            <div className="px-6 py-3 bg-slate-100/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Student Grade Ledger ({viewingResult.students.length} Candidates)
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 font-medium">
                  {viewingResult.courseCode} &mdash; Semester {viewingResult.semester}
                </span>
              </div>

              <button
                onClick={() => {
                  const records: StudentMarksheetRecord[] = viewingResult.students.map(st => {
                    const allEntriesForStudent: { course: ExamResult; entry: StudentResultEntry }[] = [];
                    results.forEach(r => {
                      const matched = r.students.find(s => s.rollNumber.toLowerCase() === st.rollNumber.toLowerCase());
                      if (matched) {
                        allEntriesForStudent.push({ course: r, entry: matched });
                      }
                    });
                    return {
                      rollNumber: st.rollNumber,
                      studentName: st.studentName,
                      courseEntries: allEntriesForStudent.length > 0 ? allEntriesForStudent : [{ course: viewingResult, entry: st }],
                    };
                  });
                  setBatchModalTitle(`Official Marksheets • ${viewingResult.courseCode} (${viewingResult.courseTitle})`);
                  setBatchModalRecords(records);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
                title={`Batch-print official marksheets for all ${viewingResult.students.length} students in this course`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Batch Print All Class Marksheets ({viewingResult.students.length})</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="p-6 max-h-[55vh] overflow-y-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Roll Number</th>
                    <th className="px-3 py-2.5">Candidate Name</th>
                    <th className="px-3 py-2.5 text-center">Assignments (10)</th>
                    <th className="px-3 py-2.5 text-center">Midterm (20)</th>
                    <th className="px-3 py-2.5 text-center">Final Exam (70)</th>
                    <th className="px-3 py-2.5 text-center">Total (100)</th>
                    <th className="px-3 py-2.5 text-center">Grade</th>
                    <th className="px-3 py-2.5 text-center">GPA</th>
                    <th className="px-3 py-2.5 text-center">Standing</th>
                    <th className="px-3 py-2.5 text-right">Marksheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {viewingResult.students.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-2 font-mono font-bold text-slate-700">{st.rollNumber}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{st.studentName}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{st.assignmentMarks}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{st.midtermMarks}</td>
                      <td className="px-3 py-2 text-center text-slate-600">{st.finalMarks}</td>
                      <td className="px-3 py-2 text-center font-bold text-slate-900">{st.totalMarks}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-bold text-[11px] ${
                            st.grade === 'A+' || st.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.grade === 'B+' || st.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : st.grade === 'F'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {st.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-slate-700">{st.gpa.toFixed(1)}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`font-semibold text-[11px] ${
                            st.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => {
                            // Find all course entries for this student across all results
                            const allEntriesForStudent: { course: ExamResult; entry: StudentResultEntry }[] = [];
                            results.forEach(r => {
                              const matched = r.students.find(s => s.rollNumber.toLowerCase() === st.rollNumber.toLowerCase());
                              if (matched) {
                                allEntriesForStudent.push({ course: r, entry: matched });
                              }
                            });
                            setMarksheetModalRecord({
                              rollNumber: st.rollNumber,
                              studentName: st.studentName,
                              courseEntries: allEntriesForStudent.length > 0 ? allEntriesForStudent : [{ course: viewingResult, entry: st }],
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition border border-indigo-200 shadow-2xs"
                          title={`Generate and print official marksheet for ${st.studentName}`}
                        >
                          <Printer className="w-3 h-3 text-indigo-600" />
                          <span>Print Marksheet</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
              <div className="text-xs text-slate-500 font-serif">
                Official Remarks: <em>{viewingResult.officialRemarks}</em>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPrintingGazette(viewingResult);
                    setViewingResult(null);
                  }}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Gazette</span>
                </button>
                <button
                  onClick={() => setViewingResult(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Modal: Principal Executive Ratification of Result */}
      {/* ========================================================================= */}
      {ratifyingResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setRatifyingResult(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 text-white rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Ratify & Publish Official Gazette</h3>
                  <p className="text-xs text-emerald-200">
                    Executive Academic Sanction by Office of the Principal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRatifyingResult(null)}
                className="text-emerald-300 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmRatification} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="font-bold text-emerald-950">
                  Course: {ratifyingResult.courseCode} &mdash; {ratifyingResult.courseTitle}
                </div>
                <div className="text-emerald-800">
                  Total Candidates: <strong>{ratifyingResult.appeared}</strong> &bull; Passed:{' '}
                  <strong>{ratifyingResult.passed}</strong> ({ratifyingResult.passPercentage}%) &bull; Average GPA:{' '}
                  <strong>{ratifyingResult.averageGpa}</strong>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Submitted By: {ratifyingResult.teacherName} ({ratifyingResult.subject})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Principal Executive Seal & Gazette Ratification Remarks
                </label>
                <textarea
                  rows={3}
                  required
                  value={ratificationRemarks}
                  onChange={e => setRatificationRemarks(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Enter official executive ratification decree..."
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                Publishing this gazette assigns an official university Gazette Number, seals the student grades, and broadcasts approval notices to the academic directorate and faculty.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatifyingResult(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Ratify & Seal Official Gazette</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Modal: Upload / Import Results Sheet */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Upload / Import Course Exam Results</h3>
                  <p className="text-xs text-slate-400">Award list compilation and marks entry</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUploadedResult} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Target Course
                  </label>
                  <select
                    value={uploadCourseCode}
                    onChange={e => {
                      setUploadCourseCode(e.target.value);
                      const target = courses.find(c => c.code === e.target.value);
                      if (target) {
                        setUploadStudents(
                          generateSampleStudents(target.subject.slice(0, 3).toUpperCase(), 20)
                        );
                      }
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.code}>
                        {c.code} &mdash; {c.title} ({c.subject}, Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = courses.find(c => c.code === uploadCourseCode) || courses[0];
                      setUploadStudents(
                        generateSampleStudents(target.subject.slice(0, 3).toUpperCase(), 22)
                      );
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Demo Students (1-Click)</span>
                  </button>
                </div>
              </div>

              {/* Student entries editor table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Candidate Marks Roster ({uploadStudents.length} Students)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newRoll = `2026-${uploadCourseCode.slice(0, 3)}-${String(uploadStudents.length + 1).padStart(3, '0')}`;
                      const newSt: StudentResultEntry = {
                        rollNumber: newRoll,
                        studentName: 'New Candidate',
                        assignmentMarks: 9,
                        midtermMarks: 16,
                        finalMarks: 50,
                        totalMarks: 75,
                        percentage: 75,
                        grade: 'B+',
                        gpa: 3.3,
                        status: 'Pass',
                      };
                      setUploadStudents([...uploadStudents, newSt]);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Candidate Row</span>
                  </button>
                </div>

                <div className="max-h-[40vh] overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Roll No</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2 w-20">Assign (10)</th>
                        <th className="px-3 py-2 w-20">Mid (20)</th>
                        <th className="px-3 py-2 w-20">Final (70)</th>
                        <th className="px-3 py-2 w-16 text-center">Total</th>
                        <th className="px-3 py-2 w-16 text-center">Grade</th>
                        <th className="px-3 py-2 w-16 text-center">GPA</th>
                        <th className="px-3 py-2 w-16 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {uploadStudents.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-mono">
                            <input
                              type="text"
                              value={st.rollNumber}
                              onChange={e => {
                                const next = [...uploadStudents];
                                next[idx].rollNumber = e.target.value;
                                setUploadStudents(next);
                              }}
                              className="w-full border-b border-transparent focus:border-indigo-500 font-mono text-xs focus:outline-none bg-transparent"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="text"
                              value={st.studentName}
                              onChange={e => {
                                const next = [...uploadStudents];
                                next[idx].studentName = e.target.value;
                                setUploadStudents(next);
                              }}
                              className="w-full border-b border-transparent focus:border-indigo-500 text-xs focus:outline-none bg-transparent"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={st.assignmentMarks}
                              onChange={e => {
                                const next = [...uploadStudents];
                                const val = Number(e.target.value) || 0;
                                next[idx].assignmentMarks = val;
                                const tot = val + next[idx].midtermMarks + next[idx].finalMarks;
                                next[idx].totalMarks = tot;
                                next[idx].percentage = tot;
                                const calc = calculateGradeAndGpa(tot, 100);
                                next[idx].grade = calc.grade;
                                next[idx].gpa = calc.gpa;
                                next[idx].status = calc.status;
                                setUploadStudents(next);
                              }}
                              className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={st.midtermMarks}
                              onChange={e => {
                                const next = [...uploadStudents];
                                const val = Number(e.target.value) || 0;
                                next[idx].midtermMarks = val;
                                const tot = next[idx].assignmentMarks + val + next[idx].finalMarks;
                                next[idx].totalMarks = tot;
                                next[idx].percentage = tot;
                                const calc = calculateGradeAndGpa(tot, 100);
                                next[idx].grade = calc.grade;
                                next[idx].gpa = calc.gpa;
                                next[idx].status = calc.status;
                                setUploadStudents(next);
                              }}
                              className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="number"
                              min="0"
                              max="70"
                              value={st.finalMarks}
                              onChange={e => {
                                const next = [...uploadStudents];
                                const val = Number(e.target.value) || 0;
                                next[idx].finalMarks = val;
                                const tot = next[idx].assignmentMarks + next[idx].midtermMarks + val;
                                next[idx].totalMarks = tot;
                                next[idx].percentage = tot;
                                const calc = calculateGradeAndGpa(tot, 100);
                                next[idx].grade = calc.grade;
                                next[idx].gpa = calc.gpa;
                                next[idx].status = calc.status;
                                setUploadStudents(next);
                              }}
                              className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-center font-bold text-slate-800">
                            {st.totalMarks}
                          </td>
                          <td className="px-3 py-1.5 text-center font-bold text-indigo-700">
                            {st.grade}
                          </td>
                          <td className="px-3 py-1.5 text-center font-bold text-slate-700">
                            {st.gpa.toFixed(1)}
                          </td>
                          <td className="px-3 py-1.5 text-center font-semibold text-[10px]">
                            <span className={st.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700'}>
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Submit Results to Principal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Modal: Printable University Official Result Gazette */}
      {/* ========================================================================= */}
      {printingGazette && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setPrintingGazette(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Controls Bar */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base">Official University Result Gazette Notification</h3>
                  <p className="text-xs text-slate-400">Formal Academic Publication &bull; Fall 2026 Examination</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  <Printer className="w-4 h-4" />
                  Print Gazette
                </button>
                <button
                  onClick={() => setPrintingGazette(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Printable Gazette Document */}
            <div className="p-8 max-h-[75vh] overflow-y-auto bg-white font-serif">
              {/* Document Header (Aligned with Date Sheet Official Institutional Branding) */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
                <div className="flex items-center justify-between gap-4 mb-2">
                  {/* Left Logo */}
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

                  {/* Institution Center Headings */}
                  <div className="flex-1 text-center px-2">
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
                      {collegeName || 'Govt. Girls Model Degree College'}
                    </h1>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest mt-0.5">
                      Office of the Controller of Examinations &bull; Jinnah Town, Quetta
                    </h2>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                      Affiliated with University of Balochistan &bull; Higher Education Department
                    </div>
                    <div className="inline-block px-4 py-0.5 mt-2 rounded-full border border-slate-900 font-black text-xs uppercase tracking-wider bg-slate-100 text-slate-900">
                      Official Semester Result Gazette Notification &bull; {printingGazette.academicSession}
                    </div>
                  </div>

                  {/* Right Seal */}
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
                          EXAMS
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-1 font-sans">
                  Gazette No: <strong>{printingGazette.gazetteNumber || 'GGMDC/EXAM/GZ-2026/OFFICIAL'}</strong> &bull; Notification Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              </div>

              {/* Course details banner */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs font-sans mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Course Title</span>
                  <span className="font-bold text-slate-900">{printingGazette.courseCode} &mdash; {printingGazette.courseTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Program & Semester</span>
                  <span className="font-bold text-slate-900">{printingGazette.subject} &bull; Semester {printingGazette.semester}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Appeared / Passed</span>
                  <span className="font-bold text-slate-900">{printingGazette.passed} of {printingGazette.appeared} ({printingGazette.passPercentage}%)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Average Cumulative GPA</span>
                  <span className="font-bold text-indigo-700">{printingGazette.averageGpa} / 4.0</span>
                </div>
              </div>

              {/* Student Gazette Ledger Table */}
              <table className="w-full text-left text-xs font-sans border-collapse border border-slate-400 mb-6">
                <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="border border-slate-300 px-3 py-2">Sr</th>
                    <th className="border border-slate-300 px-3 py-2">Roll Number</th>
                    <th className="border border-slate-300 px-3 py-2">Student Name</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Marks (100)</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Letter Grade</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Grade Points (GPA)</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {printingGazette.students.map((st, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 font-mono font-bold">
                        {st.rollNumber}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 font-semibold">
                        {st.studentName}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">
                        {st.totalMarks}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-bold">
                        {st.grade}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-bold font-mono">
                        {st.gpa.toFixed(1)}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-bold">
                        <span className={st.status === 'Pass' ? 'text-emerald-800' : 'text-rose-800'}>
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Statistical summary note */}
              <div className="text-xs font-sans border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-700 mb-8 space-y-1">
                <p>1. Errors and Omissions are excepted (E&OE). Any discrepancy must be reported to the Examination Directorate within 15 days of gazette notification.</p>
                <p>2. Re-totaling / scrutiny applications may be submitted through the respective Departmental Chairperson.</p>
                <p>3. This result is verified by the Examination Board and certified by the Principal & Controller of Examinations.</p>
              </div>

              {/* Signatures */}
              <div className="font-sans grid grid-cols-2 pt-10 border-t border-slate-400 text-xs">
                <div>
                  <div className="w-52 border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-serif italic">
                    Prof. Tariq Mahmood
                  </div>
                  <p className="text-slate-700 font-bold">Controller of Examinations</p>
                  <p className="text-slate-500 text-[11px]">Official Seal &amp; Authority</p>
                </div>

                <div className="text-right">
                  <div className="w-56 ml-auto border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 font-serif italic">
                    Prof. Dr. Bilquis Jahan
                  </div>
                  <p className="text-slate-700 font-bold">Principal &amp; CAO</p>
                  <p className="text-slate-500 text-[11px]">Approved &amp; Counter-Signed</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPrintingGazette(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Modal: Printable Student Marksheet / Transcript (Single Student) */}
      {/* ========================================================================= */}
      <PrintableMarksheetModal
        isOpen={!!marksheetModalRecord}
        onClose={() => setMarksheetModalRecord(null)}
        record={marksheetModalRecord}
      />

      {/* ========================================================================= */}
      {/* 6. Modal: Batch Printable Marksheets (Multiple/All Students) */}
      {/* ========================================================================= */}
      <BatchPrintableMarksheetsModal
        isOpen={!!batchModalRecords}
        onClose={() => setBatchModalRecords(null)}
        records={batchModalRecords || []}
        title={batchModalTitle}
      />

      {/* ========================================================================= */}
      {/* 7. Modal: Combined Student 1-Page Official Marksheet Modal                 */}
      {/* ========================================================================= */}
      <CombinedStudentMarksheetModal
        isOpen={isCombinedModalOpen}
        onClose={() => setIsCombinedModalOpen(false)}
        profile={combinedProfileForStudent}
        allCandidateNames={allCandidateNames}
        onSelectStudentName={name => setSelectedStudentForCombined(name)}
      />
    </div>
  );
};
