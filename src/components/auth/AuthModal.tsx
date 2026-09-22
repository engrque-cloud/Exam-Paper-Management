import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { UserRole, SubjectType, SemesterNumber } from '../../types';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';
import {
  X,
  User,
  Mail,
  Lock,
  ShieldAlert,
  GraduationCap,
  ClipboardCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Phone,
  MessageSquare,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    signup,
    login,
    requestPasswordReset,
    resetPassword,
    users,
  } = useExam();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('teacher');
  const [signupDept, setSignupDept] = useState<SubjectType>('English');
  const [signupSemesters, setSignupSemesters] = useState<SemesterNumber[]>([1, 2]);
  const [signupDesignation, setSignupDesignation] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  // Forgot password form state
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'done'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  // Toggle semester selection
  const handleToggleSemester = (sem: SemesterNumber) => {
    if (signupSemesters.includes(sem)) {
      if (signupSemesters.length > 1) {
        setSignupSemesters(signupSemesters.filter(s => s !== sem));
      }
    } else {
      setSignupSemesters([...signupSemesters, sem].sort((a, b) => a - b));
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please enter both your university email and password.');
      return;
    }
    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Failed to sign in.');
    }
  };

  // Handle Quick Demo Login
  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
    login(email, pass);
  };

  // Handle Signup submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupName.trim()) {
      setSignupError('Please provide your full legal or academic name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please provide a valid institutional email address.');
      return;
    }
    const cleanDigits = signupPhone.replace(/[^0-9]/g, '');
    if (!signupPhone.trim() || cleanDigits.length < 9) {
      setSignupError('Please provide a valid mobile number (e.g. 0300 1234567 or +92 300 1234567) so official WhatsApp alerts can be sent.');
      return;
    }
    if (signupPassword.length < 4) {
      setSignupError('Password must be at least 4 characters.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please verify.');
      return;
    }
    if (signupRole === 'teacher' && signupSemesters.length === 0) {
      setSignupError('Teachers must have at least 1 semester assigned.');
      return;
    }

    const res = signup({
      name: signupName,
      email: signupEmail,
      phone: signupPhone.trim(),
      whatsappNumber: signupPhone.trim(),
      password: signupPassword,
      role: signupRole,
      department: signupRole === 'teacher' ? signupDept : undefined,
      assignedSemesters: signupRole === 'teacher' ? signupSemesters : undefined,
      designation: signupDesignation || undefined,
    });

    if (!res.success) {
      setSignupError(res.error || 'Failed to create account.');
    }
  };

  // Handle Forgot Password Request (Step 1)
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    const res = requestPasswordReset(forgotEmail);
    if (res.success && res.resetToken) {
      setGeneratedCode(res.resetToken);
      setForgotCode(res.resetToken); // Pre-fill for seamless demonstration
      setForgotStep('verify');
    } else {
      setForgotError(res.error || 'Account not found.');
    }
  };

  // Handle Password Reset (Step 2)
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    const res = resetPassword(forgotEmail, forgotCode, newPassword);
    if (res.success) {
      setForgotStep('done');
    } else {
      setForgotError(res.error || 'Could not reset password.');
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        id="auth-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-emerald-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header with Title and Close */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-slate-900 px-6 py-5 flex items-center justify-between border-b border-emerald-200/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">University Portal Authentication</h3>
              <p className="text-xs text-emerald-700 font-medium">Exam Conduction &amp; Paper Submission System</p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 shrink-0">
          <button
            id="auth-tab-login"
            onClick={() => {
              setAuthModalTab('login');
              setLoginError(null);
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              authModalTab === 'login'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-signup"
            onClick={() => {
              setAuthModalTab('signup');
              setSignupError(null);
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              authModalTab === 'signup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            User Sign Up
          </button>
          <button
            id="auth-tab-forgot"
            onClick={() => {
              setAuthModalTab('forgot');
              setForgotStep('request');
              setForgotError(null);
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              authModalTab === 'forgot'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Forgot Password
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SIGN IN */}
          {authModalTab === 'login' && (
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      placeholder="e.g. bilal.qureshi@university.edu"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalTab('forgot');
                        setForgotEmail(loginEmail);
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="login-password-input"
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98"
                >
                  Sign In to Workspace
                </button>
              </form>

              {/* 1-Click Demo Accounts for Fast Testing */}
              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Fast Demo 1-Click Access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="quick-login-admin"
                    type="button"
                    onClick={() => handleQuickLogin('admin@university.edu', 'admin')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Admin</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Dr. Hawthorne (pwd: admin)</p>
                  </button>

                  <button
                    id="quick-login-teacher"
                    type="button"
                    onClick={() => handleQuickLogin('bilal.qureshi@university.edu', 'Teacher@123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                      <span>Teacher</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Dr. Bilal (Sociology)</p>
                  </button>

                  <button
                    id="quick-login-qa"
                    type="button"
                    onClick={() => handleQuickLogin('qa@university.edu', 'QA@123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>QA Checker</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Dr. Marcus Sterling</p>
                  </button>

                  <button
                    id="quick-login-principal"
                    type="button"
                    onClick={() => handleQuickLogin('principal@university.edu', 'Principal@123')}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-left transition text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Principal</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Prof. Dr. Raymond</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {authModalTab === 'signup' && (
            <div className="space-y-4">
              {signupError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                {/* Role selection pill tabs */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Role in Examination System
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(
                      [
                        { role: 'teacher' as UserRole, label: 'Teacher', icon: GraduationCap },
                        { role: 'qa' as UserRole, label: 'QA Checker', icon: ClipboardCheck },
                        { role: 'principal' as UserRole, label: 'Principal', icon: Building2 },
                        { role: 'admin' as UserRole, label: 'Admin', icon: ShieldAlert },
                      ] as const
                    ).map(item => {
                      const Icon = item.icon;
                      const selected = signupRole === item.role;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => setSignupRole(item.role)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium border transition ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      placeholder="e.g. Dr. Ayesha Siddiqui"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="signup-email-input"
                      type="email"
                      required
                      placeholder="ayesha.siddiqui@university.edu"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Mobile Number / WhatsApp */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Mobile Number / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <MessageSquare className="w-3 h-3" /> WhatsApp Enabled
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="signup-phone-input"
                      type="tel"
                      required
                      placeholder="e.g. +92 300 1234567 or 03001234567"
                      value={signupPhone}
                      onChange={e => setSignupPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    WhatsApp notices will be sent to this number. Official username & password will be emailed upon admin approval.
                  </p>
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Designation (Optional)
                  </label>
                  <input
                    id="signup-designation-input"
                    type="text"
                    placeholder="e.g. Assistant Professor, Zoology"
                    value={signupDesignation}
                    onChange={e => setSignupDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* If Teacher: Department & Semesters */}
                {signupRole === 'teacher' && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-indigo-900 mb-1">
                        Academic Department
                      </label>
                      <select
                        id="signup-department-select"
                        value={signupDept}
                        onChange={e => setSignupDept(e.target.value as SubjectType)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white border border-indigo-200 focus:ring-2 focus:ring-indigo-500"
                      >
                        {ALL_SUBJECTS.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-indigo-900 mb-1">
                        Assigned Semesters (1 to 8)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_SEMESTERS.map(sem => {
                          const isAssigned = signupSemesters.includes(sem);
                          return (
                            <button
                              key={sem}
                              type="button"
                              onClick={() => handleToggleSemester(sem)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                                isAssigned
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-100/50'
                              }`}
                            >
                              S{sem}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-indigo-600/80 mt-1">
                        Select which semesters this instructor will upload question papers for.
                      </p>
                    </div>
                  </div>
                )}

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="signup-password-input"
                        type="password"
                        required
                        placeholder="Min 4 characters"
                        value={signupPassword}
                        onChange={e => setSignupPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="signup-confirm-password-input"
                        type="password"
                        required
                        placeholder="Re-type password"
                        value={signupConfirmPassword}
                        onChange={e => setSignupConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="signup-submit-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98 mt-2"
                >
                  Create Account & Enter Workspace
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <div className="space-y-4">
              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotStep === 'request' && (
                <form onSubmit={handleRequestCode} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs">
                    <p className="font-semibold mb-0.5">Password Recovery</p>
                    <p className="text-slate-600">
                      Enter your university email. We will generate an institutional recovery verification code for you to reset your password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="forgot-email-input"
                        type="email"
                        required
                        placeholder="e.g. bilal.qureshi@university.edu"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-send-code-btn"
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98"
                  >
                    Send Recovery Verification Code
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthModalTab('login')}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      &larr; Remember your password? Sign in
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 'verify' && (
                <form onSubmit={handleResetSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs">
                    <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Recovery Code Generated</span>
                    </p>
                    <p className="text-emerald-700 mt-0.5">
                      Verification code sent to <strong>{forgotEmail}</strong>.
                    </p>
                    {generatedCode && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-emerald-200 flex items-center justify-between">
                        <span className="font-mono font-bold text-sm tracking-widest text-emerald-900">
                          {generatedCode}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                          Simulated Code
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      id="forgot-code-input"
                      type="text"
                      required
                      placeholder="e.g. 849201"
                      value={forgotCode}
                      onChange={e => setForgotCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm font-mono tracking-widest text-center rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="forgot-new-password-input"
                        type="password"
                        required
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="forgot-confirm-new-password-input"
                        type="password"
                        required
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-reset-submit-btn"
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98"
                  >
                    Reset & Set New Password
                  </button>
                </form>
              )}

              {forgotStep === 'done' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Password Updated!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Your account credentials have been updated securely. You can now log into your examination workspace.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setLoginEmail(forgotEmail);
                      setLoginPassword('');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
