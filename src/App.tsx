import React from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import { Header } from './components/common/Header';
import { Toast } from './components/common/Toast';
import { PaperPreviewModal } from './components/common/PaperPreviewModal';
import { AuthModal } from './components/auth/AuthModal';
import { GlobalDeadlineModal } from './components/common/GlobalDeadlineModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { QADashboard } from './components/qa/QADashboard';
import { PrincipalDashboard } from './components/principal/PrincipalDashboard';
import { LoginScreen } from './components/auth/LoginScreen';

const MainContent: React.FC = () => {
  const { currentRole, previewPaper, setPreviewPaper, currentUser } = useExam();

  // If not logged in, the first page is strictly the Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <GlobalDeadlineModal />
        <AuthModal />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Application Bar */}
      <Header />

      {/* Main Content View: Isolated Dashboard Per User Type */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'admin' && <AdminDashboard />}
        {currentRole === 'teacher' && <TeacherDashboard />}
        {currentRole === 'qa' && <QADashboard />}
        {currentRole === 'principal' && <PrincipalDashboard />}
      </main>

      {/* Global Paper Inspection Modal */}
      <PaperPreviewModal
        paper={previewPaper}
        onClose={() => setPreviewPaper(null)}
      />

      {/* User Authentication Modal (Sign In, Sign Up, Forgot Password) */}
      <AuthModal />

      {/* Global Paper Submission Deadline Regulatory Modal */}
      <GlobalDeadlineModal />

      {/* Global Toast Alert */}
      <Toast />

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 py-6 mt-12 text-xs text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-950">Exam Paper Management System</span>
            <span className="text-emerald-300">&bull;</span>
            <span className="text-slate-600">Govt. Girls Model Degree College, Quetta</span>
            <span className="text-emerald-300">&bull;</span>
            <span className="text-slate-500">8 Semesters &bull; 64 Courses</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">English</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">Islamic Studies</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">Sociology</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium">Zoology</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ExamProvider>
      <MainContent />
    </ExamProvider>
  );
}
