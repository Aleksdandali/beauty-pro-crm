'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface AuthContextValue {
  salonId: string;
  userName: string;
  userEmail: string;
  salonName: string;
  userRole: string;
}

const AuthContext = createContext<AuthContextValue>({
  salonId: '',
  userName: '',
  userEmail: '',
  salonName: '',
  userRole: 'owner',
});

interface AuthProviderProps {
  salonId: string;
  userName: string;
  userEmail: string;
  salonName: string;
  userRole: string;
  children: ReactNode;
}

export function AuthProvider({
  salonId,
  userName,
  userEmail,
  salonName,
  userRole,
  children,
}: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ salonId, userName, userEmail, salonName, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Get current salon_id in client components. */
export function useSalonId(): string {
  const ctx = useContext(AuthContext);
  if (!ctx.salonId) throw new Error('useSalonId must be used within AuthProvider');
  return ctx.salonId;
}

/** Get full auth context in client components. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
