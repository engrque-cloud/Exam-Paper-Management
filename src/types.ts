export type UserRole = 'admin' | 'teacher' | 'qa' | 'principal';

export type AppScreen = 'home' | 'teacher' | 'qa' | 'principal' | 'admin';

export type IDApprovalStatus = 'approved' | 'pending' | 'rejected';

export type SubjectType = 'Chemistry' | 'English' | 'Islamic Studies' | 'Sociology' | 'Zoology' | string;

export type SemesterNumber = number;

export type PaperStatus = 'pending_qa' | 'qa_approved' | 'qa_rejected';

export type ExamType =
  | 'Final Term Examination'
  | 'Midterm Examination'
  | 'Supplementary Examination'
  | 'Mid Term & Final Examination'
  | 'Final'
  | 'Mid'
  | 'Reappear';

export interface Course {
  id: string;
  code: string;
  title: string;
  subject: SubjectType;
  semester: SemesterNumber;
  creditHours: number;
}

export interface PaperQuestionSection {
  title: string;
  marks: number;
  instructions?: string;
  questions: {
    qNum: string;
    text: string;
    marks: number;
  }[];
}

export interface PaperFile {
  name: string;
  type: 'pdf' | 'docx';
  sizeKb: number;
  uploadedAt: string;
  fileDataUrl?: string; // Optional simulated base64 or blob URL
}

export interface QAReviewDetails {
  reviewedBy: string;
  reviewedAt: string;
  verdict: 'approved' | 'rejected';
  rubricScores: {
    curriculumAlignment: boolean;
    marksTallyAccuracy: boolean;
    difficultyDistribution: boolean;
    formattingStandard: boolean;
    bloomsTaxonomy: boolean;
  };
  feedbackNotes: string;
  rejectionReasons?: string[];
}

export interface ExamPaper {
  id: string;
  courseCode: string;
  courseTitle: string;
  subject: SubjectType;
  semester: SemesterNumber;
  creditHours?: number; // Course Credit Hours
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  examType: ExamType;
  academicSession: string;
  totalMarks?: number;
  durationMinutes?: number;
  file: PaperFile;
  sections?: PaperQuestionSection[];
  status: PaperStatus;
  version: number;
  revisionHistory?: {
    version: number;
    uploadedAt: string;
    fileName: string;
    reason?: string;
  }[];
  qaReview?: QAReviewDetails;
  submissionTimingStatus?: 'on_time' | 'late';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  senderRole: UserRole;
  senderName: string;
  recipientRole: UserRole | 'all';
  recipientId?: string; // specific teacher id if applicable
  title: string;
  message: string;
  type: 'exam_call' | 'rejection_alert' | 'approval_notice' | 'reminder' | 'duty_order' | 'datesheet_alert';
  timestamp: string;
  isRead: boolean;
  relatedPaperId?: string;
  subject?: SubjectType;
  semester?: SemesterNumber;
  deadline?: string;
}

export interface ExamDateSheetRow {
  id: string;
  paperId: string;
  subject: SubjectType;
  semester: SemesterNumber;
  courseCode: string;
  courseTitle: string;
  examDate: string; // YYYY-MM-DD
  dayOfWeek: string; // Monday, Tuesday...
  startTime: string; // "09:00 AM"
  endTime: string; // "12:00 PM"
  shift: 'Morning Shift' | 'Evening Shift';
  hallLocation: string; // "Hall A - Academic Block"
  chiefInvigilator: string;
  chiefInvigilatorTeacherId?: string;
  chiefInvigilatorPhone?: string;
  assistantInvigilator?: string;
  assistantInvigilatorTeacherId?: string;
  assistantInvigilatorPhone?: string;
  paperSetterTeacherId?: string;
  paperSetterTeacherName?: string;
  paperSetterTeacherPhone?: string;
  uploadDaysBefore?: number; // Configurable days before exam date (default: 5)
  paperUploadDeadline?: string; // e.g. 5 days before examDate
  paperUploaded?: boolean;
  whatsappNoticeSent?: boolean;
  whatsappSentAt?: string;
  totalCandidates: number;
  status: 'Scheduled' | 'Verified' | 'Conducted';
  paperVersion: number;
  dutyConfirmed?: boolean;
}

export interface DutyRosterItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  subject: SubjectType;
  examType: 'Final' | 'Mid' | 'Reappear';
  examDate: string;
  timeSlot: string;
  shift: 'Morning Shift' | 'Evening Shift';
  hallLocation: string;
  chiefInvigilator: string;
  assistantInvigilator: string;
  totalCandidates: number;
  confirmed: boolean;
  confirmedAt?: string;
  contactNumber?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  department: SubjectType;
  assignedSemesters: SemesterNumber[];
  designation: string;
  avatarColor: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  whatsappNumber?: string;
  role: UserRole;
  approvalStatus?: IDApprovalStatus; // admin can approve IDs ('approved' | 'pending' | 'rejected')
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  department?: SubjectType;
  assignedSemesters?: SemesterNumber[];
  designation?: string;
  avatarColor?: string;
  createdAt: string;
  approvalEmailSent?: boolean;
  approvalEmailSentAt?: string;
  approvalWhatsAppSent?: boolean;
  approvalWhatsAppSentAt?: string;
}

export interface GlobalDeadlineConfig {
  deadlineDate: string; // YYYY-MM-DD e.g. "2026-10-15"
  deadlineTime: string; // HH:mm e.g. "23:59"
  timezone: string; // "Academic Standard Time (UTC+5)"
  allowLateSubmissions: boolean;
  gracePeriodDays: number; // e.g. 3
  announcementNotes: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export type ResultStatus =
  | 'draft'
  | 'submitted_by_faculty'
  | 'under_audit'
  | 'ratified_by_principal'
  | 'gazetted_published';

export interface StudentResultEntry {
  rollNumber: string;
  studentName: string;
  assignmentMarks: number; // e.g. /10
  midtermMarks: number; // e.g. /20
  finalMarks: number; // e.g. /50
  totalMarks: number; // calculated /80 or /100
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  gpa: number;
  status: 'Pass' | 'Fail' | 'Withheld';
  remarks?: string;
}

export interface ExamResult {
  id: string;
  courseCode: string;
  courseTitle: string;
  subject: SubjectType;
  semester: SemesterNumber;
  creditHours?: number;
  academicSession: string;
  examType: ExamType;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  status: ResultStatus;
  totalStudents: number;
  appeared: number;
  passed: number;
  failed: number;
  withheld: number;
  passPercentage: number;
  averageGpa: number;
  highestMarks: number;
  submittedAt: string;
  ratifiedAt?: string;
  ratifiedBy?: string;
  gazetteNumber?: string;
  gazettePublishedAt?: string;
  officialRemarks?: string;
  students: StudentResultEntry[];
}

export interface SessionExamRecord {
  id: string;
  sessionName: string; // e.g. 'Fall 2026', 'Spring 2026', 'Fall 2025'
  academicYear: string;
  courseCode: string;
  courseTitle: string;
  department: SubjectType;
  semester: SemesterNumber;
  creditHours: number;
  examType: 'Final' | 'Mid' | 'Reappear';
  assignedTeacher: string;
  totalStudents: number;

  // Key Lifecycle Milestones
  paperCallDate: string; // YYYY-MM-DD
  paperSubmittedDate: string; // YYYY-MM-DD
  qaApprovedDate: string; // YYYY-MM-DD
  dateSheetAnnouncedDate: string; // YYYY-MM-DD
  examConductedDate: string; // YYYY-MM-DD
  resultSubmittedDate: string; // YYYY-MM-DD
  gazettePublishedDate: string; // YYYY-MM-DD

  // Turnaround Durations (Days)
  daysPaperCallToSubmit: number; // Faculty Drafting (Call to Submit)
  daysSubmitToQaApproval: number; // QA Vetting & Moderation
  daysApprovalToDateSheet: number; // Date Sheet Scheduling
  daysPaperSubmitToExam: number; // PRIMARY METRIC: Paper Submission to Exam Conduction
  daysExamToResultPublish: number; // Exam Conduction to Published Result
  totalLifecycleDays: number; // Total Cycle (Call to Gazette)

  // Status & Performance
  paperStatus: 'Submitted' | 'Delayed' | 'Approved';
  examStatus: 'Conducted' | 'Scheduled';
  resultStatus: 'Gazetted' | 'Pending' | 'Ratified';
  turnaroundRating: 'Optimal' | 'Standard' | 'Delayed Bottleneck';
  passedCount: number;
  passPercentage: number;
  chiefInvigilator?: string;
  hallLocation?: string;
}

export interface SessionTurnaroundSummary {
  sessionName: string;
  academicYear: string;
  status: 'Active Current' | 'Completed & Archived';
  totalCourses: number;
  papersSubmitted: number;
  examsConducted: number;
  resultsGazetted: number;
  complianceRate: number; // %
  avgDaysPaperSubmitToExam: number; // Key metric requested by user
  minDaysPaperToExam: number;
  maxDaysPaperToExam: number;
  avgDaysExamToResult: number;
  avgTotalLifecycleDays: number;
  fastestDepartment: SubjectType;
  bottleneckDepartment: SubjectType;
  onTimeExamDeliveryRate: number; // %
}

