import { UserAccount, GlobalDeadlineConfig } from '../types';

/**
 * INITIAL_USER_ACCOUNTS
 * Initial user accounts dataset.
 * All employee, teacher, and QA accounts have been cleared to nil for clean development.
 * The primary Administrator account is retained for secure system management.
 */
export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
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
  },
];

export const INITIAL_GLOBAL_DEADLINE: GlobalDeadlineConfig = {
  deadlineDate: '2026-10-15',
  deadlineTime: '23:59',
  timezone: 'University Standard Time (UTC+5)',
  allowLateSubmissions: true,
  gracePeriodDays: 3,
  announcementNotes:
    'All departments must finalize and upload complete examination question papers with syllabus-mapped sections before this cutoff for QA scrutiny.',
  lastUpdatedBy: 'Administrator (Controller of Examinations)',
  lastUpdatedAt: '2026-09-10T14:30:00.000Z',
};
