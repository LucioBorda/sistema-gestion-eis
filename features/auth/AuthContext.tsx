"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrentUser, ActiveSession, UserRole, RolePreset } from "./types";
import { ROLE_PRESETS, INITIAL_ACTIVE_SESSIONS } from "./mocks";

interface AuthContextType {
  currentUser: CurrentUser;
  activeSessions: ActiveSession[];
  setRole: (role: UserRole) => void;
  terminateSession: (sessionId: string) => void;
  terminateAllOtherSessions: () => void;
  logout: () => void;
  isLoggedIn: boolean;
  loginAs: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const defaultPreset = ROLE_PRESETS[0]; // Administrador General
    return {
      id: "usr-4",
      name: defaultPreset.name,
      email: defaultPreset.email,
      role: defaultPreset.role,
      avatar: defaultPreset.avatar,
      lastLogin: "Hoy, 08:30 hs",
      department: defaultPreset.title,
    };
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(INITIAL_ACTIVE_SESSIONS);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Sync with LocalStorage if available
  useEffect(() => {
    const savedRole = localStorage.getItem("eis_user_role") as UserRole | null;
    if (savedRole) {
      const preset = ROLE_PRESETS.find((p) => p.role === savedRole) || ROLE_PRESETS[0];
      setCurrentUser({
        id: `usr-${preset.role.toLowerCase()}`,
        name: preset.name,
        email: preset.email,
        role: preset.role,
        avatar: preset.avatar,
        lastLogin: "Hoy, 08:30 hs",
        department: preset.title,
      });
    }
  }, []);

  const setRole = (role: UserRole) => {
    const preset = ROLE_PRESETS.find((p) => p.role === role) || ROLE_PRESETS[0];
    const updated: CurrentUser = {
      id: `usr-${preset.role.toLowerCase()}`,
      name: preset.name,
      email: preset.email,
      role: preset.role,
      avatar: preset.avatar,
      lastLogin: "Recién ahora",
      department: preset.title,
    };
    setCurrentUser(updated);
    setIsLoggedIn(true);
    localStorage.setItem("eis_user_role", role);
  };

  const loginAs = (role: UserRole) => {
    setRole(role);
  };

  const terminateSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const terminateAllOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeSessions,
        setRole,
        terminateSession,
        terminateAllOtherSessions,
        logout,
        isLoggedIn,
        loginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
