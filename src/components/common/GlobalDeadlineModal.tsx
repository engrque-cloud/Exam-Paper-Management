import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  X,
  ShieldAlert,
  Send,
  Sparkles,
  Info,
  CalendarCheck,
  History,
} from 'lucide-react';

export const GlobalDeadlineModal: React.FC = () => {
  const {
    isDeadlineModalOpen,
    setIsDeadlineModalOpen,
    globalDeadline,
    updateGlobalDeadline,
    deadlineStatus,
    currentRole,
    currentUser,
  } = useExam();

  const [date, setDate] = useState(globalDeadline.deadlineDate);
  const [time, setTime] = useState(globalDeadline.deadlineTime || '23:59');
  const [allowLate, setAllowLate] = useState(globalDeadline.allowLateSubmissions);
  const [gracePeriod, setGracePeriod] = useState(globalDeadline.gracePeriodDays || 3);
  const [notes, setNotes] = useState(globalDeadline.announcementNotes);
  const [broadcast, setBroadcast] = useState(true);

  if (!isDeadlineModalOpen) return null;

  const isAdmin = currentRole === 'admin' || currentUser?.role === 'admin';

  // Fast extension helper
  const handleQuickExtend = (daysToAdd: number) => {
    const currentObj = new Date(date);
    currentObj.setDate(currentObj.getDate() + daysToAdd);
    const newDateStr = currentObj.toISOString().split('T')[0];
    setDate(newDateStr);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalDeadline(
      {
        deadlineDate: date,
        deadlineTime: time,
        allowLateSubmissions: allowLate,
        gracePeriodDays: gracePeriod,
        announcementNotes: notes,
      },
      broadcast
    );
    setIsDeadlineModalOpen(false);
  };

  return (
    <div
      id="global-deadline-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="global-deadline-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-emerald-200/80 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-slate-900 px-6 py-5 flex items-center justify-between border-b border-emerald-200/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">Global Paper Submission Deadline</h3>
              <p className="text-xs text-emerald-700 font-medium">Institutional Examination Regulatory Calendar</p>
            </div>
          </div>
          <button
            id="close-deadline-modal-btn"
            onClick={() => setIsDeadlineModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Live Countdown & Status Box */}
          <div
            className={`p-4 rounded-2xl border ${
              deadlineStatus.isPassed
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : deadlineStatus.isUrgent
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 border border-black/5 inline-block mb-1">
                  {deadlineStatus.isPassed
                    ? 'Submission Window Closed'
                    : deadlineStatus.isUrgent
                    ? 'Urgent Cutoff Approaching'
                    : 'Submission Window Active'}
                </span>
                <h4 className="text-lg font-bold">
                  {deadlineStatus.formattedDate} at {globalDeadline.deadlineTime}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Standard Time: {globalDeadline.timezone}
                </p>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-2">
                <div className="bg-white px-3 py-2 rounded-xl text-center shadow-xs border border-slate-200/80 min-w-[55px]">
                  <span className="text-xl font-extrabold text-slate-900 block font-mono">
                    {deadlineStatus.daysLeft}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Days</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl text-center shadow-xs border border-slate-200/80 min-w-[55px]">
                  <span className="text-xl font-extrabold text-slate-900 block font-mono">
                    {deadlineStatus.hoursLeft}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Hours</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl text-center shadow-xs border border-slate-200/80 min-w-[55px]">
                  <span className="text-xl font-extrabold text-slate-900 block font-mono">
                    {deadlineStatus.minutesLeft}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Mins</span>
                </div>
              </div>
            </div>

            {/* Regulatory Policy Summary */}
            <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Late Submissions:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    globalDeadline.allowLateSubmissions
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {globalDeadline.allowLateSubmissions
                    ? `Permitted (${globalDeadline.gracePeriodDays} days grace period)`
                    : 'Prohibited after cutoff'}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Updated by: {globalDeadline.lastUpdatedBy}
              </span>
            </div>
          </div>

          {/* Admin Edit Controls or Faculty Instructions */}
          {isAdmin ? (
            <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin Deadline Configuration & Dispatch</span>
                </span>
                <span className="text-[11px] text-slate-400">Applies across all 4 departments</span>
              </div>

              {/* Quick Preset Extension Buttons */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                  Fast Extension Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(3)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
                  >
                    +3 Days Extension
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(7)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
                  >
                    +7 Days Extension (1 Week)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(14)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition"
                  >
                    +14 Days Extension (2 Weeks)
                  </button>
                </div>
              </div>

              {/* Date and Time Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Date of Paper Submission
                  </label>
                  <input
                    id="deadline-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cutoff Time (24h)
                  </label>
                  <input
                    id="deadline-time-input"
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Late Submission policy toggle & grace days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <input
                    id="allow-late-checkbox"
                    type="checkbox"
                    checked={allowLate}
                    onChange={e => setAllowLate(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div>
                    <label htmlFor="allow-late-checkbox" className="text-xs font-semibold text-slate-800 cursor-pointer block">
                      Allow Late Submissions
                    </label>
                    <span className="text-[11px] text-slate-500">Flags paper as late for QA audit</span>
                  </div>
                </div>

                {allowLate && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={gracePeriod}
                      onChange={e => setGracePeriod(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Announcement Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Notification Announcement
                </label>
                <textarea
                  id="deadline-notes-textarea"
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  placeholder="State instructions for faculty regarding the submission cutoff..."
                />
              </div>

              {/* Broadcast notification checkbox */}
              <div className="flex items-center gap-2">
                <input
                  id="broadcast-notif-checkbox"
                  type="checkbox"
                  checked={broadcast}
                  onChange={e => setBroadcast(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="broadcast-notif-checkbox" className="text-xs text-slate-700 cursor-pointer">
                  Broadcast update notification to all faculty & deans immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeadlineModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  id="save-deadline-btn"
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Update Global Submission Cutoff</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Examination Submission Instructions</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  "{globalDeadline.announcementNotes}"
                </p>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Course instructors for English, Islamic Studies, Sociology, and Zoology (Semesters 1-8) must upload question papers in PDF or DOCX format before the cutoff. Once approved by QA, question papers are sealed for printing and date sheet conduction.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsDeadlineModalOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
