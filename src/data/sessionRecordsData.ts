import { SessionExamRecord, SessionTurnaroundSummary, SubjectType } from '../types';
import { COLLEGE_64_COURSES } from './collegeData';

// Turnaround helper to calculate days between two ISO date strings
export const calculateDaysBetween = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

// Generate Fall 2026 records from COLLEGE_64_COURSES
const fall2026Records: SessionExamRecord[] = COLLEGE_64_COURSES.map((course, index) => {
  // Deterministic realistic dates for Fall 2026
  const callDay = 10;
  const paperCallDate = `2026-08-${callDay.toString().padStart(2, '0')}`;
  
  // Submit date: 10 to 22 August
  const submitDay = Math.min(28, 15 + (index % 12));
  const paperSubmittedDate = course.paperSubmitted 
    ? `2026-08-${submitDay.toString().padStart(2, '0')}`
    : `2026-09-02`;

  // QA Approved: 2 to 4 days after submission
  const qaDay = Math.min(30, submitDay + 3);
  const qaApprovedDate = `2026-08-${qaDay.toString().padStart(2, '0')}`;

  // Date sheet announced: Sept 01
  const dateSheetAnnouncedDate = `2026-09-01`;

  // Exam conducted: between Sept 10 and Oct 05
  // Lead time from paper submit to exam is typically 14 - 30 days
  const examDay = 10 + ((index * 3) % 20);
  const examMonth = examDay > 28 ? '10' : '09';
  const formattedExamDay = (examDay > 28 ? examDay - 25 : examDay).toString().padStart(2, '0');
  const examConductedDate = `2026-${examMonth}-${formattedExamDay}`;

  // Result submitted
  const resultDay = 12 + ((index * 2) % 15);
  const resultSubmittedDate = course.resultSubmitted 
    ? `2026-10-${resultDay.toString().padStart(2, '0')}`
    : (course.resultDelayedDays ? `2026-10-28` : `2026-10-18`);

  const gazettePublishedDate = course.resultSubmitted 
    ? `2026-10-${Math.min(30, resultDay + 3).toString().padStart(2, '0')}`
    : `2026-11-05`;

  const daysPaperCallToSubmit = calculateDaysBetween(paperCallDate, paperSubmittedDate);
  const daysSubmitToQaApproval = calculateDaysBetween(paperSubmittedDate, qaApprovedDate);
  const daysApprovalToDateSheet = calculateDaysBetween(qaApprovedDate, dateSheetAnnouncedDate);
  const daysPaperSubmitToExam = calculateDaysBetween(paperSubmittedDate, examConductedDate);
  const daysExamToResultPublish = calculateDaysBetween(examConductedDate, gazettePublishedDate);
  const totalLifecycleDays = calculateDaysBetween(paperCallDate, gazettePublishedDate);

  const totalStudents = 35 + ((index * 7) % 25);
  const passRate = 78 + ((index * 3) % 20);
  const passedCount = Math.round((totalStudents * passRate) / 100);

  let turnaroundRating: 'Optimal' | 'Standard' | 'Delayed Bottleneck' = 'Standard';
  if (daysPaperSubmitToExam <= 18 && daysExamToResultPublish <= 15) {
    turnaroundRating = 'Optimal';
  } else if (daysPaperSubmitToExam > 26 || (course.resultDelayedDays && course.resultDelayedDays > 15)) {
    turnaroundRating = 'Delayed Bottleneck';
  }

  return {
    id: `sess-f26-${course.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    sessionName: 'Fall 2026',
    academicYear: '2026-2027',
    courseCode: course.code,
    courseTitle: course.title,
    department: course.subject,
    semester: course.semester,
    creditHours: course.creditHours,
    examType: course.examType,
    assignedTeacher: course.assignedTeacher,
    totalStudents,
    paperCallDate,
    paperSubmittedDate,
    qaApprovedDate,
    dateSheetAnnouncedDate,
    examConductedDate,
    resultSubmittedDate,
    gazettePublishedDate,
    daysPaperCallToSubmit,
    daysSubmitToQaApproval,
    daysApprovalToDateSheet,
    daysPaperSubmitToExam,
    daysExamToResultPublish,
    totalLifecycleDays,
    paperStatus: course.paperSubmitted ? 'Submitted' : 'Delayed',
    examStatus: 'Conducted',
    resultStatus: course.resultSubmitted ? 'Gazetted' : 'Pending',
    turnaroundRating,
    passedCount,
    passPercentage: passRate,
    chiefInvigilator: `Prof. ${course.assignedTeacher.split(' ').pop()} / Dr. Admin`,
    hallLocation: index % 2 === 0 ? 'Main Examination Hall A' : 'Auditorium Block B',
  };
});

// Generate Spring 2026 completed records
const spring2026Records: SessionExamRecord[] = COLLEGE_64_COURSES.map((course, index) => {
  const paperCallDate = `2026-02-05`;
  const submitDay = 12 + (index % 10);
  const paperSubmittedDate = `2026-02-${submitDay.toString().padStart(2, '0')}`;
  const qaApprovedDate = `2026-02-${(submitDay + 2).toString().padStart(2, '0')}`;
  const dateSheetAnnouncedDate = `2026-02-25`;
  
  const examDay = 5 + ((index * 3) % 20);
  const examConductedDate = `2026-03-${examDay.toString().padStart(2, '0')}`;
  const resultSubmittedDate = `2026-03-${(examDay + 12).toString().padStart(2, '0')}`;
  const gazettePublishedDate = `2026-04-02`;

  const daysPaperCallToSubmit = calculateDaysBetween(paperCallDate, paperSubmittedDate);
  const daysSubmitToQaApproval = calculateDaysBetween(paperSubmittedDate, qaApprovedDate);
  const daysApprovalToDateSheet = calculateDaysBetween(qaApprovedDate, dateSheetAnnouncedDate);
  const daysPaperSubmitToExam = calculateDaysBetween(paperSubmittedDate, examConductedDate);
  const daysExamToResultPublish = calculateDaysBetween(examConductedDate, gazettePublishedDate);
  const totalLifecycleDays = calculateDaysBetween(paperCallDate, gazettePublishedDate);

  const totalStudents = 38 + ((index * 5) % 22);
  const passRate = 82 + ((index * 2) % 16);

  return {
    id: `sess-s26-${course.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    sessionName: 'Spring 2026',
    academicYear: '2025-2026',
    courseCode: course.code,
    courseTitle: course.title,
    department: course.subject,
    semester: course.semester,
    creditHours: course.creditHours,
    examType: course.examType,
    assignedTeacher: course.assignedTeacher,
    totalStudents,
    paperCallDate,
    paperSubmittedDate,
    qaApprovedDate,
    dateSheetAnnouncedDate,
    examConductedDate,
    resultSubmittedDate,
    gazettePublishedDate,
    daysPaperCallToSubmit,
    daysSubmitToQaApproval,
    daysApprovalToDateSheet,
    daysPaperSubmitToExam,
    daysExamToResultPublish,
    totalLifecycleDays,
    paperStatus: 'Approved',
    examStatus: 'Conducted',
    resultStatus: 'Gazetted',
    turnaroundRating: daysPaperSubmitToExam <= 20 ? 'Optimal' : 'Standard',
    passedCount: Math.round((totalStudents * passRate) / 100),
    passPercentage: passRate,
    chiefInvigilator: `Prof. ${course.assignedTeacher.split(' ').pop()}`,
    hallLocation: 'Main Examination Hall A',
  };
});

// Generate Fall 2025 archive records
const fall2025Records: SessionExamRecord[] = COLLEGE_64_COURSES.map((course, index) => {
  const paperCallDate = `2025-08-08`;
  const submitDay = 14 + (index % 12);
  const paperSubmittedDate = `2025-08-${submitDay.toString().padStart(2, '0')}`;
  const qaApprovedDate = `2025-08-${(submitDay + 3).toString().padStart(2, '0')}`;
  const dateSheetAnnouncedDate = `2025-08-30`;
  
  const examDay = 8 + ((index * 3) % 20);
  const examConductedDate = `2025-09-${examDay.toString().padStart(2, '0')}`;
  const resultSubmittedDate = `2025-09-${(examDay + 14).toString().padStart(2, '0')}`;
  const gazettePublishedDate = `2025-10-05`;

  const daysPaperCallToSubmit = calculateDaysBetween(paperCallDate, paperSubmittedDate);
  const daysSubmitToQaApproval = calculateDaysBetween(paperSubmittedDate, qaApprovedDate);
  const daysApprovalToDateSheet = calculateDaysBetween(qaApprovedDate, dateSheetAnnouncedDate);
  const daysPaperSubmitToExam = calculateDaysBetween(paperSubmittedDate, examConductedDate);
  const daysExamToResultPublish = calculateDaysBetween(examConductedDate, gazettePublishedDate);
  const totalLifecycleDays = calculateDaysBetween(paperCallDate, gazettePublishedDate);

  const totalStudents = 40 + (index % 20);
  const passRate = 80 + (index % 18);

  return {
    id: `sess-f25-${course.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    sessionName: 'Fall 2025',
    academicYear: '2025-2026',
    courseCode: course.code,
    courseTitle: course.title,
    department: course.subject,
    semester: course.semester,
    creditHours: course.creditHours,
    examType: course.examType,
    assignedTeacher: course.assignedTeacher,
    totalStudents,
    paperCallDate,
    paperSubmittedDate,
    qaApprovedDate,
    dateSheetAnnouncedDate,
    examConductedDate,
    resultSubmittedDate,
    gazettePublishedDate,
    daysPaperCallToSubmit,
    daysSubmitToQaApproval,
    daysApprovalToDateSheet,
    daysPaperSubmitToExam,
    daysExamToResultPublish,
    totalLifecycleDays,
    paperStatus: 'Approved',
    examStatus: 'Conducted',
    resultStatus: 'Gazetted',
    turnaroundRating: daysPaperSubmitToExam > 24 ? 'Delayed Bottleneck' : 'Standard',
    passedCount: Math.round((totalStudents * passRate) / 100),
    passPercentage: passRate,
    chiefInvigilator: `Senior Invigilator Team`,
    hallLocation: 'Academic Wing Hall 1',
  };
});

// All historical session records combined
export const ALL_SESSION_RECORDS: SessionExamRecord[] = [
  ...fall2026Records,
  ...spring2026Records,
  ...fall2025Records,
];

// Available sessions for selection
export const AVAILABLE_SESSIONS = [
  { id: 'Fall 2026', label: 'Fall 2026 (Current Academic Session)', status: 'Active Current', year: '2026-2027' },
  { id: 'Spring 2026', label: 'Spring 2026 (Completed Examination)', status: 'Completed & Archived', year: '2025-2026' },
  { id: 'Fall 2025', label: 'Fall 2025 (Annual Examination Archive)', status: 'Completed & Archived', year: '2025-2026' },
];

// Precomputed session turnaround summaries
export const SESSION_SUMMARIES: Record<string, SessionTurnaroundSummary> = {
  'Fall 2026': {
    sessionName: 'Fall 2026',
    academicYear: '2026-2027',
    status: 'Active Current',
    totalCourses: 64,
    papersSubmitted: 59,
    examsConducted: 64,
    resultsGazetted: 25,
    complianceRate: 92.2,
    avgDaysPaperSubmitToExam: 19.4, // User's requested core metric
    minDaysPaperToExam: 12,
    maxDaysPaperToExam: 32,
    avgDaysExamToResult: 16.8,
    avgTotalLifecycleDays: 44.5,
    fastestDepartment: 'Islamic Studies',
    bottleneckDepartment: 'Zoology',
    onTimeExamDeliveryRate: 88.5,
  },
  'Spring 2026': {
    sessionName: 'Spring 2026',
    academicYear: '2025-2026',
    status: 'Completed & Archived',
    totalCourses: 64,
    papersSubmitted: 64,
    examsConducted: 64,
    resultsGazetted: 64,
    complianceRate: 100.0,
    avgDaysPaperSubmitToExam: 17.2,
    minDaysPaperToExam: 11,
    maxDaysPaperToExam: 25,
    avgDaysExamToResult: 14.1,
    avgTotalLifecycleDays: 38.6,
    fastestDepartment: 'English',
    bottleneckDepartment: 'Sociology',
    onTimeExamDeliveryRate: 95.3,
  },
  'Fall 2025': {
    sessionName: 'Fall 2025',
    academicYear: '2025-2026',
    status: 'Completed & Archived',
    totalCourses: 64,
    papersSubmitted: 64,
    examsConducted: 64,
    resultsGazetted: 64,
    complianceRate: 100.0,
    avgDaysPaperSubmitToExam: 21.8,
    minDaysPaperToExam: 14,
    maxDaysPaperToExam: 35,
    avgDaysExamToResult: 18.5,
    avgTotalLifecycleDays: 47.2,
    fastestDepartment: 'Islamic Studies',
    bottleneckDepartment: 'Zoology',
    onTimeExamDeliveryRate: 84.4,
  },
};

// Department turnaround benchmark comparison
export interface DepartmentTurnaroundBenchmark {
  department: SubjectType;
  coursesCount: number;
  avgDraftingDays: number; // Call to submit
  avgQaDays: number; // Submit to QA
  avgPaperToExamDays: number; // Submit to Exam
  avgResultDays: number; // Exam to Gazette
  totalCycleDays: number;
  rating: 'Fast Track' | 'Standard' | 'Attention Needed';
}

export const DEPARTMENT_TURNAROUND_BENCHMARKS: DepartmentTurnaroundBenchmark[] = [
  {
    department: 'Islamic Studies',
    coursesCount: 14,
    avgDraftingDays: 7.2,
    avgQaDays: 2.1,
    avgPaperToExamDays: 16.4,
    avgResultDays: 13.8,
    totalCycleDays: 37.3,
    rating: 'Fast Track',
  },
  {
    department: 'English',
    coursesCount: 13,
    avgDraftingDays: 8.5,
    avgQaDays: 2.8,
    avgPaperToExamDays: 17.6,
    avgResultDays: 15.2,
    totalCycleDays: 41.3,
    rating: 'Fast Track',
  },
  {
    department: 'Sociology',
    coursesCount: 19,
    avgDraftingDays: 9.8,
    avgQaDays: 3.4,
    avgPaperToExamDays: 19.9,
    avgResultDays: 17.5,
    totalCycleDays: 46.8,
    rating: 'Standard',
  },
  {
    department: 'Zoology',
    coursesCount: 18,
    avgDraftingDays: 11.4,
    avgQaDays: 4.1,
    avgPaperToExamDays: 23.2,
    avgResultDays: 20.4,
    totalCycleDays: 54.1,
    rating: 'Attention Needed',
  },
  {
    department: 'Chemistry',
    coursesCount: 0,
    avgDraftingDays: 0,
    avgQaDays: 0,
    avgPaperToExamDays: 0,
    avgResultDays: 0,
    totalCycleDays: 0,
    rating: 'Standard',
  },
];
