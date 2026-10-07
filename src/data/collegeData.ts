import { Course, SubjectType, DutyRosterItem, ExamPaper, ExamResult, ExamDateSheetRow } from '../types';

export const COLLEGE_METADATA = {
  institutionName: 'Govt. Girls Model Degree College',
  campus: 'Jinnah Town, Quetta',
  systemName: 'Examination Management System',
  reportTitle: 'Executive Dashboard · All Exam Types · CONFIDENTIAL',
  lastUpdated: 'Current Academic Session',
  confidentiality: 'CONFIDENTIAL',
  city: 'Quetta, Balochistan',
  session: 'Fall 2026',
  contactPhone: '+92 81 9201948',
};

export const COLLEGE_DEPARTMENTS: SubjectType[] = [
  'Chemistry',
  'English',
  'Islamic Studies',
  'Sociology',
  'Zoology',
];

// Institutional stats cleared to nil for clean development. Data dynamically loaded from Teachers Date Sheet.
export const INSTITUTIONAL_BENCHMARKS = {
  totalPapers: 0,
  papersSubmitted: 0,
  resultsSubmitted: 0,
  overallCompletion: 0,
  overallCompletionRounded: 0,
  paperSubmissionRate: 0,
  resultSubmissionRate: 0,
  examTypeBreakdown: {
    final: 0,
    mid: 0,
    reappear: 0,
    total: 0,
  },
  operationalIndicators: {
    resultOverdue3d: 0,
    resultDelayed15d: 0,
    reappearPapers: 0,
    dutyRosterConfirmed: 0,
    dutyRosterTotal: 0,
  },
  departmentPerformance: [
    {
      department: 'CHEMISTRY',
      subject: 'Chemistry' as SubjectType,
      papersSubmitted: 0,
      totalPapers: 0,
      resultsSubmitted: 0,
      totalResults: 0,
      overallCompletion: 0.0,
      status: 'No Active Sessions',
      activeFaculty: 'Faculty Position Advertised',
    },
    {
      department: 'ENGLISH',
      subject: 'English' as SubjectType,
      papersSubmitted: 0,
      totalPapers: 0,
      resultsSubmitted: 0,
      totalResults: 0,
      overallCompletion: 0.0,
      status: 'Awaiting Date Sheet Scheduling',
      activeFaculty: 'Awaiting Date Sheet Allocation',
    },
    {
      department: 'ISLAMIC STUDIES',
      subject: 'Islamic Studies' as SubjectType,
      papersSubmitted: 0,
      totalPapers: 0,
      resultsSubmitted: 0,
      totalResults: 0,
      overallCompletion: 0.0,
      status: 'Awaiting Date Sheet Scheduling',
      activeFaculty: 'Awaiting Date Sheet Allocation',
    },
    {
      department: 'SOCIOLOGY',
      subject: 'Sociology' as SubjectType,
      papersSubmitted: 0,
      totalPapers: 0,
      resultsSubmitted: 0,
      totalResults: 0,
      overallCompletion: 0.0,
      status: 'Awaiting Date Sheet Scheduling',
      activeFaculty: 'Awaiting Date Sheet Allocation',
    },
    {
      department: 'ZOOLOGY',
      subject: 'Zoology' as SubjectType,
      papersSubmitted: 0,
      totalPapers: 0,
      resultsSubmitted: 0,
      totalResults: 0,
      overallCompletion: 0.0,
      status: 'Awaiting Date Sheet Scheduling',
      activeFaculty: 'Awaiting Date Sheet Allocation',
    },
  ],
};

// Course records cleared to nil - Data is dynamically populated from the Teachers Date Sheet
export const COLLEGE_64_COURSES: (Course & {
  examType: 'Final' | 'Mid' | 'Reappear';
  paperSubmitted: boolean;
  resultSubmitted: boolean;
  resultDelayedDays?: number;
  assignedTeacher: string;
})[] = [];

// Institutional Duty Roster: Cleared to nil - Populated from Teachers Date Sheet invigilation entries
export const COLLEGE_DUTY_ROSTER: DutyRosterItem[] = [];
