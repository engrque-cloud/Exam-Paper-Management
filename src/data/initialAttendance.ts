import { AttendanceRecord } from '../types';

/**
 * Helper to compute attendance percentage and exam eligibility
 */
export const calculateAttendanceEligibility = (
  attended: number,
  total: number,
  threshold = 75,
  isExempted = false
): { percentage: number; isEligible: boolean } => {
  if (total <= 0) return { percentage: 0, isEligible: false };
  const percentage = Number(((attended / total) * 100).toFixed(1));
  const isEligible = isExempted || percentage >= threshold;
  return { percentage, isEligible };
};

/**
 * INITIAL_ATTENDANCE_RECORDS
 * Cleared to nil / empty array for clean development.
 */
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];
