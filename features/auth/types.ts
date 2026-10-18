export type UserRole = "Directora" | "Secretaria" | "Docente";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  lastLogin: string;
  department: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  isCurrent: boolean;
  loginTime: string;
  lastActivity: string;
}

export interface RolePreset {
  role: UserRole;
  title: string;
  email: string;
  name: string;
  description: string;
  avatar: string;
  badgeColor: "navy" | "coral" | "info";
}
