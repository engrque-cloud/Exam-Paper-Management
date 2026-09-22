import { Course, SubjectType, SemesterNumber, TeacherProfile, ExamPaper, NotificationItem, ExamDateSheetRow } from '../types';

export const ALL_SUBJECTS: SubjectType[] = [
  'English',
  'Islamic Studies',
  'Sociology',
  'Zoology',
];

export const ALL_SEMESTERS: SemesterNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const COURSES_CATALOG: Course[] = [
  // English (8 Semesters)
  { id: 'c-eng-1', code: 'ENG-101', title: 'Functional English & Grammar', subject: 'English', semester: 1, creditHours: 3 },
  { id: 'c-eng-2', code: 'ENG-201', title: 'History of English Literature', subject: 'English', semester: 2, creditHours: 3 },
  { id: 'c-eng-3', code: 'ENG-301', title: 'Classical & Renaissance Poetry', subject: 'English', semester: 3, creditHours: 3 },
  { id: 'c-eng-4', code: 'ENG-401', title: 'Romantic & Victorian Literature', subject: 'English', semester: 4, creditHours: 3 },
  { id: 'c-eng-5', code: 'ENG-501', title: 'Linguistics & Phonetics', subject: 'English', semester: 5, creditHours: 3 },
  { id: 'c-eng-6', code: 'ENG-601', title: 'Modern Drama & Tragedy', subject: 'English', semester: 6, creditHours: 3 },
  { id: 'c-eng-7', code: 'ENG-701', title: 'Literary Theory & Criticism', subject: 'English', semester: 7, creditHours: 3 },
  { id: 'c-eng-8', code: 'ENG-801', title: 'Post-Colonial & World Literature', subject: 'English', semester: 8, creditHours: 3 },

  // Islamic Studies (8 Semesters)
  { id: 'c-isl-1', code: 'ISL-101', title: 'Ulum-ul-Quran & Exegesis', subject: 'Islamic Studies', semester: 1, creditHours: 3 },
  { id: 'c-isl-2', code: 'ISL-201', title: 'Hadith Sciences & Principles', subject: 'Islamic Studies', semester: 2, creditHours: 3 },
  { id: 'c-isl-3', code: 'ISL-301', title: 'Sirah of the Prophet & Early Islam', subject: 'Islamic Studies', semester: 3, creditHours: 3 },
  { id: 'c-isl-4', code: 'ISL-401', title: 'Islamic Jurisprudence (Usul-ul-Fiqh)', subject: 'Islamic Studies', semester: 4, creditHours: 3 },
  { id: 'c-isl-5', code: 'ISL-501', title: 'Comparative Study of World Religions', subject: 'Islamic Studies', semester: 5, creditHours: 3 },
  { id: 'c-isl-6', code: 'ISL-601', title: 'Islamic History & Caliphates', subject: 'Islamic Studies', semester: 6, creditHours: 3 },
  { id: 'c-isl-7', code: 'ISL-701', title: 'Philosophy of Islamic Law & Maqasid', subject: 'Islamic Studies', semester: 7, creditHours: 3 },
  { id: 'c-isl-8', code: 'ISL-801', title: 'Contemporary Challenges & Islamic Ethics', subject: 'Islamic Studies', semester: 8, creditHours: 3 },

  // Sociology (8 Semesters)
  { id: 'c-soc-1', code: 'SOC-101', title: 'Introduction to Sociology', subject: 'Sociology', semester: 1, creditHours: 3 },
  { id: 'c-soc-2', code: 'SOC-201', title: 'Social Institutions & Structure', subject: 'Sociology', semester: 2, creditHours: 3 },
  { id: 'c-soc-3', code: 'SOC-301', title: 'Classical Sociological Theories', subject: 'Sociology', semester: 3, creditHours: 3 },
  { id: 'c-soc-4', code: 'SOC-401', title: 'Quantitative & Qualitative Research Methods', subject: 'Sociology', semester: 4, creditHours: 3 },
  { id: 'c-soc-5', code: 'SOC-501', title: 'Sociology of Development & Change', subject: 'Sociology', semester: 5, creditHours: 3 },
  { id: 'c-soc-6', code: 'SOC-601', title: 'Gender Studies & Social Inequality', subject: 'Sociology', semester: 6, creditHours: 3 },
  { id: 'c-soc-7', code: 'SOC-701', title: 'Criminology & Social Deviance', subject: 'Sociology', semester: 7, creditHours: 3 },
  { id: 'c-soc-8', code: 'SOC-801', title: 'Contemporary Sociological Perspectives', subject: 'Sociology', semester: 8, creditHours: 3 },

  // Zoology (8 Semesters)
  { id: 'c-zoo-1', code: 'ZOO-101', title: 'Principles of Animal Life I', subject: 'Zoology', semester: 1, creditHours: 3 },
  { id: 'c-zoo-2', code: 'ZOO-201', title: 'Invertebrate Diversity & Morphology', subject: 'Zoology', semester: 2, creditHours: 3 },
  { id: 'c-zoo-3', code: 'ZOO-301', title: 'Chordate Diversity & Anatomy', subject: 'Zoology', semester: 3, creditHours: 3 },
  { id: 'c-zoo-4', code: 'ZOO-401', title: 'Cell & Molecular Biology', subject: 'Zoology', semester: 4, creditHours: 3 },
  { id: 'c-zoo-5', code: 'ZOO-501', title: 'Animal Physiology & Histology', subject: 'Zoology', semester: 5, creditHours: 3 },
  { id: 'c-zoo-6', code: 'ZOO-601', title: 'Genetics, Evolution & Speciation', subject: 'Zoology', semester: 6, creditHours: 3 },
  { id: 'c-zoo-7', code: 'ZOO-701', title: 'Ecology & Wildlife Conservation', subject: 'Zoology', semester: 7, creditHours: 3 },
  { id: 'c-zoo-8', code: 'ZOO-801', title: 'Developmental Biology & Zoogeography', subject: 'Zoology', semester: 8, creditHours: 3 },
];

export const TEACHER_PROFILES: TeacherProfile[] = [
  {
    id: 'tch-eng-1',
    name: 'Prof. Dr. Sarah Jenkins',
    email: 'sarah.jenkins@university.edu',
    phone: '+92 300 8371920',
    whatsappNumber: '+923008371920',
    department: 'English',
    assignedSemesters: [1, 3, 5, 7],
    designation: 'Professor & Chair, Dept of English',
    avatarColor: 'bg-indigo-600',
  },
  {
    id: 'tch-eng-2',
    name: 'Dr. Arthur Miller',
    email: 'arthur.miller@university.edu',
    phone: '+92 301 5529183',
    whatsappNumber: '+923015529183',
    department: 'English',
    assignedSemesters: [2, 4, 6, 8],
    designation: 'Associate Professor, English Literature',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'tch-isl-1',
    name: 'Prof. Dr. Tariq Mahmood',
    email: 'tariq.mahmood@university.edu',
    phone: '+92 333 7819024',
    whatsappNumber: '+923337819024',
    department: 'Islamic Studies',
    assignedSemesters: [1, 2, 4, 7],
    designation: 'Professor, Islamic Jurisprudence & Usul',
    avatarColor: 'bg-emerald-600',
  },
  {
    id: 'tch-isl-2',
    name: 'Dr. Fatima Zahra',
    email: 'fatima.zahra@university.edu',
    phone: '+92 321 4482019',
    whatsappNumber: '+923214482019',
    department: 'Islamic Studies',
    assignedSemesters: [3, 5, 6, 8],
    designation: 'Assistant Professor, Comparative Religions',
    avatarColor: 'bg-teal-600',
  },
  {
    id: 'tch-soc-1',
    name: 'Dr. Bilal Qureshi',
    email: 'bilal.qureshi@university.edu',
    phone: '+92 345 6671029',
    whatsappNumber: '+923456671029',
    department: 'Sociology',
    assignedSemesters: [1, 3, 4, 7],
    designation: 'Head of Sociology Department',
    avatarColor: 'bg-amber-600',
  },
  {
    id: 'tch-soc-2',
    name: 'Prof. Maria Santos',
    email: 'maria.santos@university.edu',
    phone: '+92 331 9082341',
    whatsappNumber: '+923319082341',
    department: 'Sociology',
    assignedSemesters: [2, 5, 6, 8],
    designation: 'Associate Professor, Social Theories',
    avatarColor: 'bg-orange-600',
  },
  {
    id: 'tch-zoo-1',
    name: 'Dr. Harrison Vance',
    email: 'harrison.vance@university.edu',
    phone: '+92 302 4478190',
    whatsappNumber: '+923024478190',
    department: 'Zoology',
    assignedSemesters: [1, 2, 5, 8],
    designation: 'Professor, Wildlife & Vertebrate Zoology',
    avatarColor: 'bg-cyan-700',
  },
  {
    id: 'tch-zoo-2',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@university.edu',
    phone: '+92 312 8891045',
    whatsappNumber: '+923128891045',
    department: 'Zoology',
    assignedSemesters: [3, 4, 6, 7],
    designation: 'Assistant Professor, Molecular Biology',
    avatarColor: 'bg-rose-600',
  },
];

// Helper to generate sample question sections for subjects
export function getSampleQuestionsForCourse(course: Course): ExamPaper['sections'] {
  if (course.subject === 'English') {
    return [
      {
        title: 'Section A: Objective & Conceptual Comprehension',
        marks: 20,
        instructions: 'Answer all 4 questions. Each carries 5 marks.',
        questions: [
          { qNum: 'Q1', text: `Explain the thematic significance of narrative technique in the context of ${course.title}.`, marks: 5 },
          { qNum: 'Q2', text: 'Differentiate between prescriptive and descriptive grammar with concrete stylistic examples.', marks: 5 },
          { qNum: 'Q3', text: 'Identify and analyze the poetic devices employed in classical lyric verse.', marks: 5 },
          { qNum: 'Q4', text: 'Evaluate the sociolinguistic impact of language shifts in post-colonial literature.', marks: 5 },
        ],
      },
      {
        title: 'Section B: Critical Analysis & Analytical Essay',
        marks: 30,
        instructions: 'Attempt any 2 of the following 3 questions. Each carries 15 marks.',
        questions: [
          { qNum: 'Q5', text: `Conduct an in-depth textual critique illustrating how character conflict mirrors societal transformation in ${course.title}.`, marks: 15 },
          { qNum: 'Q6', text: 'Critically examine the philosophical debates underpinning the transition from Romanticism to Victorian Realism.', marks: 15 },
          { qNum: 'Q7', text: 'Synthesize the post-modernist discourse on authorial intent and reader-response theory.', marks: 15 },
        ],
      },
    ];
  } else if (course.subject === 'Islamic Studies') {
    return [
      {
        title: 'Section A: Foundational Concepts & Terminology',
        marks: 20,
        instructions: 'Answer all questions concisely. Each question carries 5 marks.',
        questions: [
          { qNum: 'Q1', text: `Elucidate the primary methodologies of textual analysis utilized in ${course.title}.`, marks: 5 },
          { qNum: 'Q2', text: 'Define the classification of Hadith narrations with reference to Isnad and Matn integrity.', marks: 5 },
          { qNum: 'Q3', text: 'Summarize the core principles governing Ijtihad and Qiyas in classical jurisprudence.', marks: 5 },
          { qNum: 'Q4', text: 'Discuss the historical compilation epochs of early Islamic canonical literature.', marks: 5 },
        ],
      },
      {
        title: 'Section B: Research & Jurisprudential Discourse',
        marks: 30,
        instructions: 'Attempt any two comprehensive questions. Each carries 15 marks.',
        questions: [
          { qNum: 'Q5', text: `Analyze the contemporary application of Maqasid al-Shariah (Higher Objectives) in addressing socio-economic dilemmas.`, marks: 15 },
          { qNum: 'Q6', text: 'Provide a comparative study of ethical frameworks between Islamic philosophy and early Hellenistic thought.', marks: 15 },
          { qNum: 'Q7', text: 'Examine the Charter of Medina (Mithaq al-Madina) as a seminal framework for constitutional pluralism.', marks: 15 },
        ],
      },
    ];
  } else if (course.subject === 'Sociology') {
    return [
      {
        title: 'Section A: Theoretical Foundations & Definitions',
        marks: 20,
        instructions: 'Answer all questions concisely. Each question carries 5 marks.',
        questions: [
          { qNum: 'Q1', text: `Define primary paradigms in ${course.title} and distinguish between structural functionalism and conflict theory.`, marks: 5 },
          { qNum: 'Q2', text: 'Explain the socialization mechanisms within secondary institutions in rapid urbanizing zones.', marks: 5 },
          { qNum: 'Q3', text: 'Compare qualitative ethnography with quantitative survey methodologies in empirical research.', marks: 5 },
          { qNum: 'Q4', text: 'Outline Robert Merton\'s typology of deviance and adaptation modes.', marks: 5 },
        ],
      },
      {
        title: 'Section B: Applied Sociological Analysis',
        marks: 30,
        instructions: 'Attempt any two analytical questions. Each carries 15 marks.',
        questions: [
          { qNum: 'Q5', text: 'Critically assess how globalization accelerates cultural hybridization and structural stratification in developing societies.', marks: 15 },
          { qNum: 'Q6', text: 'Evaluate the intersection of gender, social capital, and economic mobility in contemporary institutions.', marks: 15 },
          { qNum: 'Q7', text: 'Synthesize Michel Foucault\'s concept of panopticism and surveillance in modern institutional sociology.', marks: 15 },
        ],
      },
    ];
  } else {
    // Zoology
    return [
      {
        title: 'Section A: Anatomy, Morphology & Cellular Fundamentals',
        marks: 20,
        instructions: 'Answer all 4 questions. Each carries 5 marks.',
        questions: [
          { qNum: 'Q1', text: `Describe the physiological adaptations observed in marine taxa related to ${course.title}.`, marks: 5 },
          { qNum: 'Q2', text: 'Compare the respiratory gas-exchange mechanisms between Amphibia and Aves.', marks: 5 },
          { qNum: 'Q3', text: 'Outline the sequence of mitosis and checkpoints governing eukaryotic cell division.', marks: 5 },
          { qNum: 'Q4', text: 'Explain Hardy-Weinberg equilibrium principles and factors causing evolutionary divergence.', marks: 5 },
        ],
      },
      {
        title: 'Section B: Advanced Physiological & Ecological Critique',
        marks: 30,
        instructions: 'Attempt any two comprehensive questions. Each carries 15 marks.',
        questions: [
          { qNum: 'Q5', text: 'Detail the neuroendocrine feedback loop orchestrating osmoregulation in freshwater and saltwater teleosts.', marks: 15 },
          { qNum: 'Q6', text: 'Analyze the trophic cascade impacts resulting from apex predator depletion in temperate biomes.', marks: 15 },
          { qNum: 'Q7', text: 'Discuss modern molecular gene editing (CRISPR-Cas9) applications in conservation genetics and zoological taxonomy.', marks: 15 },
        ],
      },
    ];
  }
}

// Initial pre-seeded mock database illustrating all states:
// 1. One paper QA Approved -> Principal Date Sheet row generated
// 2. One paper QA Rejected -> Teacher notified with remarks and ready for re-upload
// 3. One paper Pending QA -> QA reviewer can inspect, approve, or reject
// 4. Initial notification from Admin to teachers
export const INITIAL_EXAM_PAPERS: ExamPaper[] = [
  // 1. Approved English Paper -> Automatically has generated Date Sheet row
  {
    id: 'paper-eng-101',
    courseCode: 'ENG-101',
    courseTitle: 'Functional English & Grammar',
    subject: 'English',
    semester: 1,
    creditHours: 3,
    teacherId: 'tch-eng-1',
    teacherName: 'Prof. Dr. Sarah Jenkins',
    teacherEmail: 'sarah.jenkins@university.edu',
    examType: 'Final Term Examination',
    academicSession: 'Fall 2026',
    totalMarks: 50,
    durationMinutes: 120,
    file: {
      name: 'ENG101_Final_Question_Paper_2026.pdf',
      type: 'pdf',
      sizeKb: 342,
      uploadedAt: '2026-09-10T10:30:00Z',
    },
    sections: [
      {
        title: 'Section A: Grammar & Comprehension',
        marks: 20,
        instructions: 'Attempt all questions.',
        questions: [
          { qNum: 'Q1', text: 'Identify the grammatical errors in the paragraph and reconstruct sentences with accurate syntax.', marks: 10 },
          { qNum: 'Q2', text: 'Write a persuasive précis of 120 words summarizing the environmental conservation excerpt.', marks: 10 },
        ],
      },
      {
        title: 'Section B: Academic Composition & Argumentation',
        marks: 30,
        instructions: 'Attempt two questions. Each carries 15 marks.',
        questions: [
          { qNum: 'Q3', text: 'Draft a formal academic policy memo on integrating AI-assisted learning into tertiary curricula.', marks: 15 },
          { qNum: 'Q4', text: 'Critically analyze how tone and rhetorical register dictate persuasive discourse in modern journalism.', marks: 15 },
        ],
      },
    ],
    status: 'qa_approved',
    version: 1,
    qaReview: {
      reviewedBy: 'Dr. Marcus Sterling (Senior QA Examiner)',
      reviewedAt: '2026-09-12T14:15:00Z',
      verdict: 'approved',
      rubricScores: {
        curriculumAlignment: true,
        marksTallyAccuracy: true,
        difficultyDistribution: true,
        formattingStandard: true,
        bloomsTaxonomy: true,
      },
      feedbackNotes: 'Exemplary paper. Total marks match 50 exactly. Strong adherence to Bloom\'s Taxonomy with balanced 40% foundational and 60% higher-order analytical evaluation. Ready for printing.',
    },
    createdAt: '2026-09-10T10:30:00Z',
    updatedAt: '2026-09-12T14:15:00Z',
  },

  // 2. Approved Islamic Studies Paper -> Also shows in Principal Date Sheet
  {
    id: 'paper-isl-201',
    courseCode: 'ISL-201',
    courseTitle: 'Hadith Sciences & Principles',
    subject: 'Islamic Studies',
    semester: 2,
    creditHours: 3,
    teacherId: 'tch-isl-1',
    teacherName: 'Prof. Dr. Tariq Mahmood',
    teacherEmail: 'tariq.mahmood@university.edu',
    examType: 'Final Term Examination',
    academicSession: 'Fall 2026',
    totalMarks: 50,
    durationMinutes: 120,
    file: {
      name: 'ISL201_Hadith_Sciences_Final_Exam.docx',
      type: 'docx',
      sizeKb: 215,
      uploadedAt: '2026-09-11T09:00:00Z',
    },
    sections: [
      {
        title: 'Section A: Sanad & Matn Principles',
        marks: 20,
        questions: [
          { qNum: 'Q1', text: 'Define Hadith Mutawatir and Hadith Ahad with classical jurisprudential parameters.', marks: 10 },
          { qNum: 'Q2', text: 'Examine the criteria formulated by Imam Bukhari for transmitter trustworthiness (Thiqa).', marks: 10 },
        ],
      },
      {
        title: 'Section B: Critical Evaluation & Exegesis',
        marks: 30,
        questions: [
          { qNum: 'Q3', text: 'Analyze the historical development of Asma-ur-Rijal as a biographical evaluation science.', marks: 15 },
          { qNum: 'Q4', text: 'Evaluate the methodology used to resolve apparent contradictions (Mukhtalif al-Hadith).', marks: 15 },
        ],
      },
    ],
    status: 'qa_approved',
    version: 1,
    qaReview: {
      reviewedBy: 'Prof. Amina Al-Husseini (QA Committee)',
      reviewedAt: '2026-09-13T11:20:00Z',
      verdict: 'approved',
      rubricScores: {
        curriculumAlignment: true,
        marksTallyAccuracy: true,
        difficultyDistribution: true,
        formattingStandard: true,
        bloomsTaxonomy: true,
      },
      feedbackNotes: 'Verified without reservations. Marks tally properly, comprehensive coverage of syllabus syllabus chapters 1 through 6.',
    },
    createdAt: '2026-09-11T09:00:00Z',
    updatedAt: '2026-09-13T11:20:00Z',
  },

  // 3. Rejected Sociology Paper -> Demonstrates the rejection notification & re-upload workflow!
  {
    id: 'paper-soc-401',
    courseCode: 'SOC-401',
    courseTitle: 'Quantitative & Qualitative Research Methods',
    subject: 'Sociology',
    semester: 4,
    creditHours: 3,
    teacherId: 'tch-soc-1',
    teacherName: 'Dr. Bilal Qureshi',
    teacherEmail: 'bilal.qureshi@university.edu',
    examType: 'Final Term Examination',
    academicSession: 'Fall 2026',
    totalMarks: 50,
    durationMinutes: 120,
    file: {
      name: 'SOC401_Research_Methods_Draft1.docx',
      type: 'docx',
      sizeKb: 180,
      uploadedAt: '2026-09-13T16:00:00Z',
    },
    sections: [
      {
        title: 'Section A: Methodology MCQs & Short Notes',
        marks: 15,
        questions: [
          { qNum: 'Q1', text: 'What is sampling bias?', marks: 5 },
          { qNum: 'Q2', text: 'Define independent and dependent variables.', marks: 10 },
        ],
      },
      {
        title: 'Section B: Research Design',
        marks: 25,
        questions: [
          { qNum: 'Q3', text: 'Design an empirical survey measuring digital inequality across rural school districts.', marks: 25 },
        ],
      },
    ],
    status: 'qa_rejected',
    version: 1,
    revisionHistory: [
      {
        version: 1,
        uploadedAt: '2026-09-13T16:00:00Z',
        fileName: 'SOC401_Research_Methods_Draft1.docx',
        reason: 'Initial submission rejected by QA',
      },
    ],
    qaReview: {
      reviewedBy: 'Dr. Clara Vance (QA Specialist)',
      reviewedAt: '2026-09-14T10:10:00Z',
      verdict: 'rejected',
      rubricScores: {
        curriculumAlignment: true,
        marksTallyAccuracy: false,
        difficultyDistribution: false,
        formattingStandard: false,
        bloomsTaxonomy: false,
      },
      rejectionReasons: [
        'Total marks sum to 40 marks instead of the stipulated 50 marks (Section A: 15 + Section B: 25 = 40).',
        'Section B lacks alternative elective choice questions required by university examination standard.',
        'Document missing mandatory candidate instruction block and university exam header format.',
      ],
      feedbackNotes: 'Please correct the marks breakdown to total exactly 50. Add elective choices in Section B (e.g. attempt 2 out of 3 questions) and attach official examination instructions before re-uploading.',
    },
    createdAt: '2026-09-13T16:00:00Z',
    updatedAt: '2026-09-14T10:10:00Z',
  },

  // 4. Pending QA Paper -> Ready for QA Checker to inspect right now
  {
    id: 'paper-zoo-301',
    courseCode: 'ZOO-301',
    courseTitle: 'Chordate Diversity & Anatomy',
    subject: 'Zoology',
    semester: 3,
    creditHours: 4,
    teacherId: 'tch-zoo-2',
    teacherName: 'Dr. Elena Rostova',
    teacherEmail: 'elena.rostova@university.edu',
    examType: 'Final Term Examination',
    academicSession: 'Fall 2026',
    totalMarks: 50,
    durationMinutes: 120,
    file: {
      name: 'ZOO301_Chordates_Final_2026.pdf',
      type: 'pdf',
      sizeKb: 489,
      uploadedAt: '2026-09-15T08:45:00Z',
    },
    sections: [
      {
        title: 'Section A: Anatomy & Morphological Diagnostics',
        marks: 20,
        instructions: 'Answer all 4 questions. 5 marks each.',
        questions: [
          { qNum: 'Q1', text: 'Detail the evolutionary transition of aortic arches in vertebrate classes.', marks: 5 },
          { qNum: 'Q2', text: 'Describe the anatomical structure and hydrostatic function of the swim bladder in Osteichthyes.', marks: 5 },
          { qNum: 'Q3', text: 'Contrast the integumentary dermal modifications between Reptilia and Amphibia.', marks: 5 },
          { qNum: 'Q4', text: 'Provide a labeled schematic explanation of the avian respiratory air-sac system.', marks: 5 },
        ],
      },
      {
        title: 'Section B: Phylogenetic & Comparative Zoology',
        marks: 30,
        instructions: 'Attempt any two comprehensive questions (15 marks each).',
        questions: [
          { qNum: 'Q5', text: 'Discuss the adaptive radiation of mammals in the Cenozoic era with emphasis on dentition and limb locomotion.', marks: 15 },
          { qNum: 'Q6', text: 'Critically analyze the origin of tetrapods from rhipidistian sarcopterygians with anatomical fossil evidence.', marks: 15 },
          { qNum: 'Q7', text: 'Evaluate the ecological significance of echolocation and flight aerodynamics in Chiroptera.', marks: 15 },
        ],
      },
    ],
    status: 'pending_qa',
    version: 1,
    createdAt: '2026-09-15T08:45:00Z',
    updatedAt: '2026-09-15T08:45:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-admin-call-1',
    senderRole: 'admin',
    senderName: 'Controller of Examinations (Admin)',
    recipientRole: 'teacher',
    title: 'OFFICIAL NOTICE: Submit Final Term Exam Papers (PDF / DOCX)',
    message: 'All Department Faculty (English, Islamic Studies, Sociology, Zoology - Semesters 1 to 8) are directed to upload comprehensive question papers in PDF or DOCX format for the upcoming Fall 2026 Examinations. Strict compliance with QA rubrics required.',
    type: 'exam_call',
    timestamp: '2026-09-08T08:00:00Z',
    isRead: false,
    deadline: '2026-09-22',
  },
  {
    id: 'notif-rejection-soc-401',
    senderRole: 'qa',
    senderName: 'QA Examination Review Board',
    recipientRole: 'teacher',
    recipientId: 'tch-soc-1',
    title: 'URGENT: Paper Rejected - Revision Required for SOC-401',
    message: 'Your exam paper for SOC-401 (Quantitative & Qualitative Research Methods, Semester 4) was rejected by QA due to marks tally mismatch (total 40 instead of 50) and missing elective options. Please re-upload immediately.',
    type: 'rejection_alert',
    timestamp: '2026-09-14T10:11:00Z',
    isRead: false,
    relatedPaperId: 'paper-soc-401',
  },
  {
    id: 'notif-qa-ready-zoo-301',
    senderRole: 'teacher',
    senderName: 'Dr. Elena Rostova (Zoology)',
    recipientRole: 'qa',
    title: 'New Exam Paper Submitted for QA: ZOO-301',
    message: 'Paper uploaded for ZOO-301 (Chordate Diversity & Anatomy, Semester 3). Ready for quality assurance checks and sign-off.',
    type: 'exam_call',
    timestamp: '2026-09-15T08:46:00Z',
    isRead: false,
    relatedPaperId: 'paper-zoo-301',
  },
  {
    id: 'notif-principal-eng-101',
    senderRole: 'qa',
    senderName: 'QA Examination Review Board',
    recipientRole: 'principal',
    title: 'Paper Approved & Date Sheet Generated: ENG-101',
    message: 'ENG-101 (Functional English, Semester 1) has been certified by QA. Automated exam schedule row generated on Principal Date Sheet.',
    type: 'approval_notice',
    timestamp: '2026-09-12T14:16:00Z',
    isRead: false,
    relatedPaperId: 'paper-eng-101',
  },
];

// Administrator Date Sheet initial rows with 5-day before paper upload deadlines & teacher duty assignments
export const INITIAL_DATE_SHEET_ROWS: ExamDateSheetRow[] = [
  {
    id: 'ds-eng-101',
    paperId: 'paper-eng-101',
    subject: 'English',
    semester: 1,
    courseCode: 'ENG-101',
    courseTitle: 'Functional English & Grammar',
    examDate: '2026-10-05',
    dayOfWeek: 'Monday',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    shift: 'Morning Shift',
    hallLocation: 'Hall A (Room 101 - Humanities Block)',
    chiefInvigilator: 'Prof. Dr. Tariq Mahmood',
    chiefInvigilatorTeacherId: 'tch-isl-1',
    chiefInvigilatorPhone: '+92 333 7819024',
    assistantInvigilator: 'Dr. Bilal Qureshi',
    assistantInvigilatorTeacherId: 'tch-soc-1',
    assistantInvigilatorPhone: '+92 345 6671029',
    paperSetterTeacherId: 'tch-eng-1',
    paperSetterTeacherName: 'Prof. Dr. Sarah Jenkins',
    paperSetterTeacherPhone: '+92 300 8371920',
    paperUploadDeadline: '2026-09-30', // Exactly 5 days before 2026-10-05
    paperUploaded: true,
    whatsappNoticeSent: true,
    whatsappSentAt: '2026-09-18T09:30:00Z',
    totalCandidates: 85,
    status: 'Verified',
    paperVersion: 1,
  },
  {
    id: 'ds-isl-201',
    paperId: 'paper-isl-201',
    subject: 'Islamic Studies',
    semester: 2,
    courseCode: 'ISL-201',
    courseTitle: 'Hadith Sciences & Principles',
    examDate: '2026-10-07',
    dayOfWeek: 'Wednesday',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    shift: 'Morning Shift',
    hallLocation: 'Al-Farabi Auditorium (Main Campus)',
    chiefInvigilator: 'Dr. Arthur Miller',
    chiefInvigilatorTeacherId: 'tch-eng-2',
    chiefInvigilatorPhone: '+92 301 5529183',
    assistantInvigilator: 'Dr. Elena Rostova',
    assistantInvigilatorTeacherId: 'tch-zoo-2',
    assistantInvigilatorPhone: '+92 312 8891045',
    paperSetterTeacherId: 'tch-isl-1',
    paperSetterTeacherName: 'Prof. Dr. Tariq Mahmood',
    paperSetterTeacherPhone: '+92 333 7819024',
    paperUploadDeadline: '2026-10-02', // Exactly 5 days before 2026-10-07
    paperUploaded: true,
    whatsappNoticeSent: true,
    whatsappSentAt: '2026-09-18T09:35:00Z',
    totalCandidates: 72,
    status: 'Verified',
    paperVersion: 1,
  },
  {
    id: 'ds-soc-401',
    paperId: 'paper-soc-401',
    subject: 'Sociology',
    semester: 4,
    courseCode: 'SOC-401',
    courseTitle: 'Research Methodology & Quantitative Analysis',
    examDate: '2026-10-12',
    dayOfWeek: 'Monday',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    shift: 'Evening Shift',
    hallLocation: 'Hall C (Room 204 - Social Sciences Complex)',
    chiefInvigilator: 'Prof. Maria Santos',
    chiefInvigilatorTeacherId: 'tch-soc-2',
    chiefInvigilatorPhone: '+92 331 9082341',
    assistantInvigilator: 'Dr. Harrison Vance',
    assistantInvigilatorTeacherId: 'tch-zoo-1',
    assistantInvigilatorPhone: '+92 302 4478190',
    paperSetterTeacherId: 'tch-soc-1',
    paperSetterTeacherName: 'Dr. Bilal Qureshi',
    paperSetterTeacherPhone: '+92 345 6671029',
    paperUploadDeadline: '2026-10-07', // Exactly 5 days before 2026-10-12
    paperUploaded: false, // In revision / re-upload
    whatsappNoticeSent: false,
    totalCandidates: 68,
    status: 'Scheduled',
    paperVersion: 1,
  },
  {
    id: 'ds-zoo-301',
    paperId: 'paper-zoo-301',
    subject: 'Zoology',
    semester: 3,
    courseCode: 'ZOO-301',
    courseTitle: 'Chordate Diversity & Anatomy',
    examDate: '2026-10-15',
    dayOfWeek: 'Thursday',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    shift: 'Morning Shift',
    hallLocation: 'Darwin Science Amphitheater (Bio Block)',
    chiefInvigilator: 'Prof. Dr. Sarah Jenkins',
    chiefInvigilatorTeacherId: 'tch-eng-1',
    chiefInvigilatorPhone: '+92 300 8371920',
    assistantInvigilator: 'Dr. Fatima Zahra',
    assistantInvigilatorTeacherId: 'tch-isl-2',
    assistantInvigilatorPhone: '+92 321 4482019',
    paperSetterTeacherId: 'tch-zoo-2',
    paperSetterTeacherName: 'Dr. Elena Rostova',
    paperSetterTeacherPhone: '+92 312 8891045',
    paperUploadDeadline: '2026-10-10', // Exactly 5 days before 2026-10-15
    paperUploaded: true,
    whatsappNoticeSent: false,
    totalCandidates: 74,
    status: 'Scheduled',
    paperVersion: 1,
  },
];
