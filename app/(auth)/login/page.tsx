"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Laptop,
  CheckCircle2,
  Building2,
  Award,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { ROLE_PRESETS } from "@/features/auth/mocks";
import { UserRole } from "@/features/auth/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const { loginAs, activeSessions, terminateSession } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("Directora");
  const [email, setEmail] = useState("direccion@culturalensenada.edu.ar");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);

  const handleSelectPreset = (role: UserRole) => {
    setSelectedRole(role);
    const preset = ROLE_PRESETS.find((p) => p.role === role);
    if (preset) {
      setEmail(preset.email);
      setPassword("instituto2026");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginAs(selectedRole);
      setIsLoading(false);
      router.push("/admin");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00153D] via-[#00205B] to-[#0A2558] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar on Login */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2 text-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white text-[#00205B] flex items-center justify-center font-black text-lg shadow-md border-2 border-[#E63956]">
            EIS
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white leading-tight group-hover:text-slate-200">
              EIS INSTITUTE
            </div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider">
              Cultural Inglesa de Ensenada
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSessionsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-colors border border-white/10"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sesiones ({activeSessions.length})</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#E63956] hover:bg-[#D12946] shadow-sm transition-colors"
          >
            <span>Ver Landing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-12">
          {/* Left Hero side (Informative) */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#00205B] to-[#0C3B8C] p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-semibold text-white mb-4 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E63956]" />
                Acceso Institucional Seguro
              </span>
              <h2 className="text-2xl font-bold tracking-tight leading-snug">
                Sistema Integral de Gestión Académica
              </h2>
              <p className="mt-3 text-xs text-slate-200 leading-relaxed">
                Plataforma de administración para directivos, personal administrativo y cuerpo docente de la <strong>Cultural Inglesa de Ensenada (EIS)</strong>.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sede La Paz Nº 525 · Ensenada</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Centro Examinador Oficial Anglia (AR-ENS-084)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Convenio Marco de Extensión Académica UTN</span>
                </div>
              </div>
            </div>

            {/* Quick Presets Section */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
                Selección Rápida de Rol:
              </span>
              <div className="space-y-2">
                {ROLE_PRESETS.map((p) => {
                  const isSelected = selectedRole === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleSelectPreset(p.role)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? "bg-white text-[#00205B] font-bold shadow-md"
                          : "bg-white/10 hover:bg-white/20 text-white font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{p.title.split("/")[0]}</span>
                      </div>
                      <span className="text-[10px] opacity-75">Probar</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtle background crest */}
            <div className="absolute -bottom-16 -right-16 text-white/5 font-black text-[220px] pointer-events-none select-none">
              EIS
            </div>
          </div>

          {/* Right Form side */}
          <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#00205B]">Iniciar Sesión</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ingrese sus credenciales autorizadas para acceder al portal.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Correo Electrónico Institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00205B] focus:bg-white text-slate-900"
                    placeholder="usuario@culturalensenada.edu.ar"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Para recuperar su contraseña, comuníquese con el Administrador de Sistemas o acérquese a Secretaría.");
                    }}
                    className="text-xs font-semibold text-[#00205B] hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00205B] focus:bg-white text-slate-900"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#00205B] focus:ring-[#00205B] w-4 h-4"
                  />
                  <span>Recordar sesión en este equipo</span>
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full py-3 text-sm font-bold shadow-md shadow-[#00205B]/20"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Ingresar como {selectedRole}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Soporte técnico interno: int. 104</span>
              <button
                type="button"
                onClick={() => setSessionsModalOpen(true)}
                className="text-[#00205B] font-semibold hover:underline"
              >
                Panel de sesiones concurrentes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-2">
        Cultural Inglesa de Ensenada (EIS Institute) · Calle La Paz Nº 525 · Ensenada, Buenos Aires · Tel: (0221) 469-5201
      </div>

      {/* MODAL: SESSIONS LIST */}
      <Modal
        isOpen={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        title="Sesiones de Acceso Registradas"
        subtitle="Dispositivos e IPs con autorización de sesión en la plataforma"
        maxWidth="md"
      >
        <div className="space-y-3 py-2">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{session.device}</span>
                  {session.isCurrent && (
                    <Badge variant="success" size="sm">
                      Actual
                    </Badge>
                  )}
                </div>
                <div className="text-slate-500 mt-0.5">
                  {session.browser} · {session.ipAddress}
                </div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  {session.location} · {session.loginTime}
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() => terminateSession(session.id)}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Cerrar
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => setSessionsModalOpen(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
