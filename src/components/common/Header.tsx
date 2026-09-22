import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  GraduationCap,
  ClipboardCheck,
  Building2,
  Bell,
  RotateCcw,
  BookOpen,
  ChevronDown,
  UserCheck,
  Calendar,
  Clock,
  User,
  LogOut,
  UserPlus,
  LogIn,
  KeyRound,
  MessageSquare,
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { WhatsAppNotificationModal } from './WhatsAppNotificationModal';

export const Header: React.FC = () => {
  const {
    currentRole,
    setRole,
    currentTeacher,
    setTeacherId,
    teachers,
    papers,
    dateSheetRows,
    unreadNotificationCount,
    resetAllData,
    globalDeadline,
    deadlineStatus,
    setIsDeadlineModalOpen,
    currentUser,
    openAuthModal,
    logout,
  } = useExam();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // QA pending count
  const pendingQACount = papers.filter(p => p.status === 'pending_qa').length;
  // Principal ready date sheet rows count
  const readyDateSheetCount = dateSheetRows.length;
  // Rejected count needing teacher re-upload
  const rejectedCount = papers.filter(p => p.status === 'qa_rejected').length;

  const portalDetails: Record<UserRole, { title: string; subtitle: string; icon: React.ElementType; iconColor: string; badgeClass: string }> = {
    admin: {
      title: 'Administrator Portal',
      subtitle: 'Matrix, Faculty Approvals & Curriculum Management',
      icon: ShieldAlert,
      iconColor: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    teacher: {
      title: 'Teacher & Faculty Portal',
      subtitle: `Exam Uploads & Revisions • Dept of ${currentTeacher?.department || 'Faculty'}`,
      icon: GraduationCap,
      iconColor: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    qa: {
      title: 'QA Paper Checker Portal',
      subtitle: 'Quality Assurance Review & 5-Point Vetting Rubrics',
      icon: ClipboardCheck,
      iconColor: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    principal: {
      title: 'Principal & CAO Portal',
      subtitle: 'Date Sheet Certification, Venue Allocation & Gazette',
      icon: Building2,
      iconColor: 'text-emerald-600',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  };

  const activePortal = portalDetails[currentRole] || portalDetails.admin;
  const ActivePortalIcon = activePortal.icon;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md text-slate-900 border-b border-emerald-200/80 sticky top-0 z-40 shadow-xs">
        {/* Top bar with University branding, global deadline, and user controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center shadow-md shadow-emerald-700/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-950 uppercase">
                    Govt. Girls Model Degree College
                  </h1>
                  <span className="hidden lg:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Jinnah Town, Quetta
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium hidden md:block">
                  Examination Management System &bull; Executive Dashboard (64 Papers &bull; 5 Depts)
                </p>
              </div>
            </div>

            {/* Middle / Right Controls: Global Deadline Pill, Notifications, User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* GLOBAL SUBMISSION DEADLINE PILL */}
              <button
                id="global-deadline-header-pill"
                onClick={() => setIsDeadlineModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
                  deadlineStatus.isPassed
                    ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    : deadlineStatus.isUrgent
                    ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 animate-pulse'
                    : 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950'
                }`}
                title="Click to view or update Global Last Date of Paper Submission"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden md:inline text-slate-600 font-normal">Last Date:</span>
                <span className="font-bold">{deadlineStatus.formattedDate}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    deadlineStatus.isPassed
                      ? 'bg-rose-600 text-white'
                      : deadlineStatus.isUrgent
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'bg-emerald-600 text-white shadow-2xs'
                  }`}
                >
                  {deadlineStatus.isPassed
                    ? 'Closed'
                    : deadlineStatus.isUrgent
                    ? `${deadlineStatus.daysLeft}d left!`
                    : `${deadlineStatus.daysLeft}d left`}
                </span>
              </button>

              {/* Authenticated Teacher Department Tag */}
              {currentRole === 'teacher' && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-emerald-50 border-emerald-200 text-emerald-900">
                  <div className={`w-2 h-2 rounded-full ${currentTeacher.avatarColor}`} />
                  <span className="max-w-[130px] truncate">
                    {currentTeacher.name} ({currentTeacher.department})
                  </span>
                </div>
              )}

              {/* WhatsApp Quick Notification Dispatcher - Strictly Restricted to Admin and Principal */}
              {(currentRole === 'admin' || currentRole === 'principal') && (
                <button
                  id="header-whatsapp-dispatch-btn"
                  onClick={() => setIsWhatsAppOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-600 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                  title="Direct 1-Click WhatsApp Notification Dispatcher (Admin & Principal Section)"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white fill-white/20" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              )}

              {/* Notification Button */}
              <button
                id="notification-bell-btn"
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 transition"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4 text-emerald-700" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* USER ACCOUNT DROPDOWN / SIGN IN BUTTON */}
              {currentUser ? (
                <div className="relative">
                  <button
                    id="user-account-dropdown-btn"
                    onClick={() => setShowUserMenu(prev => !prev)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-medium transition"
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${currentUser.avatarColor || 'bg-emerald-600'} text-white flex items-center justify-center text-[10px] font-bold`}
                    >
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate text-slate-800 font-semibold">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {currentUser.role}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>

                  {showUserMenu && (
                    <div
                      id="user-account-dropdown-menu"
                      className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      {/* Account info */}
                      <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/40">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full ${currentUser.avatarColor || 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-xs`}
                          >
                            {currentUser.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {currentUser.role.toUpperCase()}
                          </span>
                          {currentUser.department && (
                            <span className="text-[10px] text-slate-600 font-medium truncate">
                              Dept of {currentUser.department}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu actions */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-emerald-700 hover:bg-emerald-50 transition font-medium"
                        >
                          <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Switch Account (Sign In)</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            openAuthModal('signup');
                          }}
                          className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-emerald-50/60 transition font-medium"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Register New User Account</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            openAuthModal('forgot');
                          }}
                          className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-slate-700 hover:bg-emerald-50/60 transition font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reset Password / Security</span>
                        </button>

                        <div className="border-t border-emerald-100 my-1" />

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="header-signin-btn"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition active:scale-98"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Reset Data Button */}
              <button
                onClick={resetAllData}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                title="Reset simulation to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Active Dedicated Workspace Bar (One dashboard per authenticated user) */}
          {currentUser && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-t border-emerald-100/90 gap-2 text-xs bg-emerald-50/40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-900/80 uppercase tracking-wider">
                  Active Portal:
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 shadow-2xs">
                  <ActivePortalIcon className={`w-4 h-4 ${activePortal.iconColor}`} />
                  <span className="font-bold text-emerald-950 tracking-tight">{activePortal.title}</span>
                </div>
                <span className="text-emerald-300 hidden md:inline">&bull;</span>
                <span className="text-slate-600 text-[11px] hidden md:inline">{activePortal.subtitle}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="header-signout-btn"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 text-xs font-semibold transition shadow-2xs"
                  title="Sign out from this portal"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Slide-over notification drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Direct 1-Click WhatsApp Notification Modal (Admin & Principal only) */}
      {(currentRole === 'admin' || currentRole === 'principal') && (
        <WhatsAppNotificationModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}
    </>
  );
};
