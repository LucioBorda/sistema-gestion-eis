"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Wallet,
  TrendingUp,
  School,
  AlertTriangle,
  ArrowUpRight,
  UserPlus,
  PlusCircle,
  FileCheck2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Banknote,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import { useGlobalData } from "@/features/core/DataContext";
import { useAuth } from "@/features/auth/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage(): React.ReactElement {
  const { currentUser } = useAuth();
  const {
    estudiantes,
    cobranzas,
    comisiones,
    inscripciones,
    calificaciones,
    landingPhotos,
  } = useGlobalData();

  // Metrics calculations
  const totalAlumnosActivos = estudiantes.filter((e) => e.estado === "Regular").length;
  const comisionesActivas = comisiones.filter((c) => c.activo).length;

  const pagosRealizados = cobranzas.filter((c) => c.estado === "Pagado");
  const totalRecaudadoMes = pagosRealizados.reduce((acc, curr) => acc + curr.totalAPagar, 0);

  const totalEfectivo = pagosRealizados
    .filter((c) => c.metodoPago === "Efectivo")
    .reduce((acc, curr) => acc + curr.totalAPagar, 0);

  const totalTransferencia = pagosRealizados
    .filter((c) => c.metodoPago === "Transferencia")
    .reduce((acc, curr) => acc + curr.totalAPagar, 0);

  const pagosVencidos = cobranzas.filter((c) => c.estado === "Vencido");
  const porcentajeMorosidad = cobranzas.length > 0
    ? Math.round((pagosVencidos.length / cobranzas.length) * 100)
    : 0;

  const totalCupos = comisiones.reduce((acc, curr) => acc + curr.cupoMaximo, 0);
  const totalOcupados = comisiones.reduce((acc, curr) => acc + curr.cupoOcupado, 0);
  const ocupacionPorcentaje = totalCupos > 0 ? Math.round((totalOcupados / totalCupos) * 100) : 0;

  // Docente specific metrics
  const totalNotasCargadas = calificaciones.length;
  const calificacionesConNota = calificaciones.filter((c) => c.promedioFinal !== null);
  const promedioAcademico =
    calificacionesConNota.length > 0
      ? (
          calificacionesConNota.reduce((acc, curr) => acc + (curr.promedioFinal || 0), 0) /
          calificacionesConNota.length
        ).toFixed(1)
      : "8.8";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00205B] via-[#0C3B8C] to-[#00153D] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#E63956]" />
            Panel Integral · Ciclo Lectivo 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¡Bienvenida/o, {currentUser.name}!
          </h1>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">
            Gestión académica y administrativa centralizada para <strong>EIS Institute (Cultural Inglesa de Ensenada)</strong>. Sede oficial de exámenes internacionales Anglia y convenios de extensión con UTN.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {currentUser.role !== "Docente" && (
              <>
                <Link href="/admin/cobranzas">
                  <Button variant="coral" size="sm" icon={<Wallet className="w-4 h-4" />}>
                    Registrar Cobro en Caja
                  </Button>
                </Link>
                <Link href="/admin/inscripciones">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<UserPlus className="w-4 h-4" />}
                    className="text-white border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    Nueva Matriculación
                  </Button>
                </Link>
              </>
            )}

            {currentUser.role === "Docente" && (
              <>
                <Link href="/admin/calificaciones">
                  <Button variant="coral" size="sm" icon={<FileSpreadsheet className="w-4 h-4" />}>
                    Cargar Calificaciones y Actas
                  </Button>
                </Link>
                <Link href="/admin/grados-paralelos">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<School className="w-4 h-4" />}
                    className="text-white border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    Ver Comisiones y Aulas
                  </Button>
                </Link>
              </>
            )}

            {currentUser.role === "Directora" && (
              <Link href="/admin/landing-cms">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ImageIcon className="w-4 h-4 text-[#E63956]" />}
                  className="text-slate-200 hover:text-white hover:bg-white/10"
                >
                  Gestor de Fotos Landing ({landingPhotos.filter((p) => p.activa).length} activas)
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background crest */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none select-none text-[180px] font-black text-white">
          EIS
        </div>
      </div>

      {/* Real-time Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Alumnos Activos */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Alumnos Regulares
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#00205B]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00205B]">
              {totalAlumnosActivos}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% vs. Ciclo 2025</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Recaudación del Mes (Directora/Secretaria) O Calificaciones (Docente) */}
        {currentUser.role !== "Docente" ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Recaudación Mes
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00205B]">
                {formatCurrency(totalRecaudadoMes)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Efvo: {formatCurrency(totalEfectivo)}</span>
                <span>Trf: {formatCurrency(totalTransferencia)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Actas & Evaluaciones
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00205B]">
                {totalNotasCargadas} actas
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-semibold">
                Parciales y finales asentados
              </div>
            </div>
          </div>
        )}

        {/* Metric 3: Comisiones & Ocupación */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Comisiones Activas
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00205B]">
              {comisionesActivas} comisiones
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#00205B] h-1.5 rounded-full"
                  style={{ width: `${ocupacionPorcentaje}%` }}
                />
              </div>
              <span className="font-semibold text-slate-700">{ocupacionPorcentaje}% cupo</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Morosidad (Directora/Secretaria) O Promedio General (Docente) */}
        {currentUser.role !== "Docente" ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Morosidad Actual
              </span>
              <div className="p-2.5 rounded-xl bg-rose-50 text-[#E63956]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#E63956]">
                {porcentajeMorosidad}%
              </div>
              <div className="mt-1 text-xs text-rose-600 font-semibold">
                {pagosVencidos.length} cuotas pendientes de regularización
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Promedio de Rendimiento
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00205B]">
                {promedioAcademico} / 10
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Desempeño general de estudiantes
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Quick Operations & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recaudación breakdown (or Calificaciones) and Latest Items */}
        <div className="lg:col-span-2 space-y-6">
          {currentUser.role !== "Docente" ? (
            /* Recent Payments Table Card */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#00205B]">
                    Últimos Movimientos de Caja
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cobros recientes y estado de aranceles emitidos
                  </p>
                </div>
                <Link href="/admin/cobranzas">
                  <Button variant="ghost" size="sm" className="text-xs text-[#00205B]">
                    Ver todos los cobros →
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">Recibo / Fecha</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Método</th>
                      <th className="py-3 px-4 text-right">Monto</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cobranzas.slice(0, 5).map((cob) => (
                      <tr key={cob.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{cob.reciboNumero}</div>
                          <div className="text-[10px] text-slate-400">
                            {cob.fechaPago ? formatDate(cob.fechaPago) : `Vence ${formatDate(cob.fechaVencimiento)}`}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">
                            {cob.estudianteNombre}
                          </div>
                          <div className="text-[10px] text-slate-400">DNI {cob.estudianteDni}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{cob.concepto}</td>
                        <td className="py-3 px-4">
                          {cob.metodoPago ? (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                              {cob.metodoPago === "Efectivo" ? (
                                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              )}
                              {cob.metodoPago}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(cob.totalAPagar)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              cob.estado === "Pagado"
                                ? "success"
                                : cob.estado === "Pendiente"
                                ? "warning"
                                : "danger"
                            }
                            size="sm"
                          >
                            {cob.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Docente View: Recent Grades Table Card */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#00205B]">
                    Últimas Calificaciones y Actas Registradas
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seguimiento pedagógico de rendimiento por comisión
                  </p>
                </div>
                <Link href="/admin/calificaciones">
                  <Button variant="ghost" size="sm" className="text-xs text-[#00205B]">
                    Ver todas las actas →
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">Materia / Comisión</th>
                      <th className="py-3 px-4 text-center">1º Parcial</th>
                      <th className="py-3 px-4 text-center">2º Parcial</th>
                      <th className="py-3 px-4 text-center">Final</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {calificaciones.slice(0, 5).map((cal) => (
                      <tr key={cal.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{cal.estudianteNombre}</div>
                          <div className="text-[10px] text-slate-400">DNI {cal.dni}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{cal.materiaNombre}</div>
                          <div className="text-[10px] text-slate-500">{cal.comisionNombre}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {cal.primerParcial ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {cal.segundoParcial ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#00205B]">
                          {cal.promedioFinal ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              cal.estadoAprobacion === "Aprobado"
                                ? "success"
                                : cal.estadoAprobacion === "En Curso"
                                ? "info"
                                : "warning"
                            }
                            size="sm"
                          >
                            {cal.estadoAprobacion}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Institutional Partners Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00205B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                ANG
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#00205B] uppercase tracking-wide">
                  Convenio Anglia Examinations
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Centro Examinador Oficial AR-ENS-084. Próxima sesión general de exámenes orales y escritos: <strong>Noviembre 2026</strong>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E63956] text-white flex items-center justify-center font-bold text-sm shrink-0">
                UTN
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#E63956] uppercase tracking-wide">
                  Convenio Universidad Tecnológica Nacional
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Aval pedagógico en Trayectos de Formación Docente y certificación de competencias laborales idiomáticas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Shortcuts & Academic Status */}
        <div className="space-y-6">
          {/* Quick Shortcuts Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#00205B] mb-3">
              Accesos Rápidos Frecuentes
            </h3>

            <div className="space-y-2">
              <Link
                href="/admin/estudiantes"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#00205B]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Padrón de Estudiantes
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Altas, contratos e importación
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/calificaciones"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Carga de Calificaciones
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Parciales, actas y boletines
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/kardex"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Kardex Estudiantil 360°
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Historial de certificados y notas
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/landing-cms"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-[#E63956]">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Gestor de Galería Web
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Subir y sincronizar fotos Landing
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Academic Calendar highlights */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#00205B]">Hitos del Ciclo 2026</h3>
              <Badge variant="navy" size="sm">
                Vigente
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">
                    Cierre de 2º Parcial
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    24 de Octubre de 2026
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#E63956] mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">
                    Sesión Escrita Anglia Examinations
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    14 de Noviembre de 2026 (Sede La Paz)
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">
                    Acto de Colación y Open Day 2026
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    18 de Diciembre de 2026
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
