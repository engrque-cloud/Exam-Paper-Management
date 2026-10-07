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

// Teachers, Employees, and QA data cleared to nil
export const TEACHER_PROFILES: TeacherProfile[] = [];

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

// All mock papers, notifications, and date sheet entries cleared to nil for clean development.
export const INITIAL_EXAM_PAPERS: ExamPaper[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_DATE_SHEET_ROWS: ExamDateSheetRow[] = [];
