import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  AppScreen,
  IDApprovalStatus,
  SubjectType,
  SemesterNumber,
  ExamPaper,
  NotificationItem,
  ExamDateSheetRow,
  TeacherProfile,
  QAReviewDetails,
  PaperFile,
  PaperQuestionSection,
  UserAccount,
  GlobalDeadlineConfig,
  ExamResult,
  StudentResultEntry,
  Student,
  AttendanceRecord,
  CoursePipelineItem,
} from '../types';
import {
  TEACHER_PROFILES,
  INITIAL_EXAM_PAPERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DATE_SHEET_ROWS,
  COURSES_CATALOG,
  ALL_SUBJECTS,
  ALL_SEMESTERS,
} from '../data/courses';
import { INITIAL_USER_ACCOUNTS, INITIAL_GLOBAL_DEADLINE } from '../data/initialAuth';
import { INITIAL_EXAM_RESULTS, calculateGradeAndGpa } from '../data/initialResults';
import { INITIAL_STUDENTS } from '../data/initialStudents';
import { INITIAL_ATTENDANCE_RECORDS, calculateAttendanceEligibility } from '../data/initialAttendance';
import { Course } from '../types';
import {
  computePaperUploadDeadline,
  openWhatsApp,
  WhatsAppTemplates,
} from '../utils/whatsapp';

interface ExamContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  activeScreen: AppScreen;
  setActiveScreen: (screen: AppScreen) => void;
  currentTeacher: TeacherProfile;
  setTeacherId: (id: string) => void;
  teachers: TeacherProfile[];
  papers: ExamPaper[];
  notifications: NotificationItem[];
  dateSheetRows: ExamDateSheetRow[];
  paperUploadDaysBefore: number;
  setPaperUploadDaysBefore: (days: number) => void;
  applyUploadDaysToAllRows: (days: number) => void;
  collegeLogo: string | null;
  setCollegeLogo: (logo: string | null) => void;
  collegeLogoRight: string | null;
  setCollegeLogoRight: (logo: string | null) => void;
  collegeName: string;
  setCollegeName: (name: string) => void;
  unreadNotificationCount: number;
  previewPaper: ExamPaper | null;
  setPreviewPaper: (paper: ExamPaper | null) => void;

  // Curriculum & Academic Structure (Admin configurable)
  subjects: SubjectType[];
  semesters: SemesterNumber[];
  courses: Course[];
  addSubject: (name: string) => { success: boolean; error?: string };
  deleteSubject: (name: string) => { success: boolean; error?: string };
  addSemester: (semNumber: number) => { success: boolean; error?: string };
  addCourse: (course: {
    code: string;
    title: string;
    subject: SubjectType;
    semester: SemesterNumber;
    creditHours: number;
  }) => { success: boolean; error?: string };
  updateCourseCreditHours: (courseId: string, creditHours: number) => void;
  deleteCourse: (courseId: string) => void;

  // Auth state & actions
  currentUser: UserAccount | null;
  users: UserAccount[];
  userAccounts: UserAccount[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'signup' | 'forgot') => void;
  openAuthModal: (tab?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  signup: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    whatsappNumber?: string;
    role: UserRole;
    department?: SubjectType;
    assignedSemesters?: SemesterNumber[];
    designation?: string;
  }) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; resetToken?: string; error?: string };
  resetPassword: (email: string, resetCode: string, newPassword: string) => { success: boolean; error?: string };

  // ID Approval & Management by Admin
  approveUserId: (userId: string) => void;
  rejectUserId: (userId: string, reason?: string) => void;
  setUserIdPending: (userId: string) => void;
  markUserWhatsAppSent: (userId: string) => void;
  updateUserData: (userId: string, updates: Partial<UserAccount>) => { success: boolean; error?: string };
  deleteUserAccount: (userId: string) => { success: boolean; error?: string };
  pendingUsersCount: number;

  // Global submission deadline state & actions
  globalDeadline: GlobalDeadlineConfig;
  updateGlobalDeadline: (updates: Partial<GlobalDeadlineConfig>, broadcastNotice?: boolean) => void;
  deadlineStatus: {
    daysLeft: number;
    hoursLeft: number;
    minutesLeft: number;
    isPassed: boolean;
    isUrgent: boolean;
    formattedDate: string;
    fullDateTimeString: string;
  };
  isDeadlineModalOpen: boolean;
  setIsDeadlineModalOpen: (open: boolean) => void;

  // Actions
  adminSendCallNotification: (params: {
    title: string;
    message: string;
    subject?: SubjectType | 'All';
    semester?: SemesterNumber | 'All';
    targetTeacherId?: string;
    deadline: string;
  }) => void;
  submitNewPaper: (paper: {
    courseCode: string;
    courseTitle: string;
    subject: SubjectType;
    semester: SemesterNumber;
    examType: ExamPaper['examType'];
    creditHours?: number;
    academicSession?: string;
    totalMarks?: number;
    durationMinutes?: number;
    file: PaperFile;
    sections?: PaperQuestionSection[];
  }) => string;
  reuploadRevisedPaper: (
    paperId: string,
    file: PaperFile,
    sections?: PaperQuestionSection[],
    revisionNotes?: string
  ) => void;
  qaReviewPaper: (
    paperId: string,
    verdict: 'approved' | 'rejected',
    review: {
      reviewerName: string;
      rubricScores: QAReviewDetails['rubricScores'];
      feedbackNotes: string;
      rejectionReasons?: string[];
    }
  ) => void;
  createDateSheetRow: (params: {
    paperId?: string;
    subject: SubjectType;
    semester: SemesterNumber;
    courseCode: string;
    courseTitle: string;
    examDate: string; // YYYY-MM-DD
    startTime: string; // e.g. "09:00 AM"
    endTime: string; // e.g. "12:00 PM"
    shift: 'Morning Shift' | 'Evening Shift';
    hallLocation: string; // Exam Hall / Room
    chiefInvigilator: string;
    chiefInvigilatorTeacherId?: string;
    chiefInvigilatorPhone?: string;
    assistantInvigilator?: string;
    assistantInvigilatorTeacherId?: string;
    assistantInvigilatorPhone?: string;
    paperSetterTeacherId?: string;
    paperSetterTeacherName?: string;
    paperSetterTeacherPhone?: string;
    uploadDaysBefore?: number;
    totalCandidates?: number;
    sendWhatsAppImmediately?: boolean;
    targetWhatsAppTeacher?: 'paper_setter' | 'chief' | 'assistant' | 'both';
  }) => { success: boolean; rowId: string };
  updateDateSheetRow: (rowId: string, updates: Partial<ExamDateSheetRow>) => void;
  deleteDateSheetRow: (rowId: string) => void;
  autoScheduleAllCoursesDateSheet: (startDate?: string) => { scheduledCount: number };
  sendDateSheetWhatsApp: (params: {
    rowId: string;
    target: 'paper_setter' | 'chief_invigilator' | 'assistant_invigilator' | 'both';
  }) => void;
  // Date Sheet Confirmation & Paper Lifecycle Synchronization
  syncPaperLifecycleWithDateSheet: (options?: {
    onlyConfirmed?: boolean;
    autoUpdateDateSheetState?: boolean;
  }) => CoursePipelineItem[];
  getConfirmedDateSheetRows: () => ExamDateSheetRow[];
  confirmDateSheetRow: (rowId: string, confirmed?: boolean) => void;
  confirmAllDateSheetRows: () => void;
  addNotification: (params: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    senderRole?: UserRole;
    senderName?: string;
    recipientRole?: UserRole | 'all';
    recipientId?: string;
    relatedPaperId?: string;
    subject?: SubjectType;
    semester?: SemesterNumber;
    deadline?: string;
  }) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetAllData: () => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  clearToast: () => void;

  // Exam Results Management & Gazette
  results: ExamResult[];
  uploadOrUpdateResult: (data: Partial<ExamResult> & { courseCode: string; students: StudentResultEntry[] }) => void;
  ratifyAndPublishResult: (resultId: string, officialRemarks?: string) => void;
  updateResultStatus: (resultId: string, status: ExamResult['status'], remarks?: string) => void;
  sendExpediteNotice: (params: {
    targetRole: UserRole;
    recipientId?: string;
    courseCode: string;
    courseTitle: string;
    stage: string;
    customNote?: string;
  }) => void;

  // Session Conclusion & Archival
  isSessionConcluded: boolean;
  concludedSessionDetails: {
    sessionName: string;
    concludedAt: string;
    totalCourses: number;
    gazettedResults: number;
    concludedBy: string;
    officialRemarks: string;
  } | null;
  concludeAndArchiveSession: (sessionName?: string, remarks?: string) => void;
  reopenSession: (sessionName?: string) => void;

  // Student Records Management & Archival
  students: Student[];
  addStudent: (student: Omit<Student, 'status' | 'admissionDate'> & { admissionDate?: string }) => { success: boolean; error?: string };
  bulkAddStudents: (
    studentsList: (Omit<Student, 'status' | 'admissionDate'> & { admissionDate?: string })[]
  ) => {
    success: boolean;
    importedCount: number;
    skippedCount: number;
    errors?: string[];
  };
  updateStudent: (rollNumber: string, updates: Partial<Student>) => { success: boolean; error?: string };
  graduatePassoutStudent: (rollNumber: string, reason?: string) => { success: boolean; error?: string };
  restoreStudentFromArchive: (rollNumber: string) => { success: boolean; error?: string };
  deleteStudent: (rollNumber: string) => { success: boolean };

  // Attendance & Exam Eligibility Tracking
  attendanceRecords: AttendanceRecord[];
  attendanceThreshold: number;
  setAttendanceThreshold: (threshold: number) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'lastUpdated' | 'attendancePercentage' | 'isEligible'>) => { success: boolean; error?: string };
  bulkUploadAttendance: (
    records: Array<{
      rollNumber: string;
      studentName?: string;
      department?: SubjectType;
      semester?: SemesterNumber;
      courseCode?: string;
      courseTitle?: string;
      totalClasses: number;
      attendedClasses: number;
      isExempted?: boolean;
      exemptionReason?: string;
    }>
  ) => {
    success: boolean;
    importedCount: number;
    updatedCount: number;
    errors: string[];
  };
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => { success: boolean; error?: string };
  toggleAttendanceExemption: (id: string, reason?: string) => void;
  deleteAttendanceRecord: (id: string) => { success: boolean };
  clearAllAttendance: () => void;
}

const STORAGE_KEYS = {
  PAPERS: 'exam_app_papers_v1',
  NOTIFICATIONS: 'exam_app_notifications_v1',
  DATE_SHEET: 'exam_app_datesheet_v1',
  ROLE: 'exam_app_current_role_v1',
  SCREEN: 'exam_app_active_screen_v1',
  TEACHER_ID: 'exam_app_teacher_id_v1',
  USERS: 'exam_app_users_v1',
  CURRENT_USER: 'exam_app_current_user_v1',
  GLOBAL_DEADLINE: 'exam_app_global_deadline_v1',
  TEACHERS: 'exam_app_teachers_v1',
  SUBJECTS: 'exam_app_subjects_v1',
  SEMESTERS: 'exam_app_semesters_v1',
  COURSES: 'exam_app_courses_v1',
  EXAM_RESULTS: 'exam_app_results_v1',
  STUDENTS: 'exam_app_students_v1',
  SESSION_CONCLUDED: 'exam_app_session_concluded_v2',
  SESSION_DETAILS: 'exam_app_session_details_v2',
  UPLOAD_DAYS_BEFORE: 'exam_app_upload_days_before_v1',
  COLLEGE_LOGO: 'exam_app_college_logo_v1',
  COLLEGE_LOGO_RIGHT: 'exam_app_college_logo_right_v1',
  COLLEGE_NAME: 'exam_app_college_name_v1',
  ATTENDANCE: 'exam_app_attendance_v1',
  ATTENDANCE_THRESHOLD: 'exam_app_attendance_threshold_v1',
};

const SCHEMA_VERSION_KEY = 'exam_app_version_v7_audit_ledger_nil';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(SCHEMA_VERSION_KEY) !== 'ready') {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(SCHEMA_VERSION_KEY, 'ready');
    }
  } catch (e) {
    console.error(e);
  }
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreenState] = useState<AppScreen>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCREEN);
    return (saved as AppScreen) || 'home'; // First page should be dashboard of paper submitted and data sheet with last date of submission!
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'admin';
  });

  const [currentTeacherId, setCurrentTeacherIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHER_ID);
    return saved || 'tch-unassigned';
  });

  // Dynamic registered users
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        const hasAdmin = parsed.some(u => u.email.toLowerCase() === 'hr.bppra@gmail.com');
        const updated = parsed.map(u => {
          if (u.role === 'admin') {
            return {
              ...u,
              name: 'Administrator',
              email: 'hr.bppra@gmail.com',
              password: 'admin',
            };
          }
          return u;
        });
        if (!hasAdmin) {
          const defaultAdmin = INITIAL_USER_ACCOUNTS.find(u => u.email === 'hr.bppra@gmail.com');
          if (defaultAdmin) updated.unshift(defaultAdmin);
        }
        return updated;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USER_ACCOUNTS;
  });

  // Currently logged in user profile (defaults to null so first page is the Login Screen)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const parsed: UserAccount = JSON.parse(saved);
        if (parsed.role === 'admin') {
          return {
            ...parsed,
            name: 'Administrator',
            email: 'hr.bppra@gmail.com',
            password: 'admin',
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Default to null so the first page is always the login screen
    return null;
  });

  // Dynamic teachers list
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return TEACHER_PROFILES;
  });

  // Global submission deadline configuration
  const [globalDeadline, setGlobalDeadline] = useState<GlobalDeadlineConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GLOBAL_DEADLINE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_GLOBAL_DEADLINE;
  });

  // Modal dialog states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  // Session Conclusion & Archival State
  const [isSessionConcluded, setIsSessionConcluded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION_CONCLUDED) === 'true';
    } catch {
      return false;
    }
  });

  const [concludedSessionDetails, setConcludedSessionDetails] = useState<{
    sessionName: string;
    concludedAt: string;
    totalCourses: number;
    gazettedResults: number;
    concludedBy: string;
    officialRemarks: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION_DETAILS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const openAuthModal = (tab: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const [papers, setPapers] = useState<ExamPaper[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAPERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXAM_PAPERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [dateSheetRows, setDateSheetRows] = useState<ExamDateSheetRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DATE_SHEET);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DATE_SHEET_ROWS;
  });

  // Configurable Cutoff Days before Date Sheet Exam Date (Defaults to 5 days)
  const [paperUploadDaysBefore, setPaperUploadDaysBeforeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UPLOAD_DAYS_BEFORE);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (e) {
      console.error(e);
    }
    return 5;
  });

  const setPaperUploadDaysBefore = (days: number) => {
    const valid = Math.max(1, Math.min(30, days || 5));
    setPaperUploadDaysBeforeState(valid);
    try {
      localStorage.setItem(STORAGE_KEYS.UPLOAD_DAYS_BEFORE, String(valid));
    } catch (e) {
      console.error(e);
    }
  };

  const applyUploadDaysToAllRows = (days: number) => {
    const valid = Math.max(1, Math.min(30, days || 5));
    setPaperUploadDaysBefore(valid);
    setDateSheetRows(prev =>
      prev.map(row => {
        const newDeadline = computePaperUploadDeadline(row.examDate, valid);
        return {
          ...row,
          uploadDaysBefore: valid,
          paperUploadDeadline: newDeadline,
        };
      })
    );
    showToast(`Paper upload cutoff policy updated to ${valid} days before exam across all date sheet entries!`, 'success');
  };

  const [previewPaper, setPreviewPaper] = useState<ExamPaper | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // College Logo & Name State (Persisted in localStorage)
  const [collegeLogo, setCollegeLogoState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.COLLEGE_LOGO) || null;
    } catch {
      return null;
    }
  });

  const setCollegeLogo = (logo: string | null) => {
    setCollegeLogoState(logo);
    try {
      if (logo) {
        localStorage.setItem(STORAGE_KEYS.COLLEGE_LOGO, logo);
      } else {
        localStorage.removeItem(STORAGE_KEYS.COLLEGE_LOGO);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [collegeLogoRight, setCollegeLogoRightState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.COLLEGE_LOGO_RIGHT) || null;
    } catch {
      return null;
    }
  });

  const setCollegeLogoRight = (logo: string | null) => {
    setCollegeLogoRightState(logo);
    try {
      if (logo) {
        localStorage.setItem(STORAGE_KEYS.COLLEGE_LOGO_RIGHT, logo);
      } else {
        localStorage.removeItem(STORAGE_KEYS.COLLEGE_LOGO_RIGHT);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [collegeName, setCollegeNameState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.COLLEGE_NAME) || 'Govt. Girls Model Degree College';
    } catch {
      return 'Govt. Girls Model Degree College';
    }
  });

  const setCollegeName = (name: string) => {
    const trimmed = name.trim() || 'Govt. Girls Model Degree College';
    setCollegeNameState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEYS.COLLEGE_NAME, trimmed);
    } catch (e) {
      console.error(e);
    }
  };

  // Student Records State (Roll Number acts as Primary Key)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  // Academic Curriculum Structure State (Subjects, Semesters, Courses & Credit Hours)
  const [subjects, setSubjects] = useState<SubjectType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ALL_SUBJECTS;
  });

  const [semesters, setSemesters] = useState<SemesterNumber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ALL_SEMESTERS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return COURSES_CATALOG;
  });

  const [results, setResults] = useState<ExamResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EXAM_RESULTS;
  });

  // Attendance & Exam Eligibility Tracking State
  const [attendanceThreshold, setAttendanceThresholdState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE_THRESHOLD);
      if (saved) return Number(saved) || 75;
    } catch (e) {
      console.error(e);
    }
    return 75;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ATTENDANCE_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {
      console.error(e);
    }
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_THRESHOLD, String(attendanceThreshold));
    } catch (e) {
      console.error(e);
    }
  }, [attendanceThreshold]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const clearToast = () => setToastMessage(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
  }, [papers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DATE_SHEET, JSON.stringify(dateSheetRows));
  }, [dateSheetRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_ID, currentTeacherId);
  }, [currentTeacherId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GLOBAL_DEADLINE, JSON.stringify(globalDeadline));
  }, [globalDeadline]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(results));
  }, [results]);

  // Synchronize exam results with students registered by Admin (enforces rollNumber PK and registered cohort)
  useEffect(() => {
    setResults(prevResults => {
      let hasChanges = false;
      const registeredRollMap = new Map<string, Student>(students.map(s => [s.rollNumber.toUpperCase(), s]));

      const updated = prevResults.map(res => {
        let resChanged = false;
        // Filter out any student entry not registered by Admin in students roster
        const validStudents = res.students
          .filter(st => registeredRollMap.has(st.rollNumber.toUpperCase()))
          .map(st => {
            const reg = registeredRollMap.get(st.rollNumber.toUpperCase())!;
            if (st.studentName !== reg.name) {
              resChanged = true;
              return { ...st, studentName: reg.name };
            }
            return st;
          });

        if (validStudents.length !== res.students.length) {
          resChanged = true;
        }

        // Enrolled students for this course:
        // 1. Any student whose enrolledCourseCodes includes res.courseCode (multi-paper enrollment across departments)
        // 2. Or registered cohort matching department and semester
        const enrolledStudents = students.filter(s => {
          if (s.status !== 'active' && s.status) return false;
          if (s.enrolledCourseCodes && s.enrolledCourseCodes.includes(res.courseCode)) {
            return true;
          }
          if (!s.enrolledCourseCodes || s.enrolledCourseCodes.length === 0) {
            return s.department === res.subject && Number(s.currentSemester) === Number(res.semester);
          }
          return false;
        });

        enrolledStudents.forEach((st, idx) => {
          if (!validStudents.some(s => s.rollNumber.toUpperCase() === st.rollNumber.toUpperCase())) {
            resChanged = true;
            const targetCgpa = st.overallCgpa || 3.5;
            const seed = (st.rollNumber.charCodeAt(st.rollNumber.length - 1) || 5) + idx;
            const assign = 8 + (seed % 3);
            const mid = 15 + (seed % 5);
            const baseFinal = Math.min(70, Math.max(38, Math.round((targetCgpa / 4.0) * 65) + ((seed % 7) - 3)));
            const total = assign + mid + baseFinal;
            const { grade, gpa, status } = calculateGradeAndGpa(total, 100);
            validStudents.push({
              rollNumber: st.rollNumber,
              studentName: st.name,
              assignmentMarks: assign,
              midtermMarks: mid,
              finalMarks: baseFinal,
              totalMarks: total,
              percentage: total,
              grade,
              gpa,
              status,
              remarks: status === 'Pass' ? (gpa >= 3.7 ? 'Distinction' : 'Cleared') : 'Failed in Theory Component',
            });
          }
        });

        if (resChanged) {
          hasChanges = true;
          const appeared = validStudents.length;
          const passed = validStudents.filter(s => s.status === 'Pass').length;
          const failed = validStudents.filter(s => s.status === 'Fail').length;
          const passPercentage = appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0;
          const averageGpa = appeared > 0 ? Number((validStudents.reduce((acc, s) => acc + s.gpa, 0) / appeared).toFixed(2)) : 0;
          const highestMarks = appeared > 0 ? Math.max(...validStudents.map(s => s.totalMarks), 0) : 0;

          return {
            ...res,
            totalStudents: appeared,
            appeared,
            passed,
            failed,
            passPercentage,
            averageGpa,
            highestMarks,
            students: validStudents,
          };
        }
        return res;
      });

      return hasChanges ? updated : prevResults;
    });
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCREEN, activeScreen);
  }, [activeScreen]);

  const setActiveScreen = (screen: AppScreen) => {
    setActiveScreenState(screen);
    if (screen !== 'home') {
      setCurrentRoleState(screen as UserRole);
    }
  };

  const setRole = (role: UserRole) => {
    setCurrentRoleState(role);
    setActiveScreenState(role as AppScreen);

    // Synchronize currentUser with an active approved account of that role
    if (!currentUser || currentUser.role !== role) {
      const match = users.find(u => u.role === role && u.approvalStatus === 'approved') || users.find(u => u.role === role);
      if (match) {
        setCurrentUser(match);
        if (role === 'teacher') {
          const matchTeacher = teachers.find(t => t.email.toLowerCase() === match.email.toLowerCase()) || teachers[0];
          if (matchTeacher) {
            setCurrentTeacherIdState(matchTeacher.id);
          }
        }
      }
    }
  };

  const setTeacherId = (id: string) => {
    setCurrentTeacherIdState(id);
  };

  const fallbackTeacher: TeacherProfile = {
    id: 'tch-unassigned',
    name: 'Unassigned Faculty Member',
    email: 'faculty@ggmdc.edu.pk',
    department: 'English',
    assignedSemesters: [1],
    designation: 'Instructor',
    avatarColor: 'bg-emerald-600',
  };

  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0] || fallbackTeacher;

  // Global Deadline live countdown & status
  const deadlineStatus = React.useMemo(() => {
    const [year, month, day] = globalDeadline.deadlineDate.split('-').map(Number);
    const [hours, minutes] = (globalDeadline.deadlineTime || '23:59').split(':').map(Number);
    const target = new Date(year, (month || 1) - 1, day || 1, hours || 23, minutes || 59, 59);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    const isPassed = diff <= 0;

    const totalSecs = Math.max(0, Math.floor(Math.abs(diff) / 1000));
    const daysLeft = Math.floor(totalSecs / 86400);
    const hoursLeft = Math.floor((totalSecs % 86400) / 3600);
    const minutesLeft = Math.floor((totalSecs % 3600) / 60);

    // Urgent if within 3 days and not already passed
    const isUrgent = !isPassed && diff <= 3 * 24 * 60 * 60 * 1000;

    const formattedDate = target.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      daysLeft,
      hoursLeft,
      minutesLeft,
      isPassed,
      isUrgent,
      formattedDate,
      fullDateTimeString: `${formattedDate} at ${globalDeadline.deadlineTime} (${globalDeadline.timezone})`,
    };
  }, [globalDeadline]);

  // Update Global Deadline
  const updateGlobalDeadline = (updates: Partial<GlobalDeadlineConfig>, broadcastNotice = true) => {
    const updated: GlobalDeadlineConfig = {
      ...globalDeadline,
      ...updates,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedBy: currentUser
        ? `${currentUser.name} (${currentUser.role.toUpperCase()})`
        : 'Controller of Examinations',
    };
    setGlobalDeadline(updated);

    if (broadcastNotice) {
      const notif: NotificationItem = {
        id: `notif-deadline-${Date.now()}`,
        senderRole: 'admin',
        senderName: 'Controller of Examinations (Admin Regulatory Notice)',
        recipientRole: 'all',
        title: `Official Global Paper Submission Cutoff: ${updated.deadlineDate}`,
        message: `Attention all Faculty & Academic Departments (English, Islamic Studies, Sociology, Zoology): The official institutional last date for question paper submission is calibrated to ${updated.deadlineDate} at ${updated.deadlineTime} (${updated.timezone}). Policy: ${updated.allowLateSubmissions ? `Late submissions accepted within ${updated.gracePeriodDays} days grace period` : 'Strict Cutoff - Late submissions prohibited'}. Remarks: "${updated.announcementNotes}"`,
        type: 'exam_call',
        timestamp: new Date().toISOString(),
        isRead: false,
        deadline: updated.deadlineDate,
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast('Global paper submission deadline updated and broadcasted!', 'success');
  };

  // Auth: Signup
  const signup = (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    whatsappNumber?: string;
    role: UserRole;
    department?: SubjectType;
    assignedSemesters?: SemesterNumber[];
    designation?: string;
  }) => {
    const emailTrimmed = data.email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === emailTrimmed)) {
      return { success: false, error: 'An account with this email address already exists. Please log in.' };
    }

    const colors = [
      'bg-indigo-600',
      'bg-blue-600',
      'bg-emerald-600',
      'bg-teal-600',
      'bg-amber-600',
      'bg-rose-600',
      'bg-purple-600',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const cleanPhone = data.phone?.trim() || '';
    const cleanWhatsApp = data.whatsappNumber?.trim() || cleanPhone;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: emailTrimmed,
      password: data.password,
      phone: cleanPhone || undefined,
      whatsappNumber: cleanWhatsApp || undefined,
      role: data.role,
      approvalStatus: data.role === 'admin' ? 'approved' : 'pending',
      department: data.department,
      assignedSemesters: data.assignedSemesters || [1, 2],
      designation:
        data.designation ||
        (data.role === 'teacher'
          ? 'Course Faculty Instructor'
          : data.role === 'qa'
          ? 'QA Paper Examiner'
          : data.role === 'principal'
          ? 'Academic Principal'
          : 'Controller of Examinations'),
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);

    // If role is teacher, automatically create teacher profile & activate
    if (data.role === 'teacher') {
      const newTeacherProfile: TeacherProfile = {
        id: `tch-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        phone: cleanPhone || '+92 300 8371920',
        whatsappNumber: cleanWhatsApp || '+923008371920',
        department: newUser.department || 'English',
        assignedSemesters: newUser.assignedSemesters || [1, 2],
        designation: newUser.designation || 'Lecturer / Instructor',
        avatarColor: newUser.avatarColor || 'bg-indigo-600',
      };
      setTeachers(prev => [newTeacherProfile, ...prev]);
      setCurrentTeacherIdState(newTeacherProfile.id);
    }

    // Broadcast ID approval notice to Admin
    if (data.role !== 'admin') {
      const adminIdNotice: NotificationItem = {
        id: `notif-id-${Date.now()}`,
        senderRole: data.role,
        senderName: newUser.name,
        recipientRole: 'admin',
        title: `Faculty ID Approval Requested: ${newUser.name} (${newUser.role.toUpperCase()})`,
        message: `${newUser.name} registered as ${newUser.role.toUpperCase()} in ${newUser.department || 'General'}. Please review and verify their institutional ID.`,
        type: 'reminder',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications(prev => [adminIdNotice, ...prev]);
    }

    setCurrentUser(newUser);
    setCurrentRoleState(newUser.role);
    setActiveScreenState(newUser.role as AppScreen);
    setIsAuthModalOpen(false);
    showToast(
      data.role === 'admin'
        ? `Administrator account registered. Welcome, ${newUser.name}!`
        : `Account created! Institutional ID submitted for Admin verification. Welcome, ${newUser.name}!`,
      'success'
    );
    return { success: true };
  };

  // Auth: Login
  const login = (email: string, password: string) => {
    const emailTrimmed = email.toLowerCase().trim();

    // Explicit administrator credentials check
    if (emailTrimmed === 'hr.bppra@gmail.com') {
      if (password !== 'admin') {
        return { success: false, error: 'Incorrect administrator password. Please enter "admin".' };
      }
      let adminUser = users.find(u => u.email.toLowerCase() === 'hr.bppra@gmail.com');
      if (!adminUser) {
        adminUser = INITIAL_USER_ACCOUNTS.find(u => u.email === 'hr.bppra@gmail.com') || {
          id: 'user-admin-1',
          name: 'Administrator',
          email: 'hr.bppra@gmail.com',
          password: 'admin',
          phone: '+92 300 8371920',
          whatsappNumber: '+923008371920',
          role: 'admin',
          approvalStatus: 'approved',
          approvedBy: 'Board of Governors',
          approvedAt: '2026-08-01T08:00:00.000Z',
          designation: 'Controller of Examinations',
          avatarColor: 'bg-emerald-600',
          createdAt: '2026-08-01T08:00:00.000Z',
          approvalEmailSent: true,
        };
        setUsers(prev => [adminUser!, ...prev.filter(u => u.role !== 'admin')]);
      } else if (adminUser.password !== 'admin') {
        adminUser = { ...adminUser, password: 'admin' };
        setUsers(prev => prev.map(u => (u.id === adminUser!.id ? adminUser! : u)));
      }

      setCurrentUser(adminUser);
      setCurrentRoleState('admin');
      setActiveScreenState('admin');
      setIsAuthModalOpen(false);
      showToast(`Welcome Administrator! Signed in with hr.bppra@gmail.com.`, 'success');
      return { success: true };
    }

    const found = users.find(u => u.email.toLowerCase() === emailTrimmed);
    if (!found) {
      return { success: false, error: 'No registered user found with this email. Please check spelling or Sign Up.' };
    }
    const isAdminDefaultMatch = found.role === 'admin' && password === 'admin';
    if (found.password && found.password !== password && !isAdminDefaultMatch) {
      return { success: false, error: 'Incorrect password. Try again or use "Forgot Password".' };
    }

    const updatedUser = isAdminDefaultMatch ? { ...found, password: 'admin' } : found;
    if (isAdminDefaultMatch && found.password !== 'admin') {
      setUsers(prev => prev.map(u => (u.id === found.id ? { ...u, password: 'admin' } : u)));
    }

    setCurrentUser(updatedUser);
    setCurrentRoleState(updatedUser.role);
    if (updatedUser.role === 'teacher') {
      const matchTeacher = teachers.find(t => t.email.toLowerCase() === emailTrimmed);
      if (matchTeacher) {
        setCurrentTeacherIdState(matchTeacher.id);
      }
    }
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${updatedUser.name}! Switched to ${updatedUser.role.toUpperCase()} workspace.`, 'success');
    return { success: true };
  };

  // Auth: Logout
  const logout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error(e);
    }
    showToast('You have signed out from your account.', 'info');
  };

  // Auth: Request Password Reset
  const requestPasswordReset = (email: string) => {
    const emailTrimmed = email.toLowerCase().trim();
    const found = users.find(u => u.email.toLowerCase() === emailTrimmed);
    if (!found) {
      return { success: false, error: 'No registered user found with that email address.' };
    }
    // Generate a 6-digit institutional recovery code
    const resetToken = String(Math.floor(100000 + Math.random() * 900000));
    showToast(`Recovery verification code generated for ${found.email}`, 'info');
    return { success: true, resetToken };
  };

  // Auth: Reset Password
  const resetPassword = (email: string, resetCode: string, newPassword: string) => {
    const emailTrimmed = email.toLowerCase().trim();
    const found = users.find(u => u.email.toLowerCase() === emailTrimmed);
    if (!found) {
      return { success: false, error: 'Account not found.' };
    }
    if (!resetCode || resetCode.trim().length < 4) {
      return { success: false, error: 'Please enter a valid recovery verification code.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    setUsers(prev =>
      prev.map(u => (u.email.toLowerCase() === emailTrimmed ? { ...u, password: newPassword } : u))
    );

    if (currentUser?.email.toLowerCase() === emailTrimmed) {
      setCurrentUser(prev => (prev ? { ...prev, password: newPassword } : null));
    }

    showToast('Password reset successfully! You can now log in with your new password.', 'success');
    return { success: true };
  };

  // Admin ID Approval methods
  const approveUserId = (userId: string) => {
    const approverName = currentUser?.name || 'Dr. Richard Hawthorne (Admin)';
    const targetUser = users.find(u => u.id === userId);

    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            approvalStatus: 'approved',
            approvedBy: approverName,
            approvedAt: new Date().toISOString(),
            approvalEmailSent: true,
            approvalEmailSentAt: new Date().toISOString(),
            rejectionReason: undefined,
          };
        }
        return u;
      })
    );

    // If teacher, ensure they exist in teachers list with phone and whatsappNumber
    if (targetUser && targetUser.role === 'teacher') {
      setTeachers(prev => {
        const exists = prev.find(t => t.email.toLowerCase() === targetUser.email.toLowerCase());
        if (exists) {
          return prev.map(t =>
            t.email.toLowerCase() === targetUser.email.toLowerCase()
              ? {
                  ...t,
                  phone: targetUser.phone || t.phone,
                  whatsappNumber: targetUser.whatsappNumber || targetUser.phone || t.whatsappNumber,
                }
              : t
          );
        } else {
          const newTeacher: TeacherProfile = {
            id: `tch-${Date.now()}`,
            name: targetUser.name,
            email: targetUser.email,
            phone: targetUser.phone || '+92 300 8371920',
            whatsappNumber: targetUser.whatsappNumber || targetUser.phone || '+923008371920',
            department: targetUser.department || 'English',
            assignedSemesters: targetUser.assignedSemesters || [1, 2],
            designation: targetUser.designation || 'Course Faculty Instructor',
            avatarColor: targetUser.avatarColor || 'bg-indigo-600',
          };
          return [newTeacher, ...prev];
        }
      });
    }

    // Send official institutional notification for credentials email dispatch
    if (targetUser) {
      const emailNotice: NotificationItem = {
        id: `notif-email-${Date.now()}`,
        senderRole: 'admin',
        senderName: approverName,
        recipientRole: targetUser.role,
        recipientId: targetUser.id,
        title: `📧 Official Credentials Emailed to ${targetUser.name}`,
        message: `Official approval email dispatched to ${targetUser.email} containing Portal URL (${window.location.origin}), Username (${targetUser.email}), and password (${targetUser.password || 'Teacher@123'}).`,
        type: 'approval_notice',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications(prev => [emailNotice, ...prev]);
    }

    showToast(
      targetUser
        ? `Faculty ID Approved! Official email with Username (${targetUser.email}) and Password sent.`
        : 'Faculty ID Approved! Credentials email dispatched.',
      'success'
    );
  };

  const markUserWhatsAppSent = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            approvalWhatsAppSent: true,
            approvalWhatsAppSentAt: new Date().toISOString(),
          };
        }
        return u;
      })
    );
    showToast('Login credentials dispatched to faculty WhatsApp!', 'success');
  };

  const rejectUserId = (userId: string, reason?: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            approvalStatus: 'rejected',
            rejectionReason: reason || 'Credentials not verified with university faculty registry.',
          };
        }
        return u;
      })
    );
    showToast('User ID rejected.', 'error');
  };

  const setUserIdPending = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            approvalStatus: 'pending',
            approvedBy: undefined,
            approvedAt: undefined,
            rejectionReason: undefined,
          };
        }
        return u;
      })
    );
    showToast('User ID status returned to Pending.', 'info');
  };

  // Admin edits user account data (Name, Email/Login ID, Password, Role, Department, Semesters, Designation, Phone, WhatsApp, Approval Status)
  const updateUserData = (userId: string, updates: Partial<UserAccount>) => {
    const existing = users.find(u => u.id === userId);
    if (!existing) {
      return { success: false, error: 'User account not found.' };
    }

    // If changing email, ensure email is not already taken by another user
    if (updates.email && updates.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailClash = users.some(
        u => u.id !== userId && u.email.trim().toLowerCase() === updates.email!.trim().toLowerCase()
      );
      if (emailClash) {
        return { success: false, error: `Email/Login ID "${updates.email}" is already used by another user.` };
      }
    }

    const updatedUser: UserAccount = {
      ...existing,
      ...updates,
      email: updates.email ? updates.email.trim() : existing.email,
      name: updates.name ? updates.name.trim() : existing.name,
      phone: updates.phone !== undefined ? updates.phone.trim() : existing.phone,
      whatsappNumber: updates.whatsappNumber !== undefined ? updates.whatsappNumber.trim() : existing.whatsappNumber,
      designation: updates.designation !== undefined ? updates.designation.trim() : existing.designation,
      password: updates.password !== undefined && updates.password.trim() ? updates.password.trim() : existing.password,
    };

    setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));

    // If updating currently logged in user, keep session in sync
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
      if (updates.role && updates.role !== currentRole) {
        setCurrentRoleState(updates.role);
      }
    }

    // If user is a teacher, keep teacher profile synced
    if (existing.role === 'teacher' || updatedUser.role === 'teacher') {
      setTeachers(prev => {
        const found = prev.find(
          t => t.email.toLowerCase() === existing.email.toLowerCase() || t.id === existing.id
        );
        if (found) {
          return prev.map(t =>
            t.id === found.id
              ? {
                  ...t,
                  name: updatedUser.name,
                  email: updatedUser.email,
                  phone: updatedUser.phone || t.phone,
                  whatsappNumber: updatedUser.whatsappNumber || updatedUser.phone || t.whatsappNumber,
                  department: updatedUser.department || t.department,
                  assignedSemesters: updatedUser.assignedSemesters || t.assignedSemesters,
                  designation: updatedUser.designation || t.designation,
                }
              : t
          );
        } else if (updatedUser.role === 'teacher') {
          const newT: TeacherProfile = {
            id: `tch-${Date.now()}`,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || '+92 300 8371920',
            whatsappNumber: updatedUser.whatsappNumber || updatedUser.phone || '+923008371920',
            department: updatedUser.department || 'English',
            assignedSemesters: updatedUser.assignedSemesters || [1, 2],
            designation: updatedUser.designation || 'Course Faculty Instructor',
            avatarColor: updatedUser.avatarColor || 'bg-indigo-600',
          };
          return [newT, ...prev];
        }
        return prev;
      });
    }

    showToast(`User ID "${updatedUser.name}" (${updatedUser.email}) updated successfully!`, 'success');
    return { success: true };
  };

  // Admin deletes user account
  const deleteUserAccount = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, error: 'User not found.' };
    }
    // Prevent accidental deletion of primary admin
    if (target.email.toLowerCase() === 'hr.bppra@gmail.com') {
      return { success: false, error: 'The primary institutional administrator account cannot be deleted.' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast(`User account "${target.name}" (${target.email}) deleted.`, 'info');
    return { success: true };
  };

  const pendingUsersCount = users.filter(u => u.approvalStatus === 'pending').length;

  // Unread notifications for current role/teacher
  const unreadNotificationCount = notifications.filter(n => {
    if (n.isRead) return false;
    if (currentRole === 'admin') return n.recipientRole === 'admin';
    if (currentRole === 'qa') return n.recipientRole === 'qa';
    if (currentRole === 'principal') return n.recipientRole === 'principal';
    if (currentRole === 'teacher') {
      if (n.recipientRole !== 'teacher') return false;
      if (n.recipientId && n.recipientId !== currentTeacherId) return false;
      return true;
    }
    return false;
  }).length;

  // 1. Admin sends exam paper call notification to teachers
  const adminSendCallNotification = (params: {
    title: string;
    message: string;
    subject?: SubjectType | 'All';
    semester?: SemesterNumber | 'All';
    targetTeacherId?: string;
    deadline: string;
  }) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      senderRole: 'admin',
      senderName: 'Controller of Examinations (Admin)',
      recipientRole: 'teacher',
      recipientId: params.targetTeacherId && params.targetTeacherId !== 'all' ? params.targetTeacherId : undefined,
      title: params.title,
      message: params.message,
      type: 'exam_call',
      timestamp: new Date().toISOString(),
      isRead: false,
      subject: params.subject && params.subject !== 'All' ? params.subject : undefined,
      semester: params.semester && params.semester !== 'All' ? params.semester : undefined,
      deadline: params.deadline,
    };

    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Exam Call Order broadcasted to Teachers successfully!`, 'success');
  };

  // 2. Teacher uploads new exam paper
  const submitNewPaper = (paperData: {
    courseCode: string;
    courseTitle: string;
    subject: SubjectType;
    semester: SemesterNumber;
    examType: ExamPaper['examType'];
    creditHours?: number;
    academicSession?: string;
    totalMarks?: number;
    durationMinutes?: number;
    file: PaperFile;
    sections?: PaperQuestionSection[];
  }): string => {
    const paperId = `paper-${Date.now()}`;
    const timingStatus: 'on_time' | 'late' = deadlineStatus.isPassed ? 'late' : 'on_time';

    const newPaper: ExamPaper = {
      id: paperId,
      courseCode: paperData.courseCode,
      courseTitle: paperData.courseTitle,
      subject: paperData.subject,
      semester: paperData.semester,
      creditHours: paperData.creditHours || 3,
      examType: paperData.examType,
      academicSession: paperData.academicSession || 'Fall 2026',
      totalMarks: paperData.totalMarks || 50,
      durationMinutes: paperData.durationMinutes || 120,
      file: paperData.file,
      sections: paperData.sections || [],
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      teacherEmail: currentTeacher.email,
      status: 'pending_qa',
      version: 1,
      submissionTimingStatus: timingStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPapers(prev => [newPaper, ...prev]);

    // Send notification to QA
    const qaNotification: NotificationItem = {
      id: `notif-qa-${Date.now()}`,
      senderRole: 'teacher',
      senderName: `${currentTeacher.name} (${paperData.subject})`,
      recipientRole: 'qa',
      title: `New Exam Paper Submitted for QA: ${paperData.courseCode} (${timingStatus === 'late' ? 'LATE SUBMISSION' : 'ON TIME'})`,
      message: `${currentTeacher.name} uploaded ${paperData.courseCode} (${paperData.courseTitle}, Sem ${paperData.semester}) in ${paperData.file.type.toUpperCase()} format. Status: ${timingStatus === 'late' ? 'Submitted past deadline' : 'Submitted on time'}. Awaiting QA review.`,
      type: 'exam_call',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedPaperId: paperId,
      subject: paperData.subject,
      semester: paperData.semester,
    };

    setNotifications(prev => [qaNotification, ...prev]);
    showToast(
      `Paper ${paperData.courseCode} submitted to QA Review Board (${timingStatus === 'late' ? 'Recorded as Late' : 'On-Time'})!`,
      timingStatus === 'late' ? 'info' : 'success'
    );
    return paperId;
  };

  // 3. Teacher re-uploads revised paper following QA rejection
  const reuploadRevisedPaper = (
    paperId: string,
    file: PaperFile,
    sections: PaperQuestionSection[] = [],
    revisionNotes?: string
  ) => {
    const targetPaper = papers.find(p => p.id === paperId);
    if (!targetPaper) return;

    const newVersion = targetPaper.version + 1;
    const historyEntry = {
      version: targetPaper.version,
      uploadedAt: targetPaper.updatedAt,
      fileName: targetPaper.file.name,
      reason: targetPaper.qaReview?.feedbackNotes || 'Revised by instructor',
    };

    const updatedPaper: ExamPaper = {
      ...targetPaper,
      file,
      sections,
      status: 'pending_qa',
      version: newVersion,
      revisionHistory: [...(targetPaper.revisionHistory || []), historyEntry],
      updatedAt: new Date().toISOString(),
      // Keep previous QA review reference for comparison or reset verdict
      qaReview: undefined,
    };

    setPapers(prev => prev.map(p => (p.id === paperId ? updatedPaper : p)));

    // Send notification to QA checker
    const reuploadNotif: NotificationItem = {
      id: `notif-reupload-${Date.now()}`,
      senderRole: 'teacher',
      senderName: targetPaper.teacherName,
      recipientRole: 'qa',
      title: `Revised Paper Re-uploaded: ${targetPaper.courseCode} (v${newVersion})`,
      message: `Teacher ${targetPaper.teacherName} resolved QA remarks and uploaded revision v${newVersion} for ${targetPaper.courseCode}. Notes: "${revisionNotes || 'Fixed all requested corrections.'}"`,
      type: 'exam_call',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedPaperId: paperId,
      subject: targetPaper.subject,
      semester: targetPaper.semester,
    };

    setNotifications(prev => [reuploadNotif, ...prev]);
    showToast(`Revision v${newVersion} of ${targetPaper.courseCode} submitted to QA!`, 'success');
  };

  // 4. QA Checker Approves or Rejects Paper
  const qaReviewPaper = (
    paperId: string,
    verdict: 'approved' | 'rejected',
    review: {
      reviewerName: string;
      rubricScores: QAReviewDetails['rubricScores'];
      feedbackNotes: string;
      rejectionReasons?: string[];
    }
  ) => {
    const targetPaper = papers.find(p => p.id === paperId);
    if (!targetPaper) return;

    const now = new Date().toISOString();
    const qaDetails: QAReviewDetails = {
      reviewedBy: review.reviewerName,
      reviewedAt: now,
      verdict,
      rubricScores: review.rubricScores,
      feedbackNotes: review.feedbackNotes,
      rejectionReasons: review.rejectionReasons,
    };

    const newStatus = verdict === 'approved' ? 'qa_approved' : 'qa_rejected';

    const updatedPaper: ExamPaper = {
      ...targetPaper,
      status: newStatus,
      qaReview: qaDetails,
      updatedAt: now,
    };

    setPapers(prev => prev.map(p => (p.id === paperId ? updatedPaper : p)));

    if (verdict === 'approved') {
      // 1. On approval, Principal dashboard shows paper submitted & date sheet row is generated!
      // Check if Date Sheet row already exists for this paper
      const existingRow = dateSheetRows.find(r => r.paperId === paperId);
      if (!existingRow) {
        // Calculate an automatic exam date based on semester and course
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + 14 + targetPaper.semester * 2);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[baseDate.getDay()];
        const dateString = baseDate.toISOString().split('T')[0];

        // Assign default hall based on subject
        const hallMap: Record<SubjectType, string> = {
          'English': 'Hall A (Humanities Wing)',
          'Islamic Studies': 'Al-Ghazali Auditorium',
          'Sociology': 'Hall C (Social Sciences Complex)',
          'Zoology': 'Darwin Science Amphitheater',
        };

        const newDateSheetRow: ExamDateSheetRow = {
          id: `ds-${paperId}`,
          paperId: paperId,
          subject: targetPaper.subject,
          semester: targetPaper.semester,
          courseCode: targetPaper.courseCode,
          courseTitle: targetPaper.courseTitle,
          examDate: dateString,
          dayOfWeek,
          startTime: targetPaper.semester % 2 === 0 ? '02:00 PM' : '09:00 AM',
          endTime: targetPaper.semester % 2 === 0 ? '04:00 PM' : '11:00 AM',
          shift: targetPaper.semester % 2 === 0 ? 'Evening Shift' : 'Morning Shift',
          hallLocation: hallMap[targetPaper.subject] || 'Central Examination Hall',
          chiefInvigilator: `Senior Faculty (${targetPaper.subject})`,
          totalCandidates: 60 + targetPaper.semester * 4,
          status: 'Scheduled',
          paperVersion: targetPaper.version,
        };

        setDateSheetRows(prev => [newDateSheetRow, ...prev]);
      }

      // Send approval notification to Principal
      const principalNotif: NotificationItem = {
        id: `notif-principal-${Date.now()}`,
        senderRole: 'qa',
        senderName: review.reviewerName,
        recipientRole: 'principal',
        title: `Paper Approved & Date Sheet Row Generated: ${targetPaper.courseCode}`,
        message: `${targetPaper.courseCode} (${targetPaper.courseTitle}, Sem ${targetPaper.semester}) has been QA verified. Ready for examination conduct; scheduled row appended to Date Sheet.`,
        type: 'approval_notice',
        timestamp: now,
        isRead: false,
        relatedPaperId: paperId,
        subject: targetPaper.subject,
        semester: targetPaper.semester,
      };

      // Send approval notification to Teacher
      const teacherNotif: NotificationItem = {
        id: `notif-teacher-appr-${Date.now()}`,
        senderRole: 'qa',
        senderName: review.reviewerName,
        recipientRole: 'teacher',
        recipientId: targetPaper.teacherId,
        title: `Paper Approved: ${targetPaper.courseCode}`,
        message: `Your submitted exam paper for ${targetPaper.courseCode} has been approved by QA with positive endorsement. It has been cleared for examination printing.`,
        type: 'approval_notice',
        timestamp: now,
        isRead: false,
        relatedPaperId: paperId,
        subject: targetPaper.subject,
        semester: targetPaper.semester,
      };

      setNotifications(prev => [principalNotif, teacherNotif, ...prev]);
      showToast(`Paper ${targetPaper.courseCode} APPROVED! Principal Date Sheet row generated.`, 'success');
    } else {
      // 2. On rejection, the teacher gets notified with remarks and can re-upload!
      const rejectionNotif: NotificationItem = {
        id: `notif-rejection-${Date.now()}`,
        senderRole: 'qa',
        senderName: review.reviewerName,
        recipientRole: 'teacher',
        recipientId: targetPaper.teacherId,
        title: `URGENT: Paper Rejected - Revision Required for ${targetPaper.courseCode}`,
        message: `Your paper for ${targetPaper.courseCode} was rejected by QA. Remarks: "${review.feedbackNotes}". Deficiencies: ${(review.rejectionReasons || []).join('; ')}. Please re-upload corrected paper.`,
        type: 'rejection_alert',
        timestamp: now,
        isRead: false,
        relatedPaperId: paperId,
        subject: targetPaper.subject,
        semester: targetPaper.semester,
      };

      // Remove from Date Sheet if it had one
      setDateSheetRows(prev => prev.filter(r => r.paperId !== paperId));

      setNotifications(prev => [rejectionNotif, ...prev]);
      showToast(`Paper ${targetPaper.courseCode} REJECTED. Instructor notified to re-upload.`, 'error');
    }
  };

  // Create date sheet row with automatic 5-day before paper upload deadline
  const createDateSheetRow = (params: {
    paperId?: string;
    subject: SubjectType;
    semester: SemesterNumber;
    courseCode: string;
    courseTitle: string;
    examDate: string;
    startTime: string;
    endTime: string;
    shift: 'Morning Shift' | 'Evening Shift';
    hallLocation: string;
    chiefInvigilator: string;
    chiefInvigilatorTeacherId?: string;
    chiefInvigilatorPhone?: string;
    assistantInvigilator?: string;
    assistantInvigilatorTeacherId?: string;
    assistantInvigilatorPhone?: string;
    paperSetterTeacherId?: string;
    paperSetterTeacherName?: string;
    paperSetterTeacherPhone?: string;
    uploadDaysBefore?: number;
    totalCandidates?: number;
    sendWhatsAppImmediately?: boolean;
    targetWhatsAppTeacher?: 'paper_setter' | 'chief' | 'assistant' | 'both';
  }) => {
    const rowId = `ds-${Date.now()}`;
    const parsedDate = new Date(params.examDate + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[parsedDate.getDay()] || 'Monday';
    const daysBefore = params.uploadDaysBefore || paperUploadDaysBefore || 5;
    // Configurable days before date sheet exam date
    const paperUploadDeadline = computePaperUploadDeadline(params.examDate, daysBefore);

    // Check if paper already exists for this course
    const existingPaper = papers.find(p => p.courseCode === params.courseCode);
    const paperUploaded = !!existingPaper;

    const newRow: ExamDateSheetRow = {
      id: rowId,
      paperId: params.paperId || existingPaper?.id || `paper-${params.courseCode.toLowerCase()}`,
      subject: params.subject,
      semester: params.semester,
      courseCode: params.courseCode,
      courseTitle: params.courseTitle,
      examDate: params.examDate,
      dayOfWeek,
      startTime: params.startTime,
      endTime: params.endTime,
      shift: params.shift,
      hallLocation: params.hallLocation,
      chiefInvigilator: params.chiefInvigilator,
      chiefInvigilatorTeacherId: params.chiefInvigilatorTeacherId,
      chiefInvigilatorPhone: params.chiefInvigilatorPhone,
      assistantInvigilator: params.assistantInvigilator,
      assistantInvigilatorTeacherId: params.assistantInvigilatorTeacherId,
      assistantInvigilatorPhone: params.assistantInvigilatorPhone,
      paperSetterTeacherId: params.paperSetterTeacherId,
      paperSetterTeacherName: params.paperSetterTeacherName,
      paperSetterTeacherPhone: params.paperSetterTeacherPhone,
      uploadDaysBefore: daysBefore,
      paperUploadDeadline,
      paperUploaded,
      whatsappNoticeSent: !!params.sendWhatsAppImmediately,
      whatsappSentAt: params.sendWhatsAppImmediately ? new Date().toISOString() : undefined,
      totalCandidates: params.totalCandidates || 65,
      status: 'Scheduled',
      paperVersion: existingPaper?.version || 1,
    };

    setDateSheetRows(prev => [newRow, ...prev]);

    // Send in-app system notifications
    const now = new Date().toISOString();
    const notifsToAdd: NotificationItem[] = [];

    // 1. To Paper Setter Teacher
    if (params.paperSetterTeacherId) {
      notifsToAdd.push({
        id: `notif-ps-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderRole: 'admin',
        senderName: 'Controller of Examinations (Admin)',
        recipientRole: 'teacher',
        recipientId: params.paperSetterTeacherId,
        title: `Official Date Sheet: ${params.courseCode} — ${daysBefore}-Day Paper Cutoff: ${paperUploadDeadline}`,
        message: `Date sheet finalized for ${params.courseCode} (${params.courseTitle}) on ${params.examDate} (${dayOfWeek}, ${params.startTime}–${params.endTime}, Hall/Room: ${params.hallLocation}). Please submit your exam paper strictly ${daysBefore} days prior to the date sheet (Cutoff: ${paperUploadDeadline}).`,
        type: 'datesheet_alert',
        timestamp: now,
        isRead: false,
        subject: params.subject,
        semester: params.semester,
        deadline: paperUploadDeadline,
      });
    }

    // 2. To Chief Invigilator
    if (params.chiefInvigilatorTeacherId) {
      notifsToAdd.push({
        id: `notif-ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderRole: 'admin',
        senderName: 'Controller of Examinations (Admin)',
        recipientRole: 'teacher',
        recipientId: params.chiefInvigilatorTeacherId,
        title: `Invigilation Duty Order: ${params.courseCode} on ${params.examDate}`,
        message: `You are assigned as Chief Invigilator on ${params.examDate} (${dayOfWeek}, ${params.startTime}–${params.endTime}) for ${params.courseCode} at ${params.hallLocation}. Please report 30 minutes prior to exam commencement.`,
        type: 'duty_order',
        timestamp: now,
        isRead: false,
        subject: params.subject,
        semester: params.semester,
      });
    }

    // 3. To Assistant Invigilator
    if (params.assistantInvigilatorTeacherId && params.assistantInvigilatorTeacherId !== params.chiefInvigilatorTeacherId) {
      notifsToAdd.push({
        id: `notif-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        senderRole: 'admin',
        senderName: 'Controller of Examinations (Admin)',
        recipientRole: 'teacher',
        recipientId: params.assistantInvigilatorTeacherId,
        title: `Invigilation Duty Order: ${params.courseCode} on ${params.examDate}`,
        message: `You are assigned as Assistant Invigilator on ${params.examDate} (${dayOfWeek}, ${params.startTime}–${params.endTime}) for ${params.courseCode} at ${params.hallLocation}.`,
        type: 'duty_order',
        timestamp: now,
        isRead: false,
        subject: params.subject,
        semester: params.semester,
      });
    }

    if (notifsToAdd.length > 0) {
      setNotifications(prev => [...notifsToAdd, ...prev]);
    }

    // Direct WhatsApp dispatch if requested (restricted to Admin and Principal sections)
    if (params.sendWhatsAppImmediately && (currentRole === 'admin' || currentRole === 'principal')) {
      const target = params.targetWhatsAppTeacher || 'paper_setter';
      if (target === 'paper_setter' || target === 'both') {
        const phone = params.paperSetterTeacherPhone || '+923008371920';
        const msg = WhatsAppTemplates.dateSheetPaperUploadNotice({
          teacherName: params.paperSetterTeacherName || 'Respected Instructor',
          courseCode: params.courseCode,
          courseTitle: params.courseTitle,
          department: params.subject,
          semester: params.semester,
          examDate: params.examDate,
          dayOfWeek,
          startTime: params.startTime,
          endTime: params.endTime,
          shift: params.shift,
          hallLocation: params.hallLocation,
          uploadDaysBefore: daysBefore,
          uploadDeadline: paperUploadDeadline,
        });
        openWhatsApp(phone, msg);
      }
      if (target === 'chief' || target === 'both') {
        const phone = params.chiefInvigilatorPhone || '+923008371920';
        const msg = WhatsAppTemplates.dateSheetDutyOrderNotice({
          teacherName: params.chiefInvigilator,
          dutyRole: 'Chief Invigilator',
          courseCode: params.courseCode,
          courseTitle: params.courseTitle,
          examDate: params.examDate,
          dayOfWeek,
          startTime: params.startTime,
          endTime: params.endTime,
          shift: params.shift,
          hallLocation: params.hallLocation,
          totalCandidates: params.totalCandidates,
        });
        if (target === 'both') {
          setTimeout(() => openWhatsApp(phone, msg), 600);
        } else {
          openWhatsApp(phone, msg);
        }
      }
    }

    showToast(`Date Sheet created for ${params.courseCode}! ${daysBefore}-day paper upload deadline set to ${paperUploadDeadline}.`, 'success');
    return { success: true, rowId };
  };

  // Update date sheet row with automatic recalculation of deadline if examDate or uploadDaysBefore changes
  const updateDateSheetRow = (rowId: string, updates: Partial<ExamDateSheetRow>) => {
    setDateSheetRows(prev =>
      prev.map(row => {
        if (row.id !== rowId) return row;
        let dayOfWeek = row.dayOfWeek;
        const daysBefore = updates.uploadDaysBefore ?? row.uploadDaysBefore ?? paperUploadDaysBefore ?? 5;
        let paperUploadDeadline = updates.paperUploadDeadline || row.paperUploadDeadline;

        if ((updates.examDate && updates.examDate !== row.examDate) || updates.uploadDaysBefore !== undefined) {
          const targetExamDate = updates.examDate || row.examDate;
          const parsed = new Date(targetExamDate + 'T00:00:00');
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          dayOfWeek = dayNames[parsed.getDay()] || dayOfWeek;
          paperUploadDeadline = computePaperUploadDeadline(targetExamDate, daysBefore);
        }

        return {
          ...row,
          ...updates,
          uploadDaysBefore: daysBefore,
          dayOfWeek: updates.dayOfWeek || dayOfWeek,
          paperUploadDeadline,
        };
      })
    );
    showToast('Exam Date Sheet row updated successfully.', 'success');
  };

  // Delete date sheet row
  const deleteDateSheetRow = (rowId: string) => {
    setDateSheetRows(prev => prev.filter(r => r.id !== rowId));
    showToast('Date Sheet row deleted.', 'info');
  };

  // Auto-schedule entire session date sheet for all courses with configurable paper upload deadlines
  const autoScheduleAllCoursesDateSheet = (startDate: string = '2026-10-15') => {
    const halls = [
      'Hall A (Room 101 - Humanities Wing)',
      'Hall B (Room 102 - Science Complex)',
      'Al-Farabi Main Auditorium',
      'Al-Ghazali Exam Hall (Floor 2)',
      'Darwin Science Amphitheater (Bio Wing)',
      'Seminar Room 304 (Academic Block)',
    ];

    let currentDate = new Date(startDate + 'T00:00:00');
    let scheduledCount = 0;
    const newRows: ExamDateSheetRow[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    courses.forEach((c, idx) => {
      // Check if already in dateSheetRows
      if (dateSheetRows.some(r => r.courseCode === c.code)) return;

      // Skip Sundays
      while (currentDate.getDay() === 0) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = dayNames[currentDate.getDay()];
      const isEvening = idx % 2 === 1;
      const startTime = isEvening ? '02:00 PM' : '09:00 AM';
      const endTime = isEvening ? '05:00 PM' : '12:00 PM';
      const shift: 'Morning Shift' | 'Evening Shift' = isEvening ? 'Evening Shift' : 'Morning Shift';
      const hallLocation = halls[idx % halls.length];

      // Assign teachers
      const deptTeachers = teachers.filter(t => t.department === c.subject);
      const paperSetter = deptTeachers[0] || teachers[0];
      const chiefTeacher = teachers[(idx + 1) % teachers.length];
      const assistTeacher = teachers[(idx + 2) % teachers.length];

      // Configurable paper upload deadline
      const daysBefore = paperUploadDaysBefore || 5;
      const uploadDeadline = computePaperUploadDeadline(dateStr, daysBefore);
      const existingPaper = papers.find(p => p.courseCode === c.code);

      newRows.push({
        id: `ds-${c.code.toLowerCase()}-${Date.now()}-${idx}`,
        paperId: existingPaper?.id || `paper-${c.code.toLowerCase()}`,
        subject: c.subject,
        semester: c.semester,
        courseCode: c.code,
        courseTitle: c.title,
        examDate: dateStr,
        dayOfWeek,
        startTime,
        endTime,
        shift,
        hallLocation,
        chiefInvigilator: chiefTeacher.name,
        chiefInvigilatorTeacherId: chiefTeacher.id,
        chiefInvigilatorPhone: chiefTeacher.whatsappNumber || chiefTeacher.phone,
        assistantInvigilator: assistTeacher.name,
        assistantInvigilatorTeacherId: assistTeacher.id,
        assistantInvigilatorPhone: assistTeacher.whatsappNumber || assistTeacher.phone,
        paperSetterTeacherId: paperSetter.id,
        paperSetterTeacherName: paperSetter.name,
        paperSetterTeacherPhone: paperSetter.whatsappNumber || paperSetter.phone,
        uploadDaysBefore: daysBefore,
        paperUploadDeadline: uploadDeadline,
        paperUploaded: !!existingPaper,
        totalCandidates: 60 + c.semester * 3,
        status: 'Scheduled',
        paperVersion: existingPaper?.version || 1,
      });

      scheduledCount++;
      if (idx % 2 === 1) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    if (newRows.length > 0) {
      setDateSheetRows(prev => [...newRows, ...prev]);
      showToast(`Auto-scheduled ${scheduledCount} courses into Date Sheet with 5-day upload cutoffs and duties!`, 'success');
    } else {
      showToast('All courses already have scheduled date sheet rows.', 'info');
    }

    return { scheduledCount };
  };

  // Send WhatsApp Notice for Date Sheet and Exam Duties (Restricted to Admin and Principal)
  const sendDateSheetWhatsApp = (params: {
    rowId: string;
    target: 'paper_setter' | 'chief_invigilator' | 'assistant_invigilator' | 'both';
  }) => {
    if (currentRole !== 'admin' && currentRole !== 'principal') {
      showToast('WhatsApp dispatch is strictly allowed only to Admin and Principal sections.', 'error');
      return;
    }

    const row = dateSheetRows.find(r => r.id === params.rowId);
    if (!row) {
      showToast('Date Sheet row not found.', 'error');
      return;
    }

    const uploadDeadline = row.paperUploadDeadline || computePaperUploadDeadline(row.examDate, 5);

    if (params.target === 'paper_setter' || params.target === 'both') {
      const teacherObj = teachers.find(t => t.id === row.paperSetterTeacherId);
      const phone = row.paperSetterTeacherPhone || teacherObj?.whatsappNumber || teacherObj?.phone || '+92 300 8371920';
      const teacherName = row.paperSetterTeacherName || teacherObj?.name || 'Course Instructor';
      const msg = WhatsAppTemplates.dateSheetPaperUploadNotice({
        teacherName,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        department: row.subject,
        semester: row.semester,
        examDate: row.examDate,
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        shift: row.shift,
        hallLocation: row.hallLocation,
        uploadDeadline,
      });
      openWhatsApp(phone, msg);
      showToast(`WhatsApp Paper Upload notice opened for ${teacherName}!`, 'success');
    }

    if (params.target === 'chief_invigilator' || params.target === 'both') {
      const teacherObj = teachers.find(t => t.id === row.chiefInvigilatorTeacherId);
      const phone = row.chiefInvigilatorPhone || teacherObj?.whatsappNumber || teacherObj?.phone || '+92 300 8371920';
      const msg = WhatsAppTemplates.dateSheetDutyOrderNotice({
        teacherName: row.chiefInvigilator,
        dutyRole: 'Chief Invigilator',
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        examDate: row.examDate,
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        shift: row.shift,
        hallLocation: row.hallLocation,
        totalCandidates: row.totalCandidates,
      });
      if (params.target === 'both') {
        setTimeout(() => openWhatsApp(phone, msg), 600);
      } else {
        openWhatsApp(phone, msg);
      }
      showToast(`WhatsApp Duty Order opened for ${row.chiefInvigilator}!`, 'success');
    }

    if (params.target === 'assistant_invigilator') {
      const teacherObj = teachers.find(t => t.id === row.assistantInvigilatorTeacherId);
      const phone = row.assistantInvigilatorPhone || teacherObj?.whatsappNumber || teacherObj?.phone || '+92 300 8371920';
      const msg = WhatsAppTemplates.dateSheetDutyOrderNotice({
        teacherName: row.assistantInvigilator || 'Assistant Invigilator',
        dutyRole: 'Assistant Invigilator',
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        examDate: row.examDate,
        dayOfWeek: row.dayOfWeek,
        startTime: row.startTime,
        endTime: row.endTime,
        shift: row.shift,
        hallLocation: row.hallLocation,
        totalCandidates: row.totalCandidates,
      });
      openWhatsApp(phone, msg);
      showToast(`WhatsApp Duty Order opened for ${row.assistantInvigilator}!`, 'success');
    }

    // Mark notice as sent
    setDateSheetRows(prev =>
      prev.map(r => (r.id === row.id ? { ...r, whatsappNoticeSent: true, whatsappSentAt: new Date().toISOString() } : r))
    );
  };

  // Helper to determine if a date sheet entry is confirmed
  const isConfirmedDateSheetEntry = (row: ExamDateSheetRow): boolean => {
    if (row.isConfirmed === true) return true;
    if (row.dutyConfirmed === true) return true;
    if (row.status === 'Verified' || row.status === 'Conducted') return true;
    if (row.isConfirmed === false || row.dutyConfirmed === false || (row.status as string) === 'Draft') {
      return false;
    }
    // Any scheduled date sheet row with an assigned exam date is active and confirmed
    return Boolean(row.examDate && (row.status === 'Scheduled' || !row.status));
  };

  // Helper to query only confirmed date sheet records
  const getConfirmedDateSheetRows = (): ExamDateSheetRow[] => {
    return dateSheetRows.filter(isConfirmedDateSheetEntry);
  };

  // Confirm or unconfirm a specific date sheet row
  const confirmDateSheetRow = (rowId: string, confirmed: boolean = true) => {
    setDateSheetRows(prev =>
      prev.map(r => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          isConfirmed: confirmed,
          dutyConfirmed: confirmed,
          status: confirmed ? (r.status === 'Conducted' ? 'Conducted' : 'Verified') : 'Scheduled',
        };
      })
    );
    showToast(
      confirmed ? 'Date sheet entry confirmed & verified.' : 'Date sheet entry marked as pending confirmation.',
      confirmed ? 'success' : 'info'
    );
  };

  // Bulk confirm all active date sheet rows
  const confirmAllDateSheetRows = () => {
    setDateSheetRows(prev =>
      prev.map(r => ({
        ...r,
        isConfirmed: true,
        dutyConfirmed: true,
        status: r.status === 'Conducted' ? 'Conducted' : 'Verified',
      }))
    );
    showToast(`All ${dateSheetRows.length} active date sheet entries confirmed!`, 'success');
  };

  // Synchronize the 'Paper Submission Lifecycle' tracker with active datesheet records in ExamProvider state
  const syncPaperLifecycleWithDateSheet = (options?: {
    onlyConfirmed?: boolean;
    autoUpdateDateSheetState?: boolean;
  }): CoursePipelineItem[] => {
    const onlyConfirmed = options?.onlyConfirmed ?? true;
    const targetRows = onlyConfirmed ? dateSheetRows.filter(isConfirmedDateSheetEntry) : dateSheetRows;

    let hasDateSheetUpdates = false;
    const updatedDateSheetRows = [...dateSheetRows];

    const synchronizedItems: CoursePipelineItem[] = targetRows.map(dateSheetRow => {
      const course = courses.find(c => c.code === dateSheetRow.courseCode) || {
        id: dateSheetRow.courseCode,
        code: dateSheetRow.courseCode,
        title: dateSheetRow.courseTitle,
        subject: dateSheetRow.subject,
        semester: dateSheetRow.semester,
        creditHours: 3,
      };

      const paper = papers.find(
        p => p.id === dateSheetRow.paperId || p.courseCode === dateSheetRow.courseCode
      );

      // Check if DateSheet state needs synchronization regarding paper uploaded flag or version
      if (options?.autoUpdateDateSheetState && paper) {
        const rowIndex = updatedDateSheetRows.findIndex(r => r.id === dateSheetRow.id);
        if (rowIndex !== -1) {
          const row = updatedDateSheetRows[rowIndex];
          if (!row.paperUploaded || row.paperVersion !== (paper.version || 1)) {
            updatedDateSheetRows[rowIndex] = {
              ...row,
              paperUploaded: true,
              paperVersion: paper.version || 1,
              paperId: paper.id,
            };
            hasDateSheetUpdates = true;
          }
        }
      }

      // Find assigned teacher from date sheet or faculty list
      const assignedTeacher = teachers.find(
        t => t.id === dateSheetRow.paperSetterTeacherId || t.name === dateSheetRow.paperSetterTeacherName
      ) || teachers.find(
        t => t.department === dateSheetRow.subject && t.assignedSemesters.includes(dateSheetRow.semester)
      ) || teachers.find(t => t.department === dateSheetRow.subject);

      const teacherName = dateSheetRow.paperSetterTeacherName || assignedTeacher?.name || 'Assigned Faculty';
      const teacherId = dateSheetRow.paperSetterTeacherId || assignedTeacher?.id;

      if (!paper) {
        // Stage 1: Stuck at teacher upload
        return {
          course,
          paper: undefined,
          dateSheetRow,
          stage: 'stuck_at_teacher_upload' as const,
          stageLabel: 'Faculty Paper Draft Pending',
          stageStep: 1,
          stuckParty: teacherName,
          stuckPartyRole: 'teacher' as const,
          stuckPartyId: teacherId,
          stuckDurationDays: 4,
          severity: 'urgent' as const,
          actionNeeded: `Faculty (${teacherName}) must draft & submit question paper for ${dateSheetRow.examDate} exam`,
        };
      }

      if (paper.status === 'pending_qa') {
        // Stage 2: Stuck at QA review
        return {
          course,
          paper,
          dateSheetRow,
          stage: 'stuck_at_qa_review' as const,
          stageLabel: 'Awaiting QA Paper Review',
          stageStep: 2,
          stuckParty: 'QA Committee Cell',
          stuckPartyRole: 'qa' as const,
          stuckDurationDays: 2,
          severity: 'warning' as const,
          actionNeeded: 'QA Cell must validate against syllabus rubric before exam conduction',
        };
      }

      if (paper.status === 'qa_rejected') {
        // Stage 3: Stuck at faculty revision
        return {
          course,
          paper,
          dateSheetRow,
          stage: 'stuck_at_teacher_revision' as const,
          stageLabel: 'QA Rejected (Correction Required)',
          stageStep: 2,
          stuckParty: paper.teacherName || teacherName,
          stuckPartyRole: 'teacher' as const,
          stuckPartyId: paper.teacherId || teacherId,
          stuckDurationDays: 3,
          severity: 'urgent' as const,
          actionNeeded: 'Faculty must revise paper per QA remarks & re-upload v2',
        };
      }

      if (paper.status === 'qa_approved') {
        return {
          course,
          paper,
          dateSheetRow,
          stage: 'fully_scheduled' as const,
          stageLabel: 'QA Certified & Confirmed on Date Sheet',
          stageStep: 5,
          stuckParty: 'None (Ready for Exam Conduction)',
          stuckPartyRole: 'principal' as const,
          stuckDurationDays: 0,
          severity: 'completed' as const,
          actionNeeded: `Clearance authorized for ${dateSheetRow.examDate} (${dateSheetRow.shift}) in ${dateSheetRow.hallLocation}`,
        };
      }

      return {
        course,
        paper,
        dateSheetRow,
        stage: 'stuck_at_teacher_upload' as const,
        stageLabel: 'Pending Submission',
        stageStep: 1,
        stuckParty: teacherName,
        stuckPartyRole: 'teacher' as const,
        stuckPartyId: teacherId,
        stuckDurationDays: 1,
        severity: 'warning' as const,
        actionNeeded: 'Action required',
      };
    });

    if (hasDateSheetUpdates && options?.autoUpdateDateSheetState) {
      setDateSheetRows(updatedDateSheetRows);
    }

    return synchronizedItems;
  };

  // Add system notification
  const addNotification = (params: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    senderRole?: UserRole;
    senderName?: string;
    recipientRole?: UserRole | 'all';
    recipientId?: string;
    relatedPaperId?: string;
    subject?: SubjectType;
    semester?: SemesterNumber;
    deadline?: string;
  }) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: params.title,
      message: params.message,
      type: params.type || 'reminder',
      senderRole: params.senderRole || 'admin',
      senderName: params.senderName || 'Controller of Examinations',
      recipientRole: params.recipientRole || 'all',
      recipientId: params.recipientId,
      relatedPaperId: params.relatedPaperId,
      subject: params.subject,
      semester: params.semester,
      deadline: params.deadline,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newItem, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Academic Curriculum & Subjects Management Handlers
  const addSubject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: 'Subject name cannot be empty.' };
    if (subjects.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: `Subject "${trimmed}" already exists.` };
    }
    setSubjects(prev => [...prev, trimmed]);
    showToast(`Subject "${trimmed}" added to institutional curriculum.`, 'success');
    return { success: true };
  };

  const deleteSubject = (name: string) => {
    if (papers.some(p => p.subject === name)) {
      showToast(`Cannot delete "${name}": Papers have already been submitted under this subject.`, 'error');
      return { success: false, error: 'Subject has active examination paper submissions.' };
    }
    setSubjects(prev => prev.filter(s => s !== name));
    setCourses(prev => prev.filter(c => c.subject !== name));
    showToast(`Subject "${name}" and its associated courses removed.`, 'info');
    return { success: true };
  };

  const addSemester = (semNumber: number) => {
    const num = Number(semNumber);
    if (!num || num < 1) {
      return { success: false, error: 'Please enter a valid positive semester number.' };
    }
    if (semesters.includes(num)) {
      return { success: false, error: `Semester ${num} already exists in active curriculum.` };
    }
    setSemesters(prev => [...prev, num].sort((a, b) => a - b));
    showToast(`Semester ${num} added to academic schedule.`, 'success');
    return { success: true };
  };

  const addCourse = (courseData: {
    code: string;
    title: string;
    subject: SubjectType;
    semester: SemesterNumber;
    creditHours: number;
  }) => {
    const code = courseData.code.trim().toUpperCase();
    const title = courseData.title.trim();
    if (!code || !title) {
      return { success: false, error: 'Course code and title are required.' };
    }
    if (courses.some(c => c.code.toUpperCase() === code)) {
      return { success: false, error: `Course with code "${code}" already exists.` };
    }
    const newCourse: Course = {
      id: `c-custom-${Date.now()}`,
      code,
      title,
      subject: courseData.subject,
      semester: Number(courseData.semester),
      creditHours: Number(courseData.creditHours) || 3,
    };
    setCourses(prev => [...prev, newCourse]);
    showToast(`Course ${code} (${newCourse.creditHours} Cr. Hrs) registered in ${courseData.subject}.`, 'success');
    return { success: true };
  };

  const updateCourseCreditHours = (courseId: string, creditHours: number) => {
    const validHours = Math.max(1, Math.min(12, Number(creditHours) || 3));
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, creditHours: validHours } : c));
    showToast(`Credit hours updated to ${validHours} Cr. Hrs.`, 'success');
  };

  const deleteCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course && papers.some(p => p.courseCode === course.code)) {
      showToast(`Cannot delete ${course.code}: A paper has already been submitted for this course.`, 'error');
      return;
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
    showToast(`Course deleted from catalog.`, 'info');
  };

  // Exam Result Management & Ratification
  const uploadOrUpdateResult = (data: Partial<ExamResult> & { courseCode: string; students: StudentResultEntry[] }) => {
    const course = courses.find(c => c.code === data.courseCode) || {
      title: data.courseTitle || data.courseCode,
      subject: data.subject || 'General',
      semester: data.semester || 1,
    };

    const students = data.students || [];
    const appeared = students.length;
    const passed = students.filter(s => s.status === 'Pass').length;
    const failed = students.filter(s => s.status === 'Fail').length;
    const withheld = students.filter(s => s.status === 'Withheld').length;
    const passPercentage = appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0;
    const avgGpa = appeared > 0 ? Number((students.reduce((acc, s) => acc + (s.gpa || 0), 0) / appeared).toFixed(2)) : 0;
    const highestMarks = students.length > 0 ? Math.max(...students.map(s => s.totalMarks || 0)) : 0;

    const existingIndex = results.findIndex(r => r.courseCode === data.courseCode);
    const id = existingIndex >= 0 ? results[existingIndex].id : `res-${data.courseCode.toLowerCase()}-${Date.now()}`;

    const newResult: ExamResult = {
      id,
      courseCode: data.courseCode,
      courseTitle: data.courseTitle || course.title,
      subject: (data.subject || course.subject) as SubjectType,
      semester: (data.semester || course.semester) as SemesterNumber,
      academicSession: data.academicSession || 'Fall 2026',
      examType: data.examType || 'Final Term Examination',
      teacherId: data.teacherId || currentTeacher.id,
      teacherName: data.teacherName || currentTeacher.name,
      teacherEmail: data.teacherEmail || currentTeacher.email,
      status: data.status || 'submitted_by_faculty',
      totalStudents: appeared,
      appeared,
      passed,
      failed,
      withheld,
      passPercentage,
      averageGpa: avgGpa,
      highestMarks,
      submittedAt: new Date().toISOString(),
      officialRemarks: data.officialRemarks || 'Marks ledger submitted by course examiner; forward to Principal for ratification.',
      students,
    };

    if (existingIndex >= 0) {
      setResults(prev => prev.map((r, i) => (i === existingIndex ? { ...r, ...newResult } : r)));
    } else {
      setResults(prev => [newResult, ...prev]);
    }

    // Generate notice for Principal
    const notif: NotificationItem = {
      id: `notif-res-${Date.now()}`,
      senderRole: 'teacher',
      senderName: currentTeacher.name,
      recipientRole: 'principal',
      title: `Exam Result Submitted: ${data.courseCode}`,
      message: `${currentTeacher.name} submitted the candidate award ledger for ${data.courseCode} (${course.title}). Appeared: ${appeared}, Passed: ${passed} (${passPercentage}%). Awaiting executive sign-off.`,
      type: 'approval_notice',
      timestamp: new Date().toISOString(),
      isRead: false,
      subject: course.subject,
      semester: course.semester,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Exam results for ${data.courseCode} uploaded successfully & dispatched to Principal.`, 'success');
  };

  const ratifyAndPublishResult = (resultId: string, officialRemarks?: string) => {
    const existing = results.find(r => r.id === resultId);
    if (!existing) return;

    const gazetteNumber = existing.gazetteNumber || `UHE/EXAM/GZ-2026/${String(Math.floor(Math.random() * 800) + 100).padStart(3, '0')}`;
    const now = new Date().toISOString();

    setResults(prev =>
      prev.map(r =>
        r.id === resultId
          ? {
              ...r,
              status: 'gazetted_published' as const,
              ratifiedAt: now,
              ratifiedBy: currentUser ? `${currentUser.name} (Principal)` : 'Prof. Dr. Richard Hawthorne (Principal)',
              gazetteNumber,
              gazettePublishedAt: now,
              officialRemarks: officialRemarks || 'Official Result Gazette ratified by Principal & Controller of Examinations. Marks ledger published.',
            }
          : r
      )
    );

    const notif: NotificationItem = {
      id: `notif-gz-${Date.now()}`,
      senderRole: 'principal',
      senderName: currentUser?.name || 'Prof. Dr. Richard Hawthorne (Principal)',
      recipientRole: 'teacher',
      recipientId: existing.teacherId,
      title: `Gazette Ratified & Published: ${existing.courseCode}`,
      message: `The official examination gazette for ${existing.courseCode} (${existing.courseTitle}) has been ratified by the Principal. Gazette No: ${gazetteNumber}. Pass rate: ${existing.passPercentage}%.`,
      type: 'approval_notice',
      timestamp: now,
      isRead: false,
      subject: existing.subject,
      semester: existing.semester,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Official Gazette published for ${existing.courseCode} (${gazetteNumber})!`, 'success');
  };

  const updateResultStatus = (resultId: string, status: ExamResult['status'], remarks?: string) => {
    setResults(prev => prev.map(r => (r.id === resultId ? { ...r, status, officialRemarks: remarks || r.officialRemarks } : r)));
    showToast(`Result status set to ${status.replace(/_/g, ' ')}.`, 'info');
  };

  const sendExpediteNotice = (params: {
    targetRole: UserRole;
    recipientId?: string;
    courseCode: string;
    courseTitle: string;
    stage: string;
    customNote?: string;
  }) => {
    const notif: NotificationItem = {
      id: `notif-exp-${Date.now()}`,
      senderRole: 'principal',
      senderName: currentUser?.name || 'Prof. Dr. Richard Hawthorne (Principal)',
      recipientRole: params.targetRole,
      recipientId: params.recipientId,
      title: `URGENT ACTION REQUIRED: ${params.courseCode} Paper Stuck at [${params.stage}]`,
      message: params.customNote || `Principal Office Directive: Question paper submission for ${params.courseCode} (${params.courseTitle}) is currently stalled at stage "${params.stage}". Please clear this pending queue immediately to adhere to the final exam schedule.`,
      type: 'reminder',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`Urgent administrative expedite notice dispatched for ${params.courseCode}.`, 'success');
  };

  const concludeAndArchiveSession = (sessionName: string = 'Fall 2026', remarks?: string) => {
    setIsSessionConcluded(true);
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_CONCLUDED, 'true');
    } catch (e) {
      console.error(e);
    }

    const details = {
      sessionName,
      concludedAt: new Date().toISOString(),
      totalCourses: 64,
      gazettedResults: 64,
      concludedBy: currentUser?.name || 'Prof. Dr. Bilquis Jahan (Principal)',
      officialRemarks: remarks || 'All 64 course papers, exam conduction logs, and gazetted student result ledgers have been officially ratified, sealed, and moved to the permanent institutional archive.',
    };
    setConcludedSessionDetails(details);
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_DETAILS, JSON.stringify(details));
    } catch (e) {
      console.error(e);
    }

    // Broadcast official session conclusion notification
    const newNotice: NotificationItem = {
      id: `notice-conclude-${Date.now()}`,
      senderRole: 'principal',
      senderName: 'Principal Secretariat',
      recipientRole: 'all',
      title: `Academic Session ${sessionName} Concluded & Archived`,
      message: `The Principal has officially concluded ${sessionName}. All 64 papers and examination results have been verified, ratified, and permanently archived into the Session Historical Records repository.`,
      type: 'approval_notice',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotice, ...prev]);

    showToast(`Session ${sessionName} successfully concluded! All data moved to the Archived section.`, 'success');
  };

  const reopenSession = (sessionName: string = 'Fall 2026') => {
    setIsSessionConcluded(false);
    setConcludedSessionDetails(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.SESSION_CONCLUDED);
      localStorage.removeItem(STORAGE_KEYS.SESSION_DETAILS);
    } catch (e) {
      console.error(e);
    }
    showToast(`Session ${sessionName} reopened for active operations.`, 'info');
  };

  // Student Records Management Handlers (Roll Number acts as Primary Key)
  const addStudent = (studentData: Omit<Student, 'status' | 'admissionDate'> & { admissionDate?: string }) => {
    const cleanRoll = studentData.rollNumber.trim().toUpperCase();
    if (!cleanRoll) {
      return { success: false, error: 'Roll Number is required and acts as the unique student primary key.' };
    }
    if (students.some(s => s.rollNumber.toUpperCase() === cleanRoll)) {
      return { success: false, error: `Student with Roll Number "${cleanRoll}" already exists.` };
    }

    const newStudent: Student = {
      ...studentData,
      rollNumber: cleanRoll,
      status: 'active',
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
      overallCgpa: studentData.overallCgpa || 3.5,
      totalCreditsCompleted: studentData.totalCreditsCompleted || (Math.max(1, studentData.currentSemester - 1) * 18),
    };

    setStudents(prev => [newStudent, ...prev]);

    // Automatically synchronize course results for this student's department and semester
    const matchingCourses = courses.filter(c => {
      if (newStudent.enrolledCourseCodes && newStudent.enrolledCourseCodes.length > 0) {
        return newStudent.enrolledCourseCodes.includes(c.code);
      }
      return c.subject === newStudent.department && Number(c.semester) === Number(newStudent.currentSemester);
    });

    setResults(prevResults => {
      const updated = [...prevResults];
      matchingCourses.forEach(course => {
        const targetCgpa = newStudent.overallCgpa || 3.5;
        const seed =
          (newStudent.rollNumber.charCodeAt(newStudent.rollNumber.length - 1) || 5) +
          (course.code.charCodeAt(course.code.length - 1) || 2);
        const assign = 8 + (seed % 3);
        const mid = 15 + (seed % 5);
        const baseFinal = Math.min(
          70,
          Math.max(38, Math.round((targetCgpa / 4.0) * 65) + ((seed % 7) - 3))
        );
        const total = assign + mid + baseFinal;
        const { grade, gpa, status } = calculateGradeAndGpa(total, 100);

        const newEntry: StudentResultEntry = {
          rollNumber: newStudent.rollNumber,
          studentName: newStudent.name,
          assignmentMarks: assign,
          midtermMarks: mid,
          finalMarks: baseFinal,
          totalMarks: total,
          percentage: total,
          grade,
          gpa,
          status,
          remarks: status === 'Pass' ? (gpa >= 3.7 ? 'Distinction' : 'Cleared') : 'Failed in Theory Component',
        };

        const resIdx = updated.findIndex(r => r.courseCode === course.code);
        if (resIdx >= 0) {
          const r = updated[resIdx];
          const exists = r.students.some(
            s => s.rollNumber.toUpperCase() === newStudent.rollNumber.toUpperCase()
          );
          const newStList = exists
            ? r.students.map(s =>
                s.rollNumber.toUpperCase() === newStudent.rollNumber.toUpperCase() ? newEntry : s
              )
            : [newEntry, ...r.students];

          const appeared = newStList.length;
          const passed = newStList.filter(s => s.status === 'Pass').length;
          const failed = newStList.filter(s => s.status === 'Fail').length;
          const passPercentage =
            appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0;
          const averageGpa =
            appeared > 0
              ? Number((newStList.reduce((acc, s) => acc + s.gpa, 0) / appeared).toFixed(2))
              : 0;
          const highestMarks = Math.max(...newStList.map(s => s.totalMarks), 0);

          updated[resIdx] = {
            ...r,
            totalStudents: appeared,
            appeared,
            passed,
            failed,
            passPercentage,
            averageGpa,
            highestMarks,
            students: newStList,
          };
        } else {
          updated.push({
            id: `res-${course.code.toLowerCase()}`,
            courseCode: course.code,
            courseTitle: course.title,
            subject: course.subject,
            semester: course.semester,
            creditHours: course.creditHours,
            academicSession: newStudent.session || 'Fall 2026',
            examType: 'Final Term Examination',
            teacherId: 'tch-auto',
            teacherName: 'Assigned Course Faculty',
            teacherEmail: 'faculty@ggmdc.edu.pk',
            status: 'gazetted_published',
            totalStudents: 1,
            appeared: 1,
            passed: status === 'Pass' ? 1 : 0,
            failed: status === 'Fail' ? 1 : 0,
            withheld: 0,
            passPercentage: status === 'Pass' ? 100 : 0,
            averageGpa: gpa,
            highestMarks: total,
            submittedAt: new Date().toISOString(),
            ratifiedAt: new Date().toISOString(),
            ratifiedBy: 'Prof. Dr. Bilquis Jahan (Principal)',
            gazetteNumber: `GGMDC/GZ-2026/${course.code}`,
            gazettePublishedAt: new Date().toISOString(),
            officialRemarks: 'Official Gazette ratified by Academic Executive Board.',
            students: [newEntry],
          });
        }
      });
      return updated;
    });

    showToast(`Student ${newStudent.name} (${cleanRoll}) registered successfully. Results synchronized.`, 'success');
    return { success: true };
  };

  const bulkAddStudents = (
    studentsList: (Omit<Student, 'status' | 'admissionDate'> & { admissionDate?: string })[]
  ) => {
    if (!studentsList || studentsList.length === 0) {
      return { success: false, importedCount: 0, skippedCount: 0, errors: ['No student records provided to import.'] };
    }

    const existingRolls = new Set(students.map(s => s.rollNumber.toUpperCase()));
    const created: Student[] = [];
    const skipped: string[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    studentsList.forEach(stData => {
      const cleanRoll = stData.rollNumber.trim().toUpperCase();
      if (!cleanRoll) {
        skipped.push('Empty Roll Number');
        return;
      }
      if (existingRolls.has(cleanRoll)) {
        skipped.push(`Duplicate Roll Number: ${cleanRoll}`);
        return;
      }

      existingRolls.add(cleanRoll);
      const newSt: Student = {
        ...stData,
        rollNumber: cleanRoll,
        status: 'active',
        admissionDate: stData.admissionDate || todayStr,
        overallCgpa: stData.overallCgpa || 3.5,
        totalCreditsCompleted: stData.totalCreditsCompleted || (Math.max(1, stData.currentSemester - 1) * 18),
      };
      created.push(newSt);
    });

    if (created.length > 0) {
      setStudents(prev => [...created, ...prev]);
      showToast(`Successfully bulk imported ${created.length} students from CSV.`, 'success');
    } else {
      showToast(`No students imported (${skipped.length} duplicates or invalid records skipped).`, 'error');
    }

    return {
      success: created.length > 0,
      importedCount: created.length,
      skippedCount: skipped.length,
      errors: skipped,
    };
  };

  const updateStudent = (rollNumber: string, updates: Partial<Student>) => {
    const target = students.find(s => s.rollNumber === rollNumber);
    if (!target) {
      return { success: false, error: 'Student not found.' };
    }

    setStudents(prev =>
      prev.map(s => (s.rollNumber === rollNumber ? { ...s, ...updates } : s))
    );

    // Sync results entries with updated student name or roll number
    if (updates.name || updates.rollNumber) {
      const newName = updates.name;
      const newRoll = updates.rollNumber ? updates.rollNumber.toUpperCase() : rollNumber;
      setResults(prev =>
        prev.map(r => ({
          ...r,
          students: r.students.map(st =>
            st.rollNumber.toUpperCase() === rollNumber.toUpperCase()
              ? {
                  ...st,
                  rollNumber: newRoll,
                  studentName: newName || st.studentName,
                }
              : st
          ),
        }))
      );
    }

    showToast(`Record for Roll No ${rollNumber} updated successfully across student and exam registers.`, 'success');
    return { success: true };
  };

  const graduatePassoutStudent = (rollNumber: string, reason?: string) => {
    const target = students.find(s => s.rollNumber === rollNumber);
    if (!target) {
      return { success: false, error: 'Student not found.' };
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    setStudents(prev =>
      prev.map(s =>
        s.rollNumber === rollNumber
          ? {
              ...s,
              status: 'graduated',
              graduationDate: todayStr,
              archivedAt: now.toISOString(),
              archiveReason: reason || 'Completed Degree Program & Conferred Graduation (Passed Out)',
            }
          : s
      )
    );

    showToast(`Student ${target.name} (${rollNumber}) passed out and moved to alumni archive.`, 'info');
    return { success: true };
  };

  const restoreStudentFromArchive = (rollNumber: string) => {
    const target = students.find(s => s.rollNumber === rollNumber);
    if (!target) {
      return { success: false, error: 'Student not found.' };
    }

    setStudents(prev =>
      prev.map(s =>
        s.rollNumber === rollNumber
          ? {
              ...s,
              status: 'active',
              archivedAt: undefined,
              archiveReason: undefined,
            }
          : s
      )
    );

    showToast(`Student ${target.name} (${rollNumber}) restored to active enrolled roster.`, 'success');
    return { success: true };
  };

  const deleteStudent = (rollNumber: string) => {
    setStudents(prev => prev.filter(s => s.rollNumber !== rollNumber));
    setResults(prev =>
      prev.map(r => ({
        ...r,
        students: r.students.filter(s => s.rollNumber.toUpperCase() !== rollNumber.toUpperCase()),
      }))
    );
    showToast(`Student record for ${rollNumber} deleted from roster and exam registers.`, 'info');
    return { success: true };
  };

  // =========================================================================
  // ATTENDANCE & EXAM ELIGIBILITY MANAGEMENT
  // =========================================================================
  const setAttendanceThreshold = (threshold: number) => {
    const valid = Math.max(1, Math.min(100, Math.round(threshold)));
    setAttendanceThresholdState(valid);
    // Recalculate eligibility for all records based on new threshold
    setAttendanceRecords(prev =>
      prev.map(r => {
        const { isEligible } = calculateAttendanceEligibility(
          r.attendedClasses,
          r.totalClasses,
          valid,
          r.isExempted
        );
        return { ...r, isEligible };
      })
    );
    showToast(`Attendance exam eligibility threshold set to ${valid}%.`, 'info');
  };

  const addAttendanceRecord = (
    data: Omit<AttendanceRecord, 'id' | 'lastUpdated' | 'attendancePercentage' | 'isEligible'>
  ) => {
    const roll = data.rollNumber.trim().toUpperCase();
    const courseCode = data.courseCode.trim().toUpperCase();
    if (!roll || !courseCode) {
      return { success: false, error: 'Roll number and Course code are required.' };
    }
    if (data.totalClasses <= 0) {
      return { success: false, error: 'Total classes held must be greater than 0.' };
    }
    if (data.attendedClasses < 0 || data.attendedClasses > data.totalClasses) {
      return { success: false, error: 'Attended classes cannot exceed total classes or be negative.' };
    }

    const { percentage, isEligible } = calculateAttendanceEligibility(
      data.attendedClasses,
      data.totalClasses,
      attendanceThreshold,
      data.isExempted
    );

    const newRec: AttendanceRecord = {
      ...data,
      id: `att-${roll.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${courseCode.toLowerCase()}-${Date.now()}`,
      rollNumber: roll,
      courseCode,
      attendancePercentage: percentage,
      isEligible,
      lastUpdated: new Date().toISOString(),
    };

    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(
        r => r.rollNumber.toUpperCase() === roll && r.courseCode.toUpperCase() === courseCode
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRec;
        return updated;
      }
      return [newRec, ...prev];
    });

    showToast(
      `Attendance record for ${roll} (${courseCode}) recorded. Status: ${isEligible ? 'Eligible' : 'Short Attendance'}.`,
      'success'
    );
    return { success: true };
  };

  const bulkUploadAttendance = (
    records: Array<{
      rollNumber: string;
      studentName?: string;
      department?: SubjectType;
      semester?: SemesterNumber;
      courseCode?: string;
      courseTitle?: string;
      totalClasses: number;
      attendedClasses: number;
      isExempted?: boolean;
      exemptionReason?: string;
    }>
  ) => {
    let importedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const newOrUpdatedList: AttendanceRecord[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const roll = (row.rollNumber || '').trim().toUpperCase();
      const cCode = (row.courseCode || '').trim().toUpperCase();

      if (!roll) {
        errors.push(`Row ${i + 1}: Missing student roll number.`);
        continue;
      }
      if (!cCode) {
        errors.push(`Row ${i + 1} (${roll}): Missing course code.`);
        continue;
      }
      const total = Number(row.totalClasses);
      const attended = Number(row.attendedClasses);
      if (isNaN(total) || total <= 0) {
        errors.push(`Row ${i + 1} (${roll} - ${cCode}): Total classes must be a positive number.`);
        continue;
      }
      if (isNaN(attended) || attended < 0 || attended > total) {
        errors.push(
          `Row ${i + 1} (${roll} - ${cCode}): Attended classes (${attended}) must be between 0 and total (${total}).`
        );
        continue;
      }

      const st = students.find(s => s.rollNumber.toUpperCase() === roll);
      const crs = courses.find(c => c.code.toUpperCase() === cCode);

      const stName = row.studentName?.trim() || st?.name || `Candidate ${roll}`;
      const dept = row.department || st?.department || crs?.subject || 'English';
      const sem = row.semester || st?.currentSemester || crs?.semester || 1;
      const cTitle = row.courseTitle?.trim() || crs?.title || cCode;

      const { percentage, isEligible } = calculateAttendanceEligibility(
        attended,
        total,
        attendanceThreshold,
        row.isExempted
      );

      newOrUpdatedList.push({
        id: `att-${roll.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cCode.toLowerCase()}`,
        rollNumber: roll,
        studentName: stName,
        department: dept as SubjectType,
        semester: sem as SemesterNumber,
        courseCode: cCode,
        courseTitle: cTitle,
        totalClasses: total,
        attendedClasses: attended,
        attendancePercentage: percentage,
        isEligible,
        isExempted: !!row.isExempted,
        exemptionReason: row.exemptionReason,
        lastUpdated: new Date().toISOString(),
      });
    }

    if (newOrUpdatedList.length === 0) {
      return { success: false, importedCount: 0, updatedCount: 0, errors };
    }

    setAttendanceRecords(prev => {
      const map = new Map<string, AttendanceRecord>();
      prev.forEach(r => map.set(`${r.rollNumber.toUpperCase()}_${r.courseCode.toUpperCase()}`, r));
      newOrUpdatedList.forEach(r => {
        const key = `${r.rollNumber.toUpperCase()}_${r.courseCode.toUpperCase()}`;
        if (map.has(key)) {
          updatedCount++;
        } else {
          importedCount++;
        }
        map.set(key, r);
      });
      return Array.from(map.values());
    });

    showToast(`Attendance processed: ${importedCount} created, ${updatedCount} updated.`, 'success');
    return { success: true, importedCount, updatedCount, errors };
  };

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const total = updates.totalClasses !== undefined ? updates.totalClasses : r.totalClasses;
        const attended = updates.attendedClasses !== undefined ? updates.attendedClasses : r.attendedClasses;
        const isExempted = updates.isExempted !== undefined ? updates.isExempted : r.isExempted;
        const { percentage, isEligible } = calculateAttendanceEligibility(
          attended,
          total,
          attendanceThreshold,
          isExempted
        );
        return {
          ...r,
          ...updates,
          totalClasses: total,
          attendedClasses: attended,
          attendancePercentage: percentage,
          isEligible,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
    showToast('Attendance record updated.', 'success');
    return { success: true };
  };

  const toggleAttendanceExemption = (id: string, reason?: string) => {
    setAttendanceRecords(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const newExempted = !r.isExempted;
        const { isEligible } = calculateAttendanceEligibility(
          r.attendedClasses,
          r.totalClasses,
          attendanceThreshold,
          newExempted
        );
        return {
          ...r,
          isExempted: newExempted,
          exemptionReason: newExempted
            ? reason || 'Official Medical / Dean Special Board Exemption Granted'
            : undefined,
          isEligible,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
    showToast('Exemption status updated.', 'info');
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
    showToast('Attendance record removed.', 'info');
    return { success: true };
  };

  const clearAllAttendance = () => {
    setAttendanceRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    } catch (e) {
      console.error(e);
    }
    showToast('All attendance records cleared.', 'info');
  };

  const resetAllData = () => {
    setPapers(INITIAL_EXAM_PAPERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setDateSheetRows(INITIAL_DATE_SHEET_ROWS);
    setResults(INITIAL_EXAM_RESULTS);
    setStudents(INITIAL_STUDENTS);
    setUsers(INITIAL_USER_ACCOUNTS);
    setCurrentUser(null);
    setTeachers(TEACHER_PROFILES);
    setGlobalDeadline(INITIAL_GLOBAL_DEADLINE);
    setSubjects(ALL_SUBJECTS);
    setSemesters(ALL_SEMESTERS);
    setCourses(COURSES_CATALOG);
    setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    setAttendanceThresholdState(75);
    setIsSessionConcluded(false);
    setConcludedSessionDetails(null);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.PAPERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.DATE_SHEET);
    localStorage.removeItem(STORAGE_KEYS.EXAM_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.GLOBAL_DEADLINE);
    localStorage.removeItem(STORAGE_KEYS.SCREEN);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SEMESTERS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE_THRESHOLD);
    localStorage.removeItem(STORAGE_KEYS.SESSION_CONCLUDED);
    localStorage.removeItem(STORAGE_KEYS.SESSION_DETAILS);
    showToast('All data for students, employees, teachers, QA and paper submissions cleared to nil. System ready for development.', 'info');
  };

  return (
    <ExamContext.Provider
      value={{
        currentRole,
        setRole,
        activeScreen,
        setActiveScreen,
        currentTeacher,
        setTeacherId,
        teachers,
        papers,
        notifications,
        dateSheetRows,
        paperUploadDaysBefore,
        setPaperUploadDaysBefore,
        applyUploadDaysToAllRows,
        collegeLogo,
        setCollegeLogo,
        collegeLogoRight,
        setCollegeLogoRight,
        collegeName,
        setCollegeName,
        unreadNotificationCount,
        previewPaper,
        setPreviewPaper,

        // Curriculum Structure
        subjects,
        semesters,
        courses,
        addSubject,
        deleteSubject,
        addSemester,
        addCourse,
        updateCourseCreditHours,
        deleteCourse,

        // Auth
        currentUser,
        users,
        userAccounts: users,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        signup,
        login,
        logout,
        requestPasswordReset,
        resetPassword,

        // ID Approval & Management by Admin
        approveUserId,
        rejectUserId,
        setUserIdPending,
        markUserWhatsAppSent,
        updateUserData,
        deleteUserAccount,
        pendingUsersCount,

        // Global Submission Deadline
        globalDeadline,
        updateGlobalDeadline,
        deadlineStatus,
        isDeadlineModalOpen,
        setIsDeadlineModalOpen,

        // Results Management & Gazette
        results,
        uploadOrUpdateResult,
        ratifyAndPublishResult,
        updateResultStatus,
        sendExpediteNotice,

        // Session Conclusion & Archival
        isSessionConcluded,
        concludedSessionDetails,
        concludeAndArchiveSession,
        reopenSession,

        // Student Records Management & Archival
        students,
        addStudent,
        bulkAddStudents,
        updateStudent,
        graduatePassoutStudent,
        restoreStudentFromArchive,
        deleteStudent,

        // Attendance & Exam Eligibility Tracking
        attendanceRecords,
        attendanceThreshold,
        setAttendanceThreshold,
        addAttendanceRecord,
        bulkUploadAttendance,
        updateAttendanceRecord,
        toggleAttendanceExemption,
        deleteAttendanceRecord,
        clearAllAttendance,

        // Actions
        adminSendCallNotification,
        submitNewPaper,
        reuploadRevisedPaper,
        qaReviewPaper,
        createDateSheetRow,
        updateDateSheetRow,
        deleteDateSheetRow,
        autoScheduleAllCoursesDateSheet,
        sendDateSheetWhatsApp,
        syncPaperLifecycleWithDateSheet,
        getConfirmedDateSheetRows,
        confirmDateSheetRow,
        confirmAllDateSheetRows,
        addNotification,
        showToast,
        markNotificationAsRead,
        markAllNotificationsRead,
        resetAllData,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
