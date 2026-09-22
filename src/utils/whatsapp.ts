import { COLLEGE_METADATA } from '../data/collegeData';

/**
 * Standardize and clean phone numbers for WhatsApp wa.me links
 * e.g. +92 300 8371920 -> 923008371920
 * 0300-1234567 -> 923001234567
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '923008371920'; // default institutional test line
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Format phone nicely for display (e.g. 923001234567 -> +92 300 1234567)
 */
export function formatDisplayPhone(phone?: string): string {
  if (!phone) return '+92 300 8371920';
  const clean = cleanPhoneNumber(phone);
  if (clean.startsWith('92') && clean.length === 12) {
    return `+92 ${clean.substring(2, 5)} ${clean.substring(5)}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

/**
 * Trigger mail client for email delivery
 */
export function openMailClient(to: string, subject: string, body: string): void {
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

/**
 * Formatted official approval credentials email generator
 */
export function generateApprovalEmailContent(params: {
  name: string;
  email: string;
  password?: string;
  role: string;
  department?: string;
  approvedBy?: string;
  portalUrl?: string;
}) {
  const subject = `Official Account Approved: Your Login Credentials - ${COLLEGE_METADATA.institutionName}`;
  const body = `Dear ${params.name},

Assalam-o-Alaikum,

Your registration for the Examination Management System at ${COLLEGE_METADATA.institutionName}, ${COLLEGE_METADATA.campus} has been officially verified and APPROVED by ${params.approvedBy || 'the Controller of Examinations'}.

Institutional examination portal access privileges are now active.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICIAL LOGIN CREDENTIALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL: ${params.portalUrl || window.location.origin}
Username / Email: ${params.email}
Password: ${params.password || 'Teacher@123'}
Assigned Role: ${params.role.toUpperCase()}
${params.department ? `Academic Department: ${params.department}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS:
1. Sign in to the portal using your username and password.
2. Review paper submission cutoff deadlines for the upcoming semester examinations.
3. Upload finalized question papers for QA review before the cutoff date.

For security, please keep your login credentials strictly confidential.

Office of the Controller of Examinations
${COLLEGE_METADATA.institutionName}, ${COLLEGE_METADATA.campus}
Helpline: ${COLLEGE_METADATA.contactPhone}`;

  return { subject, body };
}

/**
 * Generate official WhatsApp direct link
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Trigger 1-click open of WhatsApp Web / App
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = generateWhatsAppLink(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Compute the paper upload deadline (strictly 5 days before the date sheet exam date)
 */
export function computePaperUploadDeadline(examDateStr: string, daysBefore: number = 5): string {
  if (!examDateStr) return '';
  try {
    const date = new Date(examDateStr + 'T00:00:00');
    date.setDate(date.getDate() - daysBefore);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return examDateStr;
  }
}

/**
 * Format a date string (YYYY-MM-DD) into readable format, e.g. "Oct 15, 2026"
 */
export function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export type WhatsAppTemplateType =
  | 'paper_reminder'
  | 'qa_revision'
  | 'invigilation'
  | 'datesheet_paper_upload'
  | 'datesheet_duty_order'
  | 'result_overdue'
  | 'session_concluded'
  | 'custom'
  | 'account_approved';

/**
 * Official WhatsApp Notification Templates
 */
export const WhatsAppTemplates = {
  // 1. Urgent Question Paper Submission Cutoff Reminder
  paperSubmissionReminder: (params: {
    teacherName: string;
    courseCode: string;
    courseTitle: string;
    department: string;
    deadlineDate: string;
    deadlineTime: string;
    daysLeft: number;
    portalUrl?: string;
  }) => {
    const isUrgent = params.daysLeft <= 3;
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📍 *${COLLEGE_METADATA.campus} · Examination Regulatory Division*
────────────────────────
⚠️ *OFFICIAL DIRECTIVE: QUESTION PAPER SUBMISSION*

Dear *${params.teacherName}*,
Assalam-o-Alaikum,

This is an administrative notification from the Office of the Controller of Examinations regarding question paper submission:

📚 *Course:* ${params.courseCode} — ${params.courseTitle}
🏛️ *Department:* ${params.department}
⏳ *Cutoff Deadline:* *${params.deadlineDate}* at *${params.deadlineTime}*
⚡ *Status:* ${params.daysLeft > 0 ? `${params.daysLeft} Day(s) Remaining` : 'DEADLINE CUTOFF REACHED'}

${isUrgent ? '🚨 *URGENT NOTICE:* The institutional moderation window is closing. Prompt submission is mandatory to prevent exam schedule postponement.' : 'Kindly review the curriculum blueprint and upload the bilingual question paper with marking rubrics through the faculty portal.'}

🔗 *Faculty Portal Login:* ${window.location.origin}
📞 *Exam Helpline:* ${COLLEGE_METADATA.contactPhone}

_Issued with the approval of Principal & CAO Prof. Dr. Bilquis Jahan._`;
  },

  // 2. QA Moderation Revision Required Alert
  qaRevisionNotice: (params: {
    teacherName: string;
    courseCode: string;
    courseTitle: string;
    reviewerName?: string;
    feedbackNotes: string;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
🔬 *Quality Assurance & Paper Moderation Committee*
────────────────────────
📋 *ACTION REQUIRED: QUESTION PAPER REVISION*

Respected *${params.teacherName}*,

Your question paper for *${params.courseCode} (${params.courseTitle})* has been reviewed by the QA Moderation Board.

🔍 *Moderator:* ${params.reviewerName || 'QA Committee Board'}
📝 *Reviewer Feedback:*
"${params.feedbackNotes}"

Please log in to the examination portal to upload the revised draft so your paper can receive final certification and date sheet scheduling.

🔗 *Portal:* ${window.location.origin}

_Examination QA Secretariat_`;
  },

  // 3. Examination Date Sheet & Invigilation Duty Notification
  invigilationDuty: (params: {
    teacherName: string;
    examDate: string;
    shift: 'Morning (09:00 AM – 12:00 PM)' | 'Evening (02:00 PM – 05:00 PM)' | string;
    hallName: string;
    courseCode: string;
    courseTitle: string;
    role: string;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📅 *OFFICIAL EXAMINATION DUTY ORDER*
────────────────────────
Honorable *${params.teacherName}*,

You have been assigned examination invigilation duty as per the approved institutional date sheet:

📆 *Date:* *${params.examDate}*
⏰ *Shift & Timing:* *${params.shift}*
🏢 *Center / Hall:* *${params.hallName}*
📖 *Paper:* ${params.courseCode} — ${params.courseTitle}
🛡️ *Assigned Role:* *${params.role}*

📌 *Directives:*
1. Report to the Chief Invigilator *30 minutes* prior to paper distribution.
2. Ensure strict compliance with mobile phone bans in examination halls.

_Controller of Examinations Secretariat_`;
  },

  // 4. Pending Exam Result / Gazette Overdue Notice
  resultOverdueNotice: (params: {
    teacherName: string;
    courseCode: string;
    courseTitle: string;
    daysOverdue: number;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📊 *Controller of Examinations Secretariat*
────────────────────────
⚠️ *URGENT REMINDER: EXAM RESULT SUBMISSION*

Dear *${params.teacherName}*,

According to university examination regulations, student result awards must be compiled within *15 days* of paper conduction.

📚 *Course:* *${params.courseCode}* — ${params.courseTitle}
⏳ *Delay Status:* *${params.daysOverdue} Days* past target deadline

The institutional gazette cannot be ratified without your course award ledger. Kindly finalize student internal/external marks and submit via the portal today.

🔗 *Submit Gazette Ledger:* ${window.location.origin}

_Office of the Principal & Controller of Examinations_`;
  },

  // 5. Session Conclusion & Archive Notice
  sessionConcludedNotice: (params: {
    sessionName: string;
    totalCourses: number;
    gazettedResults: number;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
🎓 *ACADEMIC SESSION CONCLUSION GAZETTE*
────────────────────────
📢 *Official Announcement for Faculty & Department Chairs*

The Principal has officially certified and concluded *Academic Session ${params.sessionName}*:

✅ *Total Courses Audited:* ${params.totalCourses}
✅ *Papers Sealed & Archived:* ${params.totalCourses}
✅ *Exam Gazettes Ratified:* ${params.gazettedResults}

All examination records, turnaround logs, and student ledgers are now permanently sealed in institutional archives. Thank you for your diligence and academic excellence.

_Prof. Dr. Bilquis Jahan (Principal)_`;
  },

  // 6. Date Sheet Announcement & 5-Day Paper Upload Deadline Order
  dateSheetPaperUploadNotice: (params: {
    teacherName: string;
    courseCode: string;
    courseTitle: string;
    department: string;
    semester: number | string;
    examDate: string;
    dayOfWeek?: string;
    startTime: string;
    endTime: string;
    shift: string;
    hallLocation: string;
    uploadDaysBefore?: number;
    uploadDeadline: string; // configurable days before exam date
    portalUrl?: string;
  }) => {
    const days = params.uploadDaysBefore || 5;
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📅 *OFFICIAL DATE SHEET: QUESTION PAPER UPLOAD DIRECTIVE*
────────────────────────
Respected *${params.teacherName}*,
Assalam-o-Alaikum,

The Institutional Examination Date Sheet has been prepared by the Administrator / Controller of Examinations:

📚 *Course:* *${params.courseCode}* — ${params.courseTitle}
🏛️ *Department:* ${params.department} (Semester ${params.semester})
📆 *Exam Date:* *${params.examDate}* ${params.dayOfWeek ? `(${params.dayOfWeek})` : ''}
⏰ *Exam Timing:* *${params.startTime} – ${params.endTime}* [${params.shift}]
🏢 *Exam Hall / Room:* *${params.hallLocation}*

⚠️ *MANDATORY ${days}-DAY PAPER UPLOAD DEADLINE:*
According to university examination protocol, question paper upload is strictly required *${days} days prior to the date sheet exam date*:
👉 *SUBMIT PAPER ON OR BEFORE: ${params.uploadDeadline}*

Please ensure your question paper is prepared in official PDF or DOCX format with Bloom's Taxonomy rubrics and uploaded via the faculty portal prior to cutoff.

🔗 *Faculty Portal Login:* ${params.portalUrl || window.location.origin}
📞 *Exam Control Cell:* ${COLLEGE_METADATA.contactPhone}

_Issued by the Controller of Examinations & Administration_`;
  },

  // 7. Official Examination Duty Order (Invigilator / Chief Invigilator)
  dateSheetDutyOrderNotice: (params: {
    teacherName: string;
    dutyRole: string; // Chief Invigilator / Assistant Invigilator
    courseCode: string;
    courseTitle: string;
    examDate: string;
    dayOfWeek?: string;
    startTime: string;
    endTime: string;
    shift: string;
    hallLocation: string;
    totalCandidates?: number;
    portalUrl?: string;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
🛡️ *OFFICIAL EXAMINATION DUTY ROSTER ORDER*
────────────────────────
Honorable *${params.teacherName}*,

You have been assigned official examination invigilation duty by the Administrator for the scheduled date sheet:

📆 *Exam Date:* *${params.examDate}* ${params.dayOfWeek ? `(${params.dayOfWeek})` : ''}
⏰ *Exam Timing:* *${params.startTime} – ${params.endTime}* [${params.shift}]
🏢 *Exam Hall / Room:* *${params.hallLocation}*
📖 *Paper Conducted:* *${params.courseCode}* — ${params.courseTitle}
🛡️ *Assigned Duty Role:* *${params.dutyRole}*
👥 *Estimated Candidates:* ${params.totalCandidates || 'Standard Section'}

📌 *Mandatory Exam Day Directives:*
1. Report to the Examination Control Room *30 minutes* prior to paper commencement.
2. Verify student admit cards, CNIC, and attendance signatures.
3. Enforce the zero-tolerance mobile phone / electronic device ban in the examination hall.

🔗 *View Full Duty Roster:* ${params.portalUrl || window.location.origin}

_Office of the Controller of Examinations & Administrator_`;
  },

  // 8. Custom Official Broadcast Notice
  customNotice: (params: {
    recipientName: string;
    title: string;
    message: string;
    senderName?: string;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📍 *${COLLEGE_METADATA.campus}*
────────────────────────
📢 *OFFICIAL EXAMINATION NOTICE: ${params.title.toUpperCase()}*

To: *${params.recipientName}*

${params.message}

_Issued by: ${params.senderName || 'Principal Executive Secretariat'}_
🔗 ${window.location.origin}`;
  },

  // 9. Account Approved & Login Credentials Dispatch Notice
  accountApprovalCredentials: (params: {
    recipientName: string;
    email: string;
    password?: string;
    role: string;
    department?: string;
    approvedBy?: string;
    portalUrl?: string;
  }) => {
    return `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📍 *${COLLEGE_METADATA.campus} · Examination Management System*
────────────────────────
✅ *FACULTY ID ACCOUNT APPROVED & ACTIVATED*

Dear *${params.recipientName}*,
Assalam-o-Alaikum,

Your faculty account registration has been officially verified and APPROVED by ${params.approvedBy || 'the Controller of Examinations'}. Institutional examination portal privileges have been activated.

🔐 *YOUR OFFICIAL LOGIN CREDENTIALS:*
━━━━━━━━━━━━━━━━━━━━━━━━
🌐 *Portal URL:* ${params.portalUrl || window.location.origin}
📧 *Username / Email:* *${params.email}*
🔑 *Password:* *${params.password || 'Teacher@123'}*
🛡️ *Assigned Role:* *${params.role.toUpperCase()}*
${params.department ? `🏛️ *Academic Department:* ${params.department}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━

📌 *Directives:*
1. Sign in with the credentials provided above.
2. Review syllabus and paper submission cutoff deadlines for the upcoming semester examinations.
3. Upload finalized bilingual question papers for QA review before the cutoff date.

⚠️ *Security Note:* Please maintain strict confidentiality of your credentials. You can update your password in portal settings after initial login.

_Office of the Controller of Examinations & Administration_
📞 *Exam Control Cell:* ${COLLEGE_METADATA.contactPhone}`;
  },
};
