import { ExamResult, StudentResultEntry } from '../types';

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

/**
 * INITIAL_EXAM_RESULTS
 * Cleared to nil / empty array for clean development.
 */
export const INITIAL_EXAM_RESULTS: ExamResult[] = [];

export const generateSampleStudents = (deptCode: string = 'ENG', count = 20): StudentResultEntry[] => {
  const list: StudentResultEntry[] = [];
  for (let i = 1; i <= count; i++) {
    const roll = `2026-${String(i).padStart(4, '0')}`;
    const assignment = Math.floor(Math.random() * 4) + 6;
    const midterm = Math.floor(Math.random() * 8) + 12;
    const final = Math.floor(Math.random() * 25) + 25;
    const total = assignment + midterm + final;
    const gradeInfo = calculateGradeAndGpa(total, 80);
    const percentage = Number(((total / 80) * 100).toFixed(1));
    list.push({
      rollNumber: roll,
      studentName: `Candidate ${i}`,
      assignmentMarks: assignment,
      midtermMarks: midterm,
      finalMarks: final,
      totalMarks: total,
      percentage,
      grade: gradeInfo.grade,
      gpa: gradeInfo.gpa,
      status: gradeInfo.status,
      remarks: gradeInfo.status === 'Pass' ? 'Good Standing' : 'Needs Improvement',
    });
  }
  return list;
};
