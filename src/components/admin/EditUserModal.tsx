import React, { useState, useEffect } from 'react';
import { UserAccount, UserRole, SubjectType, SemesterNumber } from '../../types';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  MessageSquare,
  Building,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Check,
} from 'lucide-react';

interface EditUserModalProps {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<UserAccount>) => { success: boolean; error?: string };
  onDelete?: (userId: string) => { success: boolean; error?: string };
  availableSubjects: SubjectType[];
  availableSemesters: SemesterNumber[];
  currentAdminEmail?: string;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableSubjects,
  availableSemesters,
  currentAdminEmail = 'hr.bppra@gmail.com',
}) => {
  if (!isOpen || !user) return null;

  const isPrimaryAdmin = user.email.toLowerCase() === currentAdminEmail.toLowerCase();

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState(user.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsappNumber || '');
  const [role, setRole] = useState<UserRole>(user.role || 'teacher');
  const [department, setDepartment] = useState<SubjectType | ''>(user.department || '');
  const [assignedSemesters, setAssignedSemesters] = useState<SemesterNumber[]>(user.assignedSemesters || [1, 2]);
  const [designation, setDesignation] = useState(user.designation || '');
  const [approvalStatus, setApprovalStatus] = useState(user.approvalStatus || 'approved');
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || 'bg-emerald-600');

  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword(user.password || '');
      setPhone(user.phone || '');
      setWhatsappNumber(user.whatsappNumber || user.phone || '');
      setRole(user.role || 'teacher');
      setDepartment(user.department || '');
      setAssignedSemesters(user.assignedSemesters || [1, 2]);
      setDesignation(user.designation || '');
      setApprovalStatus(user.approvalStatus || 'approved');
      setAvatarColor(user.avatarColor || 'bg-emerald-600');
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [user]);

  const toggleSemester = (sem: SemesterNumber) => {
    if (assignedSemesters.includes(sem)) {
      setAssignedSemesters(assignedSemesters.filter(s => s !== sem));
    } else {
      setAssignedSemesters([...assignedSemesters, sem].sort((a, b) => a - b));
    }
  };

  const handleQuickPassword = (pwd: string) => {
    setPassword(pwd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the full name for this user account.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }
    if (!password.trim() || password.length < 3) {
      setError('Password must contain at least 3 characters.');
      return;
    }

    const updates: Partial<UserAccount> = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim() || phone.trim(),
      role,
      approvalStatus,
      designation: designation.trim(),
      avatarColor,
      department: role === 'teacher' ? department : undefined,
      assignedSemesters: role === 'teacher' ? assignedSemesters : undefined,
    };

    if (approvalStatus === 'approved' && user.approvalStatus !== 'approved') {
      updates.approvedBy = 'Administrator';
      updates.approvedAt = new Date().toISOString();
      updates.approvalEmailSent = true;
      updates.rejectionReason = undefined;
    }

    const result = onSave(user.id, updates);
    if (!result.success) {
      setError(result.error || 'Failed to update user account.');
      return;
    }

    onClose();
  };

  const handleDelete = () => {
    if (!onDelete) return;
    const res = onDelete(user.id);
    if (!res.success) {
      setError(res.error || 'Could not delete user account.');
      return;
    }
    onClose();
  };

  const colorOptions = [
    { label: 'Emerald', value: 'bg-emerald-600' },
    { label: 'Indigo', value: 'bg-indigo-600' },
    { label: 'Amber', value: 'bg-amber-600' },
    { label: 'Teal', value: 'bg-teal-600' },
    { label: 'Blue', value: 'bg-blue-600' },
    { label: 'Purple', value: 'bg-purple-600' },
    { label: 'Rose', value: 'bg-rose-600' },
  ];

  return (
    <div
      id="edit-user-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${avatarColor} text-white flex items-center justify-center font-bold text-base shadow-xs border border-white/20`}>
              {name.charAt(0) || user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Edit User Account &amp; Login ID
                </h3>
                {isPrimaryAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                    Primary Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100">
                Modify login email, password, assigned department, roles, and contact numbers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Credentials Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Login Credentials &amp; Identity
              </span>
              <span className="text-[11px] font-mono text-slate-500">ID: {user.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Dr. Bilal Qureshi"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Email / Login ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Login Email / Username *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Login Password *
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Quick set:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickPassword('admin')}
                      className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] hover:bg-emerald-200"
                    >
                      admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPassword('Teacher@123')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] hover:bg-slate-200"
                    >
                      Teacher@123
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPassword('Pass@1234')}
                      className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] hover:bg-slate-200"
                    >
                      Pass@1234
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password for user"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-emerald-950 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Verification Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              Role &amp; Verification Authority
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Role *
                </label>
                <select
                  value={role}
                  disabled={isPrimaryAdmin}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 capitalize"
                >
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="qa">QA Paper Checker</option>
                  <option value="principal">Principal &amp; CAO</option>
                  <option value="admin">Administrator / Controller</option>
                </select>
                {isPrimaryAdmin && (
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Primary institutional administrator role cannot be demoted.
                  </p>
                )}
              </div>

              {/* Approval Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verification &amp; ID Approval *
                </label>
                <select
                  value={approvalStatus}
                  onChange={e => setApprovalStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 capitalize font-medium"
                >
                  <option value="approved">Approved &amp; Active</option>
                  <option value="pending">Pending Admin Review</option>
                  <option value="rejected">Rejected / Suspended</option>
                </select>
              </div>

              {/* Official Designation */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation / Academic Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor & Head of Department"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Numbers for WhatsApp & Notifications */}
          <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              Direct Contact &amp; WhatsApp Notifications
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Office / Cell Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number (with country code)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="+923001234567"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Course & Semester Assignments (if Teacher role) */}
          {role === 'teacher' && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                Department &amp; Semester Course Coverage
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Department / Subject
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value as SubjectType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Department --</option>
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Teaching Semesters
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSemesters.map(sem => {
                    const active = assignedSemesters.includes(sem);
                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => toggleSemester(sem)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        Sem {sem}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Avatar Color Theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Avatar Badge Theme
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAvatarColor(c.value)}
                  className={`w-7 h-7 rounded-full ${c.value} border-2 transition cursor-pointer flex items-center justify-center ${
                    avatarColor === c.value ? 'border-slate-900 scale-110 shadow-xs' : 'border-white hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {avatarColor === c.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Delete User Option (unless primary admin) */}
          {!isPrimaryAdmin && onDelete && (
            <div className="pt-2 border-t border-slate-200">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete This User Account</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3">
                  <p className="text-xs text-rose-800 font-semibold">
                    Are you sure you want to delete <span className="font-bold">{user.email}</span>?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-98 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
