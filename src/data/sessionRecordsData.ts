import { SessionExamRecord, SessionTurnaroundSummary, SubjectType } from '../types';

// Turnaround helper to calculate days between two ISO date strings
export const calculateDaysBetween = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * All historical mock session records cleared to nil.
 * Records are populated as actual papers, date sheets, exams, and results are recorded.
 */
const fall2026Records: SessionExamRecord[] = [];
const spring2026Records: SessionExamRecord[] = [];
const fall2025Records: SessionExamRecord[] = [];

// All historical session records combined - Cleared to nil / empty
export const ALL_SESSION_RECORDS: SessionExamRecord[] = [];

// Available sessions for selection
export const AVAILABLE_SESSIONS = [
  { id: 'Fall 2026', label: 'Fall 2026 (Current Academic Session)', status: 'Active Current', year: '2026-2027' },
  { id: 'Spring 2026', label: 'Spring 2026 (Completed Examination)', status: 'Completed & Archived', year: '2025-2026' },
  { id: 'Fall 2025', label: 'Fall 2025 (Annual Examination Archive)', status: 'Completed & Archived', year: '2025-2026' },
];

// Session turnaround summaries cleared to nil
export const SESSION_SUMMARIES: Record<string, SessionTurnaroundSummary> = {
  'Fall 2026': {
    sessionName: 'Fall 2026',
    academicYear: '2026-2027',
    status: 'Active Current',
    totalCourses: 0,
    papersSubmitted: 0,
    examsConducted: 0,
    resultsGazetted: 0,
    complianceRate: 0,
    avgDaysPaperSubmitToExam: 0,
    minDaysPaperToExam: 0,
    maxDaysPaperToExam: 0,
    avgDaysExamToResult: 0,
    avgTotalLifecycleDays: 0,
    fastestDepartment: 'English',
    bottleneckDepartment: 'English',
    onTimeExamDeliveryRate: 0,
  },
  'Spring 2026': {
    sessionName: 'Spring 2026',
    academicYear: '2025-2026',
    status: 'Completed & Archived',
    totalCourses: 0,
    papersSubmitted: 0,
    examsConducted: 0,
    resultsGazetted: 0,
    complianceRate: 0,
    avgDaysPaperSubmitToExam: 0,
    minDaysPaperToExam: 0,
    maxDaysPaperToExam: 0,
    avgDaysExamToResult: 0,
    avgTotalLifecycleDays: 0,
    fastestDepartment: 'English',
    bottleneckDepartment: 'English',
    onTimeExamDeliveryRate: 0,
  },
  'Fall 2025': {
    sessionName: 'Fall 2025',
    academicYear: '2025-2026',
    status: 'Completed & Archived',
    totalCourses: 0,
    papersSubmitted: 0,
    examsConducted: 0,
    resultsGazetted: 0,
    complianceRate: 0,
    avgDaysPaperSubmitToExam: 0,
    minDaysPaperToExam: 0,
    maxDaysPaperToExam: 0,
    avgDaysExamToResult: 0,
    avgTotalLifecycleDays: 0,
    fastestDepartment: 'English',
    bottleneckDepartment: 'English',
    onTimeExamDeliveryRate: 0,
  },
};

// Department turnaround benchmark comparison
export interface DepartmentTurnaroundBenchmark {
  department: SubjectType;
  coursesCount: number;
  avgDraftingDays: number;
  avgQaDays: number;
  avgPaperToExamDays: number;
  avgResultDays: number;
  totalCycleDays: number;
  rating: 'Fast Track' | 'Standard' | 'Attention Needed';
}

export const DEPARTMENT_TURNAROUND_BENCHMARKS: DepartmentTurnaroundBenchmark[] = [
  {
    department: 'Islamic Studies',
    coursesCount: 0,
    avgDraftingDays: 0,
    avgQaDays: 0,
    avgPaperToExamDays: 0,
    avgResultDays: 0,
    totalCycleDays: 0,
    rating: 'Fast Track',
  },
  {
    department: 'English',
    coursesCount: 0,
    avgDraftingDays: 0,
    avgQaDays: 0,
    avgPaperToExamDays: 0,
    avgResultDays: 0,
    totalCycleDays: 0,
    rating: 'Fast Track',
  },
  {
    department: 'Sociology',
    coursesCount: 0,
    avgDraftingDays: 0,
    avgQaDays: 0,
    avgPaperToExamDays: 0,
    avgResultDays: 0,
    totalCycleDays: 0,
    rating: 'Standard',
  },
  {
    department: 'Zoology',
    coursesCount: 0,
    avgDraftingDays: 0,
    avgQaDays: 0,
    avgPaperToExamDays: 0,
    avgResultDays: 0,
    totalCycleDays: 0,
    rating: 'Attention Needed',
  },
];
