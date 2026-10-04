import { ExamResult, StudentResultEntry } from '../types';
import { INITIAL_STUDENTS } from './initialStudents';

export const calculateGradeAndGpa = (total: number, max = 100): {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  gpa: number;
  status: 'Pass' | 'Fail';
} => {
  const pct = (total / max) * 100;
  if (pct >= 85) return { grade: 'A+', gpa: 4.0, status: 'Pass' };
  if (pct >= 80) return { grade: 'A', gpa: 3.7, status: 'Pass' };
  if (pct >= 75) return { grade: 'B+', gpa: 3.3, status: 'Pass' };
  if (pct >= 70) return { grade: 'B', gpa: 3.0, status: 'Pass' };
  if (pct >= 60) return { grade: 'C', gpa: 2.0, status: 'Pass' };
  if (pct >= 50) return { grade: 'D', gpa: 1.0, status: 'Pass' };
  return { grade: 'F', gpa: 0.0, status: 'Fail' };
};

const SAMPLE_NAMES = [
  'Ahmed Ali Khan',
  'Fatima Zahra',
  'Muhammad Usman',
  'Ayesha Siddiqa',
  'Bilal Hassan',
  'Zainab Noor',
  'Hamza Tariq',
  'Maryam Bibi',
  'Omar Farooq',
  'Hira Batool',
  'Abdullah Sheikh',
  'Sana Parveen',
  'Mustafa Kamal',
  'Rabia Anum',
  'Saad Rafiq',
  'Mahnoor Asif',
  'Usama Munir',
  'Khadija Tul Kubra',
  'Zubair Ahmed',
  'Nida Yaseen',
  'Farhan Qureshi',
  'Bushra Javed',
  'Taimoor Shah',
  'Amna Rauf',
  'Waleed Khalid',
];

export const generateStudentsForCourse = (
  deptName: string,
  semester: number,
  courseCode?: string,
  _minCount?: number
): StudentResultEntry[] => {
  // STRICTLY retrieve registered students enrolled in this course paper
  // OR matching the department and semester cohort
  const registered = INITIAL_STUDENTS.filter(s => {
    if (s.status !== 'active' && s.status) return false;
    // 1. If student has explicit enrolledCourseCodes, check if this courseCode is enrolled
    if (courseCode && s.enrolledCourseCodes && s.enrolledCourseCodes.includes(courseCode)) {
      return true;
    }
    // 2. If student has no explicit enrolledCourseCodes list, fallback to department and semester
    if (!s.enrolledCourseCodes || s.enrolledCourseCodes.length === 0) {
      return s.department === deptName && Number(s.currentSemester) === Number(semester);
    }
    return false;
  });

  return registered.map((s, idx) => {
    const cgpa = s.overallCgpa || 3.5;
    const seed = (s.rollNumber.charCodeAt(s.rollNumber.length - 1) || 5) + idx;
    const assignment = 8 + (seed % 3); // 8-10
    const midterm = 15 + (seed % 5); // 15-19
    const finalMarks = Math.min(70, Math.max(38, Math.round((cgpa / 4.0) * 65) + ((seed % 7) - 3)));
    const total = assignment + midterm + finalMarks;
    const percentage = Number(((total / 100) * 100).toFixed(1));
    const { grade, gpa, status } = calculateGradeAndGpa(total, 100);

    return {
      rollNumber: s.rollNumber,
      studentName: s.name,
      assignmentMarks: assignment,
      midtermMarks: midterm,
      finalMarks,
      totalMarks: total,
      percentage,
      grade,
      gpa,
      status,
      remarks: status === 'Pass' ? (gpa >= 3.7 ? 'Distinction' : 'Cleared') : 'Failed in Theory Component',
    };
  });
};

export const generateSampleStudents = (deptCode: string, count = 18): StudentResultEntry[] => {
  return generateStudentsForCourse('English', 1, deptCode, count);
};

const eng101Students = generateStudentsForCourse('English', 1, 'ENG-101');
const eng201Students = generateStudentsForCourse('English', 2, 'ENG-201');
const soc101Students = generateStudentsForCourse('Sociology', 1, 'SOC-101');
const soc201Students = generateStudentsForCourse('Sociology', 2, 'SOC-201');
const isl101Students = generateStudentsForCourse('Islamic Studies', 1, 'ISL-101');
const zoo101Students = generateStudentsForCourse('Zoology', 1, 'ZOO-101');

export const INITIAL_EXAM_RESULTS: ExamResult[] = [
  {
    id: 'res-eng-101',
    courseCode: 'ENG-101',
    courseTitle: 'Functional English & Grammar',
    subject: 'English',
    semester: 1,
    academicSession: 'Fall 2026',
    examType: 'Final Term Examination',
    teacherId: 'tch-eng-1',
    teacherName: 'Prof. Dr. Sarah Jenkins',
    teacherEmail: 'sarah.jenkins@university.edu',
    status: 'gazetted_published',
    totalStudents: eng101Students.length,
    appeared: eng101Students.length,
    passed: eng101Students.filter(s => s.status === 'Pass').length,
    failed: eng101Students.filter(s => s.status === 'Fail').length,
    withheld: 0,
    passPercentage: Number(
      ((eng101Students.filter(s => s.status === 'Pass').length / eng101Students.length) * 100).toFixed(1)
    ),
    averageGpa: Number(
      (eng101Students.reduce((acc, s) => acc + s.gpa, 0) / eng101Students.length).toFixed(2)
    ),
    highestMarks: Math.max(...eng101Students.map(s => s.totalMarks)),
    submittedAt: '2026-09-12T10:30:00Z',
    ratifiedAt: '2026-09-14T14:15:00Z',
    ratifiedBy: 'Prof. Dr. Richard Hawthorne (Principal)',
    gazetteNumber: 'UHE/EXAM/GZ-2026/081',
    gazettePublishedAt: '2026-09-15T09:00:00Z',
    officialRemarks: 'Official Gazette ratified by Academic Executive Board. Results declared final.',
    students: eng101Students,
  },
  {
    id: 'res-soc-101',
    courseCode: 'SOC-101',
    courseTitle: 'Introduction to Sociology',
    subject: 'Sociology',
    semester: 1,
    academicSession: 'Fall 2026',
    examType: 'Final Term Examination',
    teacherId: 'tch-soc-1',
    teacherName: 'Dr. Bilal Qureshi',
    teacherEmail: 'bilal.qureshi@university.edu',
    status: 'ratified_by_principal',
    totalStudents: soc101Students.length,
    appeared: soc101Students.length,
    passed: soc101Students.filter(s => s.status === 'Pass').length,
    failed: soc101Students.filter(s => s.status === 'Fail').length,
    withheld: 0,
    passPercentage: Number(
      ((soc101Students.filter(s => s.status === 'Pass').length / soc101Students.length) * 100).toFixed(1)
    ),
    averageGpa: Number(
      (soc101Students.reduce((acc, s) => acc + s.gpa, 0) / soc101Students.length).toFixed(2)
    ),
    highestMarks: Math.max(...soc101Students.map(s => s.totalMarks)),
    submittedAt: '2026-09-15T11:45:00Z',
    ratifiedAt: '2026-09-16T16:20:00Z',
    ratifiedBy: 'Prof. Dr. Richard Hawthorne (Principal)',
    gazetteNumber: 'UHE/EXAM/GZ-2026/094',
    gazettePublishedAt: '2026-09-16T16:30:00Z',
    officialRemarks: 'Ratified by Principal; ready for formal notification bulletin.',
    students: soc101Students,
  },
  {
    id: 'res-isl-101',
    courseCode: 'ISL-101',
    courseTitle: 'Ulum-ul-Quran & Exegesis',
    subject: 'Islamic Studies',
    semester: 1,
    academicSession: 'Fall 2026',
    examType: 'Final Term Examination',
    teacherId: 'tch-isl-1',
    teacherName: 'Prof. Hafiz Tariq Mahmood',
    teacherEmail: 'tariq.mahmood@university.edu',
    status: 'submitted_by_faculty',
    totalStudents: isl101Students.length,
    appeared: isl101Students.length,
    passed: isl101Students.filter(s => s.status === 'Pass').length,
    failed: isl101Students.filter(s => s.status === 'Fail').length,
    withheld: 0,
    passPercentage: Number(
      ((isl101Students.filter(s => s.status === 'Pass').length / isl101Students.length) * 100).toFixed(1)
    ),
    averageGpa: Number(
      (isl101Students.reduce((acc, s) => acc + s.gpa, 0) / isl101Students.length).toFixed(2)
    ),
    highestMarks: Math.max(...isl101Students.map(s => s.totalMarks)),
    submittedAt: '2026-09-16T18:00:00Z',
    officialRemarks: 'Submitted by Department Examiner; pending Principal Executive review & signature.',
    students: isl101Students,
  },
  {
    id: 'res-zoo-101',
    courseCode: 'ZOO-101',
    courseTitle: 'Principles of Animal Life I',
    subject: 'Zoology',
    semester: 1,
    academicSession: 'Fall 2026',
    examType: 'Final Term Examination',
    teacherId: 'tch-zoo-1',
    teacherName: 'Dr. Amina Malik',
    teacherEmail: 'amina.malik@university.edu',
    status: 'under_audit',
    totalStudents: zoo101Students.length,
    appeared: zoo101Students.length,
    passed: zoo101Students.filter(s => s.status === 'Pass').length,
    failed: zoo101Students.filter(s => s.status === 'Fail').length,
    withheld: 0,
    passPercentage: Number(
      ((zoo101Students.filter(s => s.status === 'Pass').length / zoo101Students.length) * 100).toFixed(1)
    ),
    averageGpa: Number(
      (zoo101Students.reduce((acc, s) => acc + s.gpa, 0) / zoo101Students.length).toFixed(2)
    ),
    highestMarks: Math.max(...zoo101Students.map(s => s.totalMarks)),
    submittedAt: '2026-09-17T08:20:00Z',
    officialRemarks: 'Exam cell marks tally verification completed; waiting for Principal ratification seal.',
    students: zoo101Students,
  },
  {
    id: 'res-eng-201',
    courseCode: 'ENG-201',
    courseTitle: 'History of English Literature',
    subject: 'English',
    semester: 2,
    academicSession: 'Fall 2026',
    examType: 'Mid Term & Final Examination',
    teacherId: 'tch-eng-1',
    teacherName: 'Prof. Dr. Sarah Jenkins',
    teacherEmail: 'sarah.jenkins@university.edu',
    status: 'gazetted_published',
    totalStudents: eng201Students.length,
    appeared: eng201Students.length,
    passed: eng201Students.filter(s => s.status === 'Pass').length,
    failed: eng201Students.filter(s => s.status === 'Fail').length,
    withheld: 0,
    passPercentage: Number(
      ((eng201Students.filter(s => s.status === 'Pass').length / eng201Students.length) * 100).toFixed(1)
    ),
    averageGpa: Number(
      (eng201Students.reduce((acc, s) => acc + s.gpa, 0) / eng201Students.length).toFixed(2)
    ),
    highestMarks: Math.max(...eng201Students.map(s => s.totalMarks)),
    submittedAt: '2026-09-18T10:00:00Z',
    ratifiedAt: '2026-09-19T11:30:00Z',
    ratifiedBy: 'Prof. Dr. Bilquis Jahan (Principal)',
    gazetteNumber: 'UHE/EXAM/GZ-2026/112',
    gazettePublishedAt: '2026-09-20T09:00:00Z',
    officialRemarks: 'Ratified and Gazetted by Academic Board.',
    students: eng201Students,
  },
  {
    id: 'res-soc-201',
    courseCode: 'SOC-201',
    courseTitle: 'Social Institutions & Structure',
    subject: 'Sociology',
    semester: 2,
    academicSession: 'Fall 2026',
    examType: 'Mid Term & Final Examination',
    teacherId: 'tch-soc-1',
    teacherName: 'Dr. Bilal Qureshi',
    teacherEmail: 'bilal.qureshi@university.edu',
    status: 'gazetted_published',
    totalStudents: soc201Students.length,
    appeared: soc201Students.length,
    passed: soc201Students.filter(s => s.status === 'Pass').length,
    failed: soc201Students.filter(s => s.status === 'Fail').length,
    withheld: 0,
    passPercentage: Number(
      ((soc201Students.filter(s => s.status === 'Pass').length / soc201Students.length) * 100).toFixed(1)
    ),
    averageGpa: Number(
      (soc201Students.reduce((acc, s) => acc + s.gpa, 0) / soc201Students.length).toFixed(2)
    ),
    highestMarks: Math.max(...soc201Students.map(s => s.totalMarks)),
    submittedAt: '2026-09-18T14:30:00Z',
    ratifiedAt: '2026-09-19T12:00:00Z',
    ratifiedBy: 'Prof. Dr. Bilquis Jahan (Principal)',
    gazetteNumber: 'UHE/EXAM/GZ-2026/115',
    gazettePublishedAt: '2026-09-20T09:30:00Z',
    officialRemarks: 'Ratified and Gazetted by Academic Board.',
    students: soc201Students,
  },
];
