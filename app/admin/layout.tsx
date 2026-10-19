"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  CalendarDays,
  GraduationCap,
  Layers,
  BookOpen,
  Users,
  ShieldCheck,
  KeyRound,
  Briefcase,
  UserCheck,
  BookMarked,
  UserPlus,
  FileSpreadsheet,
  Award,
  Wallet,
  DoorOpen,
  Image as ImageIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  ExternalLink,
  Laptop,
  LogOut,
  ChevronDown,
  Sparkles,
  School,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useGlobalData } from "@/features/core/DataContext";
import { UserRole } from "@/features/auth/types";
import { ROLE_PRESETS } from "@/features/auth/mocks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "coral" | "navy" | "warning";
  roleRequired?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setRole, activeSessions, terminateSession, logout } = useAuth();
  const { cobranzas, inscripciones, postulantes, resetAllDataToDefaults } = useGlobalData();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Compute live badges
  const vencidasCount = cobranzas.filter((c) => c.estado === "Vencido").length;
  const inscripcionesPendientes = inscripciones.filter((i) => i.estado === "Pendiente").length;
  const admisionesPendientes =
    postulantes?.filter((p) => p.estado === "Test Pendiente" || p.estado === "Test en Corrección")
      .length || 0;

  const navSections: NavSection[] = [
    {
      title: "GENERAL",
      items: [
        {
          title: "Dashboard Principal",
          href: "/admin",
          icon: LayoutDashboard,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
        {
          title: "Datos de Institución",
          href: "/admin/institucion",
          icon: Building,
          roleRequired: ["Administrador", "Directora"],
        },
        {
          title: "Gestión Educativa (Ciclos)",
          href: "/admin/gestion-educativa",
          icon: CalendarDays,
          roleRequired: ["Administrador", "Directora"],
        },
      ],
    },
    {
      title: "FLUJOS CRÍTICOS Y ADMISIÓN",
      items: [
        {
          title: "Admisiones & Test Nivelatorio",
          href: "/admin/admisiones",
          icon: UserPlus,
          badge: admisionesPendientes > 0 ? `${admisionesPendientes} tests` : undefined,
          badgeVariant: "coral",
          roleRequired: ["Administrador", "Directora", "Secretaria"],
        },
        {
          title: "Cobranzas & Caja Diaria",
          href: "/admin/cobranzas",
          icon: Wallet,
          badge: vencidasCount > 0 ? `${vencidasCount} mora` : undefined,
          badgeVariant: "coral",
          roleRequired: ["Administrador", "Directora", "Secretaria"],
        },
        {
          title: "Catálogo de Cursos",
          href: "/admin/cursos",
          icon: BookOpen,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
      ],
    },
    {
      title: "ESTRUCTURA ACADÉMICA",
      items: [
        {
          title: "Niveles",
          href: "/admin/niveles-turnos",
          icon: Layers,
          roleRequired: ["Administrador", "Directora", "Secretaria"],
        },
        {
          title: "Aulas e Instalaciones",
          href: "/admin/aulas",
          icon: DoorOpen,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
        {
          title: "Grados / Comisiones",
          href: "/admin/grados-paralelos",
          icon: School,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
        {
          title: "Catálogo de Materias",
          href: "/admin/materias",
          icon: BookMarked,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
        {
          title: "Asignación de Materias",
          href: "/admin/asignacion-materias",
          icon: BookMarked,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
      ],
    },
    {
      title: "MATRICULACIONES Y ALUMNOS",
      items: [
        {
          title: "Padrón de Estudiantes",
          href: "/admin/estudiantes",
          icon: GraduationCap,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
        {
          title: "Matriculaciones",
          href: "/admin/inscripciones",
          icon: UserCheck,
          badge: inscripcionesPendientes > 0 ? inscripcionesPendientes : undefined,
          badgeVariant: "warning",
          roleRequired: ["Administrador", "Directora", "Secretaria"],
        },
        {
          title: "Kardex Estudiantil 360°",
          href: "/admin/kardex",
          icon: Award,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
        {
          title: "Calificaciones y Actas",
          href: "/admin/calificaciones",
          icon: FileSpreadsheet,
          roleRequired: ["Administrador", "Directora", "Secretaria", "Docente"],
        },
      ],
    },
    {
      title: "SEGURIDAD Y RRHH",
      items: [
        {
          title: "Roles de Acceso",
          href: "/admin/roles",
          icon: ShieldCheck,
          roleRequired: ["Administrador"],
        },
        {
          title: "Matriz de Permisos",
          href: "/admin/permisos",
          icon: KeyRound,
          roleRequired: ["Administrador"],
        },
        {
          title: "Cuentas de Usuarios",
          href: "/admin/usuarios",
          icon: Users,
          roleRequired: ["Administrador"],
        },
        {
          title: "Personal Administrativo",
          href: "/admin/personal-admin",
          icon: Briefcase,
          roleRequired: ["Administrador", "Directora"],
        },
        {
          title: "Personal Docente",
          href: "/admin/personal-docente",
          icon: UserCheck,
          roleRequired: ["Administrador", "Directora", "Secretaria"],
        },
      ],
    },
    {
      title: "PORTAL & COMUNICACIÓN",
      items: [
        {
          title: "Gestor Fotos Landing CMS",
          href: "/admin/landing-cms",
          icon: ImageIcon,
          badge: "Directora / Admin",
          badgeVariant: "coral",
          roleRequired: ["Administrador", "Directora"],
        },
      ],
    },
  ];

  // RBAC: Filter visible sections and items for the active role
  const visibleNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roleRequired || item.roleRequired.includes(currentUser.role)
      ),
    }))
    .filter((section) => section.items.length > 0);

  // RBAC: Check if current URL route is authorized for active role
  const allNavItems = navSections.flatMap((s) => s.items);
  const matchedItem = allNavItems.find(
    (item) => item.href === pathname || (item.href !== "/admin" && pathname.startsWith(item.href))
  );
  const isCurrentRouteAllowed =
    !matchedItem ||
    !matchedItem.roleRequired ||
    matchedItem.roleRequired.includes(currentUser.role);

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    setRoleModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#00205B] text-white transition-all duration-300 ease-in-out lg:static shadow-xl",
          isCollapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white text-[#00205B] flex items-center justify-center font-black text-lg shadow-md shrink-0 border-2 border-[#E63956]">
              EIS
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                  EIS INSTITUTE
                </span>
                <span className="text-[10px] text-slate-300 font-medium tracking-wide uppercase">
                  Cultural Inglesa Ensenada
                </span>
              </div>
            )}
          </div>

          {/* Toggle Collapse Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Close Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {visibleNavSections.map((section, sIdx) => (
            <div key={sIdx}>
              {!isCollapsed ? (
                <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </div>
              ) : (
                <div className="w-8 h-[1px] bg-white/10 mx-auto my-3" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative",
                        isActive
                          ? "bg-[#E63956] text-white shadow-md shadow-[#E63956]/30 font-bold"
                          : "text-slate-200 hover:text-white hover:bg-white/10"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-white" : "text-slate-300"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.title}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] rounded-full font-bold uppercase shrink-0",
                            item.badgeVariant === "coral" &&
                              "bg-[#E63956] text-white",
                            item.badgeVariant === "warning" &&
                              "bg-amber-400 text-slate-900",
                            item.badgeVariant === "navy" &&
                              "bg-blue-900 text-blue-100"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip on collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                          {item.title}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Role Switcher at Bottom */}
        <div className="p-3 border-t border-white/10 bg-[#00153D]/80 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <div
                className="flex items-center gap-2.5 cursor-pointer truncate flex-1 hover:opacity-90"
                onClick={() => setRoleModalOpen(true)}
                title="Cambiar de Rol / Ver perfil"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E63956]"
                />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {currentUser.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setRoleModalOpen(true)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
                title="Cambiar rol"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onClick={() => setRoleModalOpen(true)}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#E63956] cursor-pointer"
                title={`${currentUser.name} (${currentUser.role})`}
              />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00205B]/10 text-[#00205B] border border-[#00205B]/20">
                Ciclo Lectivo 2026 · Vigente
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Sede La Paz Nº 525 (Ensenada)
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* View Public Landing link */}
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00205B] bg-slate-100 hover:bg-slate-200 transition-colors"
              title="Abrir la Landing Page pública en una pestaña nueva"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E63956]" />
              Ver Landing Pública
            </Link>

            {/* Quick Role Switcher Pill */}
            <button
              onClick={() => setRoleModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Rol: {currentUser.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Active Sessions Button */}
            <button
              onClick={() => setSessionsModalOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Gestión de sesiones activas (IP y navegadores)"
            >
              <Laptop className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Notificaciones y alertas"
            >
              <Bell className="w-4 h-4" />
              {(vencidasCount > 0 || inscripcionesPendientes > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E63956]" />
              )}
            </button>

            {/* Reset Defaults button (Demo Helper) */}
            <button
              onClick={resetAllDataToDefaults}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Restaurar datos semilla iniciales"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto space-y-6">
            {isCurrentRouteAllowed ? (
              children
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center max-w-xl mx-auto my-12 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#E63956] flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Acceso Restringido por Rol
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    La sección <strong className="text-[#00205B]">{matchedItem?.title}</strong> requiere privilegios específicos según la política institucional de EIS Institute.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Tu cargo actual:</span>
                    <Badge variant="coral" size="sm">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Cargos autorizados:</span>
                    <div className="flex items-center gap-1">
                      {matchedItem?.roleRequired?.map((r) => (
                        <Badge key={r} variant="navy" size="sm">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Puedes conmutar de rol desde el selector en la barra superior para simular los accesos y vistas de cada cargo.
                </p>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                    Volver al Dashboard
                  </Button>
                  <Button variant="coral" size="sm" onClick={() => setRoleModalOpen(true)}>
                    Cambiar de Rol (Simulación)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: ROLE SWITCHER (Directora, Secretaria, Docente) */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Conmutador Rápido de Roles (Simulación RBAC)"
        subtitle="Permite cambiar de perspectiva para experimentar la interfaz con los permisos de cada cargo"
        maxWidth="lg"
      >
        <div className="space-y-3 py-2">
          {ROLE_PRESETS.map((preset) => {
            const isSelected = currentUser.role === preset.role;
            return (
              <div
                key={preset.role}
                onClick={() => handleRoleChange(preset.role)}
                className={cn(
                  "flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all duration-150",
                  isSelected
                    ? "border-[#00205B] bg-blue-50/60 ring-2 ring-[#00205B]/20"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <img
                  src={preset.avatar}
                  alt={preset.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {preset.name}
                    </h4>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-[#00205B] bg-white px-2 py-0.5 rounded-full border border-blue-200">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[#00205B] mt-0.5">
                    {preset.title}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    {preset.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRoleModalOpen(false)}
            className="w-full sm:w-auto justify-center"
          >
            Cerrar
          </Button>
        </div>
      </Modal>

      {/* MODAL: ACTIVE SESSIONS MANAGER */}
      <Modal
        isOpen={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        title="Gestión de Sesiones Activas"
        subtitle="Monitoreo de accesos concurrentes, IPs y navegadores conectados con esta cuenta"
        maxWidth="xl"
      >
        <div className="space-y-3 py-2">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[#00205B] shadow-xs">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-slate-900">
                      {session.device}
                    </h5>
                    {session.isCurrent && (
                      <Badge variant="success" size="sm">
                        Esta sesión actual
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {session.browser} · IP: {session.ipAddress}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {session.location} · {session.loginTime} ({session.lastActivity})
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => terminateSession(session.id)}
                  className="text-rose-600 border-rose-300 hover:bg-rose-50 text-xs w-full sm:w-auto justify-center"
                >
                  Cerrar Sesión Remota
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <span className="text-xs text-slate-500 text-center sm:text-left">
            {activeSessions.length} sesiones detectadas
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSessionsModalOpen(false)}
            className="w-full sm:w-auto justify-center"
          >
            Cerrar Ventana
          </Button>
        </div>
      </Modal>

      {/* MODAL: NOTIFICATIONS & ALERTS */}
      <Modal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Centro de Alertas y Notificaciones"
        subtitle="Avisos prioritarios del sistema académico y financiero de EIS Institute"
        maxWidth="lg"
      >
        <div className="space-y-2.5 py-2">
          {vencidasCount > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-rose-900">
                  {vencidasCount} Cuotas con vencimiento operado
                </h5>
                <p className="text-xs text-rose-700 mt-0.5">
                  Hay cuotas de aranceles del mes en estado vencido que requieren emisión de aviso o recargo.
                </p>
                <Link
                  href="/admin/cobranzas"
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-block mt-2 text-xs font-bold text-rose-800 underline"
                >
                  Ir al módulo de Cobranzas →
                </Link>
              </div>
            </div>
          )}

          {inscripcionesPendientes > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-amber-900">
                  {inscripcionesPendientes} Matriculaciones pendientes
                </h5>
                <p className="text-xs text-amber-700 mt-0.5">
                  Alumnos con pre-inscripción que esperan confirmación de pago de arancel matrícula.
                </p>
                <Link
                  href="/admin/inscripciones"
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-block mt-2 text-xs font-bold text-amber-800 underline"
                >
                  Ver Matriculaciones →
                </Link>
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-blue-900">
                Sincronización con Chichester College OK
              </h5>
              <p className="text-xs text-blue-700 mt-0.5">
                Padrón de aspirantes a exámenes Anglia 2026 listo para generación de actas.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
