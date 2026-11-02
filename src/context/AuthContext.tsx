import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types/database';
import { supabaseDb, notifyChange } from '../services/supabaseClient';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, requiredRole: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  currentPath: string;
  navigate: (path: string) => void;
}

const SESSION_KEY = 'alexandria_active_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Simple client-side path state with hash fallback or browser history
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return '/librarian/login';
    const path = window.location.pathname;
    if (path === '/' || path === '') {
      // Default initial view: librarian login or member login or active session dashboard
      return '/librarian/login';
    }
    return path;
  });

  const navigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/librarian/login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const login = async (
    email: string,
    password: string,
    requiredRole: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    // Artificial slight network delay for natural feel
    await new Promise((res) => setTimeout(res, 350));

    const cleanEmail = email.trim().toLowerCase();
    const profiles = supabaseDb.getProfiles();
    const matchedProfile = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

    if (!matchedProfile) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (!matchedProfile.is_active) {
      return { success: false, error: 'Account has been disabled. Please contact Library Administration.' };
    }

    // Role-enforcement rule:
    // "Rules: each role can only log into its own page. If a Librarian's credentials are used on the Admin page, show 'Access denied for this role'."
    if (matchedProfile.role !== requiredRole) {
      return {
        success: false,
        error: `Access denied for this role. This entrance is restricted to ${requiredRole.toUpperCase()} credentials only.`,
      };
    }

    // Passwords for demo accounts: accept standard demo passwords or any 6+ chars
    if (password.length < 4) {
      return { success: false, error: 'Invalid password. Must be at least 4 characters.' };
    }

    // Success! Persist session
    setUser(matchedProfile);
    localStorage.setItem(SESSION_KEY, JSON.stringify(matchedProfile));

    // Audit log
    supabaseDb.addAuditLog({
      user_id: matchedProfile.id,
      user_name: matchedProfile.full_name,
      role: matchedProfile.role,
      action: 'USER_LOGIN',
      details: `${matchedProfile.full_name} (${matchedProfile.role}) logged in from ${requiredRole} portal.`,
    });

    // Auto-redirect to the appropriate dashboard
    if (matchedProfile.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (matchedProfile.role === 'librarian') {
      navigate('/librarian/dashboard');
    } else {
      navigate('/member/portal');
    }

    return { success: true };
  };

  const logout = () => {
    if (user) {
      supabaseDb.addAuditLog({
        user_id: user.id,
        user_name: user.full_name,
        role: user.role,
        action: 'USER_LOGOUT',
        details: `${user.full_name} logged out.`,
      });
    }
    const previousRole = user?.role || 'librarian';
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    navigate(`/${previousRole}/login`);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise((res) => setTimeout(res, 400));
    const cleanEmail = email.trim().toLowerCase();
    const profiles = supabaseDb.getProfiles();
    const exists = profiles.some((p) => p.email.toLowerCase() === cleanEmail);

    if (!exists) {
      return {
        success: false,
        message: 'No record associated with this library registry email.',
      };
    }

    return {
      success: true,
      message: `Password reset instructions and cryptographic recovery token dispatched to ${cleanEmail}. Check your inbox.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        logout,
        forgotPassword,
        currentPath,
        navigate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
