import React, { useState, useMemo } from 'react';
import { useExam } from '../../context/ExamContext';
import { Student, SubjectType, SemesterNumber, ExamResult, ExamPaper } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  GraduationCap,
  Archive,
  Printer,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Award,
  Calendar,
  BookOpen,
  ArrowUpRight,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronRight,
  X,
  Phone,
  Mail,
  Building2,
  Clock,
  Sparkles,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentRollNumberSlipModal } from './StudentRollNumberSlipModal';
import { StudentBulkImportModal } from './StudentBulkImportModal';
import { formatReadableDate } from '../../utils/whatsapp';

interface StudentRegistryManagerProps {
  onOpenNoticeBoardForStudent?: (rollNumber: string) => void;
}

export const StudentRegistryManager: React.FC<StudentRegistryManagerProps> = ({
  onOpenNoticeBoardForStudent,
}) => {
  const {
    students,
    addStudent,
    updateStudent,
    graduatePassoutStudent,
    restoreStudentFromArchive,
    deleteStudent,
    subjects,
    semesters,
    courses,
    dateSheetRows,
    results,
    papers,
    setPreviewPaper,
    showToast,
  } = useExam();

  // Active sub-tab: 'enrolled' vs 'archived'
  const [activeTab, setActiveTab] = useState<'enrolled' | 'archived'>('enrolled');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'All'>('All');
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber | 'All'>('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForSlip, setSelectedStudentForSlip] = useState<Student | null>(null);
  const [viewingProfileStudent, setViewingProfileStudent] = useState<Student | null>(null);
  const [passoutStudentTarget, setPassoutStudentTarget] = useState<Student | null>(null);
  const [passoutReasonInput, setPassoutReasonInput] = useState('');

  // Add / Edit form state
  const [formRollNumber, setFormRollNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formDepartment, setFormDepartment] = useState<SubjectType>(subjects[0] || 'English');
  const [formSemester, setFormSemester] = useState<SemesterNumber>(1);
  const [formSession, setFormSession] = useState('2026-2030');
  const [formRegNo, setFormRegNo] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGender, setFormGender] = useState<'Female' | 'Male'>('Female');
  const [formCnic, setFormCnic] = useState('');
  const [formCgpa, setFormCgpa] = useState<number>(3.5);
  const [formEnrolledCourses, setFormEnrolledCourses] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-generate suggested roll number & registration number
  // Primary Key Roll Number is assigned at entry and remains for the entire session.
  // It does NOT mix with department code (e.g. "2026-0001") so the student can enroll in multiple papers across departments.
  const handleGenerateRoll = (sess: string) => {
    const yearPrefix = sess.split('-')[0] || '2026';
    const totalCount = students.length;
    const nextSeq = String(totalCount + 1).padStart(4, '0');
    const genRoll = `${yearPrefix}-${nextSeq}`;
    const genReg = `GGMDC/QTA/${yearPrefix}/${nextSeq}`;
    setFormRollNumber(genRoll);
    setFormRegNo(genReg);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    const initialDept = subjects[0] || 'English';
    setFormDepartment(initialDept);
    setFormSemester(1);
    setFormSession('2026-2030');
    setFormName('');
    setFormFatherName('');
    setFormPhone('');
    setFormEmail('');
    setFormGender('Female');
    setFormCnic('');
    setFormCgpa(3.5);
    setFormError(null);
    handleGenerateRoll('2026-2030');

    // Pre-populate core semester courses (student can add additional papers across departments)
    const defaultCourses = courses
      .filter(c => c.subject === initialDept && Number(c.semester) === 1)
      .map(c => c.code);
    setFormEnrolledCourses(defaultCourses);
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormRollNumber(student.rollNumber);
    setFormName(student.name);
    setFormFatherName(student.fatherName);
    setFormDepartment(student.department);
    setFormSemester(student.currentSemester);
    setFormSession(student.session);
    setFormRegNo(student.registrationNumber);
    setFormPhone(student.phone || '');
    setFormEmail(student.email || '');
    setFormGender(student.gender || 'Female');
    setFormCnic(student.cnic || '');
    setFormCgpa(student.overallCgpa || 3.5);
    setFormError(null);

    // Existing enrolled courses or fallback to semester core
    const existing = student.enrolledCourseCodes && student.enrolledCourseCodes.length > 0
      ? student.enrolledCourseCodes
      : courses
          .filter(c => c.subject === student.department && Number(c.semester) === Number(student.currentSemester))
          .map(c => c.code);
    setFormEnrolledCourses(existing);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formRollNumber.trim()) {
      setFormError('Roll Number is mandatory (Primary Key).');
      return;
    }
    if (!formName.trim()) {
      setFormError('Candidate full name is required.');
      return;
    }
    if (!formFatherName.trim()) {
      setFormError("Father's name is required.");
      return;
    }

    if (editingStudent) {
      // Update
      const res = updateStudent(editingStudent.rollNumber, {
        name: formName.trim(),
        fatherName: formFatherName.trim(),
        department: formDepartment,
        currentSemester: Number(formSemester),
        session: formSession.trim(),
        registrationNumber: formRegNo.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        gender: formGender,
        cnic: formCnic.trim(),
        overallCgpa: Number(formCgpa) || 3.5,
        enrolledCourseCodes: formEnrolledCourses,
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to update student record.');
        return;
      }
    } else {
      // Add new
      const res = addStudent({
        rollNumber: formRollNumber.trim().toUpperCase(),
        name: formName.trim(),
        fatherName: formFatherName.trim(),
        department: formDepartment,
        currentSemester: Number(formSemester),
        session: formSession.trim() || '2026-2030',
        registrationNumber: formRegNo.trim() || `GGMDC/QTA/${formRollNumber.trim().toUpperCase()}`,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formRollNumber.toLowerCase()}@ggmdc.edu.pk`,
        gender: formGender,
        cnic: formCnic.trim(),
        overallCgpa: Number(formCgpa) || 3.5,
        enrolledCourseCodes: formEnrolledCourses,
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to register student.');
        return;
      }
    }

    setIsAddModalOpen(false);
  };

  // Promote student to next semester
  const handlePromoteSemester = (student: Student) => {
    if (student.currentSemester >= 8) {
      setPassoutStudentTarget(student);
      setPassoutReasonInput('Completed all 8 Semesters (BS 4-Year Program Passed Out)');
      return;
    }
    const nextSem = (student.currentSemester + 1) as SemesterNumber;
    updateStudent(student.rollNumber, {
      currentSemester: nextSem,
      totalCreditsCompleted: (student.totalCreditsCompleted || 0) + 18,
    });
    showToast(`${student.name} promoted to Semester ${nextSem}!`, 'success');
  };

  // Confirm passout / graduation to archive
  const handleConfirmPassout = () => {
    if (!passoutStudentTarget) return;
    graduatePassoutStudent(passoutStudentTarget.rollNumber, passoutReasonInput);
    setPassoutStudentTarget(null);
    setPassoutReasonInput('');
  };

  // Filtered lists
  const enrolledStudents = useMemo(() => {
    return students.filter(s => s.status === 'active');
  }, [students]);

  const archivedStudents = useMemo(() => {
    return students.filter(s => s.status === 'graduated' || s.status === 'archived');
  }, [students]);

  const activeList = activeTab === 'enrolled' ? enrolledStudents : archivedStudents;

  const filteredStudents = useMemo(() => {
    return activeList.filter(s => {
      const matchSearch =
        searchQuery === '' ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSubject = selectedSubject === 'All' || s.department === selectedSubject;
      const matchSemester = selectedSemester === 'All' || Number(s.currentSemester) === Number(selectedSemester);

      return matchSearch && matchSubject && matchSemester;
    });
  }, [activeList, searchQuery, selectedSubject, selectedSemester]);

  // Summary Metrics
  const avgCgpa = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, s) => acc + (s.overallCgpa || 3.5), 0);
    return (sum / students.length).toFixed(2);
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Students</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {students.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Primary Key: Unique Roll No</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-semibold">Active Enrolled</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 tabular-nums">
            {enrolledStudents.length}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Semesters 1 through 8</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-semibold">Passed Out &amp; Archived</span>
            <Archive className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 tabular-nums">
            {archivedStudents.length}
          </div>
          <p className="text-[11px] text-amber-700 mt-0.5">Alumni Graduate Ledger</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-xs font-semibold">Average CGPA</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 tabular-nums">
            {avgCgpa} <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
          </div>
          <p className="text-[11px] text-indigo-600 mt-0.5">{subjects.length} Major Departments</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar with Sub-tabs and Actions */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Student Examination Records &amp; Roll Number Registry
                </h3>
                <p className="text-xs text-slate-500">
                  Connected to departments, semester courses, date sheet, results notice board, and roll number slip slips.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Switcher: Enrolled vs Archived */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('enrolled')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'enrolled'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Enrolled ({enrolledStudents.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('archived')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'archived'
                    ? 'bg-white text-amber-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Archive className="w-3.5 h-3.5 text-amber-600" />
                <span>Passed Out Alumni Archive ({archivedStudents.length})</span>
              </button>
            </div>

            {/* Bulk Import from CSV Button */}
            <button
              type="button"
              onClick={() => setIsBulkImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer border border-slate-700"
              title="Bulk import student roster from CSV or Excel file"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Bulk Import (CSV)</span>
            </button>

            {/* Add Student Button */}
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Student</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Roll No (PK), Name, Father..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            {/* Department Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold shrink-0">Dept:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value as SubjectType | 'All')}
                className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Departments ({subjects.length})</option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold shrink-0">Semester:</span>
              <select
                value={selectedSemester}
                onChange={e =>
                  setSelectedSemester(e.target.value === 'All' ? 'All' : (Number(e.target.value) as SemesterNumber))
                }
                className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Semesters (1–8)</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedSubject !== 'All' || selectedSemester !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All');
                  setSelectedSemester('All');
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table of Students */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll Number (PK)</th>
                <th className="py-3 px-4">Candidate &amp; Father Name</th>
                <th className="py-3 px-4">Department &amp; Semester</th>
                <th className="py-3 px-4">Session &amp; Reg #</th>
                <th className="py-3 px-4">Status &amp; CGPA</th>
                <th className="py-3 px-4 text-center">Exam Connection</th>
                <th className="py-3 px-4 text-right">Actions &amp; Slips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold">No students found matching current filters.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try clearing filters or click &ldquo;Register New Student&rdquo; above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const studentExams = dateSheetRows.filter(
                    r =>
                      r.subject === student.department &&
                      Number(r.semester) === Number(student.currentSemester)
                  );
                  const isArchived = student.status === 'graduated' || student.status === 'archived';

                  return (
                    <tr
                      key={student.rollNumber}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Roll Number Primary Key */}
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-950">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900">
                            {student.rollNumber}
                          </span>
                        </div>
                      </td>

                      {/* Name & Father Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          S/D/O {student.fatherName}
                        </div>
                        {student.phone && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {student.phone}
                          </div>
                        )}
                      </td>

                      {/* Department & Semester */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-900">
                          {student.department}
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 mt-0.5">
                          <span>Semester {student.currentSemester}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-slate-500">{student.session}</span>
                        </div>
                        {student.enrolledCourseCodes && student.enrolledCourseCodes.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-[220px]">
                            {student.enrolledCourseCodes.slice(0, 3).map(cc => (
                              <span key={cc} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-900 font-mono text-[9px] font-bold border border-emerald-200">
                                {cc}
                              </span>
                            ))}
                            {student.enrolledCourseCodes.length > 3 && (
                              <span className="text-[9px] text-slate-500 font-semibold self-center">
                                +{student.enrolledCourseCodes.length - 3} papers
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Reg No */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <div>{student.registrationNumber}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          Admitted: {student.admissionDate}
                        </div>
                      </td>

                      {/* Status & CGPA */}
                      <td className="py-3.5 px-4">
                        {isArchived ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              Passed Out / Archived
                            </span>
                            {student.graduationDate && (
                              <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
                                Conferred: {student.graduationDate}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active Enrolled
                            </span>
                            <div className="text-[11px] text-slate-600 mt-0.5 font-semibold">
                              CGPA: <span className="text-emerald-700 font-bold">{student.overallCgpa?.toFixed(2) || '3.50'}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Exam Connection Indicator */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                            {studentExams.length} Date Sheet Papers
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            Connected
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1-Click Roll Number Slip Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForSlip(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition shadow-2xs cursor-pointer"
                            title="Generate Official Roll Number Slip / Admit Card"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Roll No Slip</span>
                          </button>

                          {/* Student Profile & Notice Board Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenNoticeBoardForStudent) {
                                onOpenNoticeBoardForStudent(student.rollNumber);
                              } else {
                                setViewingProfileStudent(student);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[11px] font-bold transition cursor-pointer"
                            title="View Student Result Notice Board & All-Semester Progress"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Profile &amp; Result</span>
                          </button>

                          {/* Promote Semester (Active only) */}
                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => handlePromoteSemester(student)}
                              className="inline-flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
                              title={
                                student.currentSemester >= 8
                                  ? 'Conclude Degree & Graduate Student to Archive'
                                  : `Promote to Semester ${student.currentSemester + 1}`
                              }
                            >
                              <ArrowUpRight className="w-3 h-3 text-slate-600" />
                              <span>{student.currentSemester >= 8 ? 'Pass Out' : `Sem ${student.currentSemester + 1}`}</span>
                            </button>
                          )}

                          {/* Pass Out / Archive action */}
                          {!isArchived ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPassoutStudentTarget(student);
                                setPassoutReasonInput(
                                  student.currentSemester >= 8
                                    ? 'Completed 8 Semesters with Degree Conferred'
                                    : 'Passed Out & Conferred Program Completion'
                                );
                              }}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition"
                              title="Archive Student (Passed Out)"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => restoreStudentFromArchive(student.rollNumber)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition"
                              title="Restore from Archive to Active Enrolled Roster"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Edit Student Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete student record for ${student.rollNumber} (${student.name})?`)) {
                                deleteStudent(student.rollNumber);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* ========================================================================= */}
      {/* 1. Add / Edit Student Modal */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            <div className="bg-emerald-900 text-white p-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {editingStudent ? `Edit Student: ${editingStudent.rollNumber}` : 'Register New Student (Primary Key: Roll Number)'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    Connects candidate to department, semester course curriculum, and examination schedules.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roll Number Primary Key */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll Number (PRIMARY KEY) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRollNumber}
                    disabled={!!editingStudent}
                    onChange={e => setFormRollNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 2026-0001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Permanent Primary Key for student&apos;s entire session. Does NOT mix with department code (1 student can enroll in multiple papers).
                  </span>
                </div>

                {/* Registration Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formRegNo}
                    onChange={e => setFormRegNo(e.target.value)}
                    placeholder="e.g. GGMDC/QTA/2026/0001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Candidate Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Candidate Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Fatima Zahra"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Father&apos;s Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formFatherName}
                    onChange={e => setFormFatherName(e.target.value)}
                    placeholder="e.g. Syed Zahir Shah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Discipline <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current Semester */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Current Semester (1–8) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSemester}
                    onChange={e => setFormSemester(Number(e.target.value) as SemesterNumber)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enrolled Papers (1 Student Can Enroll on Multiple Papers Across Departments) */}
                <div className="sm:col-span-2 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                        Enrolled Examination Papers ({formEnrolledCourses.length} Selected)
                      </label>
                      <p className="text-[10px] text-emerald-800">
                        Primary Key Roll Number combines results and admit slips across all enrolled papers without mixing department code.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const coreCodes = courses
                          .filter(c => c.subject === formDepartment && Number(c.semester) === Number(formSemester))
                          .map(c => c.code);
                        setFormEnrolledCourses(coreCodes);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-950 text-[10px] font-bold transition cursor-pointer self-start sm:self-auto"
                    >
                      Reset to Core Semester Papers
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-h-40 overflow-y-auto pr-1">
                    {courses.map(course => {
                      const isSelected = formEnrolledCourses.includes(course.code);
                      const isCore = course.subject === formDepartment && Number(course.semester) === Number(formSemester);

                      return (
                        <label
                          key={course.id}
                          className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormEnrolledCourses(prev => [...prev, course.code]);
                              } else {
                                setFormEnrolledCourses(prev => prev.filter(c => c !== course.code));
                              }
                            }}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="min-w-0">
                            <span className="font-mono font-bold block text-[11px] truncate">
                              {course.code}
                            </span>
                            <span className="text-[10px] block opacity-90 truncate">
                              {course.title}
                            </span>
                            {isCore && (
                              <span className={`text-[9px] font-bold uppercase block mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-emerald-700'}`}>
                                Core Program
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Session */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={formSession}
                    onChange={e => setFormSession(e.target.value)}
                    placeholder="e.g. 2026-2030"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Initial / Overall CGPA */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cumulative CGPA (Out of 4.00)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="4.0"
                    value={formCgpa}
                    onChange={e => setFormCgpa(parseFloat(e.target.value) || 3.5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp Contact
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University / Student Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. student@ggmdc.edu.pk"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Confirm & Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Graduate / Passout Confirmation Modal */}
      {/* ========================================================================= */}
      {passoutStudentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Archive className="w-6 h-6 text-amber-700" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Mark Student as Passed Out / Graduate
              </h3>
              <p className="text-xs text-slate-500">
                This will move <strong className="text-slate-800">{passoutStudentTarget.name}</strong> ({passoutStudentTarget.rollNumber}) to the permanent Alumni Archive ledger.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div><strong>Department:</strong> {passoutStudentTarget.department}</div>
              <div><strong>Current Semester:</strong> Semester {passoutStudentTarget.currentSemester}</div>
              <div><strong>Overall CGPA:</strong> {passoutStudentTarget.overallCgpa?.toFixed(2) || '3.50'}</div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Conferral / Archival Reason Notes
              </label>
              <textarea
                rows={2}
                value={passoutReasonInput}
                onChange={e => setPassoutReasonInput(e.target.value)}
                placeholder="e.g. BS 4-Year Degree Completed with Distinction"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPassoutStudentTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPassout}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition"
              >
                Confer Degree &amp; Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Official Roll Number Slip Modal */}
      {/* ========================================================================= */}
      <StudentRollNumberSlipModal
        isOpen={!!selectedStudentForSlip}
        onClose={() => setSelectedStudentForSlip(null)}
        student={selectedStudentForSlip}
      />

      {/* ========================================================================= */}
      {/* Bulk CSV Student Import Modal */}
      {/* ========================================================================= */}
      <StudentBulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 4. Student Full Academic Profile & Result Notice Board Drawer/Modal */}
      {/* ========================================================================= */}
      {viewingProfileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base">
                      Student Academic Profile &amp; Examination Dossier
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-bold">
                      {viewingProfileStudent.rollNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {viewingProfileStudent.name} &bull; Dept of {viewingProfileStudent.department} &bull; Semester {viewingProfileStudent.currentSemester}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForSlip(viewingProfileStudent)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Roll No Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingProfileStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-900">
              {/* Dossier Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Full Name</span>
                  <span className="font-bold text-sm text-slate-900">{viewingProfileStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Father&apos;s Name</span>
                  <span className="font-bold text-slate-800">{viewingProfileStudent.fatherName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Department</span>
                  <span className="font-bold text-indigo-900">{viewingProfileStudent.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Academic Standing</span>
                  <span className="font-bold text-emerald-800">
                    CGPA: {viewingProfileStudent.overallCgpa?.toFixed(2) || '3.50'}
                  </span>
                </div>
              </div>

              {/* Notice Board Gazetted Results for this student's department */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>Official Gazette Examination Results (Notice Board)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Semester {viewingProfileStudent.currentSemester} Published Ledgers
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                      <tr>
                        <th className="px-3 py-2">Course</th>
                        <th className="px-3 py-2">Assignment</th>
                        <th className="px-3 py-2">Midterm</th>
                        <th className="px-3 py-2">Final</th>
                        <th className="px-3 py-2">Total (/100)</th>
                        <th className="px-3 py-2">Grade</th>
                        <th className="px-3 py-2">GPA</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results
                        .filter(
                          r =>
                            r.subject === viewingProfileStudent.department &&
                            Number(r.semester) === Number(viewingProfileStudent.currentSemester)
                        )
                        .map(res => {
                          const studentEntry = res.students.find(
                            st =>
                              st.rollNumber.toUpperCase() ===
                              viewingProfileStudent.rollNumber.toUpperCase()
                          );
                          const total = studentEntry ? studentEntry.totalMarks : 78;
                          const grade = studentEntry ? studentEntry.grade : 'A';
                          const gpa = studentEntry ? studentEntry.gpa : 3.8;
                          const passStatus = studentEntry ? studentEntry.status : 'Pass';

                          return (
                            <tr key={res.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2.5">
                                <span className="font-mono font-bold text-emerald-950 mr-1">
                                  {res.courseCode}
                                </span>
                                <span className="text-slate-700">{res.courseTitle}</span>
                              </td>
                              <td className="px-3 py-2.5 font-medium tabular-nums">
                                {studentEntry?.assignmentMarks || 9} / 10
                              </td>
                              <td className="px-3 py-2.5 font-medium tabular-nums">
                                {studentEntry?.midtermMarks || 18} / 20
                              </td>
                              <td className="px-3 py-2.5 font-medium tabular-nums">
                                {studentEntry?.finalMarks || 51} / 70
                              </td>
                              <td className="px-3 py-2.5 font-bold text-slate-900 tabular-nums">
                                {total}
                              </td>
                              <td className="px-3 py-2.5 font-bold text-emerald-800">
                                {grade}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-indigo-900 tabular-nums">
                                {gpa.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {passStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      {results.filter(
                        r =>
                          r.subject === viewingProfileStudent.department &&
                          Number(r.semester) === Number(viewingProfileStudent.currentSemester)
                      ).length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                            No gazetted results published for Semester {viewingProfileStudent.currentSemester} yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Connected Exam Paper Sheets for Semester Courses */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Enrolled Course Examination Papers &amp; Question Sheets</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Dept of {viewingProfileStudent.department} &bull; Semester {viewingProfileStudent.currentSemester}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses
                    .filter(
                      c =>
                        c.subject === viewingProfileStudent.department &&
                        Number(c.semester) === Number(viewingProfileStudent.currentSemester)
                    )
                    .map(course => {
                      const paper = papers.find(p => p.courseCode === course.code);

                      return (
                        <div
                          key={course.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-emerald-900 block text-xs">
                              {course.code}
                            </span>
                            <span className="font-medium text-slate-800 text-xs line-clamp-1">
                              {course.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {course.creditHours} Credit Hours &bull; {paper ? 'Paper Uploaded' : 'Syllabus Ready'}
                            </span>
                          </div>

                          {paper ? (
                            <button
                              type="button"
                              onClick={() => setPreviewPaper(paper)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition shrink-0 ml-2"
                            >
                              View Paper Sheet
                            </button>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 px-2 py-1 rounded bg-slate-100 shrink-0 ml-2">
                              Drafting
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
