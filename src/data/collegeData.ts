import { Course, SubjectType, DutyRosterItem, ExamPaper, ExamResult, ExamDateSheetRow } from '../types';

export const COLLEGE_METADATA = {
  institutionName: 'Govt. Girls Model Degree College',
  campus: 'Jinnah Town, Quetta',
  systemName: 'Examination Management System',
  reportTitle: 'Executive Dashboard · All Exam Types · Updated 17-Sep-2026 10:29 PM · CONFIDENTIAL',
  lastUpdated: '17-Sep-2026 10:29 PM',
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

// Exact institutional stats matching the college sheet
export const INSTITUTIONAL_BENCHMARKS = {
  totalPapers: 64,
  papersSubmitted: 59,
  resultsSubmitted: 25,
  overallCompletion: 71.9,
  overallCompletionRounded: 72,
  paperSubmissionRate: 92.18, // 92%
  resultSubmissionRate: 39.06, // 39%
  examTypeBreakdown: {
    final: 58,
    mid: 4,
    reappear: 2,
    total: 64,
  },
  operationalIndicators: {
    resultOverdue3d: 0,
    resultDelayed15d: 25,
    reappearPapers: 2,
    dutyRosterConfirmed: 50,
    dutyRosterTotal: 64,
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
      papersSubmitted: 13,
      totalPapers: 13,
      resultsSubmitted: 5,
      totalResults: 13,
      overallCompletion: 69.2,
      status: 'Papers 100% Cleared · Results In Progress',
      activeFaculty: 'Prof. Dr. Sarah Jenkins, Dr. Arthur Miller',
    },
    {
      department: 'ISLAMIC STUDIES',
      subject: 'Islamic Studies' as SubjectType,
      papersSubmitted: 14,
      totalPapers: 14,
      resultsSubmitted: 5,
      totalResults: 14,
      overallCompletion: 76.8,
      status: 'Papers 100% Cleared · Results Under Audit',
      activeFaculty: 'Prof. Dr. Tariq Mahmood, Dr. Fatima Zahra',
    },
    {
      department: 'SOCIOLOGY',
      subject: 'Sociology' as SubjectType,
      papersSubmitted: 17,
      totalPapers: 19,
      resultsSubmitted: 10,
      totalResults: 19,
      overallCompletion: 80.3,
      status: '2 Papers Stalled · Highest Result Velocity',
      activeFaculty: 'Dr. Bilal Qureshi, Prof. Maria Santos',
    },
    {
      department: 'ZOOLOGY',
      subject: 'Zoology' as SubjectType,
      papersSubmitted: 15,
      totalPapers: 18,
      resultsSubmitted: 5,
      totalResults: 18,
      overallCompletion: 61.1,
      status: '3 Papers Stalled · Practical Labs Ongoing',
      activeFaculty: 'Dr. Harrison Vance, Dr. Elena Rostova',
    },
  ],
};

// All 64 Courses for Govt. Girls Model Degree College
export const COLLEGE_64_COURSES: (Course & {
  examType: 'Final' | 'Mid' | 'Reappear';
  paperSubmitted: boolean;
  resultSubmitted: boolean;
  resultDelayedDays?: number;
  assignedTeacher: string;
})[] = [
  // ==================== ENGLISH (13 Courses: 12 Final, 1 Mid · 13 submitted, 5 results) ====================
  { id: 'c-eng-101', code: 'ENG-101', title: 'Functional English & Grammar', subject: 'English', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Dr. Sarah Jenkins' },
  { id: 'c-eng-102', code: 'ENG-102', title: 'Academic Reading & Study Skills', subject: 'English', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Dr. Sarah Jenkins' },
  { id: 'c-eng-201', code: 'ENG-201', title: 'History of English Literature', subject: 'English', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Arthur Miller' },
  { id: 'c-eng-202', code: 'ENG-202', title: 'Communication Skills in English', subject: 'English', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Arthur Miller' },
  { id: 'c-eng-301', code: 'ENG-301', title: 'Classical & Renaissance Poetry', subject: 'English', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Dr. Sarah Jenkins' },
  { id: 'c-eng-302', code: 'ENG-302', title: 'Romantic & Victorian Literature', subject: 'English', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 18, assignedTeacher: 'Dr. Arthur Miller' },
  { id: 'c-eng-401', code: 'ENG-401', title: 'Introduction to English Prose', subject: 'English', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 19, assignedTeacher: 'Dr. Arthur Miller' },
  { id: 'c-eng-402', code: 'ENG-402', title: 'Introduction to Fiction & Narrative', subject: 'English', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 17, assignedTeacher: 'Prof. Dr. Sarah Jenkins' },
  { id: 'c-eng-501', code: 'ENG-501', title: 'Linguistics & Phonetics', subject: 'English', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 20, assignedTeacher: 'Prof. Dr. Sarah Jenkins' },
  { id: 'c-eng-601', code: 'ENG-601', title: 'Modern Drama & Tragedy', subject: 'English', semester: 6, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 16, assignedTeacher: 'Dr. Arthur Miller' },
  { id: 'c-eng-701', code: 'ENG-701', title: 'Literary Theory & Criticism', subject: 'English', semester: 7, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 22, assignedTeacher: 'Prof. Dr. Sarah Jenkins' },
  { id: 'c-eng-801', code: 'ENG-801', title: 'Post-Colonial & World Literature', subject: 'English', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 21, assignedTeacher: 'Dr. Arthur Miller' },
  { id: 'c-eng-mid-3', code: 'ENG-MID-303', title: 'English Essay & Composition', subject: 'English', semester: 3, creditHours: 2, examType: 'Mid', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 16, assignedTeacher: 'Dr. Arthur Miller' },

  // ==================== ISLAMIC STUDIES (14 Courses: 13 Final, 1 Mid · 14 submitted, 5 results) ====================
  { id: 'c-isl-101', code: 'ISL-101', title: 'Ulum-ul-Quran & Exegesis', subject: 'Islamic Studies', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-102', code: 'ISL-102', title: 'Islamic Creed & Theology (Aqaid)', subject: 'Islamic Studies', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Fatima Zahra' },
  { id: 'c-isl-201', code: 'ISL-201', title: 'Hadith Sciences & Principles', subject: 'Islamic Studies', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-202', code: 'ISL-202', title: 'Arabic Grammar & Quranic Lexicon', subject: 'Islamic Studies', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Fatima Zahra' },
  { id: 'c-isl-301', code: 'ISL-301', title: 'Sirah of the Prophet & Early Islam', subject: 'Islamic Studies', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-302', code: 'ISL-302', title: 'History of Islamic Civilization', subject: 'Islamic Studies', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 17, assignedTeacher: 'Dr. Fatima Zahra' },
  { id: 'c-isl-401', code: 'ISL-401', title: 'Islamic Jurisprudence (Usul-ul-Fiqh)', subject: 'Islamic Studies', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 19, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-402', code: 'ISL-402', title: 'Fiqh al-Muamalat (Transactions)', subject: 'Islamic Studies', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 18, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-501', code: 'ISL-501', title: 'Comparative Study of World Religions', subject: 'Islamic Studies', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 20, assignedTeacher: 'Dr. Fatima Zahra' },
  { id: 'c-isl-502', code: 'ISL-502', title: 'Islamic Economic Framework', subject: 'Islamic Studies', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 21, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-601', code: 'ISL-601', title: 'Islamic History & Caliphates', subject: 'Islamic Studies', semester: 6, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 16, assignedTeacher: 'Dr. Fatima Zahra' },
  { id: 'c-isl-701', code: 'ISL-701', title: 'Philosophy of Islamic Law & Maqasid', subject: 'Islamic Studies', semester: 7, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 2, assignedTeacher: 'Prof. Dr. Tariq Mahmood' },
  { id: 'c-isl-801', code: 'ISL-801', title: 'Contemporary Challenges & Islamic Ethics', subject: 'Islamic Studies', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Fatima Zahra' },
  { id: 'c-isl-mid-4', code: 'ISL-MID-403', title: 'Da\'wah & Islamic Communication', subject: 'Islamic Studies', semester: 4, creditHours: 2, examType: 'Mid', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Fatima Zahra' },

  // ==================== SOCIOLOGY (19 Courses: 17 Final, 1 Mid, 1 Reappear · 17 submitted, 10 results) ====================
  { id: 'c-soc-101', code: 'SOC-101', title: 'Introduction to Sociology', subject: 'Sociology', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-102', code: 'SOC-102', title: 'Social Psychology', subject: 'Sociology', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-201', code: 'SOC-201', title: 'Social Institutions & Structure', subject: 'Sociology', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-202', code: 'SOC-202', title: 'Cultural Anthropology', subject: 'Sociology', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-301', code: 'SOC-301', title: 'Classical Sociological Theories', subject: 'Sociology', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-302', code: 'SOC-302', title: 'Urban Sociology & Demography', subject: 'Sociology', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-401', code: 'SOC-401', title: 'Quantitative Research Methods', subject: 'Sociology', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-402', code: 'SOC-402', title: 'Qualitative Research & Ethnography', subject: 'Sociology', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-501', code: 'SOC-501', title: 'Sociology of Development & Change', subject: 'Sociology', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-502', code: 'SOC-502', title: 'Rural Sociology & Peasant Studies', subject: 'Sociology', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-601', code: 'SOC-601', title: 'Gender Studies & Social Inequality', subject: 'Sociology', semester: 6, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 17, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-602', code: 'SOC-602', title: 'Population Studies & Migration', subject: 'Sociology', semester: 6, creditHours: 3, examType: 'Final', paperSubmitted: false, resultSubmitted: false, assignedTeacher: 'Dr. Bilal Qureshi' }, // STALLED PAPER 1
  { id: 'c-soc-701', code: 'SOC-701', title: 'Criminology & Social Deviance', subject: 'Sociology', semester: 7, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 19, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-702', code: 'SOC-702', title: 'Social Movements & Collective Action', subject: 'Sociology', semester: 7, creditHours: 3, examType: 'Final', paperSubmitted: false, resultSubmitted: false, assignedTeacher: 'Prof. Maria Santos' }, // STALLED PAPER 2
  { id: 'c-soc-801', code: 'SOC-801', title: 'Contemporary Sociological Perspectives', subject: 'Sociology', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 18, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-802', code: 'SOC-802', title: 'Community Organization & Practice', subject: 'Sociology', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 20, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-803', code: 'SOC-803', title: 'Environmental Sociology & Policy', subject: 'Sociology', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 22, assignedTeacher: 'Dr. Bilal Qureshi' },
  { id: 'c-soc-mid-2', code: 'SOC-MID-203', title: 'Sociology of Education', subject: 'Sociology', semester: 2, creditHours: 2, examType: 'Mid', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 16, assignedTeacher: 'Prof. Maria Santos' },
  { id: 'c-soc-rep-1', code: 'SOC-REP-101', title: 'Introduction to Sociology (Reappear)', subject: 'Sociology', semester: 1, creditHours: 3, examType: 'Reappear', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Bilal Qureshi' },

  // ==================== ZOOLOGY (18 Courses: 16 Final, 1 Mid, 1 Reappear · 15 submitted, 5 results) ====================
  { id: 'c-zoo-101', code: 'ZOO-101', title: 'Principles of Animal Life I', subject: 'Zoology', semester: 1, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Harrison Vance' },
  { id: 'c-zoo-102', code: 'ZOO-102', title: 'General Zoology Practical I', subject: 'Zoology', semester: 1, creditHours: 1, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-201', code: 'ZOO-201', title: 'Invertebrate Diversity & Morphology', subject: 'Zoology', semester: 2, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Harrison Vance' },
  { id: 'c-zoo-202', code: 'ZOO-202', title: 'General Zoology Practical II', subject: 'Zoology', semester: 2, creditHours: 1, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-301', code: 'ZOO-301', title: 'Chordate Diversity & Anatomy', subject: 'Zoology', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: true, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-302', code: 'ZOO-302', title: 'Animal Behavior & Ethology', subject: 'Zoology', semester: 3, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 17, assignedTeacher: 'Dr. Harrison Vance' },
  { id: 'c-zoo-401', code: 'ZOO-401', title: 'Cell & Molecular Biology', subject: 'Zoology', semester: 4, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 19, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-402', code: 'ZOO-402', title: 'Biological Techniques & Instrumentation', subject: 'Zoology', semester: 4, creditHours: 2, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 18, assignedTeacher: 'Dr. Harrison Vance' },
  { id: 'c-zoo-501', code: 'ZOO-501', title: 'Animal Physiology & Histology', subject: 'Zoology', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 20, assignedTeacher: 'Dr. Harrison Vance' },
  { id: 'c-zoo-502', code: 'ZOO-502', title: 'Comparative Endocrinology', subject: 'Zoology', semester: 5, creditHours: 3, examType: 'Final', paperSubmitted: false, resultSubmitted: false, assignedTeacher: 'Dr. Elena Rostova' }, // STALLED PAPER 3
  { id: 'c-zoo-601', code: 'ZOO-601', title: 'Genetics, Evolution & Speciation', subject: 'Zoology', semester: 6, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 21, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-602', code: 'ZOO-602', title: 'Paleontology & Zoogeography', subject: 'Zoology', semester: 6, creditHours: 3, examType: 'Final', paperSubmitted: false, resultSubmitted: false, assignedTeacher: 'Dr. Harrison Vance' }, // STALLED PAPER 4
  { id: 'c-zoo-701', code: 'ZOO-701', title: 'Ecology & Wildlife Conservation', subject: 'Zoology', semester: 7, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 2, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-702', code: 'ZOO-702', title: 'Fisheries & Aquaculture', subject: 'Zoology', semester: 7, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Harrison Vance' },
  { id: 'c-zoo-801', code: 'ZOO-801', title: 'Developmental Biology & Embryology', subject: 'Zoology', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-802', code: 'ZOO-802', title: 'Biostatistics & Bioinformatics', subject: 'Zoology', semester: 8, creditHours: 3, examType: 'Final', paperSubmitted: false, resultSubmitted: false, assignedTeacher: 'Dr. Harrison Vance' }, // STALLED PAPER 5
  { id: 'c-zoo-mid-3', code: 'ZOO-MID-303', title: 'Medical Entomology', subject: 'Zoology', semester: 3, creditHours: 2, examType: 'Mid', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Elena Rostova' },
  { id: 'c-zoo-rep-2', code: 'ZOO-REP-201', title: 'Invertebrate Diversity (Reappear)', subject: 'Zoology', semester: 2, creditHours: 3, examType: 'Reappear', paperSubmitted: true, resultSubmitted: false, resultDelayedDays: 1, assignedTeacher: 'Dr. Harrison Vance' },
];

// Institutional Duty Roster: 64 Examination Invigilation Duties (50 Confirmed, 14 Pending)
export const COLLEGE_DUTY_ROSTER: DutyRosterItem[] = COLLEGE_64_COURSES.map((course, idx) => {
  // First 50 are confirmed, remaining 14 are pending
  const isConfirmed = idx < 50;
  const halls = [
    'Jinnah Town Examination Hall A (Main Campus)',
    'Jinnah Town Examination Hall B (Humanities Block)',
    'Fatima Jinnah Auditorium',
    'Postgraduate Science Block - Hall 1',
    'Postgraduate Science Block - Hall 2',
  ];
  const hall = halls[idx % halls.length];
  const timeSlots = [
    '09:00 AM - 12:00 PM',
    '01:30 PM - 04:30 PM',
  ];
  const shift = (idx % 2 === 0 ? 'Morning Shift' : 'Evening Shift') as 'Morning Shift' | 'Evening Shift';
  const timeSlot = idx % 2 === 0 ? timeSlots[0] : timeSlots[1];

  const chiefInvigilators = [
    'Prof. Dr. Sarah Jenkins (English)',
    'Dr. Arthur Miller (English)',
    'Prof. Dr. Tariq Mahmood (Islamic Studies)',
    'Dr. Fatima Zahra (Islamic Studies)',
    'Dr. Bilal Qureshi (Sociology)',
    'Prof. Maria Santos (Sociology)',
    'Dr. Harrison Vance (Zoology)',
    'Dr. Elena Rostova (Zoology)',
  ];

  const assistantInvigilators = [
    'Lecturer Samina Kausar',
    'Lecturer Rubina Mengal',
    'Lecturer Farzana Baloch',
    'Lecturer Maryam Jamali',
    'Lecturer Shazia Achakzai',
    'Lecturer Naila Kakar',
  ];

  return {
    id: `duty-roster-${course.code.toLowerCase()}`,
    courseCode: course.code,
    courseTitle: course.title,
    subject: course.subject,
    examType: course.examType,
    examDate: `2026-10-${String((idx % 18) + 1).padStart(2, '0')}`,
    timeSlot,
    shift,
    hallLocation: hall,
    chiefInvigilator: chiefInvigilators[idx % chiefInvigilators.length],
    assistantInvigilator: assistantInvigilators[idx % assistantInvigilators.length],
    totalCandidates: 45 + (idx % 40),
    confirmed: isConfirmed,
    confirmedAt: isConfirmed ? '2026-09-14T10:30:00Z' : undefined,
    contactNumber: '+92 81 ' + (9201000 + idx),
  };
});
