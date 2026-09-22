import React from 'react';
import { useExam } from '../../context/ExamContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useExam();

  if (!toastMessage) return null;

  const bgConfig = {
    success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
    error: 'bg-rose-900/90 border-rose-500 text-rose-100',
    info: 'bg-slate-900/90 border-blue-500 text-slate-100',
  }[toastMessage.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toastMessage.type];

  return (
    <div
      id="app-toast-alert"
      role="status"
      className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${bgConfig}`}
      >
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm font-medium leading-snug">
          {toastMessage.text}
        </div>
        <button
          onClick={clearToast}
          aria-label="Dismiss notification"
          className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
