import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { SubjectType, SemesterNumber } from '../../types';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Layers,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  FileSpreadsheet,
  Award,
  ChevronRight,
  Hash,
} from 'lucide-react';

const SUGGESTED_SUBJECTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Economics',
  'Psychology',
  'Business Administration',
  'Political Science',
];

export const CurriculumManagement: React.FC = () => {
  const {
    subjects,
    semesters,
    courses,
    addSubject,
    deleteSubject,
    addSemester,
    addCourse,
    updateCourseCreditHours,
    deleteCourse,
    papers,
  } = useExam();

  // Internal sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'subjects' | 'semesters' | 'courses'>('courses');

  // Add Subject Form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Add Semester Form state
  const [newSemesterNum, setNewSemesterNum] = useState<number>(() => {
    const max = Math.max(...semesters, 8);
    return max + 1;
  });
  const [semesterError, setSemesterError] = useState<string | null>(null);

  // Add Course Form state
  const [courseSubject, setCourseSubject] = useState<SubjectType>(subjects[0] || 'English');
  const [courseSemester, setCourseSemester] = useState<SemesterNumber>(semesters[0] || 1);
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCreditHours, setCourseCreditHours] = useState<number>(3);
  const [courseError, setCourseError] = useState<string | null>(null);

  // Courses filter & search
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Add Subject
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubjectError(null);
    const res = addSubject(newSubjectName);
    if (!res.success) {
      setSubjectError(res.error || 'Failed to add subject');
    } else {
      setNewSubjectName('');
    }
  };

  // Handle Add Semester
  const handleAddSemesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSemesterError(null);
    const res = addSemester(Number(newSemesterNum));
    if (!res.success) {
      setSemesterError(res.error || 'Failed to add semester');
    } else {
      const nextMax = Math.max(...semesters, Number(newSemesterNum)) + 1;
      setNewSemesterNum(nextMax);
    }
  };

  // Handle Add Course
  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourseError(null);
    const res = addCourse({
      code: courseCode,
      title: courseTitle,
      subject: courseSubject,
      semester: Number(courseSemester),
      creditHours: Number(courseCreditHours),
    });
    if (!res.success) {
      setCourseError(res.error || 'Failed to add course');
    } else {
      setCourseCode('');
      setCourseTitle('');
      setCourseCreditHours(3);
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter(c => {
    if (selectedSubjectFilter !== 'all' && c.subject !== selectedSubjectFilter) return false;
    if (selectedSemesterFilter !== 'all' && String(c.semester) !== selectedSemesterFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate statistics
  const totalCreditHours = courses.reduce((acc, c) => acc + (c.creditHours || 3), 0);
  const avgCreditHours = courses.length > 0 ? (totalCreditHours / courses.length).toFixed(1) : '3.0';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-400/30">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Curriculum Authority</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Academic Structure & Course Credit Hours Manager
            </h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Administrator module to register degree subjects, add academic semester levels, and configure courses with verified credit hour weights for examination conduct.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <p className="text-[10px] text-indigo-200 uppercase font-semibold">Subjects</p>
              <p className="text-lg font-black">{subjects.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <p className="text-[10px] text-indigo-200 uppercase font-semibold">Semesters</p>
              <p className="text-lg font-black">{semesters.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
              <p className="text-[10px] text-indigo-200 uppercase font-semibold">Courses</p>
              <p className="text-lg font-black">{courses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            id="admin-curriculum-tab-courses"
            onClick={() => setActiveSubTab('courses')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'courses'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>1. Courses & Credit Hours ({courses.length})</span>
          </button>

          <button
            id="admin-curriculum-tab-subjects"
            onClick={() => setActiveSubTab('subjects')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'subjects'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>2. Add & Manage Subjects ({subjects.length})</span>
          </button>

          <button
            id="admin-curriculum-tab-semesters"
            onClick={() => setActiveSubTab('semesters')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeSubTab === 'semesters'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>3. Configure Semesters ({semesters.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Degree Credit Hours: <strong className="text-slate-800">{totalCreditHours} Cr. Hrs</strong> &bull; Avg: <strong className="text-indigo-600">{avgCreditHours} Cr/Course</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. COURSES & CREDIT HOURS PANEL */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Course Form (Left 1 col) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Course & Credit Hours</h3>
                <p className="text-[11px] text-slate-500">Assign course code, subject, semester & credit hours</p>
              </div>
            </div>

            {courseError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{courseError}</span>
              </div>
            )}

            <form onSubmit={handleAddCourseSubmit} className="space-y-3.5">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Subject
                </label>
                <select
                  id="admin-add-course-subject"
                  value={courseSubject}
                  onChange={e => setCourseSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Semester
                </label>
                <select
                  id="admin-add-course-semester"
                  value={courseSemester}
                  onChange={e => setCourseSemester(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Code
                </label>
                <input
                  id="admin-add-course-code"
                  type="text"
                  required
                  placeholder="e.g. CS-201 or ENG-105"
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono font-semibold"
                />
              </div>

              {/* Course Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title / Name
                </label>
                <input
                  id="admin-add-course-title"
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={courseTitle}
                  onChange={e => setCourseTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Credit Hours Selector & Stepper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Assigned Credit Hours (Cr. Hrs)
                  </label>
                  <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {courseCreditHours} Credit Hours
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map(hrs => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setCourseCreditHours(hrs)}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        courseCreditHours === hrs
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {hrs} Cr
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Standard lecture course: 3 Cr. Hrs (3 contact hours/week) | Lab course: 4 Cr. Hrs.
                </p>
              </div>

              <button
                id="admin-submit-course-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register Course with {courseCreditHours} Cr. Hrs</span>
              </button>
            </form>
          </div>

          {/* Courses List Table with Credit Hours modifier (Right 2 cols) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Course Catalog & Credit Hours Matrix ({filteredCourses.length} Courses)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Adjust credit hours directly with the stepper controls.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedSubjectFilter}
                  onChange={e => setSelectedSubjectFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="all">All Subjects ({subjects.length})</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={selectedSemesterFilter}
                  onChange={e => setSelectedSemesterFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="all">All Semesters</option>
                  {semesters.map(sem => (
                    <option key={sem} value={String(sem)}>Sem {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search course code, title, or subject..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[520px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-3 py-2.5">Course Code & Title</th>
                    <th className="px-3 py-2.5">Subject</th>
                    <th className="px-3 py-2.5">Semester</th>
                    <th className="px-3 py-2.5">Credit Hours</th>
                    <th className="px-3 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map(course => {
                    const hasSubmittedPaper = papers.some(p => p.courseCode === course.code);

                    return (
                      <tr key={course.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 text-[11px]">
                              {course.code}
                            </span>
                            <span className="font-medium text-slate-800">{course.title}</span>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-slate-600 font-medium">
                          {course.subject}
                        </td>

                        <td className="px-3 py-2.5">
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            Sem {course.semester}
                          </span>
                        </td>

                        <td className="px-3 py-2.5">
                          {/* Credit Hours Stepper Control */}
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => updateCourseCreditHours(course.id, Math.max(1, (course.creditHours || 3) - 1))}
                              className="w-5 h-5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs transition"
                              title="Decrease credit hours"
                            >
                              -
                            </button>
                            <span className="px-1.5 font-extrabold text-indigo-900 text-xs min-w-[28px] text-center">
                              {course.creditHours || 3} <span className="text-[10px] font-normal text-slate-500">Cr</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCourseCreditHours(course.id, Math.min(8, (course.creditHours || 3) + 1))}
                              className="w-5 h-5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs transition"
                              title="Increase credit hours"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => deleteCourse(course.id)}
                            disabled={hasSubmittedPaper}
                            className={`p-1.5 rounded-lg transition ${
                              hasSubmittedPaper
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={hasSubmittedPaper ? 'Cannot delete: Paper submitted for this course' : 'Delete course'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBJECTS / DEPARTMENTS PANEL */}
      {/* ========================================================================= */}
      {activeSubTab === 'subjects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Subject Form (Left 1 col) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Academic Subject</h3>
                <p className="text-[11px] text-slate-500">Register new degree department or discipline</p>
              </div>
            </div>

            {subjectError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{subjectError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject / Discipline Name
                </label>
                <input
                  id="admin-add-subject-input"
                  type="text"
                  required
                  placeholder="e.g. Computer Science, Mathematics"
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              {/* Suggestions chips */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                  Popular Disciplines:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SUBJECTS.map(item => {
                    const isExisting = subjects.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        disabled={isExisting}
                        onClick={() => setNewSubjectName(item)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          isExisting
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item} {isExisting && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                id="admin-submit-subject-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register Subject in Curriculum</span>
              </button>
            </form>
          </div>

          {/* Subjects Grid (Right 2 cols) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Subjects & Departments ({subjects.length} Active)
              </h3>
              <p className="text-[11px] text-slate-500">
                All registered degree programs currently eligible for teacher paper upload, QA checking, and Principal examination scheduling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {subjects.map(subject => {
                const subjectCourses = courses.filter(c => c.subject === subject);
                const subjectPapers = papers.filter(p => p.subject === subject);
                const subjectCrHrs = subjectCourses.reduce((sum, c) => sum + (c.creditHours || 3), 0);
                const isInitialFour = ['English', 'Islamic Studies', 'Sociology', 'Zoology'].includes(subject);

                return (
                  <div
                    key={subject}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {subject.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{subject}</h4>
                          <span className="text-[10px] text-slate-500">
                            {isInitialFour ? 'Core University Department' : 'Custom Department'}
                          </span>
                        </div>
                      </div>

                      {/* Delete button (with protection) */}
                      {!isInitialFour && (
                        <button
                          type="button"
                          onClick={() => deleteSubject(subject)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Remove subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Courses</p>
                        <p className="font-bold text-slate-800 text-xs">{subjectCourses.length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Credit Hrs</p>
                        <p className="font-bold text-indigo-700 text-xs">{subjectCrHrs}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Papers</p>
                        <p className="font-bold text-emerald-700 text-xs">{subjectPapers.length}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEMESTERS PANEL */}
      {/* ========================================================================= */}
      {activeSubTab === 'semesters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Semester Form (Left 1 col) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Academic Semester</h3>
                <p className="text-[11px] text-slate-500">Configure higher semester levels (e.g. 9, 10, 11, 12)</p>
              </div>
            </div>

            {semesterError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{semesterError}</span>
              </div>
            )}

            <form onSubmit={handleAddSemesterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Semester Level Number
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      id="admin-add-semester-input"
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={newSemesterNum}
                      onChange={e => setNewSemesterNum(Number(e.target.value))}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    Semester {newSemesterNum}
                  </span>
                </div>
              </div>

              {/* Quick Action Button */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-2">
                <p className="font-semibold">Quick Extension:</p>
                <button
                  type="button"
                  onClick={() => {
                    const max = Math.max(...semesters, 0);
                    addSemester(max + 1);
                    setNewSemesterNum(max + 2);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Next: Semester {Math.max(...semesters, 0) + 1}</span>
                </button>
              </div>

              <button
                id="admin-submit-semester-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Semester {newSemesterNum}</span>
              </button>
            </form>
          </div>

          {/* Semesters Grid (Right 2 cols) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Active Semesters Grid ({semesters.length} Semesters Configured)
              </h3>
              <p className="text-[11px] text-slate-500">
                Each semester level can be populated with courses and credit hours across all enrolled subjects.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {semesters.map(sem => {
                const semCourses = courses.filter(c => c.semester === sem);
                const semCreditHours = semCourses.reduce((sum, c) => sum + (c.creditHours || 3), 0);
                const semPapers = papers.filter(p => p.semester === sem);

                return (
                  <div
                    key={sem}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:border-amber-300 hover:shadow-xs transition text-center space-y-1.5"
                  >
                    <div className="inline-flex px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-black">
                      Semester {sem}
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {semCourses.length} Course{semCourses.length === 1 ? '' : 's'}
                    </p>
                    <p className="text-[10px] text-indigo-700 font-semibold">
                      {semCreditHours} Total Cr. Hrs
                    </p>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      {semPapers.length} Papers Submitted
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
