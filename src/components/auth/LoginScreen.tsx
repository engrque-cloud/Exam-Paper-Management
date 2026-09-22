import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { UserRole, SubjectType, SemesterNumber } from '../../types';
import { ALL_SUBJECTS, ALL_SEMESTERS } from '../../data/courses';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  GraduationCap,
  ClipboardCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  RefreshCw,
  Award,
  Phone,
  MessageSquare,
  Smartphone,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const {
    login,
    signup,
    requestPasswordReset,
    resetPassword,
    deadlineStatus,
    setIsDeadlineModalOpen,
  } = useExam();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
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

  // Quick 1-Click login for testing
  const handleQuickLogin = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError(null);
    login(email, pass);
  };

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

  // Handle Forgot Password Request
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid university email address.');
      return;
    }
    const res = requestPasswordReset(forgotEmail);
    if (res.success && res.resetToken) {
      setGeneratedCode(res.resetToken);
      setForgotStep('verify');
    } else {
      setForgotError(res.error || 'User not found with this email.');
    }
  };

  // Handle Password Reset Submission
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-[#f8fbf9] to-emerald-50/40 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Institutional Top Brand Bar */}
      <header className="border-b border-emerald-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-950 tracking-tight uppercase">
                  Govt. Girls Model Degree College
                </span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Jinnah Town, Quetta
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                Examination Management System &bull; Executive Dashboard Portal
              </p>
            </div>
          </div>

          {/* Submission Deadline Capsule */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-600">Paper Deadline:</span>
              <span className="font-semibold text-slate-900">{deadlineStatus.formattedDate}</span>
              <button
                onClick={() => setIsDeadlineModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 underline font-medium ml-1"
              >
                Schedule
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">256-Bit SSL Secure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Content Canvas */}
      <main className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full mx-auto relative z-10">
          {/* Main Card Container */}
          <div className="bg-white text-slate-900 rounded-3xl shadow-xl shadow-emerald-950/5 border border-emerald-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-emerald-100 bg-emerald-50/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Authentication Gateway
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Semester Exams &bull; Fall 2026
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                {activeTab === 'login' && 'Sign in to Your Academic Portal'}
                {activeTab === 'signup' && 'Register Faculty Account'}
                {activeTab === 'forgot' && 'Account Password Recovery'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {activeTab === 'login' &&
                  'Enter your university credentials to access your dedicated workspace.'}
                {activeTab === 'signup' &&
                  'Create an examiner profile for verification and administrative approval.'}
                {activeTab === 'forgot' &&
                  'Generate an institutional recovery code to securely reset your credentials.'}
              </p>

              {/* Navigation Tabs */}
              <div className="flex rounded-xl bg-emerald-100/60 p-1 mt-5 text-xs font-semibold">
                <button
                  type="button"
                  id="tab-btn-signin"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition text-center ${
                    activeTab === 'login'
                      ? 'bg-white text-emerald-950 shadow-2xs font-bold border border-emerald-200/50'
                      : 'text-slate-600 hover:text-emerald-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-btn-signup"
                  onClick={() => {
                    setActiveTab('signup');
                    setSignupError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg transition text-center ${
                    activeTab === 'signup'
                      ? 'bg-white text-emerald-950 shadow-2xs font-bold border border-emerald-200/50'
                      : 'text-slate-600 hover:text-emerald-900'
                  }`}
                >
                  Register Faculty
                </button>
                <button
                  type="button"
                  id="tab-btn-forgot"
                  onClick={() => {
                    setActiveTab('forgot');
                    setForgotError(null);
                    setForgotStep('request');
                  }}
                  className={`flex-1 py-2 rounded-lg transition text-center ${
                    activeTab === 'forgot'
                      ? 'bg-white text-emerald-950 shadow-2xs font-bold border border-emerald-200/50'
                      : 'text-slate-600 hover:text-emerald-900'
                  }`}
                >
                  Reset Password
                </button>
              </div>
            </div>

            {/* TAB 1: SIGN IN FORM */}
            {activeTab === 'login' && (
              <div className="p-6 sm:p-8 space-y-6">
                {loginError && (
                  <div
                    id="login-error-alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      University Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="login-email-input"
                        type="email"
                        required
                        placeholder="e.g. admin@university.edu or your.name@university.edu"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot');
                          setForgotEmail(loginEmail);
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your account password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Keep me signed in on this computer</span>
                    </label>
                  </div>

                  <button
                    id="login-submit-btn"
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Designated Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* 1-Click Demo Accounts for Quick Access */}
                <div className="pt-5 border-t border-emerald-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Instant 1-Click Role Login (Demo Credentials)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Pre-Configured
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Admin */}
                    <button
                      id="quick-login-admin"
                      type="button"
                      onClick={() => handleQuickLogin('admin@university.edu', 'admin')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-emerald-950">
                          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Administrator</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                          admin
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Dr. Richard Hawthorne &bull; pwd: <span className="font-mono text-slate-800 font-semibold">admin</span>
                      </p>
                    </button>

                    {/* Teacher */}
                    <button
                      id="quick-login-teacher"
                      type="button"
                      onClick={() => handleQuickLogin('bilal.qureshi@university.edu', 'Teacher@123')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-emerald-950">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Teacher / Faculty</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                          teacher
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Dr. Bilal (Sociology) &bull; pwd: <span className="font-mono text-slate-800 font-semibold">Teacher@123</span>
                      </p>
                    </button>

                    {/* QA */}
                    <button
                      id="quick-login-qa"
                      type="button"
                      onClick={() => handleQuickLogin('qa@university.edu', 'QA@123')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-emerald-950">
                          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>QA Paper Checker</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                          qa
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Dr. Marcus Sterling &bull; pwd: <span className="font-mono text-slate-800 font-semibold">QA@123</span>
                      </p>
                    </button>

                    {/* Principal */}
                    <button
                      id="quick-login-principal"
                      type="button"
                      onClick={() => handleQuickLogin('principal@university.edu', 'Principal@123')}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition group shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-emerald-950">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Principal & CAO</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                          principal
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Prof. Raymond Vance &bull; pwd: <span className="font-mono text-slate-800 font-semibold">Principal@123</span>
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTER FACULTY */}
            {activeTab === 'signup' && (
              <div className="p-6 sm:p-8 space-y-5">
                {signupError && (
                  <div
                    id="signup-error-alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{signupError}</span>
                  </div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Role picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Designated Role in Examination System
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
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition ${
                              selected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50/50'
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
                      Full Academic / Official Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-name-input"
                        type="text"
                        required
                        placeholder="e.g. Dr. Ayesha Siddiqui"
                        value={signupName}
                        onChange={e => setSignupName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institutional University Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-email-input"
                        type="email"
                        required
                        placeholder="e.g. ayesha.siddiqui@university.edu"
                        value={signupEmail}
                        onChange={e => setSignupEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Mobile Number / WhatsApp (Required for Alerts & Login Delivery) */}
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
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="signup-phone-input"
                        type="tel"
                        required
                        placeholder="e.g. +92 300 1234567 or 03001234567"
                        value={signupPhone}
                        onChange={e => setSignupPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                      <span className="text-emerald-700 font-semibold">Alerts & Credentials:</span>
                      <span>Official exam notices will be sent to this WhatsApp number. Upon admin approval, an email with your official username and password will be delivered to your registered email address.</span>
                    </p>
                  </div>

                  {/* Role Specific Fields (Teacher Department & Assigned Semesters) */}
                  {signupRole === 'teacher' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-950 mb-1">
                          Academic Department / Subject Area
                        </label>
                        <select
                          id="signup-dept-select"
                          value={signupDept}
                          onChange={e => setSignupDept(e.target.value as SubjectType)}
                          className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-emerald-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                          {ALL_SUBJECTS.map(s => (
                            <option key={s} value={s}>
                              Department of {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                          Assigned Semesters (Undergraduate)
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                          {ALL_SEMESTERS.map(sem => {
                            const isSelected = signupSemesters.includes(sem);
                            return (
                              <button
                                key={sem}
                                type="button"
                                onClick={() => handleToggleSemester(sem)}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                S{sem}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Designation
                    </label>
                    <input
                      id="signup-designation-input"
                      type="text"
                      placeholder="e.g. Associate Professor, Assistant Professor, Lecturer"
                      value={signupDesignation}
                      onChange={e => setSignupDesignation(e.target.value)}
                      className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="signup-password-input"
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 4 characters"
                          value={signupPassword}
                          onChange={e => setSignupPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          id="signup-confirm-password-input"
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          placeholder="Re-type password"
                          value={signupConfirmPassword}
                          onChange={e => setSignupConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-emerald-950 block mb-0.5">Approval Policy:</strong>
                    New faculty accounts require approval from the Controller of Examinations before unrestricted question paper publishing permissions are granted.
                  </div>

                  <button
                    id="signup-submit-btn"
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98"
                  >
                    Submit Faculty Registration
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: FORGOT PASSWORD */}
            {activeTab === 'forgot' && (
              <div className="p-6 sm:p-8 space-y-5">
                {forgotError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotStep === 'request' && (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                      Enter your university email address. We will generate an institutional recovery verification code for you to reset your password.
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        University Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          id="forgot-email-input"
                          type="email"
                          required
                          placeholder="e.g. admin@university.edu"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                        />
                      </div>
                    </div>

                    <button
                      id="forgot-request-code-btn"
                      type="submit"
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Verification Code</span>
                    </button>
                  </form>
                )}

                {forgotStep === 'verify' && (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    {generatedCode && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Institutional Recovery Token:</span>
                          <span className="font-mono text-base font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {generatedCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-700 mt-1">
                          Enter this 6-digit recovery code below along with your new password.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        6-Digit Recovery Verification Code
                      </label>
                      <input
                        id="forgot-code-input"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={forgotCode}
                        onChange={e => setForgotCode(e.target.value)}
                        className="w-full py-2.5 px-3 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Password
                      </label>
                      <input
                        id="forgot-new-password-input"
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        id="forgot-confirm-password-input"
                        type="password"
                        required
                        placeholder="Re-type new password"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                      />
                    </div>

                    <button
                      id="forgot-reset-submit-btn"
                      type="submit"
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98"
                    >
                      Update Password & Unlock Account
                    </button>
                  </form>
                )}

                {forgotStep === 'done' && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Password Reset Successfully!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Your university credentials have been updated. You can now sign in with your new password.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('login');
                        setLoginEmail(forgotEmail);
                        setLoginPassword('');
                        setForgotStep('request');
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                    >
                      Return to Sign In
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Institutional Compliance Footer Banner */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Personnel Only &bull; Strict Role Isolation</span>
              </div>
              <span>Higher Education Commission Compliance</span>
            </div>
          </div>

          {/* Bottom Accreditation info */}
          <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
            <p>
              Govt. Girls Model Degree College, Quetta &bull; Office of the Controller of Examinations
            </p>
            <p className="text-[11px] text-slate-500">
              Undergraduate Programs: English &bull; Islamic Studies &bull; Sociology &bull; Zoology (Semesters 1 through 8)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
