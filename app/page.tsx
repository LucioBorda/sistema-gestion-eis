"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Wallet,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles,
  School,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdministrativePortalGateway(): React.ReactElement {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between selection:bg-[#00205B] selection:text-white">
      {/* Top Decoupling Header */}
      <header className="bg-[#00205B] text-white py-3 px-6 shadow-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#00205B] flex items-center justify-center font-black text-lg border-2 border-[#E63956]">
              EIS
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block leading-tight">
                EIS INSTITUTE · SISTEMA INTEGRAL DE GESTIÓN ESCOLAR
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                Cultural Inglesa de Ensenada · Calle La Paz Nº 525 · Subdominio Administrativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://eisinstitute.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <span>Ir a la Landing Pública (eisinstitute.com.ar)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link href="/login">
              <Button variant="coral" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Gateway Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#00205B] border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#E63956]" />
            Entorno Exclusivo para Secretaría, Dirección y Tesorería
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#00205B] tracking-tight leading-tight">
            Portal Institucional de Gestión y Administración Escolar
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Plataforma centralizada para la administración de los <strong>19 cursos oficiales de EIS Institute</strong>, ventanilla ágil de cobranzas con cálculo automático de mora, gestión del embudo de admisiones con examen nivelatorio digitalizado y gestor dinámico de fotos para la web pública.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/admin">
              <Button
                variant="coral"
                size="lg"
                className="font-bold shadow-lg shadow-[#E63956]/20"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Acceder al Panel de Control Administrativo
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" icon={<Lock className="w-4 h-4 text-[#00205B]" />}>
                Conectar con Credenciales
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Core Highlight Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Pillar 1: Admisiones & Tests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#E63956] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-[#00205B] text-base">
              Admisiones & Test Nivelatorio
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Circuito completo con precarga de aspirantes, toma presencial o agendada, subida de exámenes manuscritos, calificación por Dirección y pase directo a alumno activo.
            </p>
            <Link
              href="/admin/admisiones"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#00205B] hover:text-[#E63956] transition-colors"
            >
              <span>Abrir embudo de admisiones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2: Cobranzas & Ventanilla */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-[#00205B] text-base">
              Cobranzas & Caja Diaria
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Liquidación por tramos de vencimiento (1 al 10, 11 al 19, 20 al fin, +30% mora vencida), tarifas diferenciadas efectivo vs. transferencia, calculadora de vuelto y recibo no fiscal.
            </p>
            <Link
              href="/admin/cobranzas"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>Operar ventanilla de caja</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3: 19 Cursos & Landing CMS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00205B] flex items-center justify-center">
              <BookOpen className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-[#00205B] text-base">
              19 Cursos Oficiales & CMS Fotos
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Catálogo completo desde Playgroup (2h) hasta Adults 6 (3h), Profesorado y Conversation con bibliografía oficial, más el gestor fotográfico con Live Preview para la web externa.
            </p>
            <Link
              href="/admin/cursos"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#00205B] hover:text-[#E63956] transition-colors"
            >
              <span>Ver catálogo curricular</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Cultural Inglesa de Ensenada (EIS Institute) · Personería Jurídica DGCyE Nº 4812/98 · Calle La Paz Nº 525, Ensenada
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            v3.1 · Next.js App Router · TypeScript Strict
          </span>
        </div>
      </footer>
    </div>
  );
}
