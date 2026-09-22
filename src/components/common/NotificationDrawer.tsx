import React from 'react';
import { useExam } from '../../context/ExamContext';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  FileCheck2,
  Megaphone,
  ArrowRight,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { UserRole } from '../../types';
import { openWhatsApp } from '../../utils/whatsapp';
import { TEACHER_PROFILES } from '../../data/courses';
import { COLLEGE_METADATA } from '../../data/collegeData';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    currentRole,
    setRole,
    currentTeacher,
    setTeacherId,
    setPreviewPaper,
    papers,
  } = useExam();

  if (!isOpen) return null;

  // Filter notifications relevant to current role & active teacher
  const filteredNotifications = notifications.filter(n => {
    if (currentRole === 'admin') return true; // admin sees all notifications in audit trail
    if (currentRole === 'qa') return n.recipientRole === 'qa' || n.recipientRole === 'all';
    if (currentRole === 'principal') return n.recipientRole === 'principal' || n.recipientRole === 'all';
    if (currentRole === 'teacher') {
      if (n.recipientRole === 'all') return true;
      if (n.recipientRole === 'teacher') {
        if (!n.recipientId || n.recipientId === currentTeacher.id) return true;
      }
      return false;
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'exam_call':
        return <Megaphone className="w-4 h-4 text-emerald-600" />;
      case 'rejection_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'approval_notice':
        return <FileCheck2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-600" />;
    }
  };

  const handleActionClick = (n: typeof notifications[0]) => {
    markNotificationAsRead(n.id);
    if (n.relatedPaperId) {
      const paper = papers.find(p => p.id === n.relatedPaperId);
      if (paper) {
        setPreviewPaper(paper);
      }
    }
    onClose();
  };

  const handleShareWhatsApp = (n: typeof notifications[0]) => {
    // WhatsApp dispatch is strictly restricted to Admin and Principal sections
    if (currentRole !== 'admin' && currentRole !== 'principal') {
      return;
    }

    // Find recipient phone if known, or default to general test phone
    let phone = '+92 300 8371920';
    if (n.recipientId) {
      const teacher = TEACHER_PROFILES.find(t => t.id === n.recipientId);
      if (teacher?.whatsappNumber || teacher?.phone) {
        phone = teacher.whatsappNumber || teacher.phone || phone;
      }
    }

    const msg = `🏛️ *${COLLEGE_METADATA.institutionName.toUpperCase()}*
📢 *OFFICIAL EXAMINATION NOTICE*
────────────────────────
*${n.title.toUpperCase()}*

${n.message}
${n.deadline ? `\n⏳ *Deadline:* *${n.deadline}*` : ''}

_Issued by: ${n.senderName}_
🔗 ${window.location.origin}`;

    openWhatsApp(phone, msg);
  };

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        id="notification-drawer-panel"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-emerald-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-slate-900 border-b border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <Bell className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">System Notifications</h3>
              <p className="text-[11px] text-emerald-700 font-medium">
                Viewing for <span className="capitalize font-bold text-emerald-800">{currentRole}</span>
                {currentRole === 'teacher' ? ` (${currentTeacher.name})` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-100/60 font-medium transition"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Read all</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
              <p className="text-sm font-medium text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-500 mt-1">
                You're all caught up on alerts.
              </p>
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs transition relative ${
                  !n.isRead
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                    : 'bg-white border-slate-200 opacity-90'
                }`}
              >
                {!n.isRead && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                )}

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white border border-emerald-200 shadow-2xs mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
                      <span className="font-semibold text-slate-700">{n.senderName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-xs leading-snug">
                      {n.title}
                    </h4>

                    <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                      {n.message}
                    </p>

                    {n.deadline && (
                      <div className="mt-1.5 inline-block bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Deadline: {n.deadline}
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleActionClick(n)}
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
                        >
                          {n.type === 'rejection_alert'
                            ? 'Open & Re-upload Paper'
                            : n.type === 'approval_notice'
                            ? 'View in Date Sheet'
                            : 'View Details'}
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {/* WhatsApp sharing allowed only for Admin and Principal */}
                        {(currentRole === 'admin' || currentRole === 'principal') && (
                          <button
                            onClick={() => handleShareWhatsApp(n)}
                            className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-200 transition cursor-pointer"
                            title="Forward this notification to faculty on WhatsApp (Admin & Principal Section)"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600 fill-emerald-500/20" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-emerald-50/50 border-t border-emerald-200/60 text-center text-xs text-emerald-800 font-medium">
          Real-time synchronization across Admin, Teacher, QA & Principal
        </div>
      </div>
    </div>
  );
};
