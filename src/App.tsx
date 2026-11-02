import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryDataProvider } from './context/LibraryDataContext';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { LibrarianLoginPage } from './components/auth/LibrarianLoginPage';
import { MemberLoginPage } from './components/auth/MemberLoginPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { CommandPalette } from './components/common/CommandPalette';
import { DashboardMainView } from './components/dashboard/DashboardMainView';
import { BooksCatalogView } from './components/books/BooksCatalogView';
import { MembersDirectoryView } from './components/members/MembersDirectoryView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { ReportsView } from './components/reports/ReportsView';
import { StaffManagementView } from './components/admin/StaffManagementView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';
import { AuditTrailView } from './components/admin/AuditTrailView';
import { MemberPortalView } from './components/member-portal/MemberPortalView';
import { IssueBookModal } from './components/circulation/IssueBookModal';
import { ReturnBookModal } from './components/circulation/ReturnBookModal';
import { AboutFounderModal } from './components/common/AboutFounderModal';

function AppContent() {
  const { user, role, isAuthenticated, currentPath, navigate } = useAuth();

  // Modals state
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [activePreselectedBookId, setActivePreselectedBookId] = useState<string | undefined>();
  const [activePreselectedMemberId, setActivePreselectedMemberId] = useState<string | undefined>();
  const [activePreselectedTxId, setActivePreselectedTxId] = useState<string | undefined>();

  const handleOpenIssue = (bookId?: string, memberId?: string) => {
    setActivePreselectedBookId(bookId);
    setActivePreselectedMemberId(memberId);
    setIsIssueOpen(true);
  };

  const handleOpenReturn = (txId?: string) => {
    setActivePreselectedTxId(txId);
    setIsReturnOpen(true);
  };

  const handleCommandPaletteAction = (actionKey: string, payload?: any) => {
    if (actionKey === 'open_about_founder') {
      setIsAboutOpen(true);
    } else if (actionKey === 'open_issue_modal') {
      handleOpenIssue();
    } else if (actionKey === 'open_return_modal') {
      handleOpenReturn();
    } else if (actionKey === 'view_book' && payload) {
      if (role === 'member') navigate('/member/catalog');
      else navigate(`/${role}/books`);
    } else if (actionKey === 'view_member' && payload) {
      navigate(`/${role}/members`);
    }
  };

  // 1. Unauthenticated: Render appropriate login page
  if (!isAuthenticated || !user) {
    if (currentPath.startsWith('/admin')) {
      return (
        <>
          <AdminLoginPage onOpenAbout={() => setIsAboutOpen(true)} />
          <AboutFounderModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </>
      );
    }
    if (currentPath.startsWith('/member')) {
      return (
        <>
          <MemberLoginPage onOpenAbout={() => setIsAboutOpen(true)} />
          <AboutFounderModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </>
      );
    }
    return (
      <>
        <LibrarianLoginPage onOpenAbout={() => setIsAboutOpen(true)} />
        <AboutFounderModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </>
    );
  }

  // 2. Authenticated: Render Main App Shell
  const renderCurrentView = () => {
    // Member views
    if (role === 'member') {
      if (currentPath === '/member/catalog') {
        return <BooksCatalogView />;
      }
      return <MemberPortalView />;
    }

    // Admin & Librarian views
    const path = currentPath;
    if (path.endsWith('/books')) {
      return <BooksCatalogView onIssueBook={(bId) => handleOpenIssue(bId)} />;
    }
    if (path.endsWith('/members')) {
      return <MembersDirectoryView onIssueBookToMember={(mId) => handleOpenIssue(undefined, mId)} />;
    }
    if (path.endsWith('/circulation') || path.endsWith('/transactions')) {
      return <TransactionsView onProcessReturn={(txId) => handleOpenReturn(txId)} />;
    }
    if (path.endsWith('/reports')) {
      return <ReportsView />;
    }
    if (role === 'admin') {
      if (path.endsWith('/librarians')) {
        return <StaffManagementView />;
      }
      if (path.endsWith('/settings')) {
        return <SystemSettingsView />;
      }
      if (path.endsWith('/audit')) {
        return <AuditTrailView />;
      }
    }

    // Default dashboard
    return (
      <DashboardMainView
        onOpenIssue={() => handleOpenIssue()}
        onOpenReturn={(txId) => handleOpenReturn(txId)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] dark:bg-[#101513] text-[#1D2923] dark:text-[#E2ECE6] flex flex-col font-sans transition-colors paper-texture">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main layout with sidebar */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          onOpenIssue={() => handleOpenIssue()}
          onOpenReturn={() => handleOpenReturn()}
          onOpenAbout={() => setIsAboutOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 min-w-0 overflow-y-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modals & Overlays */}
      <IssueBookModal
        isOpen={isIssueOpen}
        onClose={() => {
          setIsIssueOpen(false);
          setActivePreselectedBookId(undefined);
          setActivePreselectedMemberId(undefined);
        }}
        preselectedBookId={activePreselectedBookId}
        preselectedMemberId={activePreselectedMemberId}
      />

      <ReturnBookModal
        isOpen={isReturnOpen}
        onClose={() => {
          setIsReturnOpen(false);
          setActivePreselectedTxId(undefined);
        }}
        preselectedTransactionId={activePreselectedTxId}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectAction={handleCommandPaletteAction}
      />

      <AboutFounderModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LibraryDataProvider>
        <AppContent />
      </LibraryDataProvider>
    </AuthProvider>
  );
}
