import { CurrentUser, ActiveSession, RolePreset } from "./types";

export const ROLE_PRESETS: RolePreset[] = [
  {
    role: "Administrador",
    title: "Administrador General / Manager",
    name: "Ing. Martín Almada",
    email: "admin.ti@culturalensenada.edu.ar",
    description: "Acceso total y sin restricciones: seguridad, roles de acceso, matriz de permisos, usuarios y toda la plataforma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    badgeColor: "navy",
  },
  {
    role: "Directora",
    title: "Directora General / Rectora",
    name: "Lic. Patricia Valenzuela",
    email: "direccion@culturalensenada.edu.ar",
    description: "Supervisión institucional, académica, tesorería, cobranzas, personal y gestión escolar",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    badgeColor: "coral",
  },
  {
    role: "Secretaria",
    title: "Secretaría Académica & Cobranzas",
    name: "Mariana Beltrán",
    email: "secretaria@culturalensenada.edu.ar",
    description: "Gestión de alumnos, matrículas, cobro de cuotas, kardex y certificados",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    badgeColor: "navy",
  },
  {
    role: "Docente",
    title: "Docente Titular / Coordinador",
    name: "Prof. Lucas Rossi",
    email: "lrossi@culturalensenada.edu.ar",
    description: "Carga de calificaciones, asistencias, comisiones asignadas y actas",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badgeColor: "info",
  },
];

export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "sess-1",
    device: "Windows 11 PC (Sede Central La Paz)",
    browser: "Google Chrome 124.0",
    ipAddress: "190.191.240.42 (Ensenada, Buenos Aires)",
    location: "Sede La Paz Nº 525, Ensenada",
    isCurrent: true,
    loginTime: "Hoy, 08:30 hs",
    lastActivity: "Activo ahora",
  },
  {
    id: "sess-2",
    device: "MacBook Air M2",
    browser: "Safari 17.2",
    ipAddress: "181.44.112.19 (La Plata)",
    location: "La Plata, Buenos Aires",
    isCurrent: false,
    loginTime: "Ayer, 19:15 hs",
    lastActivity: "Hace 14 horas",
  },
  {
    id: "sess-3",
    device: "iPhone 15 Pro",
    browser: "Mobile Safari",
    ipAddress: "200.55.89.102 (Claro 5G)",
    location: "Ensenada, Buenos Aires",
    isCurrent: false,
    loginTime: "Hace 2 días",
    lastActivity: "Hace 2 días",
  },
];
